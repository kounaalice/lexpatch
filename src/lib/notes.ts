// ── Unified Note Scanner (lp_memo_* + lp_annot_*) ──────────────
import { getHistory } from "./history";

/** Build a lawId → lawTitle lookup from browsing history */
function buildLawTitleMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of getHistory()) {
    if (!map.has(entry.lawId) && entry.lawTitle) {
      map.set(entry.lawId, entry.lawTitle);
    }
  }
  return map;
}

export interface NoteEntry {
  type: "memo" | "annotation";
  key: string; // localStorage key
  lawId: string;
  articleTitle: string;
  lineIndex?: number; // annotation のみ
  text: string;
  lawTitle?: string;
  updatedAt?: string; // ISO string
}

export interface NoteCounts {
  memos: number;
  annotations: number;
  total: number;
}

/** すべてのメモ・注釈を統合して返す（updatedAt 降順） */
export function getAllNotes(): NoteEntry[] {
  if (typeof window === "undefined") return [];
  const entries: NoteEntry[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (key.startsWith("lp_memo_")) {
      const entry = parseMemoKey(key);
      if (entry) entries.push(entry);
    } else if (key.startsWith("lp_annot_")) {
      const entry = parseAnnotationKey(key);
      if (entry) entries.push(entry);
    }
  }

  // Resolve missing lawTitle from browsing history
  const titleMap = buildLawTitleMap();
  for (const entry of entries) {
    if (!entry.lawTitle && titleMap.has(entry.lawId)) {
      entry.lawTitle = titleMap.get(entry.lawId);
    }
  }

  // updatedAt 降順（なければ末尾）
  entries.sort((a, b) => {
    const ta = a.updatedAt ?? "";
    const tb = b.updatedAt ?? "";
    return tb.localeCompare(ta);
  });

  return entries;
}

/** メモ・注釈の件数を返す */
export function getNoteCounts(): NoteCounts {
  if (typeof window === "undefined") return { memos: 0, annotations: 0, total: 0 };

  let memos = 0;
  let annotations = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("lp_memo_")) {
      const val = localStorage.getItem(key);
      if (val && val.trim()) memos++;
    } else if (key.startsWith("lp_annot_")) {
      const val = localStorage.getItem(key);
      if (val && val.trim()) annotations++;
    }
  }

  return { memos, annotations, total: memos + annotations };
}

/** 特定の条文の注釈数を返す */
export function getArticleAnnotationCount(lawId: string, articleTitle: string): number {
  if (typeof window === "undefined") return 0;
  const prefix = `lp_annot_${lawId}_${articleTitle}_`;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) count++;
  }
  return count;
}

/** 特定の条文にメモがあるか確認 */
export function hasArticleMemo(lawId: string, articleTitle: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `lp_memo_${lawId}_${articleTitle}`;
  const val = localStorage.getItem(key);
  return !!(val && val.trim());
}

// ── Internal parsers ──

function parseMemoKey(key: string): NoteEntry | null {
  const val = localStorage.getItem(key);
  if (!val || !val.trim()) return null;

  // Key format: lp_memo_{lawId}_{articleTitle}
  const rest = key.slice("lp_memo_".length);
  const lastUnderscore = rest.lastIndexOf("_");
  let lawId = rest;
  let articleTitle = "";
  if (lastUnderscore > 0) {
    lawId = rest.slice(0, lastUnderscore);
    articleTitle = rest.slice(lastUnderscore + 1);
  }

  try {
    const parsed = JSON.parse(val);
    return {
      type: "memo",
      key,
      lawId,
      articleTitle: parsed.articleTitle ?? articleTitle,
      text: typeof parsed === "string" ? parsed : (parsed.text ?? val),
      lawTitle: parsed.lawTitle,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return {
      type: "memo",
      key,
      lawId,
      articleTitle,
      text: val,
    };
  }
}

function parseAnnotationKey(key: string): NoteEntry | null {
  const val = localStorage.getItem(key);
  if (!val || !val.trim()) return null;

  // Key format: lp_annot_{lawId}_{articleTitle}_{lineIndex}
  const rest = key.slice("lp_annot_".length);
  // lineIndex は末尾の数字
  const lastUnderscore = rest.lastIndexOf("_");
  if (lastUnderscore < 0) return null;

  const lineIndexStr = rest.slice(lastUnderscore + 1);
  const lineIndex = parseInt(lineIndexStr, 10);
  if (isNaN(lineIndex)) return null;

  const beforeLineIndex = rest.slice(0, lastUnderscore);
  // lawId と articleTitle の分離: articleTitle は「第〜条」等の日本語
  // lawId は英数字+記号のパターンが多い
  // 最後の _ から lineIndex を取り除いた残りを lawId_articleTitle として扱う
  const secondLastUnderscore = beforeLineIndex.lastIndexOf("_");
  let lawId = beforeLineIndex;
  let articleTitle = "";
  if (secondLastUnderscore > 0) {
    lawId = beforeLineIndex.slice(0, secondLastUnderscore);
    articleTitle = beforeLineIndex.slice(secondLastUnderscore + 1);
  }

  try {
    const parsed = JSON.parse(val);
    return {
      type: "annotation",
      key,
      lawId,
      articleTitle,
      lineIndex,
      text: parsed.text ?? val,
      lawTitle: parsed.lawTitle,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return {
      type: "annotation",
      key,
      lawId,
      articleTitle,
      lineIndex,
      text: val,
    };
  }
}
