import type { PatchData } from "./types";

export interface CanonLine {
  num: string | null;
  text: string;
  indent?: number; // 0=paragraph(default), 1=item(号), 2=subitem(号細分), 3=sub-subitem
}

/**
 * Canon（現行条文の行配列）+ PatchData → NEW（溶け込み後の行配列）
 *
 * ルール:
 *   ctx 行 → Canonからそのままコピー
 *   del 行 → 除去（Canonの対応行を削除）
 *   add 行 → NEWに挿入
 *
 * 項番号の自動振り直しはしない（パッチに書かれた番号をそのまま使う）。
 * Lintで番号整合性を別途チェックする。
 */
export function applyPatch(canonLines: CanonLine[], patch: PatchData): CanonLine[] {
  // Canonを num → index で引けるようにする
  const canonByNum = new Map<string, number>();
  canonLines.forEach((cl, i) => {
    if (cl.num !== null) canonByNum.set(cl.num, i);
  });

  // 削除対象インデックスを収集
  const deletedIdx = new Set<number>();
  for (const pl of patch.lines) {
    if (pl.op === "del" && pl.num !== null) {
      const idx = canonByNum.get(pl.num);
      if (idx !== undefined) deletedIdx.add(idx);
    }
    if (pl.op === "del" && pl.num === null) {
      // 本文行（num=null）の削除: 最初の本文行を削除
      const idx = canonLines.findIndex((cl) => cl.num === null);
      if (idx >= 0) deletedIdx.add(idx);
    }
  }

  // Canonの残存行
  const surviving = canonLines.filter((_, i) => !deletedIdx.has(i));

  // add 行を適切な位置に挿入
  // 戦略: add 行の直前の ctx/del 行の num を手がかりに挿入位置を決める
  const result: CanonLine[] = [...surviving];

  const addLines = patch.lines.filter((pl) => pl.op === "add");

  for (const pl of addLines) {
    const newLine: CanonLine = { num: pl.num, text: pl.text };

    if (pl.num === null) {
      // 本文追加: 先頭に挿入
      result.unshift(newLine);
    } else {
      // 数値順に挿入（全角数字 → 半角に変換して比較）
      const numVal = toHalfWidth(pl.num);
      let insertAt = result.length;
      for (let i = 0; i < result.length; i++) {
        const existingNum = result[i].num;
        if (existingNum !== null && toHalfWidth(existingNum) > numVal) {
          insertAt = i;
          break;
        }
      }
      result.splice(insertAt, 0, newLine);
    }
  }

  return result;
}

// 全角数字を半角に変換してソート可能な文字列にする
function toHalfWidth(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/**
 * Article の paragraphs を CanonLine 配列に変換するユーティリティ
 * 号(Item) / 号細分(Subitem) を indent 付きでフラット化
 */
export function paragraphsToCanonLines(
  paragraphs: Array<{
    num: string;
    sentences: string[];
    items?: Array<{
      title: string;
      sentences: string[];
      subitems?: Array<{
        title: string;
        sentences: string[];
        subitems?: Array<{ title: string; sentences: string[] }>;
      }>;
    }>;
  }>,
): CanonLine[] {
  const result: CanonLine[] = [];
  for (const p of paragraphs) {
    // 項本文
    result.push({ num: p.num || null, text: p.sentences.join("") });
    // 号
    if (p.items) {
      for (const item of p.items) {
        result.push({
          num: null,
          text: `${item.title}\u3000${item.sentences.join("")}`,
          indent: 1,
        });
        // 号細分
        if (item.subitems) {
          for (const sub of item.subitems) {
            result.push({
              num: null,
              text: `${sub.title}\u3000${sub.sentences.join("")}`,
              indent: 2,
            });
            if (sub.subitems) {
              for (const sub2 of sub.subitems) {
                result.push({
                  num: null,
                  text: `${sub2.title}\u3000${sub2.sentences.join("")}`,
                  indent: 3,
                });
              }
            }
          }
        }
      }
    }
  }
  return result;
}
