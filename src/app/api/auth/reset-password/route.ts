import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOneTimeToken, verifyOneTimeToken, hashPassword } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { validateRequest, resetPasswordSchema, resetPasswordExecuteSchema } from "@/lib/validation";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * POST: Request password reset — sends email with reset link
 * Always returns success to prevent email enumeration
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const result = await validateRequest(request, resetPasswordSchema);
  if (!result.success) return result.error;
  const email = result.data.email.trim().toLowerCase();

  // Always return success (don't reveal if email exists)
  const successResponse = NextResponse.json({
    message: "メールアドレスが登録されている場合、リセットリンクを送信しました。",
  });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (admin as any)
    .from("member_profiles")
    .select("id, name, auth_provider")
    .eq("email", email)
    .maybeSingle();

  if (!member) return successResponse;

  // Don't allow password reset for OAuth-only accounts
  if (member.auth_provider === "google") return successResponse;

  // Generate reset token (1 hour expiry)
  const { raw, hashed } = await generateOneTimeToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("member_profiles")
    .update({
      password_reset_token: hashed,
      password_reset_expires: expires,
    })
    .eq("id", member.id);

  // Send reset email
  const origin = request.headers.get("origin") || "https://lexcard.jp";
  const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail({
    to: email,
    memberName: member.name,
    resetUrl,
  });

  return successResponse;
}

/**
 * PATCH: Execute password reset — verify token and set new password
 */
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const result = await validateRequest(request, resetPasswordExecuteSchema);
  if (!result.success) return result.error;
  const body = result.data;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (admin as any)
    .from("member_profiles")
    .select("id, password_reset_token, password_reset_expires")
    .eq("email", body.email.trim().toLowerCase())
    .maybeSingle();

  if (!member || !member.password_reset_token) {
    return NextResponse.json({ error: "リセットリンクが無効です" }, { status: 400 });
  }

  // Check expiry
  if (new Date(member.password_reset_expires) < new Date()) {
    return NextResponse.json({ error: "リセットリンクの有効期限が切れています" }, { status: 400 });
  }

  // Verify token
  const valid = await verifyOneTimeToken(body.token, member.password_reset_token);
  if (!valid) {
    return NextResponse.json({ error: "リセットリンクが無効です" }, { status: 400 });
  }

  // Set new password (PBKDF2)
  const newHash = await hashPassword(body.newPassword);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("member_profiles")
    .update({
      password_hash: newHash,
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", member.id);

  return NextResponse.json({ message: "パスワードが正常にリセットされました" });
}
