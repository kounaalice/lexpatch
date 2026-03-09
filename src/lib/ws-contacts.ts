/**
 * 連絡先台帳 + 対応メモ — localStorage管理
 * C-VI-1: 連絡先台帳, C-VI-2: 対応メモ
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Contact {
  id: string;
  name: string;
  organization: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMemo {
  id: string;
  contactId: string;
  date: string; // YYYY-MM-DD
  content: string;
  category: string; // 電話 | メール | 打合せ | 訪問 | その他
  createdAt: string;
}

const CONTACTS_KEY = "lp_ws_contacts";
const MEMOS_KEY = "lp_ws_contact_memos";

function loadContacts(): Contact[] {
  return wsLoad<Contact[]>(CONTACTS_KEY, []);
}
function saveContacts(c: Contact[]) {
  wsSave(CONTACTS_KEY, c);
}
function loadMemos(): ContactMemo[] {
  return wsLoad<ContactMemo[]>(MEMOS_KEY, []);
}
function saveMemos(m: ContactMemo[]) {
  wsSave(MEMOS_KEY, m);
}

export function getAllContacts(): Contact[] {
  return loadContacts().sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export function getContact(id: string): Contact | undefined {
  return loadContacts().find((c) => c.id === id);
}

export function addContact(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Contact {
  const all = loadContacts();
  const now = new Date().toISOString();
  const c: Contact = { ...contact, id: uuid(), createdAt: now, updatedAt: now };
  all.push(c);
  saveContacts(all);
  return c;
}

export function updateContact(id: string, updates: Partial<Contact>) {
  const all = loadContacts();
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveContacts(all);
  }
}

export function deleteContact(id: string) {
  saveContacts(loadContacts().filter((c) => c.id !== id));
  saveMemos(loadMemos().filter((m) => m.contactId !== id));
}

export function searchContacts(q: string): Contact[] {
  const lower = q.toLowerCase();
  return getAllContacts().filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.organization.toLowerCase().includes(lower) ||
      c.email.toLowerCase().includes(lower) ||
      c.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}

export function getMemosForContact(contactId: string): ContactMemo[] {
  return loadMemos()
    .filter((m) => m.contactId === contactId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addMemo(memo: Omit<ContactMemo, "id" | "createdAt">): ContactMemo {
  const all = loadMemos();
  const m: ContactMemo = { ...memo, id: uuid(), createdAt: new Date().toISOString() };
  all.push(m);
  saveMemos(all);
  return m;
}

export function deleteMemo(id: string) {
  saveMemos(loadMemos().filter((m) => m.id !== id));
}

export function exportContactsCsv(): string {
  const bom = "\uFEFF";
  const header = "名前,組織,部署,役職,メール,電話,住所,タグ";
  const rows = getAllContacts().map((c) =>
    [
      c.name,
      c.organization,
      c.department,
      c.position,
      c.email,
      c.phone,
      c.address,
      c.tags.join(";"),
    ]
      .map((f) => (f.includes(",") || f.includes('"') ? `"${f.replace(/"/g, '""')}"` : f))
      .join(","),
  );
  return bom + [header, ...rows].join("\n");
}

export const MEMO_CATEGORIES = ["電話", "メール", "打合せ", "訪問", "その他"];
