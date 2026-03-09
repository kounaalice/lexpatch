import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/precedents?lawId=129AC0000000089&article=709
 * 指定された法令×条文に関連する判例を返す
 *
 * Query params:
 *   lawId   - e-Gov 法令ID (required)
 *   article - 条番号 "709", "465_2" → "465の2" (required)
 *   limit   - 最大件数 (default: 20)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lawId = searchParams.get("lawId");
  const articleRaw = searchParams.get("article");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  if (!lawId || !articleRaw) {
    return NextResponse.json({ error: "lawId and article are required" }, { status: 400 });
  }

  // URL形式 "465_2" → DB形式 "465の2"
  const article = articleRaw.replace(/_/g, "の");

  try {
    const supabase = createAdminClient();

    // precedent_law_refs → precedents JOIN
    const { data, error } = await supabase
      .from("precedent_law_refs")
      .select(
        `
        law_name,
        article,
        paragraph,
        precedents!inner (
          lawsuit_id,
          case_number,
          case_name,
          court_name,
          date,
          trial_type,
          result,
          article_info,
          detail_url
        )
      `,
      )
      .eq("law_id", lawId)
      .eq("article", article)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Precedents query error", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the join result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const precedents = ((data || []) as any[]).map((row: any) => {
      const p = row.precedents as Record<string, unknown>;
      return {
        lawsuit_id: p.lawsuit_id,
        case_number: p.case_number,
        case_name: p.case_name,
        court_name: p.court_name,
        date: p.date,
        trial_type: p.trial_type,
        result: p.result,
        article_info: p.article_info,
        detail_url: p.detail_url,
      };
    });

    // 重複除去 (同一判例が複数のparagraphで参照されうる)
    const seen = new Set<string>();
    const unique = precedents.filter((p) => {
      if (seen.has(p.lawsuit_id as string)) return false;
      seen.add(p.lawsuit_id as string);
      return true;
    });

    return NextResponse.json({
      precedents: unique,
      total: unique.length,
      law_id: lawId,
      article,
    });
  } catch (err) {
    logger.error("Precedents API error", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
