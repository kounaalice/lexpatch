import type { LawSearchResponse, StructuredLaw, LawNode, LawRevisionEntry } from "./types";
import { parseLawFullText } from "./parser";

const BASE_URL = process.env.EGOV_API_BASE ?? "https://laws.e-gov.go.jp/api/2";

// e-Gov fetch のタイムアウト
// ビルド時に96カテゴリ+106法令が一斉に叩くため、余裕を持たせる
const FETCH_TIMEOUT_MS = 15_000;
// 大規模法令（所得税法=16MB等）は転送に10秒以上かかるため長めに設定
const FETCH_TIMEOUT_LONG_MS = 30_000;

// e-Gov API へのフェッチ（24時間キャッシュ + タイムアウト）
async function cachedFetch(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// 短期キャッシュ版（1時間 + タイムアウト — 最近の法令一覧等、鮮度が必要なデータ向け）
async function cachedFetchShort(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// 法令検索
export async function searchLaws(
  query: string,
  limit = 20,
  offset = 0,
): Promise<LawSearchResponse> {
  let url = `${BASE_URL}/laws?law_title=${encodeURIComponent(query)}&limit=${limit}&response_format=json`;
  if (offset > 0) url += `&offset=${offset}`;
  const res = await cachedFetch(url);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const laws = mapLawSearchResults(data.laws ?? []);
  return { laws, total_count: data.total_count ?? laws.length };
}

// e-Gov APIレスポンスの法令配列を LawSearchResult[] にマッピング
function mapLawSearchResults(
  rawLaws: Record<string, unknown>[],
): import("./types").LawSearchResult[] {
  return rawLaws.map((item) => {
    const lawInfo = (item.law_info ?? {}) as Record<string, unknown>;
    const revInfo = (item.current_revision_info ?? item.revision_info ?? {}) as Record<
      string,
      unknown
    >;
    const enfDate = String(
      revInfo.amendment_enforcement_date ?? revInfo.amended_law_enforcement_date ?? "",
    );
    return {
      law_id: String(lawInfo.law_id ?? ""),
      law_title: String(revInfo.law_title ?? ""),
      law_num: String(lawInfo.law_num ?? ""),
      law_type: String(lawInfo.law_type ?? ""),
      promulgation_date: String(lawInfo.promulgation_date ?? ""),
      ...(enfDate ? { amendment_enforcement_date: enfDate } : {}),
    };
  });
}

// 高度検索オプション
export interface AdvancedSearchOptions {
  lawTitle?: string; // 法令名
  keyword?: string; // 条文内キーワード
  lawType?: string; // Act, CabinetOrder, MinisterialOrdinance 等
  promulgationFrom?: string; // 公布日 from (YYYY-MM-DD)
  promulgationTo?: string; // 公布日 to
  amendmentFrom?: string; // 改正日 from
  amendmentTo?: string; // 改正日 to
  limit?: number;
  offset?: number;
}

// 高度法令検索（条文内キーワード・種別・日付範囲対応）
export async function advancedSearchLaws(opts: AdvancedSearchOptions): Promise<LawSearchResponse> {
  const params = new URLSearchParams({ response_format: "json" });
  if (opts.lawTitle) params.set("law_title", opts.lawTitle);
  if (opts.keyword) params.set("keyword", opts.keyword);
  if (opts.lawType) params.set("law_type", opts.lawType);
  if (opts.promulgationFrom) params.set("promulgation_date_from", opts.promulgationFrom);
  if (opts.promulgationTo) params.set("promulgation_date_to", opts.promulgationTo);
  if (opts.amendmentFrom) params.set("amendment_promulgation_from", opts.amendmentFrom);
  if (opts.amendmentTo) params.set("amendment_promulgation_to", opts.amendmentTo);
  params.set("limit", String(opts.limit ?? 50));
  if (opts.offset) params.set("offset", String(opts.offset));

  const url = `${BASE_URL}/laws?${params}`;
  const res = await cachedFetch(url);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const laws = mapLawSearchResults(data.laws ?? []);
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
  const revInfo = (item.current_revision_info ?? item.revision_info ?? {}) as Record<
    string,
    unknown
  >;
  return String(revInfo.law_title ?? "");
}

// 最近公布された法令一覧取得（新着情報用）
// ※ amendment_promulgation_from は e-Gov API に無視されるため promulgation_date_from を使用
export async function getRecentLaws(days = 365, limit = 20): Promise<LawSearchResponse> {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromStr = from.toISOString().split("T")[0];
  const url = `${BASE_URL}/laws?promulgation_date_from=${fromStr}&limit=${limit}&response_format=json`;
  const res = await cachedFetchShort(url); // 1時間キャッシュ + タイムアウト
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const laws = mapLawSearchResults(data.laws ?? [])
    .filter((l) => l.law_id && l.promulgation_date)
    .sort((a, b) => b.promulgation_date.localeCompare(a.promulgation_date));

  return { laws, total_count: data.total_count ?? laws.length };
}

// 最近施行された法令一覧取得
// e-Gov API の amendment_enforcement_date_from は無視されるため、
// 広めに取得して amendment_enforcement_date でクライアント側フィルタリング
export async function getRecentlyEnforcedLaws(days = 365, limit = 12): Promise<LawSearchResponse> {
  // 直近5年以内に公布された法令を500件取得し、施行日でフィルタ
  const from = new Date();
  from.setFullYear(from.getFullYear() - 5);
  const fromStr = from.toISOString().split("T")[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  const url = `${BASE_URL}/laws?promulgation_date_from=${fromStr}&limit=500&response_format=json`;
  const res = await cachedFetchShort(url); // 1時間キャッシュ + タイムアウト
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const data = await res.json();

  const allLaws = mapLawSearchResults(data.laws ?? []);

  // 施行日が cutoff ～ 今日の範囲にある法令をフィルタ（未来施行は除外）
  const enforced = allLaws
    .filter(
      (l) =>
        l.amendment_enforcement_date &&
        l.amendment_enforcement_date >= cutoffStr &&
        l.amendment_enforcement_date <= todayStr,
    )
    .sort((a, b) =>
      (b.amendment_enforcement_date ?? "").localeCompare(a.amendment_enforcement_date ?? ""),
    )
    .slice(0, limit);

  return { laws: enforced, total_count: enforced.length };
}

// 法令本文取得 + パース（20MB 上限でメモリ保護 — 所得税法は約16MB）
// asof: "YYYY-MM-DD" 指定で時点指定取得（施行日ベース）
export async function getLawData(
  lawId: string,
  options?: { asof?: string; maxBytes?: number },
): Promise<StructuredLaw> {
  const maxBytes = options?.maxBytes ?? 20 * 1024 * 1024;
  let url = `${BASE_URL}/law_data/${encodeURIComponent(lawId)}?response_format=json`;
  if (options?.asof) {
    url += `&asof=${encodeURIComponent(options.asof)}`;
  }
  const res = await cachedFetch(url, FETCH_TIMEOUT_LONG_MS);
  if (!res.ok) throw new Error(`e-Gov API error: ${res.status}`);
  const text = await res.text();
  if (text.length > maxBytes)
    throw new Error(`法令データが大きすぎます (${Math.round(text.length / 1024)}KB)`);
  const data = JSON.parse(text) as Record<string, unknown>;

  const lawInfo = (data.law_info ?? {}) as Record<string, unknown>;
  // current_revision_info に最新改正メタデータが入る（revision_info は制定時情報）
  const revInfo = (data.current_revision_info ?? data.revision_info ?? {}) as Record<
    string,
    unknown
  >;
  const fullText = data.law_full_text as LawNode;

  const structured = parseLawFullText(
    String(lawInfo.law_id ?? lawId),
    String(revInfo.law_title ?? ""),
    String(lawInfo.law_num ?? ""),
    fullText,
  );

  // 追加メタデータ（実務向け）
  const lawType = String(lawInfo.law_type ?? "");
  const promulgationDate = String(lawInfo.promulgation_date ?? "");
  // 最終改正日: revision_info 内の amendment_promulgation_date 等を試みる
  const amendmentDate = String(
    revInfo.amendment_promulgation_date ?? revInfo.amended_law_promulgation_date ?? "",
  );
  const enforcementDate = String(
    revInfo.amendment_enforcement_date ?? revInfo.amended_law_enforcement_date ?? "",
  );

  return {
    ...structured,
    ...(lawType ? { law_type: lawType } : {}),
    ...(promulgationDate ? { promulgation_date: promulgationDate } : {}),
    ...(amendmentDate ? { amendment_date: amendmentDate } : {}),
    ...(enforcementDate ? { enforcement_date: enforcementDate } : {}),
  };
}

// 改正履歴取得（施行日降順）
export async function getLawRevisions(lawId: string): Promise<LawRevisionEntry[]> {
  const url = `${BASE_URL}/law_revisions/${encodeURIComponent(lawId)}?response_format=json`;
  try {
    const res = await cachedFetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>;
    const revisions = (data.revisions ?? data.law_revisions ?? []) as Record<string, unknown>[];
    return revisions
      .map((rev) => ({
        law_revision_id: String(rev.law_revision_id ?? ""),
        law_title: String(rev.law_title ?? ""),
        amendment_law_id: String(rev.amendment_law_id ?? ""),
        amendment_law_title: rev.amendment_law_title ? String(rev.amendment_law_title) : undefined,
        amendment_promulgate_date: rev.amendment_promulgate_date
          ? String(rev.amendment_promulgate_date)
          : undefined,
        amendment_enforcement_date: String(
          rev.amendment_enforcement_date ?? rev.amendment_promulgate_date ?? "",
        ),
        amendment_enforcement_comment: rev.amendment_enforcement_comment
          ? String(rev.amendment_enforcement_comment)
          : undefined,
        current_revision_status: rev.current_revision_status
          ? String(rev.current_revision_status)
          : undefined,
      }))
      .filter((r) => r.amendment_enforcement_date)
      .sort((a, b) => b.amendment_enforcement_date.localeCompare(a.amendment_enforcement_date));
  } catch {
    return [];
  }
}
