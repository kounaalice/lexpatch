/**
 * 汎用ブックマーク — localStorage管理
 * C-XIII-1: 汎用ブックマーク
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface WsBookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_bookmarks";

function load(): WsBookmark[] {
  return wsLoad<WsBookmark[]>(STORAGE_KEY, []);
}
function save(bm: WsBookmark[]) {
  wsSave(STORAGE_KEY, bm);
}

export function getAllBookmarks(): WsBookmark[] {
  return load().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function addBookmark(bm: Omit<WsBookmark, "id" | "createdAt">): WsBookmark {
  const all = load();
  const b: WsBookmark = { ...bm, id: uuid(), createdAt: new Date().toISOString() };
  all.push(b);
  save(all);
  return b;
}

export function updateBookmark(id: string, updates: Partial<WsBookmark>) {
  const all = load();
  const idx = all.findIndex((b) => b.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    save(all);
  }
}

export function deleteBookmark(id: string) {
  save(load().filter((b) => b.id !== id));
}

export function searchBookmarks(q: string): WsBookmark[] {
  const lower = q.toLowerCase();
  return getAllBookmarks().filter(
    (b) =>
      b.title.toLowerCase().includes(lower) ||
      b.url.toLowerCase().includes(lower) ||
      b.description.toLowerCase().includes(lower) ||
      b.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}

export const BOOKMARK_CATEGORIES = [
  "法令",
  "判例",
  "行政",
  "ニュース",
  "ツール",
  "参考資料",
  "その他",
];
