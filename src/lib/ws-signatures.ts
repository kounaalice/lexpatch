/**
 * 電子署名管理 — localStorage管理
 * C-XIII-4: テキスト・手書き署名の作成・管理
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Signature {
  id: string;
  type: "text" | "drawn";
  name: string;
  textValue?: string; // text type
  fontFamily?: string; // text type
  dataUrl?: string; // drawn type (canvas toDataURL)
  isDefault: boolean;
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_signatures";

export const SIGNATURE_FONTS = [
  "cursive",
  "serif",
  "'BIZ UDPGothic', sans-serif",
  "'Georgia', serif",
  "'Palatino Linotype', serif",
];

function load(): Signature[] {
  return wsLoad<Signature[]>(STORAGE_KEY, []);
}
function save(sigs: Signature[]) {
  wsSave(STORAGE_KEY, sigs);
}

export function getAllSignatures(): Signature[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSignature(id: string): Signature | undefined {
  return load().find((s) => s.id === id);
}

export function getDefaultSignature(): Signature | undefined {
  return load().find((s) => s.isDefault);
}

export function addTextSignature(data: {
  name: string;
  textValue: string;
  fontFamily: string;
}): Signature {
  const sigs = load();
  const sig: Signature = {
    id: uuid(),
    type: "text",
    name: data.name,
    textValue: data.textValue,
    fontFamily: data.fontFamily,
    isDefault: sigs.length === 0,
    createdAt: new Date().toISOString(),
  };
  sigs.push(sig);
  save(sigs);
  return sig;
}

export function addDrawnSignature(data: { name: string; dataUrl: string }): Signature {
  const sigs = load();
  const sig: Signature = {
    id: uuid(),
    type: "drawn",
    name: data.name,
    dataUrl: data.dataUrl,
    isDefault: sigs.length === 0,
    createdAt: new Date().toISOString(),
  };
  sigs.push(sig);
  save(sigs);
  return sig;
}

export function setDefault(id: string) {
  const sigs = load();
  for (const s of sigs) s.isDefault = s.id === id;
  save(sigs);
}

export function deleteSignature(id: string) {
  const sigs = load().filter((s) => s.id !== id);
  if (sigs.length > 0 && !sigs.some((s) => s.isDefault)) {
    sigs[0].isDefault = true;
  }
  save(sigs);
}
