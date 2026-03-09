import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyPassword, generateSessionToken, needsRehash, hashPassword } from "@/lib/crypto";
import { checkLoginAllowed, recordFailedAttempt, resetAttempts } from "@/lib/auth-rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { validateRequest, loginSchema } from "@/lib/validation";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const GENERIC_ERROR = "認証情報が正しくありません";

// ログイン（メールアドレスまたは表示名+所属）
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  // CSRF 検証
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 403 });
  }

  const result = await validateRequest(request, loginSchema);
  if (!result.success) return result.error;
  const body = result.data;

  const password = body.password;

  // Determine login method: email or name+org
  const loginIdentifier = body.name?.trim() || "";
  const isEmailLogin = loginIdentifier.includes("@") || !!body.email;
  const email = body.email?.trim() || (isEmailLogin ? loginIdentifier : "");
  const name = isEmailLogin ? "" : loginIdentifier;
  const org = body.org?.trim() ?? "";

  if (!email && !name) {
    return NextResponse.json({ error: "メールアドレスまたは表示名は必須です" }, { status: 400 });
  }

  // Rate limit check
  const rateLimitKey = isEmailLogin ? email : `${name}:${org}`;
  const rateCheck = checkLoginAllowed(rateLimitKey);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `ログイン試行回数の上限に達しました。${rateCheck.retryAfterSec}秒後にお試しください。`,
      },
      { status: 429 },
    );
  }

  const admin = createAdminClient();

  // Query by email or name+org
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from("member_profiles")
    .select("id, name, org, org_type, password_hash, role, auth_provider, avatar_url, email");

  if (isEmailLogin) {
    query = query.eq("email", email);
  } else {
    query = query.eq("name", name).eq("org", org);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // OAuth-only accounts cannot use password login
  if (data.password_hash === "oauth:google" || data.auth_provider !== "local") {
    if (data.password_hash === "oauth:google") {
      return NextResponse.json(
        {
          error: "このアカウントはGoogleログインで登録されています。Googleでログインしてください。",
        },
        { status: 401 },
      );
    }
  }

  const valid = await verifyPassword(password, data.password_hash);
  if (!valid) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // Success — reset rate limit
  resetAttempts(rateLimitKey);

  // Auto-upgrade password hash to PBKDF2 if using legacy SHA-256
  if (needsRehash(data.password_hash)) {
    const newHash = await hashPassword(password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("member_profiles")
      .update({ password_hash: newHash })
      .eq("id", data.id);
  }

  const token = await generateSessionToken(data.id);

  // Never return password_hash or other sensitive fields
  return NextResponse.json({
    memberId: data.id,
    name: data.name,
    org: data.org,
    orgType: data.org_type,
    role: data.role ?? "member",
    token,
    avatarUrl: data.avatar_url ?? null,
    authProvider: data.auth_provider ?? "local",
    email: data.email ?? null,
  });
}
