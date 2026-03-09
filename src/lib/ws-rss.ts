/**
 * RSS/外部情報 — localStorage管理
 * C-III: RSS/外部情報フィード
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Feed {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  feedId: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  read: boolean;
}

const FEEDS_KEY = "lp_ws_rss_feeds";
const ITEMS_KEY = "lp_ws_rss_items";

function loadArr<T>(key: string): T[] {
  return wsLoad<T[]>(key, []);
}
function saveArr<T>(key: string, data: T[]) {
  wsSave(key, data);
}

// Feeds
export function getAllFeeds(): Feed[] {
  return loadArr<Feed>(FEEDS_KEY);
}
export function addFeed(f: { title: string; url: string; category: string }): Feed {
  const all = loadArr<Feed>(FEEDS_KEY);
  const feed: Feed = { ...f, id: uuid(), createdAt: new Date().toISOString() };
  all.push(feed);
  saveArr(FEEDS_KEY, all);
  return feed;
}
export function deleteFeed(id: string) {
  saveArr(
    FEEDS_KEY,
    loadArr<Feed>(FEEDS_KEY).filter((f) => f.id !== id),
  );
  saveArr(
    ITEMS_KEY,
    loadArr<FeedItem>(ITEMS_KEY).filter((i) => i.feedId !== id),
  );
}

// Items
export function getItemsByFeed(feedId: string): FeedItem[] {
  return loadArr<FeedItem>(ITEMS_KEY)
    .filter((i) => i.feedId === feedId)
    .sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}
export function getAllItems(): FeedItem[] {
  return loadArr<FeedItem>(ITEMS_KEY).sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}
export function addItem(item: Omit<FeedItem, "id" | "read">): FeedItem {
  const all = loadArr<FeedItem>(ITEMS_KEY);
  const fi: FeedItem = { ...item, id: uuid(), read: false };
  all.push(fi);
  saveArr(ITEMS_KEY, all);
  return fi;
}
export function markRead(id: string) {
  const all = loadArr<FeedItem>(ITEMS_KEY);
  const idx = all.findIndex((i) => i.id === id);
  if (idx >= 0) {
    all[idx].read = true;
    saveArr(ITEMS_KEY, all);
  }
}
export function markAllRead(feedId: string) {
  const all = loadArr<FeedItem>(ITEMS_KEY);
  for (const item of all) {
    if (item.feedId === feedId) item.read = true;
  }
  saveArr(ITEMS_KEY, all);
}
export function unreadCount(feedId: string): number {
  return loadArr<FeedItem>(ITEMS_KEY).filter((i) => i.feedId === feedId && !i.read).length;
}
export function totalUnread(): number {
  return loadArr<FeedItem>(ITEMS_KEY).filter((i) => !i.read).length;
}

export const PRESET_FEEDS = [
  { title: "e-Gov 法令検索 新着", url: "https://laws.e-gov.go.jp", category: "法令" },
  { title: "官報 最新号", url: "https://kanpou.npb.go.jp", category: "官報" },
  { title: "総務省 報道資料", url: "https://www.soumu.go.jp", category: "行政" },
  { title: "法務省 新着情報", url: "https://www.moj.go.jp", category: "行政" },
];

export const FEED_CATEGORIES = ["法令", "官報", "行政", "業界", "ニュース", "その他"];
