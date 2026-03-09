/**
 * 資格・期限管理 — localStorage管理
 * C-XII-3: 資格・期限管理
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Certification {
  id: string;
  name: string;
  holder: string;
  issuer: string;
  category: string;
  acquiredDate: string;
  expiryDate: string | null;
  status: "active" | "expired" | "pending";
  certNumber: string;
  notes: string;
  alertDays: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "lp_ws_certifications";

function load(): Certification[] {
  return wsLoad<Certification[]>(STORAGE_KEY, []);
}
function save(certs: Certification[]) {
  wsSave(STORAGE_KEY, certs);
}

export function getAllCertifications(): Certification[] {
  return load().sort(
    (a, b) => a.holder.localeCompare(b.holder, "ja") || a.name.localeCompare(b.name, "ja"),
  );
}

export function addCertification(
  c: Omit<Certification, "id" | "createdAt" | "updatedAt">,
): Certification {
  const all = load();
  const now = new Date().toISOString();
  const cert: Certification = { ...c, id: uuid(), createdAt: now, updatedAt: now };
  all.push(cert);
  save(all);
  return cert;
}

export function updateCertification(id: string, updates: Partial<Certification>) {
  const all = load();
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(all);
  }
}

export function deleteCertification(id: string) {
  save(load().filter((c) => c.id !== id));
}

export function getExpiringCertifications(withinDays: number = 60): Certification[] {
  const now = new Date();
  const limit = new Date(now.getTime() + withinDays * 86400000);
  return getAllCertifications().filter((c) => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    return exp >= now && exp <= limit;
  });
}

export function getExpiredCertifications(): Certification[] {
  const now = new Date().toISOString().slice(0, 10);
  return getAllCertifications().filter((c) => c.expiryDate && c.expiryDate < now);
}

export const CERT_CATEGORIES = [
  "国家資格",
  "民間資格",
  "社内認定",
  "免許",
  "許可",
  "届出",
  "その他",
];
