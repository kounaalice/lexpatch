import type { LawSearchResponse, StructuredLaw, LawNode } from "./types";
import { parseLawFullText } from "./parser";

const BASE_URL = process.env.EGOV_API_BASE ?? "https://laws.e-gov.go.jp/api/2";

// レート制限: 前回リクエストから最低1秒空ける
let lastRequestAt = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = 1000 - (now - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
  return fetch(url, { next: { revalidate: 86400 } }); // 24時間キャッシュ
}

// 法令検索
export async function searchLaws(query: string, limit = 20): Promise<LawSearchResponse> {
  const url = `${BASE_URL}/laws?law_title=${encodeURIComponent(query)}&limit=${limit}&response_format=json`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  // e-Gov APIのレスポンス構造に合わせてマッピング
  // law_title は revision_info または current_revision_info に格納される
  const laws = (data.laws ?? []).map((item: Record<string, unknown>) => {
    const lawInfo = (item.law_info ?? {}) as Record<string, unknown>;
    const revInfo = (item.current_revision_info ?? item.revision_info ?? {}) as Record<string, unknown>;
    return {
      law_id: String(lawInfo.law_id ?? ""),
      law_title: String(revInfo.law_title ?? ""),
      law_num: String(lawInfo.law_num ?? ""),
      law_type: String(lawInfo.law_type ?? ""),
      promulgation_date: String(lawInfo.promulgation_date ?? ""),
    };
  });

  return { laws, total_count: data.total_count ?? laws.length };
}

// 法令本文取得 + パース
export async function getLawData(lawId: string): Promise<StructuredLaw> {
  const url = `${BASE_URL}/law_data/${encodeURIComponent(lawId)}?response_format=json`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const lawInfo = (data.law_info ?? {}) as Record<string, unknown>;
  const revInfo = (data.revision_info ?? {}) as Record<string, unknown>;
  const fullText = data.law_full_text as LawNode;

  return parseLawFullText(
    String(lawInfo.law_id ?? lawId),
    String(revInfo.law_title ?? ""),
    String(lawInfo.law_num ?? ""),
    fullText
  );
}
