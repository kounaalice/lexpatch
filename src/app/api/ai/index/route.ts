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

// ── 106法令 ID リスト（generateStaticParams と同一） ──
const INDEXED_LAW_IDS = [
  // 公法 — 憲法・基本法
  "321CONSTITUTION",
  "322AC0000000003",
  "325AC0000000147",
  // 国会・選挙
  "322AC1000000079",
  "325AC1000000100",
  // 裁判法
  "322AC0000000059",
  "322AC0000000061",
  "324AC1000000205",
  "416AC0000000063",
  "141AC0000000053",
  // 行政組織
  "322AC0000000005",
  "323AC0000000120",
  "322AC0000000120",
  "322AC0000000067",
  "325AC0000000261",
  // 行政通則
  "405AC0000000088",
  "323AC0000000043",
  "426AC0000000068",
  "337AC0000000139",
  "322AC0000000125",
  "411AC0000000042",
  "415AC0000000057",
  // 財政・租税
  "337AC0000000066",
  "334AC0000000147",
  "340AC0000000033",
  "340AC0000000034",
  "363AC0000000108",
  "325AC0000000073",
  "325AC0000000226",
  // 警察・治安
  "323AC0000000136",
  "323AC1000000186",
  "335AC0000000105",
  "326CO0000000319",
  // 国土整備
  "326AC0100000219",
  "343AC0000000100",
  "325AC0000000201",
  "327AC1000000180",
  "339AC0000000167",
  // 環境
  "405AC0000000091",
  "322AC0000000233",
  "332AC0000000177",
  // 教育
  "418AC0000000120",
  "322AC0000000026",
  // 民事法 — 民法・関連法
  "129AC0000000089",
  "322AC0000000224",
  "132AC0000000015",
  "329AC0000000100",
  "406AC0000000085",
  "330AC0000000097",
  "403AC0000000090",
  "416AC0000000123",
  "327AC1000000176",
  "418AC0000000078",
  // 商法
  "132AC0000000048",
  "417AC0000000086",
  "338AC0000000125",
  "420AC0000000056",
  "307AC0000000020",
  "308AC0000000057",
  "323AC0000000025",
  // 民事訴訟・倒産
  "408AC0000000109",
  "415AC0000000109",
  "423AC0000000051",
  "423AC0000000052",
  "354AC0000000004",
  "401AC0000000091",
  "416AC0000000075",
  "411AC0000000225",
  "414AC0000000154",
  // 刑事法
  "140AC0000000045",
  "323AC0000000131",
  "323AC0000000168",
  "417AC0000000050",
  // 社会法 — 労働法
  "322AC0000000049",
  "419AC0000000128",
  "324AC0000000174",
  "321AC0000000025",
  "347AC0000000057",
  "334AC0000000137",
  "347AC0000000113",
  "403AC0000000076",
  "360AC0000000088",
  "405AC0000000076",
  "322AC0000000050",
  "349AC0000000116",
  "416AC0000000045",
  "416AC0000000122",
  // 社会保障
  "211AC0000000070",
  "333AC0000000192",
  "334AC0000000141",
  "329AC0000000115",
  "409AC0000000123",
  "322AC0000000164",
  "325AC0000000144",
  // 産業法 — 経済法・消費者法
  "322AC0000000054",
  "343AC1000000078",
  "412AC0000000061",
  "351AC0000000057",
  "337AC0000000134",
  // 知的財産
  "345AC0000000048",
  "334AC0000000121",
  "334AC0000000125",
  "334AC0000000127",
  "405AC0000000047",
  // 情報通信
  "359AC0000000086",
];

/** 法令から全条文をフラット化 + チャプタータイトル付与 */
function flattenArticles(law: StructuredLaw): { article: Article; chapterTitle: string }[] {
  const result: { article: Article; chapterTitle: string }[] = [];
  if (law.chapters.length > 0) {
    for (const ch of law.chapters) {
      for (const a of ch.articles) {
        result.push({ article: a, chapterTitle: ch.title });
      }
    }
  }
  for (const a of law.articles) {
    result.push({ article: a, chapterTitle: "" });
  }
  return result;
}

// POST /api/ai/index — 管理者専用: 法令インデックス構築
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  const vectorize = await getVectorize();
  if (!isVectorizeAvailable(vectorize)) {
    return NextResponse.json({ error: "Vectorize は利用できません" }, { status: 503 });
  }

  let body: { memberId?: string; token?: string; lawId?: string; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, lawId, all } = body;

  // 認証
  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // 管理者チェック（こうな姫 admin ID）
  if (memberId !== "23a63a2b-c522-4a2d-97f7-bf4446708cf7") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  // 対象法令を決定
  const targetIds = all ? INDEXED_LAW_IDS : lawId ? [lawId] : [];
  if (targetIds.length === 0) {
    return NextResponse.json(
      { error: "lawId または all=true を指定してください" },
      { status: 400 },
    );
  }

  const results: { lawId: string; title: string; articles: number; status: string }[] = [];
  let totalArticles = 0;

  for (const lid of targetIds) {
    try {
      const law = await getLawData(lid);
      const items = flattenArticles(law);

      if (items.length === 0) {
        results.push({
          lawId: lid,
          title: law.law_title,
          articles: 0,
          status: "skip (no articles)",
        });
        continue;
      }

      // 条文テキストを生成（エンベディング用に先頭800文字に切り詰め）
      // bge-m3 の 60,000 token コンテキスト制限対策
      // 条文の意味把握には先頭部分で十分（本文・項番号で構造把握可能）
      const MAX_ARTICLE_CHARS = 800;
      const texts = items.map(({ article }) => {
        const serialized = serializeArticle(article).slice(0, MAX_ARTICLE_CHARS);
        // エンベディング用に法令名をプレフィックス
        return `${law.law_title} ${article.title} ${article.caption}\n${serialized}`;
      });

      // バッチエンベディング
      const vectors = await embedTexts(ai, texts);

      // upsert 用エントリ構築
      const entries: ArticleVectorEntry[] = items.map(({ article, chapterTitle }, i) => ({
        id: vectorId(lid, article.num),
        values: vectors[i],
        metadata: {
          lawId: lid,
          lawTitle: law.law_title,
          articleNum: article.num,
          articleTitle: article.title,
          caption: article.caption,
          chapterTitle,
        },
      }));

      await upsertVectors(vectorize, entries);
      totalArticles += items.length;
      results.push({ lawId: lid, title: law.law_title, articles: items.length, status: "ok" });

      // 推定 neuron 消費をログ
      const totalTokens = texts.reduce((sum, t) => sum + estimateTokenCount(t), 0);
      logger.info(
        `[ai/index] ${law.law_title}: ${items.length} articles, ~${totalTokens} tokens embedded`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error(`[ai/index] ${lid} エラー`, { detail: msg });
      // law が取得できていれば法令名を表示
      let title = "?";
      try {
        const lawForTitle = await getLawData(lid);
        title = lawForTitle.law_title;
      } catch {
        /* ignore */
      }
      results.push({ lawId: lid, title, articles: 0, status: `error: ${msg.slice(0, 100)}` });
    }
  }

  return NextResponse.json({
    totalLaws: targetIds.length,
    totalArticles,
    results,
  });
}
