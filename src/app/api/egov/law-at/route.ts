import { NextRequest, NextResponse } from "next/server";
import { getLawData } from "@/lib/egov/client";
import { paragraphsToCanonLines } from "@/lib/patch/apply";
import { logger } from "@/lib/logger";

export const revalidate = 86400; // 24h ISR

export async function GET(request: NextRequest) {
  const lawId = request.nextUrl.searchParams.get("law_id")?.trim();
  const asof = request.nextUrl.searchParams.get("asof")?.trim();
  const articleNum = request.nextUrl.searchParams.get("article_num")?.trim();
  const articleTitle = request.nextUrl.searchParams.get("article_title")?.trim();

  if (!lawId || !asof) {
    return NextResponse.json({ error: "law_id と asof が必要です" }, { status: 400 });
  }

  try {
    const law = await getLawData(lawId, { asof });
    const allArticles =
      law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;

    // 条文を特定（num または title でマッチ）
    const article = allArticles.find(
      (a) =>
        (articleNum && (a.num === articleNum || a.title === articleNum)) ||
        (articleTitle && a.title === articleTitle),
    );

    if (!article) {
      // 該当条文なし（新設された条文など）
      return NextResponse.json({ canonLines: null, articleFound: false });
    }

    const canonLines = paragraphsToCanonLines(article.paragraphs);
    return NextResponse.json({ canonLines, articleFound: true });
  } catch (err) {
    logger.error("[law-at] error", { error: err });
    return NextResponse.json({ canonLines: null, articleFound: false, error: "取得失敗" });
  }
}
