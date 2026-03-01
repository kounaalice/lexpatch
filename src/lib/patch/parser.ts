import type { PatchData, PatchLine, PatchOp } from "./types";

// 全角数字 → 項番号として認識するパターン
const PARA_NUM_RE = /^[１２３４５６７８９０\d]+$/;

// 行頭の記号を判定
function detectOp(line: string): { op: PatchOp; rest: string } {
  if (line.startsWith("+")) return { op: "add", rest: line.slice(1) };
  if (line.startsWith("-")) return { op: "del", rest: line.slice(1) };
  return { op: "ctx", rest: line };
}

// 「第〇〇条」パターン
const ARTICLE_HEADER_RE = /^[+-]?第[一二三四五六七八九十百千\d]+条/;

// 行テキストから項番号を切り出す
// 例: "１　この法律は…" → num="１", text="この法律は…"
function splitNumText(text: string): { num: string | null; text: string } {
  // 全角数字 or 半角数字 + 全角スペース or タブ
  const m = text.match(/^([１２３４５６７８９０\d]+)[　\t ]/);
  if (m && PARA_NUM_RE.test(m[1])) {
    return { num: m[1], text: text.slice(m[0].length).trimStart() };
  }
  return { num: null, text };
}

/**
 * プレーンテキスト（逐条パッチ記法）→ PatchData
 *
 * 入力例:
 *   第百十二条
 *   　代理権の消滅は、…
 *   ２　前項の規定にかかわらず、…
 *   +３　前二項の規定は、…
 *   -２　前項の規定にかかわらず、代理権消滅後…
 */
export function parsePatch(plainText: string, targetArticle?: string): PatchData {
  const rawLines = plainText.split(/\r?\n/);
  const lines: PatchLine[] = [];
  let detectedArticle = targetArticle ?? "";
  let patchType: "A" | "C" = "A";
  let foundHeader = false;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const { op, rest } = detectOp(trimmed);
    const restTrimmed = rest.trimStart();

    // 条番号ヘッダ行（例: "第百十二条" or "+第百十二条"）
    if (ARTICLE_HEADER_RE.test(trimmed)) {
      if (!foundHeader) {
        detectedArticle = restTrimmed.match(/^(第[一二三四五六七八九十百千\d]+条[のの二三四五六七八九十]*)/)
          ?.[1] ?? restTrimmed;
        foundHeader = true;
      }
      // C記法: +/− が条番号ヘッダについている
      if (op !== "ctx") patchType = "C";

      lines.push({
        op,
        num: null,
        text: restTrimmed,
        scope: true,
        rawLine,
      });
      continue;
    }

    // 通常行: 項番号 + 本文
    const { num, text } = splitNumText(restTrimmed);
    lines.push({ op, num, text, rawLine });
  }

  return { targetArticle: detectedArticle, patchType, lines };
}
