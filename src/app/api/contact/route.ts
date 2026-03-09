import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyAdminContact, autoReplyContact } from "@/lib/mail";
import { validateRequest, contactSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const result = await validateRequest(request, contactSchema);
  if (!result.success) return result.error;
  const { name, email, organization, subject, message, honeypot } = result.data;

  // ボット検知（ハニーポット）
  if (honeypot) {
    return NextResponse.json({ ok: true }); // ボットには成功を返す
  }

  const contact = {
    name: name.trim(),
    email: email.trim(),
    organization: organization?.trim() ?? null,
    subject: subject?.trim() ?? null,
    message: message.trim(),
  };

  // Supabase が未設定の場合は成功扱いで返す（ログだけ残す）
  if (!url || !key) {
    logger.info("[contact] Supabase未設定 — メッセージをログ出力", { contact });
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("contacts").insert(contact);

  if (error) {
    logger.error("[contact] Supabase error", { error });
    return NextResponse.json(
      { error: "送信に失敗しました。しばらくしてからお試しください。" },
      { status: 500 },
    );
  }

  // メール通知（await して CF Workers で打ち切られないようにする）
  try {
    await Promise.all([notifyAdminContact(contact), autoReplyContact(contact)]);
  } catch (e) {
    logger.error("[contact] メール送信エラー", { error: e });
  }

  return NextResponse.json({ ok: true });
}
