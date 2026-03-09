import { NextRequest, NextResponse } from "next/server";
import { discoverNewLaws, sendImmediateAlerts, sendWeeklyDigests } from "@/lib/law-alerts";
import { logger } from "@/lib/logger";

function getCronSecret(): string {
  return process.env.CRON_SECRET ?? "";
}

/**
 * POST /api/cron/law-alerts
 * Cron Worker から毎時呼び出される法令アラート処理エンドポイント。
 * CRON_SECRET ヘッダーで認証。
 */
export async function POST(request: NextRequest) {
  // CRON_SECRET 認証
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  const secret = getCronSecret();

  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Record<string, any> = {};

    // 1. 新規法令検出 → law_alert_log に記録
    const { newPromulgations, newEnforcements } = await discoverNewLaws();
    results.discovered = {
      promulgations: newPromulgations.length,
      enforcements: newEnforcements.length,
    };

    // 2. 即時アラート送信（新規検出分のみ）
    if (newPromulgations.length > 0) {
      results.immediate_promulgation = await sendImmediateAlerts(newPromulgations, "promulgation");
    }
    if (newEnforcements.length > 0) {
      results.immediate_enforcement = await sendImmediateAlerts(newEnforcements, "enforcement");
    }

    // 3. 週次ダイジェスト送信（スケジュール一致のメンバーのみ）
    results.digests = await sendWeeklyDigests();

    logger.info("[cron/law-alerts] 完了", { results });
    return NextResponse.json({ ok: true, ...results });
  } catch (e) {
    logger.error("[cron/law-alerts] エラー", { error: e });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
