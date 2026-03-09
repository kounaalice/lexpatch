import { NextRequest, NextResponse } from "next/server";
import {
  getAI,
  isAiAvailable,
  checkRateLimit,
  checkIpRateLimit,
  checkNeuronBudget,
} from "@/lib/ai";
import { getVectorize, isVectorizeAvailable, searchSimilar, vectorId } from "@/lib/vectorize";
import { serializeArticle } from "@/lib/ai-context";
import { getLawData } from "@/lib/egov/client";
import { verifySessionToken } from "@/lib/crypto";
import { getCategoryGroupId } from "@/lib/law-category-map";
import { logger } from "@/lib/logger";

// POST /api/ai/search/similar — "この条文に似た条文を探す"
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  const vectorize = await getVectorize();
  if (!isVectorizeAvailable(vectorize)) {
    return NextResponse.json({ error: "AI検索は現在利用できません" }, { status: 503 });
  }

  let body: {
    memberId?: string;
    token?: string;
    lawId?: string;
    articleNum?: string;
    topK?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, lawId, articleNum, topK = 10 } = body;

  // 認証（任意）
  let rateLimitKey: string;
  if (memberId && token) {
    const valid = await verifySessionToken(memberId, token);
    if (!valid) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }
    rateLimitKey = memberId;
  } else {
    rateLimitKey =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
  }

  const withinLimit =
    memberId && token ? checkRateLimit(rateLimitKey) : checkIpRateLimit(rateLimitKey);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "本日の利用上限に達しました。ログインすると個別枠で利用できます。" },
      { status: 429 },
    );
  }
  if (!checkNeuronBudget()) {
    return NextResponse.json(
      { error: "AI処理量が上限に近づいたため一時停止中です" },
      { status: 429 },
    );
  }

  if (!lawId || !articleNum) {
    return NextResponse.json({ error: "lawId と articleNum が必要です" }, { status: 400 });
  }

  const clampedTopK = Math.min(Math.max(1, topK), 15);
  const sourceVectorId = vectorId(lawId, articleNum);

  try {
    // ソース条文のテキストを取得
    const law = await getLawData(lawId);
    const allArticles =
      law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;
    const article = allArticles.find((a) => a.num === articleNum);
    if (!article) {
      return NextResponse.json({ error: "条文が見つかりません" }, { status: 404 });
    }

    const sourceText = serializeArticle(article).slice(0, 800);

    // ソーステキストで類似検索（+1して自分自身を除外用）
    const matches = await searchSimilar(vectorize, ai, sourceText, clampedTopK + 1);

    // ソース自身を除外
    const filtered = matches.filter((m) => m.id !== sourceVectorId);
    const trimmed = filtered.slice(0, clampedTopK);

    // 結果の条文テキストを取得
    const results = [];
    const lawCache = new Map<string, Awaited<ReturnType<typeof getLawData>>>();
    lawCache.set(lawId, law);

    for (const match of trimmed) {
      const {
        lawId: mLawId,
        lawTitle,
        articleNum: mArticleNum,
        articleTitle,
        caption,
        chapterTitle,
      } = match.metadata;
      try {
        let mLaw = lawCache.get(mLawId);
        if (!mLaw) {
          mLaw = await getLawData(mLawId);
          lawCache.set(mLawId, mLaw);
        }
        const mAllArticles =
          mLaw.chapters.length > 0 ? mLaw.chapters.flatMap((ch) => ch.articles) : mLaw.articles;
        const mArticle = mAllArticles.find((a) => a.num === mArticleNum);
        const text = mArticle ? serializeArticle(mArticle) : "";

        results.push({
          lawId: mLawId,
          lawTitle,
          articleNum: mArticleNum,
          articleTitle,
          caption,
          chapterTitle,
          categoryGroup: getCategoryGroupId(mLawId),
          score: Math.round(match.score * 1000) / 1000,
          text: text.slice(0, 2000),
        });
      } catch {
        results.push({
          lawId: mLawId,
          lawTitle,
          articleNum: mArticleNum,
          articleTitle,
          caption,
          chapterTitle,
          categoryGroup: getCategoryGroupId(mLawId),
          score: Math.round(match.score * 1000) / 1000,
          text: "",
        });
      }
    }

    return NextResponse.json({
      source: { lawId, lawTitle: law.law_title, articleNum },
      results,
    });
  } catch (e) {
    logger.error("[ai/search/similar] エラー", { error: e });
    return NextResponse.json({ error: "類似検索の実行に失敗しました" }, { status: 500 });
  }
}
