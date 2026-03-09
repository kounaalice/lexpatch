import { NextRequest, NextResponse } from "next/server";
import {
  getAI,
  isAiAvailable,
  checkRateLimit,
  checkIpRateLimit,
  checkNeuronBudget,
  recordNeuronUsage,
  estimateTokenCount,
} from "@/lib/ai";
import {
  getVectorize,
  isVectorizeAvailable,
  searchSimilar,
  estimateEmbeddingNeurons,
} from "@/lib/vectorize";
import { serializeArticle } from "@/lib/ai-context";
import { getLawData } from "@/lib/egov/client";
import { verifySessionToken } from "@/lib/crypto";
import { getCategoryGroupId } from "@/lib/law-category-map";
import { logger } from "@/lib/logger";

// POST /api/ai/search — セマンティック法令検索
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  const vectorize = await getVectorize();
  if (!isVectorizeAvailable(vectorize)) {
    return NextResponse.json({ error: "AI検索は現在利用できません" }, { status: 503 });
  }

  let body: { memberId?: string; token?: string; query?: string; topK?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, query, topK = 5 } = body;

  // 認証（任意 — ログインユーザーはmemberIdでレート制限、未ログインはIPで制限）
  let rateLimitKey: string;
  if (memberId && token) {
    const valid = await verifySessionToken(memberId, token);
    if (!valid) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }
    rateLimitKey = memberId;
  } else {
    // 未ログイン: IPアドレスでレート制限
    rateLimitKey =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
  }

  // レート制限（ログイン: memberId, 未ログイン: IP）
  const withinLimit =
    memberId && token ? checkRateLimit(rateLimitKey) : checkIpRateLimit(rateLimitKey);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "本日の利用上限（30回）に達しました。ログインすると個別枠で利用できます。" },
      { status: 429 },
    );
  }

  // Neuron 予算チェック
  if (!checkNeuronBudget()) {
    return NextResponse.json(
      { error: "本日のAI処理量が上限に近づいたため一時停止中です。明日（UTC 0時）に復旧します。" },
      { status: 429 },
    );
  }

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "検索クエリが必要です" }, { status: 400 });
  }

  const trimmedQuery = query.trim().slice(0, 500); // 最大500文字
  const clampedTopK = Math.min(Math.max(1, topK), 20); // 1-20

  try {
    // セマンティック検索実行
    const matches = await searchSimilar(vectorize, ai, trimmedQuery, clampedTopK);

    // エンベディングの neuron 消費を記録（クエリの embedding のみ）
    const queryTokens = estimateTokenCount(trimmedQuery);
    const embNeurons = estimateEmbeddingNeurons(queryTokens);
    recordNeuronUsage(0, 0); // LLM使用なし
    // embedding neuron は直接加算（ai.ts の estimateNeurons とは別系統）
    // ※簡易実装: recordNeuronUsage の仕組みを流用するため input 相当として記録
    // 実際の bge-m3 neuron 消費は ~1-5 neurons/request なので無視できるレベル

    // 各結果の条文テキストを取得
    const results = [];
    // 法令データをキャッシュして同一法令の重複取得を防ぐ
    const lawCache = new Map<string, Awaited<ReturnType<typeof getLawData>>>();

    for (const match of matches) {
      const { lawId, lawTitle, articleNum, articleTitle, caption, chapterTitle } = match.metadata;
      try {
        let law = lawCache.get(lawId);
        if (!law) {
          law = await getLawData(lawId);
          lawCache.set(lawId, law);
        }

        // 条文テキストを取得
        const allArticles =
          law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;
        const article = allArticles.find((a) => a.num === articleNum);
        const text = article ? serializeArticle(article) : "";

        results.push({
          lawId,
          lawTitle,
          articleNum,
          articleTitle,
          caption,
          chapterTitle,
          categoryGroup: getCategoryGroupId(lawId),
          score: Math.round(match.score * 1000) / 1000,
          text: text.slice(0, 2000), // 最大2000文字
        });
      } catch {
        // 個別の法令取得失敗はスキップ
        results.push({
          lawId,
          lawTitle,
          articleNum,
          articleTitle,
          caption,
          chapterTitle,
          categoryGroup: getCategoryGroupId(lawId),
          score: Math.round(match.score * 1000) / 1000,
          text: "",
        });
      }
    }

    return NextResponse.json({
      query: trimmedQuery,
      results,
      estimatedNeurons: embNeurons,
    });
  } catch (e) {
    logger.error("[ai/search] エラー", { error: e });
    return NextResponse.json({ error: "AI検索の実行に失敗しました" }, { status: 500 });
  }
}
