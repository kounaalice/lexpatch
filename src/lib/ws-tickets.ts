/**
 * チケット管理 — localStorage管理
 * C-X-1: チケット管理
 */

import { wsLoad, wsSave, wsLoadRaw, wsSaveRaw } from "./ws-storage";
import { uuid } from "./uuid";

export interface Ticket {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  assignee: string;
  reporter: string;
  dueDate: string | null;
  tags: string[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_tickets";
const COUNTER_KEY = "lp_ws_ticket_counter";

function load(): Ticket[] {
  return wsLoad<Ticket[]>(STORAGE_KEY, []);
}
function save(tickets: Ticket[]) {
  wsSave(STORAGE_KEY, tickets);
}

function nextNumber(): number {
  const n = parseInt(wsLoadRaw(COUNTER_KEY, "0")) + 1;
  wsSaveRaw(COUNTER_KEY, String(n));
  return n;
}

export function getAllTickets(): Ticket[] {
  return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTicket(id: string): Ticket | undefined {
  return load().find((t) => t.id === id);
}

export function addTicket(
  ticket: Omit<Ticket, "id" | "number" | "comments" | "createdAt" | "updatedAt">,
): Ticket {
  const all = load();
  const now = new Date().toISOString();
  const t: Ticket = {
    ...ticket,
    id: uuid(),
    number: nextNumber(),
    comments: [],
    createdAt: now,
    updatedAt: now,
  };
  all.push(t);
  save(all);
  return t;
}

export function updateTicket(id: string, updates: Partial<Ticket>) {
  const all = load();
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(all);
  }
}

export function deleteTicket(id: string) {
  save(load().filter((t) => t.id !== id));
}

export function addComment(ticketId: string, content: string, author: string) {
  const all = load();
  const idx = all.findIndex((t) => t.id === ticketId);
  if (idx >= 0) {
    all[idx].comments.push({ id: uuid(), content, author, createdAt: new Date().toISOString() });
    all[idx].updatedAt = new Date().toISOString();
    save(all);
  }
}

export function getTicketStats(): {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
} {
  const all = load();
  return {
    open: all.filter((t) => t.status === "open").length,
    inProgress: all.filter((t) => t.status === "in_progress").length,
    resolved: all.filter((t) => t.status === "resolved").length,
    closed: all.filter((t) => t.status === "closed").length,
    total: all.length,
  };
}

export const STATUS_LABELS: Record<string, string> = {
  open: "未着手",
  in_progress: "対応中",
  resolved: "解決済",
  closed: "完了",
};
export const STATUS_COLORS: Record<string, string> = {
  open: "#D97706",
  in_progress: "#0369A1",
  resolved: "#059669",
  closed: "#6B7280",
};
export const PRIORITY_LABELS: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "緊急",
};
export const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",
  medium: "#0369A1",
  high: "#D97706",
  urgent: "#DC2626",
};
export const TICKET_CATEGORIES = ["バグ", "機能要望", "質問", "タスク", "改善", "その他"];
