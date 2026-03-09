/**
 * ref_law (参照法条) パーサー
 * courts.go.jp の参照法条テキストを構造化データに変換
 *
 * 入力例: "民法446条1項，民法465条の2第1項，刑訴法411条1号"
 * 出力: ParsedLawRef[]
 */

import type { ParsedLawRef } from "./types";
import { resolveLawName } from "./law-abbrev";

/** 全角数字→半角数字 (０=U+FF10 → 0=U+0030, 差分=0xFEE0) */
function normalizeDigits(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/**
 * ref_law テキストをカンマ区切りで分割
 * 法令名中のカンマ（「児童買春，児童ポルノ…」）を考慮
 */
function splitRefLaw(raw: string): string[] {
  // 先にグルーピング注記を除去: "（１，３，４につき）"
  const cleaned = raw.replace(/（[\d０-９，,、〜～]+につき）\s*/g, "");

  // 、(U+3001 読点) ，(U+FF0C 全角カンマ) ,(U+002C カンマ) すべてに対応
  const parts = cleaned.split(/[，,、]\s*/);
  const result: string[] = [];
  let buffer = "";

  for (const part of parts) {
    if (buffer) {
      buffer += "，" + part;
    } else {
      buffer = part;
    }

    // 条 を含んでいれば完結した参照
    if (/[\d０-９]+条/.test(buffer)) {
      result.push(buffer.trim());
      buffer = "";
    }
  }

  // 残りがあれば最後のエントリに結合
  if (buffer.trim()) {
    if (result.length > 0) {
      result[result.length - 1] += "，" + buffer.trim();
    } else {
      result.push(buffer.trim());
    }
  }

  return result;
}

/**
 * 個別の参照テキスト（例: "民法465条の2第1項1号"）を分解
 * @returns [法令名部分, 条番号, 項, 号] or null
 */
function parseOneRef(text: string): {
  lawNamePart: string;
  article: string;
  paragraph?: string;
  item?: string;
  subdivision?: string;
} | null {
  const normalized = normalizeDigits(text.trim());

  // パターン: {法令名}{条番号}条[の{枝番}][第{項}項][{号}号][前段|後段|本文|ただし書]
  // 末尾に「別表…」等の付属物がある場合も許容
  const m = normalized.match(
    /^(.+?)\s*(\d+)\s*条(?:\s*の\s*(\d+))?(?:\s*第?\s*(\d+)\s*項)?(?:\s*(\d+)\s*号)?(?:\s*(前段|後段|本文|ただし書))?/,
  );

  if (!m) return null;

  const lawNamePart = m[1].trim();
  const articleMain = m[2];
  const articleSub = m[3]; // 条の2 の 2
  const paragraph = m[4];
  const item = m[5];
  const subdivision = m[6];

  const article = articleSub ? `${articleMain}の${articleSub}` : articleMain;

  return { lawNamePart, article, paragraph, item, subdivision };
}

/**
 * ref_law テキスト全体をパース
 * @param refLaw "民法446条1項，民法465条の2第1項"
 * @returns パース成功した参照の配列
 */
export function parseRefLaw(refLaw: string): ParsedLawRef[] {
  if (!refLaw || !refLaw.trim()) return [];

  const segments = splitRefLaw(refLaw);
  const results: ParsedLawRef[] = [];

  for (const seg of segments) {
    const parsed = parseOneRef(seg);
    if (!parsed) continue;

    const resolved = resolveLawName(parsed.lawNamePart);
    if (!resolved) continue;

    const [lawName, lawId] = resolved;
    if (!lawId) continue; // 法令IDが空（人事院規則など）

    results.push({
      law_name: lawName,
      law_id: lawId,
      article: parsed.article,
      paragraph: parsed.paragraph,
      item: parsed.item,
      raw: seg,
    });
  }

  return results;
}

/**
 * 条番号を LexCard の URL 形式に変換
 * "709"       → "709"
 * "465の2"    → "465_2"
 * "41の2"     → "41_2"
 */
export function articleToUrlParam(article: string): string {
  return article.replace(/の/g, "_");
}

/**
 * LexCard URL 形式の条番号を表示形式に変換
 * "709"   → "第七百九条"  ← 不要、既存のtitleで対応
 * "709"   → "709条"
 */
export function articleToDisplay(article: string): string {
  return `${article.replace(/_/g, "の")}条`;
}
