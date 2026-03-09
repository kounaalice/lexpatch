/**
 * ナレッジベース + FAQ管理 — localStorage管理
 * C-IX-1: ナレッジベース, C-IX-2: FAQ管理
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFaq: boolean;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "lp_ws_knowledge";

function load(): KnowledgeArticle[] {
  return wsLoad<KnowledgeArticle[]>(STORAGE_KEY, []);
}
function save(articles: KnowledgeArticle[]) {
  wsSave(STORAGE_KEY, articles);
}

export function getAllArticles(): KnowledgeArticle[] {
  return load().sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function getFaqArticles(): KnowledgeArticle[] {
  return getAllArticles().filter((a) => a.isFaq);
}

export function getArticle(id: string): KnowledgeArticle | undefined {
  return load().find((a) => a.id === id);
}

export function addArticle(
  article: Omit<KnowledgeArticle, "id" | "viewCount" | "createdAt" | "updatedAt">,
): KnowledgeArticle {
  const all = load();
  const now = new Date().toISOString();
  const a: KnowledgeArticle = {
    ...article,
    id: uuid(),
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  all.push(a);
  save(all);
  return a;
}

export function updateArticle(id: string, updates: Partial<KnowledgeArticle>) {
  const all = load();
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(all);
  }
}

export function deleteArticle(id: string) {
  save(load().filter((a) => a.id !== id));
}

export function incrementViewCount(id: string) {
  const all = load();
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) {
    all[idx].viewCount++;
    save(all);
  }
}

export function searchArticles(q: string): KnowledgeArticle[] {
  const lower = q.toLowerCase();
  return getAllArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(lower) ||
      a.content.toLowerCase().includes(lower) ||
      a.tags.some((t) => t.toLowerCase().includes(lower)) ||
      a.category.toLowerCase().includes(lower),
  );
}

export function getCategories(): string[] {
  const cats = new Set(
    load()
      .map((a) => a.category)
      .filter(Boolean),
  );
  return Array.from(cats).sort();
}

export const DEFAULT_CATEGORIES = [
  "一般",
  "業務手順",
  "法令解説",
  "システム",
  "規程",
  "テンプレート",
];
