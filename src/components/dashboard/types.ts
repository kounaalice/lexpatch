export type WidgetId =
  | "stats"
  | "tasks"
  | "upcoming"
  | "gaming"
  | "bookmarks"
  | "follows"
  | "history"
  | "notes"
  | "agencies"
  | "ai"
  | "w100";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  stats: "クイック統計",
  tasks: "横断タスク",
  upcoming: "施行・公布予定",
  gaming: "ゲーミング統計",
  bookmarks: "ブックマーク",
  follows: "フォロー中",
  history: "閲覧履歴",
  notes: "マイノート",
  agencies: "関連行政機関",
  ai: "AIアシスタント",
  w100: "W100 知識分類",
};

export const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
  stats: true,
  tasks: true,
  upcoming: true,
  gaming: true,
  bookmarks: true,
  follows: true,
  history: true,
  notes: true,
  agencies: true,
  ai: true,
  w100: true,
};

const STORAGE_KEY = "lp_dashboard_widgets";

export function loadWidgetVisibility(): Record<WidgetId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_VISIBILITY, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_VISIBILITY };
}

export function saveWidgetVisibility(v: Record<WidgetId, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

const ORDER_STORAGE_KEY = "lp_dashboard_widget_order";

const DEFAULT_ORDER: WidgetId[] = [
  "stats",
  "tasks",
  "upcoming",
  "gaming",
  "bookmarks",
  "follows",
  "history",
  "notes",
  "agencies",
  "ai",
  "w100",
];

export function loadWidgetOrder(): WidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (raw) {
      const parsed: WidgetId[] = JSON.parse(raw);
      // Ensure all widget IDs are present (merge with defaults for new widgets)
      const known = new Set(parsed);
      const merged = [...parsed];
      for (const id of DEFAULT_ORDER) {
        if (!known.has(id)) {
          merged.push(id);
        }
      }
      return merged;
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_ORDER];
}

export function saveWidgetOrder(order: WidgetId[]): void {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}
