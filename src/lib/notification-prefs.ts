/**
 * 通知設定の型定義・デフォルト値・ヘルパー
 */

export interface WeeklySchedule {
  day: number; // 0=日, 1=月, ... 6=土
  time: string; // "HH:mm"
  count: number; // 週あたりの回数 (1-7)
}

export type AlertFrequency = "immediate" | "weekly";
export type LawScope = "bookmarked" | "categories" | "situations" | "all";

export interface AlertPref {
  enabled: boolean;
  frequency: AlertFrequency;
  email?: string; // カテゴリ別通知メール（未設定→アカウントメール）
}

export interface LawAlertPref extends AlertPref {
  scope: LawScope;
  weekly_schedule: WeeklySchedule;
}

export interface NotificationPrefs {
  project_notifications: AlertPref;
  task_alerts: AlertPref;
  message_alerts: AlertPref;
  law_promulgation: LawAlertPref;
  law_enforcement: LawAlertPref;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  project_notifications: { enabled: false, frequency: "immediate" },
  task_alerts: { enabled: false, frequency: "immediate" },
  message_alerts: { enabled: false, frequency: "immediate" },
  law_promulgation: {
    enabled: false,
    frequency: "weekly",
    scope: "bookmarked",
    weekly_schedule: { day: 1, time: "09:00", count: 1 },
  },
  law_enforcement: {
    enabled: false,
    frequency: "weekly",
    scope: "bookmarked",
    weekly_schedule: { day: 1, time: "09:00", count: 1 },
  },
};

/** 保存済み（部分的な）JSONB を完全な NotificationPrefs にマージ */
export function mergePrefs(saved: Record<string, unknown> | null | undefined): NotificationPrefs {
  if (!saved || typeof saved !== "object") return { ...DEFAULT_PREFS };

  const result = JSON.parse(JSON.stringify(DEFAULT_PREFS)) as NotificationPrefs;

  for (const key of Object.keys(DEFAULT_PREFS) as (keyof NotificationPrefs)[]) {
    const sv = saved[key];
    if (!sv || typeof sv !== "object") continue;

    const s = sv as Record<string, unknown>;
    const base = result[key];

    if (typeof s.enabled === "boolean") base.enabled = s.enabled;
    if (s.frequency === "immediate" || s.frequency === "weekly") base.frequency = s.frequency;

    // カテゴリ別通知メール
    if (typeof s.email === "string" && s.email.trim()) {
      (base as AlertPref).email = s.email.trim();
    }

    // 法令系の追加フィールド
    if (key === "law_promulgation" || key === "law_enforcement") {
      const lawBase = base as LawAlertPref;
      if (
        s.scope === "bookmarked" ||
        s.scope === "categories" ||
        s.scope === "situations" ||
        s.scope === "all"
      ) {
        lawBase.scope = s.scope;
      }
      if (s.weekly_schedule && typeof s.weekly_schedule === "object") {
        const ws = s.weekly_schedule as Record<string, unknown>;
        if (typeof ws.day === "number" && ws.day >= 0 && ws.day <= 6) {
          lawBase.weekly_schedule.day = ws.day;
        }
        if (typeof ws.time === "string" && /^\d{2}:\d{2}$/.test(ws.time)) {
          lawBase.weekly_schedule.time = ws.time;
        }
        if (typeof ws.count === "number" && ws.count >= 1 && ws.count <= 7) {
          lawBase.weekly_schedule.count = ws.count;
        }
      }
    }
  }

  return result;
}

/**
 * カテゴリ別の通知送信先メールを解決。
 * カテゴリ個別メール → アカウントメール の順にフォールバック。
 */
export function getNotificationEmail(
  prefs: NotificationPrefs,
  category: keyof NotificationPrefs,
  accountEmail: string,
): string {
  const p = prefs[category];
  return p.email?.trim() || accountEmail;
}

/** 特定カテゴリのメール通知が即時配信で有効か */
export function isImmediateEnabled(
  prefs: NotificationPrefs,
  category: keyof NotificationPrefs,
): boolean {
  const p = prefs[category];
  return p.enabled && p.frequency === "immediate";
}

/** 曜日ラベル */
export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** カテゴリの日本語ラベル */
export const CATEGORY_LABELS: Record<keyof NotificationPrefs, string> = {
  project_notifications: "プロジェクトお知らせ",
  task_alerts: "タスクアラート",
  message_alerts: "新メッセージ",
  law_promulgation: "法令公布アラート",
  law_enforcement: "施行アラート",
};

/** スコープの日本語ラベル */
export const SCOPE_LABELS: Record<LawScope, string> = {
  bookmarked: "ブックマーク法令",
  categories: "関心分野の法令",
  situations: "状況に合った法令",
  all: "全法令",
};
