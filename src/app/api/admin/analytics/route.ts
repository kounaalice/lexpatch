import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";

/**
 * CF Analytics API プロキシ
 * GET /api/admin/analytics?days=7
 * 管理者のみ利用可。環境変数 CF_API_TOKEN, CF_ZONE_ID が必要。
 */
export async function GET(req: NextRequest) {
  // 認証チェック
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sep = auth.indexOf(":");
  if (sep === -1) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const memberId = auth.slice(0, sep);
  const token = auth.slice(sep + 1);
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("member_profiles")
    .select("id, role")
    .eq("id", memberId)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const CF_API_TOKEN = process.env.CF_API_TOKEN ?? "";
  const CF_ZONE_ID = process.env.CF_ZONE_ID ?? "";

  if (!CF_API_TOKEN || !CF_ZONE_ID) {
    return NextResponse.json(
      {
        error: "CF_API_TOKEN or CF_ZONE_ID not configured",
        hint: "Set CF_API_TOKEN and CF_ZONE_ID environment variables",
      },
      { status: 503 },
    );
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "7");
  const safeDays = Math.min(Math.max(days, 1), 30);

  const now = new Date();
  const since = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().slice(0, 10);
  const untilStr = now.toISOString().slice(0, 10);

  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${CF_ZONE_ID}" }) {
          httpRequestsAdaptiveGroups(
            filter: { date_geq: "${sinceStr}", date_leq: "${untilStr}" }
            limit: 5000
            orderBy: [date_ASC]
          ) {
            count
            dimensions {
              date
              clientRequestPath
              edgeResponseStatus
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error("[analytics] CF API error", { status: res.status, errText });
      return NextResponse.json({ error: "CF API error", status: res.status }, { status: 502 });
    }

    const cfData = await res.json();
    const zones = cfData?.data?.viewer?.zones;
    if (!zones || zones.length === 0) {
      return NextResponse.json({ error: "No zone data found" }, { status: 404 });
    }

    const groups = zones[0].httpRequestsAdaptiveGroups ?? [];

    // 集計: 日別リクエスト数
    const dailyMap = new Map<string, { requests: number; errors: number }>();
    // パス別リクエスト数
    const pathMap = new Map<string, number>();
    // ステータスコード別
    const statusMap = new Map<number, number>();

    let totalRequests = 0;
    let totalErrors = 0;

    for (const g of groups) {
      const date = g.dimensions.date;
      const path = g.dimensions.clientRequestPath ?? "/";
      const status = g.dimensions.edgeResponseStatus ?? 0;
      const count = g.count;

      totalRequests += count;

      // 日別
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { requests: 0, errors: 0 });
      }
      const day = dailyMap.get(date)!;
      day.requests += count;
      if (status >= 400) {
        day.errors += count;
        totalErrors += count;
      }

      // パス別（クエリパラメータ除去、先頭パスセグメントで集約）
      const cleanPath = path.split("?")[0];
      pathMap.set(cleanPath, (pathMap.get(cleanPath) ?? 0) + count);

      // ステータスコード別
      statusMap.set(status, (statusMap.get(status) ?? 0) + count);
    }

    // 日別データ配列
    const daily = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        requests: d.requests,
        errors: d.errors,
      }));

    // 人気ページ Top 20
    const topPages = Array.from(pathMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([path, count]) => ({ path, count }));

    // ステータスコード分布
    const statusDist = Array.from(statusMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([status, count]) => ({ status, count }));

    const activeDays = daily.filter((d) => d.requests > 0).length || 1;

    return NextResponse.json({
      period: { since: sinceStr, until: untilStr, days: safeDays },
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : "0",
      dailyAvg: Math.round(totalRequests / activeDays),
      uniquePages: pathMap.size,
      daily,
      topPages,
      statusDist,
    });
  } catch (e) {
    logger.error("[analytics] fetch error", { error: e });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
