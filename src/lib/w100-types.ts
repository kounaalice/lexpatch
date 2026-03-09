/**
 * W100知識分類法 — 型定義
 * 4次元座標系: CC(分野) × TT(主題) × AA(観点) × UU(細分)
 */

// ── CC: Conceptual Category (分野コード 00-99) ──

export interface W100FieldGroup {
  id: string;
  range: string; // "00-09"
  label: string; // "総合・基礎方法"
  color: string; // テキスト色
  bg: string; // 背景色
}

export interface W100Field {
  code: string; // "00"-"99"
  name: string; // "総合・百科・序論"
  groupId: string; // FieldGroup.id
  description?: string; // 分野の説明文（PDF本文より）
}

// ── TT: Teaching Topic (主題コード 00-99) ──

export interface W100TopicGroup {
  range: string; // "00-09"
  label: string; // "基礎・定義"
}

export interface W100Topic {
  code: string; // "00"-"99"
  name: string; // 各CC固有の主題名
  fieldCode: string; // 所属CC
  groupRange: string; // "00-09" etc.
}

// ── AA: Academic Aspect (観点コード 0-9) ──

export interface W100Aspect {
  code: string; // "0"-"9"
  label: string; // "基礎"
  description: string; // "定義・前提"
}

// ── UU: Unique Unit (細分コード 00-99) ──

export interface W100UnitSlot {
  code: string; // "00" | "01"-"98" | "99"
  type: "foundation" | "active" | "archive";
  label: string; // "基礎固定" | "現役領域" | "退避・博物館"
}

// ── 4次元座標 ──

export interface W100Coordinate {
  cc: string; // "00"-"99"
  tt: string; // "00"-"99"
  aa: string; // "0"-"9"
  uu: string; // "00"-"99"
}

/** W CC.TT.AA.UU 形式の完全コード (例: "W27.40.04.15") */
export function formatCoordinate(c: W100Coordinate): string {
  return `W${c.cc}.${c.tt}.${c.aa}${c.uu !== "00" ? `.${c.uu}` : ""}`;
}

/** "W27.40.04.15" → W100Coordinate パース */
export function parseCoordinate(code: string): W100Coordinate | null {
  // W + CC.TT.AA.UU or W + CC.TT.AA
  const m = code.match(/^W?(\d{2})\.(\d{2})\.(\d)(\d)(?:\.(\d{2}))?$/);
  if (!m) return null;
  return {
    cc: m[1],
    tt: m[2],
    aa: m[3],
    uu: m[5] ?? m[4] + "0", // AA の2桁目が UU の十の位になるケース対応
  };
}

/** 短縮コード: "W27" (CCのみ), "W27.40" (CC.TT) */
export function shortCode(cc: string, tt?: string): string {
  if (tt) return `W${cc}.${tt}`;
  return `W${cc}`;
}

// ── ユースケース ──

export interface W100UseCase {
  question: string; // "百科の定義や語源を知りたい"
  coordinate: string; // "00.00.00.00"
}

// ── 分野間接続 ──

export interface W100Connection {
  fromField: string; // CC code
  toField: string; // CC code
  type: "adjacent" | "cross" | "application";
  description: string;
}
