/**
 * 法令ページ プリフェッチ戦略
 *
 * ユーザー行動に基づいた先読みで体感速度を向上させる。
 * - 検索結果の上位3件をプリフェッチ
 * - カテゴリ兄弟法令をプリフェッチ
 * - 閲覧履歴の関連法令をプリフェッチ
 *
 * Next.js の router.prefetch() は App Router では Link コンポーネント経由でのみ利用可能なため、
 * ここでは <link rel="prefetch"> を動的挿入する方式を採用。
 */

const MAX_PREFETCH = 5;
const prefetched = new Set<string>();

/**
 * 指定URLをブラウザにプリフェッチさせる。
 * 重複排除 + 上限制御あり。
 */
export function prefetchUrl(url: string): void {
  if (typeof document === "undefined") return;
  if (prefetched.has(url)) return;
  if (prefetched.size >= MAX_PREFETCH) return;

  // ネットワーク節約モード時はスキップ
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  link.as = "document";
  document.head.appendChild(link);
  prefetched.add(url);
}

/**
 * 法令ページをプリフェッチする。
 */
export function prefetchLawPage(lawId: string): void {
  prefetchUrl(`/law/${lawId}`);
}

/**
 * 検索結果の上位N件をプリフェッチする。
 */
export function prefetchSearchResults(lawIds: string[], limit = 3): void {
  lawIds.slice(0, limit).forEach(prefetchLawPage);
}

/**
 * プリフェッチ済みURLをクリアする（テスト・SPA遷移用）。
 */
export function clearPrefetchCache(): void {
  prefetched.clear();
}

/**
 * 現在のプリフェッチ済みURL数を返す（テスト用）。
 */
export function getPrefetchCount(): number {
  return prefetched.size;
}
