// ── ゲーミフィケーション: 閲覧XP + 活動ポイント ──────────────
// 閲覧XP（スクロール→レベル）と活動ポイント（アクション別）の2軸

import { loadSettings } from "./settings";
import { getSession } from "./session";
import { getCardProfileForSync, loadCardsFromDB, type CardCollectionProfile } from "./cards";

// ── 型定義 ──

export type ActivityType = "view" | "bookmark" | "follow" | "search" | "note";

export interface ActivityLogEntry {
  type: ActivityType;
  label?: string; // 「行政手続法を閲覧」等
  points: number;
  at: string; // ISO string
}

export interface DailyStats {
  readingXp: number;
  activityPoints: number;
  actions: number;
}

export interface GamingStats {
  readingXp: number;
  activityPoints: number;
  level: number;
  title: string;
  progress: number; // 0-100
  todayStats: DailyStats;
  todayLog: ActivityLogEntry[];
}

export interface GamingProfile {
  readingXp: number;
  activityPoints: number;
  activityLog: ActivityLogEntry[];
  dailyStats: Record<string, DailyStats>;
  cards?: CardCollectionProfile;
  syncedAt: string;
}

// ── 定数 ──

export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  view: 5,
  bookmark: 10,
  follow: 8,
  search: 3,
  note: 10,
};

export const ACTIVITY_EMOJI: Record<ActivityType, string> = {
  view: "\uD83D\uDCD6", // 📖
  bookmark: "\uD83D\uDD16", // 🔖
  follow: "\u2B50", // ⭐
  search: "\uD83D\uDD0D", // 🔍
  note: "\uD83D\uDCDD", // 📝
};

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  view: "法令閲覧",
  bookmark: "ブックマーク",
  follow: "フォロー",
  search: "検索",
  note: "ノート作成",
};

const TITLES = ["見習い", "法令探究者", "条文読み", "法令通", "法令マスター", "法令賢者", "法令王"];
const XP_PER_LEVEL = 200;
const LOG_MAX = 50;

// ── localStorage キー ──

const KEYS = {
  xp: "lp_xp", // 既存
  activityPoints: "lp_activity_points",
  activityLog: "lp_activity_log",
  dailyStats: "lp_daily_stats",
} as const;

// ── ヘルパー ──

