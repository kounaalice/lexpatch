// ── Personal workspace calendar events (localStorage) ──

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface WsEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  color: string;
  category?: string;
  recurrence?: string; // none | daily | weekly | monthly | yearly
  reminder?: number; // minutes before (0=at time, 5,10,15,30,60)
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_events";
const COLORS = ["#0369A1", "#7C3AED", "#059669", "#D97706", "#DC2626", "#DB2777", "#4F46E5"];

export function getDefaultColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getAllEvents(): WsEvent[] {
  return wsLoad<WsEvent[]>(STORAGE_KEY, []);
}

export function getEventsInRange(from: string, to: string): WsEvent[] {
  const all = getAllEvents();
  return all.filter((e) => {
    if (e.startDate > to) return false;
    const end = e.endDate || e.startDate;
    if (end < from) return false;
    // Handle recurrence
    if (e.recurrence && e.recurrence !== "none") {
      return checkRecurrence(e, from, to);
    }
    return true;
  });
}

function checkRecurrence(e: WsEvent, from: string, to: string): boolean {
  // Simple recurrence check — does any occurrence fall within range?
  const start = new Date(e.startDate);
  const _rangeFrom = new Date(from);
  const rangeTo = new Date(to);
  const d = new Date(start);
  for (let i = 0; i < 400; i++) {
    if (d > rangeTo) return false;
    const ds = toYMD(d);
    if (ds >= from && ds <= to) return true;
    switch (e.recurrence) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        return false;
    }
  }
  return false;
}

/** Get occurrences of an event in a date range */
export function expandRecurrences(e: WsEvent, from: string, to: string): string[] {
  if (!e.recurrence || e.recurrence === "none") {
    return e.startDate >= from && e.startDate <= to ? [e.startDate] : [];
  }
  const dates: string[] = [];
  const d = new Date(e.startDate);
  const rangeTo = new Date(to);
  for (let i = 0; i < 400 && d <= rangeTo; i++) {
    const ds = toYMD(d);
    if (ds >= from && ds <= to) dates.push(ds);
    switch (e.recurrence) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        return dates;
    }
  }
  return dates;
}

export function addEvent(event: Omit<WsEvent, "id" | "createdAt">): WsEvent {
  const all = getAllEvents();
  const newEvent: WsEvent = {
    ...event,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  all.push(newEvent);
  wsSave(STORAGE_KEY, all);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Omit<WsEvent, "id" | "createdAt">>): void {
  const all = getAllEvents();
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    wsSave(STORAGE_KEY, all);
  }
}

export function deleteEvent(id: string): void {
  const all = getAllEvents().filter((e) => e.id !== id);
  wsSave(STORAGE_KEY, all);
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const EVENT_COLORS = COLORS;
export const REMINDER_OPTIONS = [
  { value: -1, label: "なし" },
  { value: 0, label: "開始時刻" },
  { value: 5, label: "5分前" },
  { value: 10, label: "10分前" },
  { value: 15, label: "15分前" },
  { value: 30, label: "30分前" },
  { value: 60, label: "1時間前" },
];

const REMINDED_KEY = "lp_ws_reminded";

function getRemindedIds(): Set<string> {
  try {
    const today = toYMD(new Date());
    const data = wsLoad<{ date?: string; ids?: string[] }>(REMINDED_KEY, {});
    if (data.date !== today) return new Set();
    return new Set(data.ids || []);
  } catch {
    return new Set();
  }
}

function markReminded(eventId: string, dateStr: string) {
  const today = toYMD(new Date());
  const data = wsLoad<{ date?: string; ids?: string[] }>(REMINDED_KEY, {});
  if (data.date !== today) {
    wsSave(REMINDED_KEY, { date: today, ids: [eventId + dateStr] });
  } else {
    const ids = data.ids || [];
    ids.push(eventId + dateStr);
    wsSave(REMINDED_KEY, { date: today, ids });
  }
}

/** Check and fire browser notifications for upcoming events. Call on interval. */
export function checkReminders() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const today = toYMD(now);
  const events = getEventsInRange(today, today);
  const reminded = getRemindedIds();

  for (const e of events) {
    if (e.reminder === undefined || e.reminder < 0 || !e.startTime) continue;
    const key = e.id + today;
    if (reminded.has(key)) continue;

    const [h, m] = e.startTime.split(":").map(Number);
    const eventTime = new Date(now);
    eventTime.setHours(h, m, 0, 0);
    const triggerTime = new Date(eventTime.getTime() - e.reminder * 60 * 1000);
    const diff = now.getTime() - triggerTime.getTime();

    // Fire if within 2-minute window after trigger time
    if (diff >= 0 && diff < 120_000) {
      markReminded(e.id, today);
      new Notification(`${e.title}`, {
        body: e.reminder > 0 ? `${e.reminder}分後に開始` : "まもなく開始",
        icon: "/icon-192.png",
        tag: key,
      });
    }
  }
}
