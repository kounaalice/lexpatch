import type { LawSearchResponse, StructuredLaw, LawNode } from "./types";
import { parseLawFullText } from "./parser";

const BASE_URL = process.env.EGOV_API_BASE ?? "https://laws.e-gov.go.jp/api/2";

// e-Gov fetch のタイムアウト（Workers の wall-clock 上限を守る）
const FETCH_TIMEOUT_MS = 8_000;

// e-Gov API へのフェッチ（24時間キャッシュ + タイムアウト）
async function cachedFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// 法令検索
export async function searchLaws(query: string, limit = 20): Promise<LawSearchResponse> {
  const url = `${BASE_URL}/laws?law_title=${encodeURIComponent(query)}&limit=${limit}&response_format=json`;
  const res = await cachedFetch(url);
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

// 法令タイトルのみ取得（軽量・キャッシュ付き）
export async function getLawTitle(lawId: string): Promise<string> {
  // /laws?law_id= で法令メタデータのみ取得（全文ダウンロード不要）
  const url = `${BASE_URL}/laws?law_id=${encodeURIComponent(lawId)}&limit=1&response_format=json`;
  const res = await cachedFetch(url);
  if (!res.ok) return "";
  const data = await res.json();
  const laws = (data.laws ?? []) as Record<string, unknown>[];
  if (laws.length === 0) return "";
  const item = laws[0];
  const revInfo = ((item.current_revision_info ?? item.revision_info ?? {}) as Record<string, unknown>);
  return String(revInfo.law_title ?? "");
}

// 最近改正された法令一覧取得（新着情報用）
export async function getRecentLaws(days = 90, limit = 12): Promise<LawSearchResponse> {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromStr = from.toISOString().split("T")[0];
  const url = `${BASE_URL}/laws?amendment_promulgation_from=${fromStr}&limit=${limit}&response_format=json`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // 1時間キャッシュ
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const laws = (data.laws ?? []).map((item: Record<string, unknown>) => {
    const lawInfo = (item.law_info ?? {}) as Record<string, unknown>;
    const revInfo = (item.current_revision_info ?? item.revision_info ?? {}) as Record<string, unknown>;
    return {
      law_id: String(lawInfo.law_id ?? ""),
      law_title: String(revInfo.law_title ?? ""),
      law_num: String(lawInfo.law_num ?? ""),
      law_type: String(lawInfo.law_type ?? ""),
      promulgation_date: String(revInfo.amendment_promulgation_date ?? revInfo.amended_law_promulgation_date ?? ""),
    };
  }).filter((l: { law_id: string }) => l.law_id)
    .sort((a: { promulgation_date: string }, b: { promulgation_date: string }) =>
      b.promulgation_date.localeCompare(a.promulgation_date)
    );

  return { laws, total_count: data.total_count ?? laws.length };
}

// 法令本文取得 + パース（5MB 上限でメモリ保護）
export async function getLawData(lawId: string, maxBytes = 5 * 1024 * 1024): Promise<StructuredLaw> {
  const url = `${BASE_URL}/law_data/${encodeURIComponent(lawId)}?response_format=json`;
  const res = await cachedFetch(url);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const text = await res.text();
  if (text.length > maxBytes) throw new Error(`法令データが大きすぎます (${Math.round(text.length / 1024)}KB)`);
  const data = JSON.parse(text) as Record<string, unknown>;

  const lawInfo = (data.law_info ?? {}) as Record<string, unknown>;
  const revInfo = (data.revision_info ?? {}) as Record<string, unknown>;
  const fullText = data.law_full_text as LawNode;

  const structured = parseLawFullText(
    String(lawInfo.law_id ?? lawId),
    String(revInfo.law_title ?? ""),
    String(lawInfo.law_num ?? ""),
    fullText
  );

  // 追加メタデータ（実務向け）
  const lawType = String(lawInfo.law_type ?? "");
  const promulgationDate = String(lawInfo.promulgation_date ?? "");
  // 最終改正日: revision_info 内の amendment_promulgation_date 等を試みる
  const amendmentDate =
    String(revInfo.amendment_promulgation_date ?? revInfo.amended_law_promulgation_date ?? "");
  const enforcementDate =
    String(revInfo.amendment_enforcement_date ?? revInfo.amended_law_enforcement_date ?? "");

  return {
    ...structured,
    ...(lawType         ? { law_type: lawType }               : {}),
    ...(promulgationDate ? { promulgation_date: promulgationDate } : {}),
    ...(amendmentDate   ? { amendment_date: amendmentDate }    : {}),
    ...(enforcementDate ? { enforcement_date: enforcementDate } : {}),
  };
}
