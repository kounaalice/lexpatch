/**
 * Cloudflare Vectorize クライアント
 * AI法令セマンティック検索（β）用
 * bge-m3 (1024次元, 多言語対応) + Vectorize で 106法令を横断検索
 */

import { logger } from "./logger";

// ── Vectorize バインディング取得 ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVectorize(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ctx.env as any).VECTORIZE ?? null;
  } catch {
    return null;
  }
}

export function isVectorizeAvailable(v: unknown): boolean {
  return !!v;
}

// ── エンベディング ──

/** bge-m3: 多言語対応、1024次元、日本語法令テキストに最適 */
export const EMBEDDING_MODEL = "@cf/baai/bge-m3";
export const EMBEDDING_DIMENSIONS = 1024;

/** bge-m3 の neuron コスト: 1,075 neurons / 1M tokens */
const NEURONS_PER_EMBEDDING_TOKEN = 1_075 / 1_000_000;

/** エンベディングの推定 neuron 消費量 */
export function estimateEmbeddingNeurons(tokenCount: number): number {
  return Math.ceil(tokenCount * NEURONS_PER_EMBEDDING_TOKEN);
}

/**
 * テキストをエンベディングに変換
 * @returns 1024次元のベクトル
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function embedText(ai: any, text: string): Promise<number[]> {
  const resp = await ai.run(EMBEDDING_MODEL, {
    text: [text],
  });
  // Workers AI embedding 応答: { shape: [1, 1024], data: [[...]] }
  if (resp?.data?.[0]) {
    return resp.data[0];
  }
  throw new Error("エンベディング生成に失敗しました");
}

/**
 * 複数テキストを一括エンベディング（バッチ処理）
 * bge-m3 コンテキスト上限: 60,000 tokens — バッチ全テキストの合計が制限
 * 安全策: 小バッチ + 失敗時は1件ずつフォールバック
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function embedTexts(ai: any, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  // バッチサイズ: 小さめに設定（bge-m3 の 60k token 上限対策）
  const BATCH_SIZE = 5;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      const resp = await ai.run(EMBEDDING_MODEL, {
        text: batch,
      });
      if (resp?.data) {
        results.push(...resp.data);
      } else {
        throw new Error(`エンベディングバッチ応答なし (offset ${i})`);
      }
    } catch (batchErr) {
      // バッチ失敗 → 1件ずつフォールバック
      logger.warn(`[vectorize] batch ${i}-${i + batch.length} failed, falling back to individual`, {
        error: String(batchErr),
      });
      for (const text of batch) {
        try {
          const resp = await ai.run(EMBEDDING_MODEL, {
            text: [text.slice(0, 1500)], // 超長テキストは切り詰め
          });
          if (resp?.data?.[0]) {
            results.push(resp.data[0]);
          } else {
            // ゼロベクトルで埋める（検索精度は落ちるが全体が止まらない）
            results.push(new Array(EMBEDDING_DIMENSIONS).fill(0));
          }
        } catch {
          results.push(new Array(EMBEDDING_DIMENSIONS).fill(0));
        }
      }
    }
  }

  return results;
}

// ── ベクトルID生成 ──

/** 法令ID + 条文番号 → ユニークなベクトルID */
export function vectorId(lawId: string, articleNum: string): string {
  return `${lawId}:${articleNum}`;
}

// ── 検索 ──

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    lawId: string;
    lawTitle: string;
    articleNum: string;
    articleTitle: string;
    caption: string;
    chapterTitle: string;
  };
}

/**
 * セマンティック検索: クエリテキスト → Vectorize 類似検索
 * @returns スコア降順のマッチ結果
 */

export async function searchSimilar(
  vectorize: any,
  ai: any,
  query: string,
  topK = 5,
): Promise<VectorSearchResult[]> {
  // クエリをエンベディング
  const queryVector = await embedText(ai, query);

  // Vectorize 検索
  const results = await vectorize.query(queryVector, {
    topK,
    returnMetadata: "all",
  });

  if (!results?.matches) return [];

  return results.matches.map(
    (m: { id: string; score: number; metadata?: Record<string, string> }) => ({
      id: m.id,
      score: m.score,
      metadata: {
        lawId: m.metadata?.lawId ?? "",
        lawTitle: m.metadata?.lawTitle ?? "",
        articleNum: m.metadata?.articleNum ?? "",
        articleTitle: m.metadata?.articleTitle ?? "",
        caption: m.metadata?.caption ?? "",
        chapterTitle: m.metadata?.chapterTitle ?? "",
      },
    }),
  );
}

// ── Upsert ──

export interface ArticleVectorEntry {
  id: string; // vectorId(lawId, articleNum)
  values: number[]; // 1024次元ベクトル
  metadata: {
    lawId: string;
    lawTitle: string;
    articleNum: string;
    articleTitle: string;
    caption: string;
    chapterTitle: string;
  };
}

/**
 * ベクトルを Vectorize にupsert（バッチ対応）
 * Vectorize の upsert 上限: 1,000ベクトル/リクエスト
 */

export async function upsertVectors(
  vectorize: any,
  entries: ArticleVectorEntry[],
): Promise<{ count: number }> {
  if (entries.length === 0) return { count: 0 };

  const UPSERT_BATCH = 1000;
  let totalUpserted = 0;

  for (let i = 0; i < entries.length; i += UPSERT_BATCH) {
    const batch = entries.slice(i, i + UPSERT_BATCH);
    await vectorize.upsert(batch);
    totalUpserted += batch.length;
  }

  return { count: totalUpserted };
}
