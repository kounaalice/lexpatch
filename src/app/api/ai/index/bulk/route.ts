import { NextRequest, NextResponse } from "next/server";
import { getAI, isAiAvailable, estimateTokenCount } from "@/lib/ai";
import {
  getVectorize,
  isVectorizeAvailable,
  embedTexts,
  upsertVectors,
  vectorId,
  type ArticleVectorEntry,
} from "@/lib/vectorize";
import { serializeArticle } from "@/lib/ai-context";
import { getLawData } from "@/lib/egov/client";
import { verifySessionToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import type { Article, StructuredLaw } from "@/lib/egov/types";

const ADMIN_ID = "23a63a2b-c522-4a2d-97f7-bf4446708cf7";
const EGOV_API = "https://laws.e-gov.go.jp/api/2";
const MAX_ARTICLE_CHARS = 800;

// ── e-Gov 法令リスト取得（キャッシュなし — admin ツール用） ──

interface EgovLawEntry {
  law_id: string;
  law_title: string;
  law_num: string;
  law_type: string;
}

async function fetchLawList(
  offset: number,
  limit: number,
  lawType?: string,
): Promise<{ laws: EgovLawEntry[]; totalCount: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    response_format: "json",
  });
  if (lawType) params.set("law_type", lawType);

  const url = `${EGOV_API}/laws?${params}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const laws: EgovLawEntry[] = ((data.laws ?? []) as any[]).map((item) => {
      const lawInfo = (item.law_info ?? {}) as Record<string, unknown>;
      const revInfo = (item.current_revision_info ?? item.revision_info ?? {}) as Record<
        string,
        unknown
      >;
      return {
        law_id: String(lawInfo.law_id ?? ""),
        law_title: String(revInfo.law_title ?? ""),
        law_num: String(lawInfo.law_num ?? ""),
        law_type: String(lawInfo.law_type ?? ""),
      };
    });

    return { laws, totalCount: data.total_count ?? laws.length };
  } finally {
    clearTimeout(timer);
  }
}

// ── 条文フラット化 ──

function flattenArticles(law: StructuredLaw): { article: Article; chapterTitle: string }[] {
  const result: { article: Article; chapterTitle: string }[] = [];
  for (const ch of law.chapters) {
    for (const a of ch.articles) {
      result.push({ article: a, chapterTitle: ch.title });
    }
  }
  for (const a of law.articles) {
    result.push({ article: a, chapterTitle: "" });
  }
  return result;
}

// ── 1法令のインデックス構築 ──

interface IndexResult {
  lawId: string;
  title: string;
  articles: number;
  tokens: number;
  status: string;
}

async function indexOneLaw(
  ai: any,
  vectorize: any,
  lawId: string,
  fallbackTitle: string,
): Promise<IndexResult> {
  try {
    const law = await getLawData(lawId);
    const items = flattenArticles(law);

    if (items.length === 0) {
      return {
        lawId,
        title: law.law_title || fallbackTitle,
        articles: 0,
        tokens: 0,
        status: "skip (no articles)",
      };
    }

    // 条文テキスト生成（エンベディング用、先頭800文字）
    const texts = items.map(({ article }) => {
      const serialized = serializeArticle(article).slice(0, MAX_ARTICLE_CHARS);
      return `${law.law_title} ${article.title} ${article.caption}\n${serialized}`;
    });

    // バッチエンベディング
    const vectors = await embedTexts(ai, texts);

    // upsert 用エントリ
    const entries: ArticleVectorEntry[] = items.map(({ article, chapterTitle }, i) => ({
      id: vectorId(lawId, article.num),
      values: vectors[i],
      metadata: {
        lawId,
        lawTitle: law.law_title,
        articleNum: article.num,
        articleTitle: article.title,
        caption: article.caption,
        chapterTitle,
      },
    }));

    await upsertVectors(vectorize, entries);

    const totalTokens = texts.reduce((sum, t) => sum + estimateTokenCount(t), 0);
    logger.info(`[bulk-index] ${law.law_title}: ${items.length} articles, ~${totalTokens} tokens`);

    return {
      lawId,
      title: law.law_title,
      articles: items.length,
      tokens: totalTokens,
      status: "ok",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error(`[bulk-index] ${lawId} (${fallbackTitle}): ${msg.slice(0, 200)}`);
    return {
      lawId,
      title: fallbackTitle,
      articles: 0,
      tokens: 0,
      status: `error: ${msg.slice(0, 200)}`,
    };
  }
}

// ── POST /api/ai/index/bulk ──
// mode=discover: e-Gov全法令の総数を返す
// mode=batch (default): offset + batchSize で法令をバッチインデックス

export async function POST(request: NextRequest) {
  let body: {
    memberId?: string;
    token?: string;
    mode?: "discover" | "batch";
    offset?: number;
    batchSize?: number;
    lawType?: string; // フィルタ: "Act", "CabinetOrder", "MinisterialOrdinance" 等
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, mode = "batch", offset = 0, batchSize = 10, lawType } = body;

  // ── 認証 ──
  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }
  if (memberId !== ADMIN_ID) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  // ── Discovery モード ──
  if (mode === "discover") {
    try {
      // 全体＋種別ごとの件数
      const [all, acts, cabinet, ministerial, rules, imperial] = await Promise.all([
        fetchLawList(0, 1),
        fetchLawList(0, 1, "Act"),
        fetchLawList(0, 1, "CabinetOrder"),
        fetchLawList(0, 1, "MinisterialOrdinance"),
        fetchLawList(0, 1, "Rule"),
        fetchLawList(0, 1, "ImperialOrder"),
      ]);
      return NextResponse.json({
        totalLaws: all.totalCount,
        byType: {
          Act: acts.totalCount,
          CabinetOrder: cabinet.totalCount,
          MinisterialOrdinance: ministerial.totalCount,
          Rule: rules.totalCount,
          ImperialOrder: imperial.totalCount,
        },
      });
    } catch (e) {
      return NextResponse.json({ error: `e-Gov API エラー: ${e}` }, { status: 502 });
    }
  }

  // ── Batch モード ──
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }
  const vectorize = await getVectorize();
  if (!isVectorizeAvailable(vectorize)) {
    return NextResponse.json({ error: "Vectorize は利用できません" }, { status: 503 });
  }

  // batchSize 上限: 一度に処理しすぎると Worker タイムアウト
  const clampedBatch = Math.min(Math.max(1, batchSize), 50);

  // e-Gov から法令リスト取得
  let lawList: { laws: EgovLawEntry[]; totalCount: number };
  try {
    lawList = await fetchLawList(offset, clampedBatch, lawType);
  } catch (e) {
    return NextResponse.json({ error: `e-Gov 法令リスト取得エラー: ${e}` }, { status: 502 });
  }

  if (lawList.laws.length === 0) {
    return NextResponse.json({
      offset,
      batchSize: clampedBatch,
      lawType: lawType ?? "all",
      totalLawsOnEgov: lawList.totalCount,
      processedInBatch: 0,
      totalArticlesIndexed: 0,
      totalTokens: 0,
      nextOffset: offset,
      hasMore: false,
      results: [],
    });
  }

  // 各法令を順次インデックス
  const results: IndexResult[] = [];
  let totalArticles = 0;
  let totalTokens = 0;

  for (const law of lawList.laws) {
    if (!law.law_id) {
      results.push({
        lawId: "",
        title: law.law_title,
        articles: 0,
        tokens: 0,
        status: "skip (no id)",
      });
      continue;
    }

    const result = await indexOneLaw(ai, vectorize, law.law_id, law.law_title);
    results.push(result);
    totalArticles += result.articles;
    totalTokens += result.tokens;
  }

  const nextOffset = offset + lawList.laws.length;

  return NextResponse.json({
    offset,
    batchSize: clampedBatch,
    lawType: lawType ?? "all",
    totalLawsOnEgov: lawList.totalCount,
    processedInBatch: lawList.laws.length,
    totalArticlesIndexed: totalArticles,
    totalTokens,
    nextOffset,
    hasMore: nextOffset < lawList.totalCount,
    results,
  });
}
