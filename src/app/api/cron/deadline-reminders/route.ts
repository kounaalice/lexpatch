import { NextRequest, NextResponse } from "next/server";
import { checkDeadlineReminders } from "@/lib/deadline-reminders";
import { logger } from "@/lib/logger";

function getCronSecret(): string {
  return process.env.CRON_SECRET ?? "";
}

/**
 * POST /api/cron/deadline-reminders
 * Cron Worker から毎時呼び出されるタスク期限リマインダー処理エンドポイント。
 * CRON_SECRET ヘッダーで認証。
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  const secret = getCronSecret();

  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkDeadlineReminders();
    logger.info("[cron/deadline-reminders] 完了", { result });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    logger.error("[cron/deadline-reminders] エラー", { error: e });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
