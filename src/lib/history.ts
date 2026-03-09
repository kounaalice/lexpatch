// ── Browsing History helpers (lp_history) ──────────────────────
import { addActivityPoints } from "./gaming";

/** New browsing-history entry (article-level granularity) */
export interface BrowsingHistoryEntry {
  lawId: string;
  lawTitle: string;
  articleNum?: string;
  articleTitle?: string;
  visitedAt: string; // ISO string
}

const BROWSING_KEY = "lp_history";
const BROWSING_MAX = 50;

/**
 * Add or update a browsing-history entry.
 * Deduplicates on lawId+articleNum; keeps at most 50 entries.
 */
export function addToHistory(entry: Omit<BrowsingHistoryEntry, "visitedAt">): void {
  if (typeof window === "undefined") return;
  const prev = getHistory();
  const filtered = prev.filter(
    (e) => !(e.lawId === entry.lawId && e.articleNum === entry.articleNum),
  );
  const next: BrowsingHistoryEntry[] = [
    { ...entry, visitedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, BROWSING_MAX);
  localStorage.setItem(BROWSING_KEY, JSON.stringify(next));
  addActivityPoints("view", entry.lawTitle);
}

/** Retrieve all browsing-history entries (newest first). */
export function getHistory(): BrowsingHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BROWSING_KEY) ?? "[]") as BrowsingHistoryEntry[];
  } catch {
    return [];
  }
}

/** Remove all browsing-history entries. */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BROWSING_KEY);
}

// ── Legacy API (backward compat with existing page.tsx / LawCopyButton) ──

/** @deprecated Use BrowsingHistoryEntry instead */
export interface HistoryEntry {
  law_id: string;
  law_title: string;
  law_num: string;
  visited_at: string;
}

/**
 * @deprecated Use addToHistory instead.
 * Records a law-level visit and also writes to the new browsing-history format.
 */
export function recordLawVisit(law_id: string, law_title: string, _law_num: string): void {
  // Write to the new format
  addToHistory({ lawId: law_id, lawTitle: law_title });
}

/**
 * @deprecated Use getHistory instead.
 * Returns recent laws in the old format for the homepage grid.
 */
export function getRecentLaws(): HistoryEntry[] {
  // Read from the new format and convert back to legacy shape
  const entries = getHistory();
  // Deduplicate by lawId (keep first = most recent)
  const seen = new Set<string>();
  const result: HistoryEntry[] = [];
  for (const e of entries) {
    if (seen.has(e.lawId)) continue;
    seen.add(e.lawId);
    result.push({
      law_id: e.lawId,
      law_title: e.lawTitle,
      law_num: "",
      visited_at: e.visitedAt,
    });
  }
  return result.slice(0, 8);
}
