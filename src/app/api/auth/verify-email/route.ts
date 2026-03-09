import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOneTimeToken, verifyOneTimeToken, verifySessionToken } from "@/lib/crypto";
import { sendEmailVerificationEmail } from "@/lib/mail";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * GET: Verify email via link click
 * Query params: ?token=<raw_token>&id=<memberId>
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const token = request.nextUrl.searchParams.get("token");
  const memberId = request.nextUrl.searchParams.get("id");

  if (!token || !memberId) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (admin as any)
    .from("member_profiles")
    .select("id, password_reset_token")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || !member.password_reset_token) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  }

  // Reuse password_reset_token field for email verification token
  const valid = await verifyOneTimeToken(token, member.password_reset_token);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  }

  // Mark email as verified
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("member_profiles")
    .update({
      email_verified: true,
      password_reset_token: null,
      password_reset_expires: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}

/**
 * POST: Send/resend email verification
 * Requires authenticated session (X-Member-Id + X-Session-Token headers)
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = request.headers.get("X-Member-Id");
  const sessionToken = request.headers.get("X-Session-Token");
  if (!memberId || !sessionToken) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const valid = await verifySessionToken(memberId, sessionToken);
  if (!valid) {
    return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (admin as any)
    .from("member_profiles")
    .select("id, name, email, email_verified")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || !member.email) {
    return NextResponse.json({ error: "メールアドレスが設定されていません" }, { status: 400 });
  }

  if (member.email_verified) {
    return NextResponse.json({ message: "メールアドレスは既に確認済みです" });
  }

  // Generate verification token (24h expiry)
  const { raw, hashed } = await generateOneTimeToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("member_profiles")
    .update({
      password_reset_token: hashed,
      password_reset_expires: expires,
    })
    .eq("id", memberId);

  const origin = request.headers.get("origin") || "https://lexcard.jp";
  const verifyUrl = `${origin}/api/auth/verify-email?token=${encodeURIComponent(raw)}&id=${encodeURIComponent(memberId)}`;

  await sendEmailVerificationEmail({
    to: member.email,
    memberName: member.name,
    verifyUrl,
  });

  return NextResponse.json({ message: "確認メールを送信しました" });
}
