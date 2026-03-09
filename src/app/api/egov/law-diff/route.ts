import { NextRequest, NextResponse } from "next/server";
import { getLawData } from "@/lib/egov/client";
import { computeArticleDiffs } from "@/app/law/[lawId]/page";

export async function GET(req: NextRequest) {
  const lawId = req.nextUrl.searchParams.get("law_id");
  const asof = req.nextUrl.searchParams.get("asof");

  if (!lawId || !asof) {
    return NextResponse.json({ error: "law_id and asof are required" }, { status: 400 });
  }

  try {
    const [currentLaw, prevLaw] = await Promise.all([
      getLawData(lawId),
      getLawData(lawId, { asof }),
    ]);

    const flattenArticles = (law: typeof currentLaw) =>
      law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;

    const currentArticles = flattenArticles(currentLaw);
    const prevArticles = flattenArticles(prevLaw);
    const changedArticles = computeArticleDiffs(currentArticles, prevArticles);

    return NextResponse.json({
      changedArticles,
      totalArticles: currentArticles.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "diff computation failed" },
      { status: 500 },
    );
  }
}
