/**
 * 契約台帳 + 社内規程管理 — localStorage管理
 * C-XI-1: 契約台帳, C-XI-2: 社内規程管理
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Contract {
  id: string;
  title: string;
  counterparty: string;
  type: string;
  status: "active" | "expired" | "terminated" | "draft";
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  amount: string;
  currency: string;
  notes: string;
  tags: string[];
  alertDays: number; // 期限N日前にアラート
  createdAt: string;
  updatedAt: string;
}

export interface Regulation {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string;
  content: string;
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

const CONTRACTS_KEY = "lp_ws_contracts";
const REGULATIONS_KEY = "lp_ws_regulations";

function loadContracts(): Contract[] {
  return wsLoad<Contract[]>(CONTRACTS_KEY, []);
}
function saveContracts(c: Contract[]) {
  wsSave(CONTRACTS_KEY, c);
}
function loadRegulations(): Regulation[] {
  return wsLoad<Regulation[]>(REGULATIONS_KEY, []);
}
function saveRegulations(r: Regulation[]) {
  wsSave(REGULATIONS_KEY, r);
}

// ── Contracts ──
export function getAllContracts(): Contract[] {
  return loadContracts().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addContract(c: Omit<Contract, "id" | "createdAt" | "updatedAt">): Contract {
  const all = loadContracts();
  const now = new Date().toISOString();
  const contract: Contract = { ...c, id: uuid(), createdAt: now, updatedAt: now };
  all.push(contract);
  saveContracts(all);
  return contract;
}

export function updateContract(id: string, updates: Partial<Contract>) {
  const all = loadContracts();
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveContracts(all);
  }
}

export function deleteContract(id: string) {
  saveContracts(loadContracts().filter((c) => c.id !== id));
}

export function getExpiringContracts(withinDays: number = 30): Contract[] {
  const now = new Date();
  const limit = new Date(now.getTime() + withinDays * 86400000);
  return getAllContracts().filter((c) => {
    if (c.status !== "active" || !c.endDate) return false;
    const end = new Date(c.endDate);
    return end >= now && end <= limit;
  });
}

// ── Regulations ──
export function getAllRegulations(): Regulation[] {
  return loadRegulations().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getRegulation(id: string): Regulation | undefined {
  return loadRegulations().find((r) => r.id === id);
}

export function addRegulation(r: Omit<Regulation, "id" | "createdAt" | "updatedAt">): Regulation {
  const all = loadRegulations();
  const now = new Date().toISOString();
  const reg: Regulation = { ...r, id: uuid(), createdAt: now, updatedAt: now };
  all.push(reg);
  saveRegulations(all);
  return reg;
}

export function updateRegulation(id: string, updates: Partial<Regulation>) {
  const all = loadRegulations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveRegulations(all);
  }
}

export function deleteRegulation(id: string) {
  saveRegulations(loadRegulations().filter((r) => r.id !== id));
}

export const CONTRACT_TYPES = [
  "業務委託",
  "秘密保持(NDA)",
  "売買",
  "賃貸借",
  "ライセンス",
  "保守",
  "派遣",
  "顧問",
  "その他",
];
export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  active: "有効",
  expired: "期限切れ",
  terminated: "解除済",
  draft: "下書き",
};
export const REGULATION_CATEGORIES = [
  "就業規則",
  "給与規程",
  "旅費規程",
  "情報セキュリティ",
  "ハラスメント防止",
  "個人情報保護",
  "内部通報",
  "その他",
];
