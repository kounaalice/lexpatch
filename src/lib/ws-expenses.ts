/**
 * 経費・単価設定・見積請求 — localStorage管理
 * C-IV: 経費・見積・請求
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Rate {
  id: string;
  label: string;
  rate: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  type: "estimate" | "invoice";
  title: string;
  client: string;
  items: InvoiceItem[];
  taxRate: number;
  status: "draft" | "sent" | "paid";
  createdAt: string;
}

const EXP_KEY = "lp_ws_expenses";
const RATE_KEY = "lp_ws_rates";
const INV_KEY = "lp_ws_invoices";

function loadArr<T>(key: string): T[] {
  return wsLoad<T[]>(key, []);
}
function saveArr<T>(key: string, data: T[]) {
  wsSave(key, data);
}

// Expenses
export function getAllExpenses(): Expense[] {
  return loadArr<Expense>(EXP_KEY).sort((a, b) => b.date.localeCompare(a.date));
}
export function addExpense(e: Omit<Expense, "id" | "createdAt">): Expense {
  const all = loadArr<Expense>(EXP_KEY);
  const exp: Expense = { ...e, id: uuid(), createdAt: new Date().toISOString() };
  all.push(exp);
  saveArr(EXP_KEY, all);
  return exp;
}
export function updateExpense(id: string, updates: Partial<Expense>) {
  const all = loadArr<Expense>(EXP_KEY);
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    saveArr(EXP_KEY, all);
  }
}
export function deleteExpense(id: string) {
  saveArr(
    EXP_KEY,
    loadArr<Expense>(EXP_KEY).filter((e) => e.id !== id),
  );
}

// Rates
export function getAllRates(): Rate[] {
  return loadArr<Rate>(RATE_KEY);
}
export function addRate(label: string, rate: number): Rate {
  const all = loadArr<Rate>(RATE_KEY);
  const r: Rate = { id: uuid(), label, rate };
  all.push(r);
  saveArr(RATE_KEY, all);
  return r;
}
export function deleteRate(id: string) {
  saveArr(
    RATE_KEY,
    loadArr<Rate>(RATE_KEY).filter((r) => r.id !== id),
  );
}

// Invoices
export function getAllInvoices(): Invoice[] {
  return loadArr<Invoice>(INV_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getInvoice(id: string): Invoice | undefined {
  return loadArr<Invoice>(INV_KEY).find((i) => i.id === id);
}
export function addInvoice(inv: Omit<Invoice, "id" | "createdAt">): Invoice {
  const all = loadArr<Invoice>(INV_KEY);
  const i: Invoice = { ...inv, id: uuid(), createdAt: new Date().toISOString() };
  all.push(i);
  saveArr(INV_KEY, all);
  return i;
}
export function updateInvoice(id: string, updates: Partial<Invoice>) {
  const all = loadArr<Invoice>(INV_KEY);
  const idx = all.findIndex((i) => i.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    saveArr(INV_KEY, all);
  }
}
export function deleteInvoice(id: string) {
  saveArr(
    INV_KEY,
    loadArr<Invoice>(INV_KEY).filter((i) => i.id !== id),
  );
}

export function calcSubtotal(items: InvoiceItem[]): number {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}
export function calcTax(items: InvoiceItem[], taxRate: number): number {
  return Math.floor((calcSubtotal(items) * taxRate) / 100);
}
export function calcTotal(items: InvoiceItem[], taxRate: number): number {
  return calcSubtotal(items) + calcTax(items, taxRate);
}

export const EXPENSE_CATEGORIES = [
  "交通費",
  "通信費",
  "消耗品",
  "会議費",
  "交際費",
  "書籍",
  "その他",
];
export const STATUS_LABELS: Record<string, string> = {
  pending: "申請中",
  approved: "承認",
  rejected: "却下",
  draft: "下書き",
  sent: "送付済",
  paid: "入金済",
};
export const STATUS_COLORS: Record<string, string> = {
  pending: "#D97706",
  approved: "#059669",
  rejected: "#DC2626",
  draft: "#6B7280",
  sent: "#0369A1",
  paid: "#059669",
};
