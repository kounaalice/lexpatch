/**
 * 作業時間打刻 — localStorage管理
 * C-VII-1: 出退勤・作業時間記録
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut: string | null;
  breakMinutes: number;
  memo: string;
  category: string;
}

const STORAGE_KEY = "lp_ws_timetrack";

function load(): TimeEntry[] {
  return wsLoad<TimeEntry[]>(STORAGE_KEY, []);
}
function save(entries: TimeEntry[]) {
  wsSave(STORAGE_KEY, entries);
}

export function getAllEntries(): TimeEntry[] {
  return load().sort((a, b) => {
    const da = `${a.date}T${a.clockIn}`;
    const db = `${b.date}T${b.clockIn}`;
    return db.localeCompare(da);
  });
}

export function getEntriesByDateRange(from: string, to: string): TimeEntry[] {
  return getAllEntries().filter((e) => e.date >= from && e.date <= to);
}

export function getEntriesToday(): TimeEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return getAllEntries().filter((e) => e.date === today);
}

export function addEntry(entry: Omit<TimeEntry, "id">): TimeEntry {
  const entries = load();
  const newEntry: TimeEntry = { ...entry, id: uuid() };
  entries.push(newEntry);
  save(entries);
  return newEntry;
}

export function updateEntry(id: string, updates: Partial<TimeEntry>) {
  const entries = load();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...updates };
    save(entries);
  }
}

export function deleteEntry(id: string) {
  save(load().filter((e) => e.id !== id));
}

/** 勤務時間（分）= clockOut - clockIn - breakMinutes */
export function calcWorkMinutes(entry: TimeEntry): number | null {
  if (!entry.clockOut) return null;
  const [ih, im] = entry.clockIn.split(":").map(Number);
  const [oh, om] = entry.clockOut.split(":").map(Number);
  const total = oh * 60 + om - (ih * 60 + im) - entry.breakMinutes;
  return Math.max(0, total);
}

/** 分→時間表示 */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m > 0 ? `${m}分` : ""}`;
}

/** 日次・週次・月次集計 */
export function summarize(entries: TimeEntry[]): {
  totalMinutes: number;
  workDays: number;
  avgMinutes: number;
} {
  const days = new Set<string>();
  let totalMinutes = 0;
  for (const e of entries) {
    const m = calcWorkMinutes(e);
    if (m !== null) {
      totalMinutes += m;
      days.add(e.date);
    }
  }
  const workDays = days.size;
  return {
    totalMinutes,
    workDays,
    avgMinutes: workDays > 0 ? Math.round(totalMinutes / workDays) : 0,
  };
}

export const CATEGORIES = ["通常勤務", "残業", "テレワーク", "外出", "研修", "その他"];