function todayKey(): string {
  // JST 日付キー
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

function readNum(key: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(key) || "0", 10) || 0;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ── 公開API ──

/** 活動ポイントを加算（データ蓄積無効時は何もしない） */
export function addActivityPoints(type: ActivityType, label?: string): void {
  if (typeof window === "undefined") return;
  if (loadSettings().disableGamingData) return;

  const points = ACTIVITY_POINTS[type];

  // 活動ポイント合計
  const current = readNum(KEYS.activityPoints);
  localStorage.setItem(KEYS.activityPoints, String(current + points));

  // 活動ログ（50件上限）
  const log = readJSON<ActivityLogEntry[]>(KEYS.activityLog, []);
  log.unshift({
    type,
    label: label || ACTIVITY_LABEL[type],
    points,
    at: new Date().toISOString(),
  });
  if (log.length > LOG_MAX) log.length = LOG_MAX;
  localStorage.setItem(KEYS.activityLog, JSON.stringify(log));

  // 日別統計
  const daily = readJSON<Record<string, DailyStats>>(KEYS.dailyStats, {});
  const key = todayKey();
  const today = daily[key] || { readingXp: 0, activityPoints: 0, actions: 0 };
  today.activityPoints += points;
  today.actions += 1;
  daily[key] = today;
  // 古い日付を削除（7日分のみ保持）
  const keys = Object.keys(daily).sort().reverse();
  for (const k of keys.slice(7)) delete daily[k];
  localStorage.setItem(KEYS.dailyStats, JSON.stringify(daily));

  // CustomEvent でオーバーレイに通知
  window.dispatchEvent(new CustomEvent("lexcard:activity-point"));
}

/** 閲覧XPの日別統計を更新（GamingOverlayから呼出し） */
export function trackDailyReadingXp(delta: number): void {
  if (typeof window === "undefined") return;
  const daily = readJSON<Record<string, DailyStats>>(KEYS.dailyStats, {});
  const key = todayKey();
  const today = daily[key] || { readingXp: 0, activityPoints: 0, actions: 0 };
  today.readingXp += delta;
  daily[key] = today;
  localStorage.setItem(KEYS.dailyStats, JSON.stringify(daily));
}

/** 現在のゲーミング統計を取得 */
export function getGamingStats(): GamingStats {
  const readingXp = readNum(KEYS.xp);
  const activityPoints = readNum(KEYS.activityPoints);
  const level = Math.floor(readingXp / XP_PER_LEVEL) + 1;
  const progress = ((readingXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)] || TITLES[TITLES.length - 1];

  const daily = readJSON<Record<string, DailyStats>>(KEYS.dailyStats, {});
  const todayStats = daily[todayKey()] || { readingXp: 0, activityPoints: 0, actions: 0 };

  const allLog = readJSON<ActivityLogEntry[]>(KEYS.activityLog, []);
  const todayPrefix = todayKey();
  const todayLog = allLog.filter((e) => e.at.startsWith(todayPrefix));

  return { readingXp, activityPoints, level, title, progress, todayStats, todayLog };
}

// ── DB同期 ──

/** localStorage の gaming データを DB に同期（ページ離脱時に呼出し） */
export function syncGamingProfile(): void {
  const session = getSession();
  if (!session) return;

  const profile: GamingProfile = {
    readingXp: readNum(KEYS.xp),
    activityPoints: readNum(KEYS.activityPoints),
    activityLog: readJSON<ActivityLogEntry[]>(KEYS.activityLog, []),
    dailyStats: readJSON<Record<string, DailyStats>>(KEYS.dailyStats, {}),
    cards: getCardProfileForSync(),
    syncedAt: new Date().toISOString(),
  };

  // sendBeacon は header を送れないので、body に認証情報を含める（PUT エンドポイント）
  const payload = JSON.stringify({
    memberId: session.memberId,
    token: session.token,
    gaming_profile: profile,
  });
  const blob = new Blob([payload], { type: "application/json" });
  const url = `/api/members?action=sync_gaming`;

  // sendBeacon は POST で送信されるが、Next.js では PUT にルーティング不可
  // → keepalive fetch で PUT 送信
  fetch(url, {
    method: "PUT",
    body: blob,
    keepalive: true,
  }).catch(() => {});
}

/** DB から gaming_profile を読み込み、localStorage に復元（大きい方を採用） */
export function loadGamingFromDB(dbProfile: GamingProfile | null): void {
  if (typeof window === "undefined" || !dbProfile) return;

  const localXp = readNum(KEYS.xp);
  const localAp = readNum(KEYS.activityPoints);

  // 閲覧XP: 大きい方を採用
  if ((dbProfile.readingXp || 0) > localXp) {
    localStorage.setItem(KEYS.xp, String(dbProfile.readingXp));
  }

  // 活動ポイント: 大きい方を採用
  if ((dbProfile.activityPoints || 0) > localAp) {
    localStorage.setItem(KEYS.activityPoints, String(dbProfile.activityPoints));
  }

  // 活動ログ: DB側のログとマージ（重複排除、50件上限）
  if (dbProfile.activityLog?.length) {
    const local = readJSON<ActivityLogEntry[]>(KEYS.activityLog, []);
    const merged = [...local];
    const localTimes = new Set(local.map((e) => e.at));
    for (const entry of dbProfile.activityLog) {
      if (!localTimes.has(entry.at)) merged.push(entry);
    }
    merged.sort((a, b) => b.at.localeCompare(a.at));
    if (merged.length > LOG_MAX) merged.length = LOG_MAX;
    localStorage.setItem(KEYS.activityLog, JSON.stringify(merged));
  }

  // 日別統計: 各日の大きい方を採用
  if (dbProfile.dailyStats) {
    const local = readJSON<Record<string, DailyStats>>(KEYS.dailyStats, {});
    for (const [day, dbDay] of Object.entries(dbProfile.dailyStats)) {
      const localDay = local[day];
      if (!localDay) {
        local[day] = dbDay;
      } else {
        local[day] = {
          readingXp: Math.max(localDay.readingXp, dbDay.readingXp || 0),
          activityPoints: Math.max(localDay.activityPoints, dbDay.activityPoints || 0),
          actions: Math.max(localDay.actions, dbDay.actions || 0),
        };
      }
    }
    localStorage.setItem(KEYS.dailyStats, JSON.stringify(local));
  }

  // カードコレクション: マージ
  if (dbProfile.cards) {
    loadCardsFromDB(dbProfile.cards);
  }
}
