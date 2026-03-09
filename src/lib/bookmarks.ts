import { addActivityPoints } from "./gaming";

export interface Bookmark {
  lawId: string;
  lawTitle: string;
  articleNum?: string;
  articleTitle?: string;
  memo?: string;
  createdAt: string; // ISO string
}

const BOOKMARKS_KEY = "lp_bookmarks";

function readStorage(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(bookmarks: Bookmark[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

function matches(b: Bookmark, lawId: string, articleNum?: string): boolean {
  if (b.lawId !== lawId) return false;
  if (articleNum === undefined) return b.articleNum === undefined;
  return b.articleNum === articleNum;
}

export function getBookmarks(): Bookmark[] {
  return readStorage();
}

export function addBookmark(bookmark: Omit<Bookmark, "createdAt">): void {
  const bookmarks = readStorage();
  // Prevent duplicates
  if (bookmarks.some((b) => matches(b, bookmark.lawId, bookmark.articleNum))) {
    return;
  }
  bookmarks.unshift({
    ...bookmark,
    createdAt: new Date().toISOString(),
  });
  writeStorage(bookmarks);
  addActivityPoints("bookmark", bookmark.lawTitle);
}

export function removeBookmark(lawId: string, articleNum?: string): void {
  const bookmarks = readStorage();
  writeStorage(bookmarks.filter((b) => !matches(b, lawId, articleNum)));
}

export function isBookmarked(lawId: string, articleNum?: string): boolean {
  return readStorage().some((b) => matches(b, lawId, articleNum));
}

export function updateBookmarkMemo(
  lawId: string,
  articleNum: string | undefined,
  memo: string,
): void {
  const bookmarks = readStorage();
  const target = bookmarks.find((b) => matches(b, lawId, articleNum));
  if (target) {
    target.memo = memo;
    writeStorage(bookmarks);
  }
}

export function getBookmarkCount(): number {
  return readStorage().length;
}
