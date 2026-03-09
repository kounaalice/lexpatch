/**
 * 直接編集モード用のdiff計算
 * テキストをCanonLine配列に変換し、既存のdiff関数で比較する
 */

import type { CanonLine } from "./apply";
import type { DiffLine } from "./types";

/**
 * 条文テキスト（段落形式）をCanonLineに変換
 * 入力例:
 *   "　労働条件は、労働者と使用者が...\n２　労働条件の決定は..."
 * →
 *   [{ num: null, text: "労働条件は..." }, { num: "２", text: "労働条件の決定は..." }]
 */
export function textToCanonLines(text: string): CanonLine[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const result: CanonLine[] = [];

  // 段落番号検出パターン（全角数字 or 半角数字）
  const numPattern = /^([１２３４５６７８９０\d]+)[　\t ]/;

  for (const line of lines) {
    const trimmed = line.replace(/^　/, ""); // 先頭全角スペース除去
    const match = trimmed.match(numPattern);
    if (match) {
      result.push({
        num: match[1],
        text: trimmed.slice(match[0].length),
      });
    } else {
      result.push({
        num: null,
        text: trimmed,
      });
    }
  }

  return result;
}

/**
 * CanonLine配列をテキストに変換（エディタ表示用）
 */
export function canonLinesToText(lines: CanonLine[]): string {
  return lines.map((l) => (l.num ? `${toFullWidth(l.num)}　${l.text}` : `　${l.text}`)).join("\n");
}

// 半角数字→全角数字
function toFullWidth(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}
// 全角数字→半角数字
function _toHalfWidth(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/**
 * 項番号の自動繰り下げ（renumber）
 *
 * 直接編集で項を追加・削除した際に後続の項番号を連番に振り直す。
 * num === null の行（条名・本文行）はスキップし、
 * num を持つ行だけを出現順に１、２、３… へ振り直す。
 *
 * 例:
 *   [null, "１", "３"]  →  [null, "１", "２"]
 *   [null, "１", "２", "２"]  →  [null, "１", "２", "３"]
 */
export function autoRenumber(lines: CanonLine[]): CanonLine[] {
  // 番号付き行が無い場合はそのまま返す
  const hasNum = lines.some((l) => l.num !== null);
  if (!hasNum) return lines;

  let counter = 1;
  return lines.map((line) => {
    if (line.num === null) return line;
    const newNum = toFullWidth(String(counter));
    counter++;
    if (newNum === line.num) return line; // 変更不要
    return { ...line, num: newNum };
  });
}

/**
 * DiffLine配列を +/- 記法のプレーンテキストに変換（保存用）
 *
 * parsePatch() が期待するフォーマットを生成する。
 * 例:
 *   第一条
 *    　この法律は…
 *   -２　旧テキスト
 *   +２　新テキスト
 */
export function diffToPlainText(articleTitle: string, diffLines: DiffLine[]): string {
  const out: string[] = [articleTitle];
  for (const dl of diffLines) {
    const body = dl.num ? `${dl.num}　${dl.text}` : `　${dl.text}`;
    if (dl.op === "add") out.push(`+${body}`);
    else if (dl.op === "del") out.push(`-${body}`);
    else out.push(` ${body}`);
  }
  return out.join("\n");
}
