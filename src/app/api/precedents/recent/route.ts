import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/precedents/recent?limit=10
 * 参照法条付きの最新判例を返す（トップページ用）
 * ref_law がある判例のみ対象（法条リンクが必ず表示される）
 */
export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 50);

  try {
    const supabase = createAdminClient();

    // ref_law がある判例のみ、日付降順で取得
    const { data, error } = await supabase
      .from("precedents")
      .select(
        "id, lawsuit_id, case_number, case_name, court_name, date, trial_type, result, detail_url",
      )
      .not("ref_law", "is", null)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Recent precedents query error", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const precedents = (data || []) as any[];
    if (precedents.length === 0) {
      return NextResponse.json({ precedents: [] });
    }

    // 各判例の参照法条を取得
    const ids = precedents.map((p: { id: string }) => p.id);
    const { data: refsData } = await supabase
      .from("precedent_law_refs")
      .select("precedent_id, law_id, law_name, article")
      .in("precedent_id", ids);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refs = (refsData || []) as any[];

    // precedent_id → refs のマップ
    const refMap = new Map<string, { law_id: string; law_name: string; article: string }[]>();
    for (const r of refs) {
      const list = refMap.get(r.precedent_id) || [];
      list.push({ law_id: r.law_id, law_name: r.law_name, article: r.article });
      refMap.set(r.precedent_id, list);
    }

    // 重複除去して返す
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = precedents.map((p: any) => {
      const lawRefs = refMap.get(p.id) || [];
      // 同一 law_id + article の重複除去
      const seen = new Set<string>();
      const uniqueRefs = lawRefs.filter((r) => {
        const key = `${r.law_id}:${r.article}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return {
        lawsuit_id: p.lawsuit_id,
        case_number: p.case_number,
        case_name: p.case_name,
        court_name: p.court_name,
        date: p.date,
        trial_type: p.trial_type,
        result: p.result,
        detail_url: p.detail_url,
        law_refs: uniqueRefs,
      };
    });

    return NextResponse.json(
      { precedents: result },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    logger.error("Recent precedents API error", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
