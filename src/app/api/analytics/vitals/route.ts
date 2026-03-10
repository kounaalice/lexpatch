import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * POST /api/analytics/vitals
 *
 * Core Web Vitals レポート受信エンドポイント。
 * クライアントの web-vitals ライブラリからバッチ送信されたメトリクスを
 * 構造化ログとして記録する。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metrics, url, timestamp } = body;

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ error: "No metrics provided" }, { status: 400 });
    }

    // 各メトリクスを構造化ログに記録
    for (const metric of metrics) {
      logger.info("web-vital", {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        pageUrl: url,
        reportedAt: timestamp,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
