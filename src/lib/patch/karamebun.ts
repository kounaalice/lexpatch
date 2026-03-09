/**
 * 改め文（Amendment Text）生成
 *
 * 法制執務の標準的な改め文方式に準拠:
 *   - 字句の改正: 第○条[第○項]中「A」を「B」に改める。
 *   - 字句の削除: 第○条[第○項]中「A」を削る。
 *   - 字句の追加: 第○条[第○項]中「A」の下に「B」を加える。
 *   - 複数字句:   第○条第○項中「A」を「B」に、「C」を「D」に改める。
 *   - 全文改正:   第○条第○項を次のように改める。
 *   - 段落の削除: 第○条第○項を削る。
 *   - 段落の追加: 第○条に次の一項を加える。
 *
 * @see https://houseikyoku.sangiin.go.jp/column/column050.htm
 */

import type { CanonLine } from "./apply";

export interface KaramebunLine {
  text: string;
  detail?: string; // 加える項の内容等
}

// 全角数字→半角数字（キー正規化用）
function toHalf(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/** CanonLine の num を正規化して比較用キーにする（"1" と "１" を同一視） */
function normalizeKey(line: CanonLine): string {
  if (!line.num) return "__body__";
  return toHalf(line.num);
}

/**
 * 2つのCanonLine配列から改め文を生成
 */
export function generateKaramebun(
  articleTitle: string,
  original: CanonLine[],
  edited: CanonLine[],
): KaramebunLine[] {
  const results: KaramebunLine[] = [];

  // Build maps by normalized paragraph number
  const origMap = new Map<string, CanonLine>();
  const editMap = new Map<string, CanonLine>();
  const origOrder: string[] = [];
  const editOrder: string[] = [];

  for (const line of original) {
    const key = normalizeKey(line);
    origMap.set(key, line);
    origOrder.push(key);
  }
  for (const line of edited) {
    const key = normalizeKey(line);
    editMap.set(key, line);
    editOrder.push(key);
  }

  // 1. Deleted paragraphs (in original but not in edited)
  for (const key of origOrder) {
    if (!editMap.has(key)) {
      const para = paragraphRef(articleTitle, key);
      results.push({ text: `${para}を削る。` });
    }
  }

  // 2. Modified paragraphs (in both, text changed)
  for (const key of origOrder) {
    if (!editMap.has(key)) continue;
    const origText = origMap.get(key)!.text;
    const editText = editMap.get(key)!.text;
    if (origText === editText) continue;

    const para = paragraphRef(articleTitle, key);

    // 字句の差分を検出
    const substitutions = findSubstitutions(origText, editText);
    if (substitutions.length > 0 && substitutions.length <= 3) {
      // 字句の改正
      const parts: string[] = [];
      for (const s of substitutions) {
        if (s.type === "replace") {
          parts.push(`「${s.from}」を「${s.to}」に`);
        } else if (s.type === "delete") {
          parts.push(`「${s.from}」を削り`);
        } else if (s.type === "add") {
          parts.push(`「${s.context}」の下に「${s.to}」を加え`);
        }
      }
      // 末尾の動詞を整える
      if (parts.length === 1) {
        const s = substitutions[0];
        if (s.type === "replace") {
          results.push({ text: `${para}中「${s.from}」を「${s.to}」に改める。` });
        } else if (s.type === "delete") {
          results.push({ text: `${para}中「${s.from}」を削る。` });
        } else if (s.type === "add") {
          results.push({ text: `${para}中「${s.context}」の下に「${s.to}」を加える。` });
        }
      } else {
        // 複数置換: 最後だけ「改める。」
        const _last = parts[parts.length - 1];
        const rest = parts.slice(0, -1);
        const lastSub = substitutions[substitutions.length - 1];
        let lastText: string;
        if (lastSub.type === "replace") {
          lastText = `「${lastSub.from}」を「${lastSub.to}」に改める。`;
        } else if (lastSub.type === "delete") {
          lastText = `「${lastSub.from}」を削る。`;
        } else {
          lastText = `「${lastSub.context}」の下に「${lastSub.to}」を加える。`;
        }
        // 連結: 「A」を「B」に改め、「C」を「D」に改める。
        const chainParts = rest.map((p) => {
          // 「削り」→そのまま、「加え」→そのまま、「に」→「に改め」
          if (p.endsWith("に")) return p + "改め";
          if (p.endsWith("削り")) return p.slice(0, -1) + "り";
          if (p.endsWith("加え")) return p + "";
          return p;
        });
        results.push({
          text: `${para}中${chainParts.join("、")}、${lastText}`,
        });
      }
    } else {
      // 全文改正（差分が複雑すぎる場合）
      results.push({
        text: `${para}を次のように改める。`,
        detail: formatParagraph(key, editText),
      });
    }
  }

  // 3. Added paragraphs (in edited but not in original)
  for (const key of editOrder) {
    if (origMap.has(key)) continue;
    const line = editMap.get(key)!;
    results.push({
      text: `${articleTitle}に次の一項を加える。`,
      detail: formatParagraph(key, line.text),
    });
  }

  return results;
}

function paragraphRef(articleTitle: string, key: string): string {
  if (key === "__body__") return articleTitle;
  return `${articleTitle}第${toKanjiNum(key)}項`;
}

function formatParagraph(key: string, text: string): string {
  if (key === "__body__") return `　${text}`;
  // 第一項（「1」）は省略（法令出版の慣例）
  if (key === "1") return `　${text}`;
  return `${toFullWidthNum(key)}　${text}`;
}

// ─── 単語境界判定ヘルパー ──────────────────────────

/** 漢数字・全角数字・半角数字 */
function isJpNum(c: string): boolean {
  return c.length === 1 && /[0-9０-９一二三四五六七八九十百千万億兆零〇]/.test(c);
}

/** 法令文で数字に続く助数詞・単位 */
function isLegalCounter(c: string): boolean {
  return c.length === 1 && /[人年月日条項号円編章節款目歳度回個箇週]/.test(c);
}

/** 文字列が助詞のみで構成されているか */
function isParticleOnly(s: string): boolean {
  return /^[はがのをにでとへもより]+$/.test(s);
}

/** CJK統合漢字かどうか（漢数字含む） */
function isKanjiChar(c: string): boolean {
  return c.length === 1 && /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(c);
}

/** 文字列がすべて漢字で構成されているか（送り仮名なし） */
function isPureKanji(s: string): boolean {
  return s.length > 0 && [...s].every((c) => isKanjiChar(c));
}

// ─── 字句差分検出 ──────────────────────────────

interface Substitution {
  type: "replace" | "delete" | "add";
  from: string;
  to: string;
  context: string; // add 時の前文脈
}

/**
 * 2つの文字列の差分を「改め文」で使える字句置換として検出。
 * 1-3 個の置換を返す。検出できなければ空配列（→全文改正にフォールバック）。
 */
function findSubstitutions(orig: string, edit: string): Substitution[] {
  // 1. 文字レベルの最小差分を特定
  const [rawFrom, rawTo, rawP, rawS] = findDiffRegion(orig, edit);
  if (rawFrom.length === 0 && rawTo.length === 0) return [];

  // 2. 単語境界に調整（数字+助数詞、第X条、年号 等）
  const [prefixLen, suffixLen] = adjustToWordBoundaries(orig, edit, rawP, rawS);
  const fromPart = orig.slice(prefixLen, orig.length - suffixLen);
  const toPart = edit.slice(prefixLen, edit.length - suffixLen);

  // 差分が非常に長い場合は全文改正
  if (fromPart.length > 80 || toPart.length > 80) return [];

  // 差分領域内に共通部分があれば分割（2箇所の改正対応）
  if (fromPart.length > 0 && toPart.length > 0) {
    const split = trySplitDiffs(fromPart, toPart);
    if (split && split.length <= 3) {
      // 分割された各部分も単語境界を調整
      // from === to（境界調整で生じた同一部分）は除外
      const subs = split
        .filter((s) => s.from !== s.to)
        .map((s) => {
          const expanded = expandSplitBoundary(s.from, s.to, orig, prefixLen);
          return {
            type: "replace" as const,
            from: expanded.from,
            to: expanded.to,
            context: "",
          };
        })
        .filter((s) => s.from !== s.to); // 展開後も同一なら除外
      if (subs.length > 0 && subs.length <= 3) {
        return subs;
      }
      // フィルタで全て除外された場合はフォールスルー
    }
  }

  // 単一の差分
  return [buildSubstitution(fromPart, toPart, orig, prefixLen, suffixLen)];
}

/** prefix/suffix法で差分領域を特定 */
function findDiffRegion(orig: string, edit: string): [string, string, number, number] {
  let prefixLen = 0;
  while (
    prefixLen < orig.length &&
    prefixLen < edit.length &&
    orig[prefixLen] === edit[prefixLen]
  ) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    suffixLen < orig.length - prefixLen &&
    suffixLen < edit.length - prefixLen &&
    orig[orig.length - 1 - suffixLen] === edit[edit.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const fromPart = orig.slice(prefixLen, orig.length - suffixLen);
  const toPart = edit.slice(prefixLen, edit.length - suffixLen);
  return [fromPart, toPart, prefixLen, suffixLen];
}

/**
 * 差分境界を単語境界に調整する。
 *
 * 法制執務の原則：「一つの独立した意味を持つ字句」を単位として引用。
 * - 数字は助数詞・単位と一体（例: 七→七人、五→第五項）
 * - 年号は年数と一体（例: 二十二年→平成二十二年）
 * - 句点（。）は引用に含めない
 * - 助詞単独は引用しない（の、を 等 → 前の名詞を含める）
 *
 * @returns 調整後の [prefixLen, suffixLen]
 */
function adjustToWordBoundaries(
  orig: string,
  edit: string,
  prefixLen: number,
  suffixLen: number,
): [number, number] {
  let p = prefixLen;
  let s = suffixLen;
  const oLen = orig.length;
  const eLen = edit.length;

  // ヘルパー: 差分領域の前後の文字を取得
  const before = () => (p > 0 ? orig[p - 1] : "");
  const after = () => (s > 0 ? orig[oLen - s] : "");
  const from = () => orig.slice(p, oLen - s);

  // === 右展開: 数字の後に助数詞があれば含める ===
  {
    const f = from();
    if (f.length > 0 && s > 0 && isJpNum(f[f.length - 1])) {
      // 続く数字もまとめる（例: 差分末尾が「二」で次が「十」）
      while (s > 0 && isJpNum(after())) s--;
      // 助数詞を含める（年、月、日、人、条、項 等）
      if (s > 0 && isLegalCounter(after())) s--;
    }
  }

  // === 左展開: 先行する数字列 + 「第」を含める ===
  {
    const f = from();
    if (f.length > 0 && p > 0) {
      const first = f[0];
      // Case A: 数字が先行数字に続く（例: 「二」の前に「十」）
      if (isJpNum(first) && isJpNum(before())) {
        while (p > 0 && isJpNum(before())) p--;
        if (p > 0 && before() === "第") p--;
      }
      // Case B: 数字の前に「第」（例: 第五項の「五」変更）
      else if (isJpNum(first) && before() === "第") {
        p--;
      }
      // Case C: 助数詞の前に数字（例: 差分が「項」で前が「五」）
      else if (isLegalCounter(first) && isJpNum(before())) {
        while (p > 0 && isJpNum(before())) p--;
        if (p > 0 && before() === "第") p--;
      }
    }
  }

  // === 年号展開: 数字の前に平成・令和等があれば含める ===
  {
    const f = from();
    if (f.length > 0 && isJpNum(f[0]) && p >= 2) {
      const era = orig.slice(p - 2, p);
      if (["平成", "令和", "昭和", "大正", "明治"].includes(era)) {
        p -= 2;
      }
    }
  }

  // === 右再チェック（左展開で差分内容が変わった場合） ===
  {
    const f = from();
    if (f.length > 0 && s > 0 && isJpNum(f[f.length - 1])) {
      while (s > 0 && isJpNum(after())) s--;
      if (s > 0 && isLegalCounter(after())) s--;
    }
  }

  // === 名詞接尾辞の展開: 者・人・物 は直前の漢字と一体 ===
  // 例: 差分「未成年」+ サフィックス「者は…」 → 「未成年者」
  {
    const f = from();
    const t = edit.slice(p, eLen - s);
    if (
      f.length > 0 &&
      s > 0 &&
      isKanjiChar(f[f.length - 1]) &&
      /^[者人物]/.test(after()) &&
      isPureKanji(f) &&
      isPureKanji(t)
    ) {
      s--;
    }
  }

  // === 漢字熟語の左展開: 熟語の途中で切れないよう接頭漢字を含める ===
  // 例: プレフィックス末尾「成」+ 差分「年者」 → 「成年者」
  // 条件: 両差分が純漢字 ＋ プレフィックス末尾が漢字 ＋ その前が非漢字（語頭）
  {
    const f = from();
    const t = edit.slice(p, eLen - s);
    if (
      f.length > 0 &&
      p >= 2 &&
      isKanjiChar(f[0]) &&
      isKanjiChar(before()) &&
      isPureKanji(f) &&
      isPureKanji(t) &&
      !isKanjiChar(orig[p - 2])
    ) {
      p--;
    }
  }

  // === 句点除外: 「。」は引用に含めない ===
  {
    const f = from();
    if (f.length > 1 && f.endsWith("。")) {
      s++;
    }
  }

  // === 助詞のみの差分 → 左展開して直前の名詞を含める ===
  // 例: 「は」→「を」 ⇒ 「規定は」→「規定を」（直前の名詞を含める）
  // 最大4文字まで、読点・句点・助詞で停止
  {
    const f = from();
    if (f.length > 0 && f.length <= 2 && isParticleOnly(f) && p > 0) {
      const breakChars = "、。（）「」　";
      const MAX_PARTICLE_EXPAND = 4;
      let expanded = 0;
      while (p > 0 && expanded < MAX_PARTICLE_EXPAND) {
        const c = before();
        if (breakChars.includes(c)) break;
        // 助詞も単語境界として扱う（の、が、を 等）
        if (isParticleOnly(c)) break;
        p--;
        expanded++;
      }
    }
  }

  // 安全チェック
  if (p < 0) p = 0;
  if (s < 0) s = 0;
  if (p + s > Math.min(oLen, eLen)) {
    return [prefixLen, suffixLen]; // 調整が行き過ぎた場合はリバート
  }

  return [p, s];
}

/**
 * 差分領域内に共通テキストが挟まっている場合に分割を試みる。
 * 例: from="乙丙丁", to="AB丙EF" → [{from:"乙",to:"AB"}, {from:"丁",to:"EF"}]
 */
function trySplitDiffs(from: string, to: string): { from: string; to: string }[] | null {
  // 共通部分文字列を探す（最低3文字以上で一意性を確保）
  const MIN_COMMON = 3;
  let bestCommon = "";
  let bestFi = -1;
  let bestTi = -1;

  for (let len = from.length - 1; len >= MIN_COMMON; len--) {
    for (let fi = 1; fi <= from.length - len; fi++) {
      const candidate = from.slice(fi, fi + len);
      const ti = to.indexOf(candidate);
      if (ti > 0 && ti + len < to.length) {
        // 共通部分の前後に差分がある
        bestCommon = candidate;
        bestFi = fi;
        bestTi = ti;
        break;
      }
    }
    if (bestCommon) break;
  }

  if (!bestCommon) return null;

  const fromBefore = from.slice(0, bestFi);
  const fromAfter = from.slice(bestFi + bestCommon.length);
  const toBefore = to.slice(0, bestTi);
  const toAfter = to.slice(bestTi + bestCommon.length);

  // 各部分が空でないこと、かつ長すぎないこと
  if (fromBefore.length === 0 && toBefore.length === 0) return null;
  if (fromAfter.length === 0 && toAfter.length === 0) return null;
  if (fromBefore.length > 40 || toBefore.length > 40) return null;
  if (fromAfter.length > 40 || toAfter.length > 40) return null;

  const results: { from: string; to: string }[] = [];
  if (fromBefore.length > 0 || toBefore.length > 0) {
    results.push({ from: fromBefore, to: toBefore });
  }
  if (fromAfter.length > 0 || toAfter.length > 0) {
    results.push({ from: fromAfter, to: toAfter });
  }
  return results.length > 0 ? results : null;
}

/**
 * 分割された差分部分の境界を単語境界に調整する。
 *
 * trySplitDiffs の結果は文字レベルで分割されるため、
 * 数字+助数詞や第X条などの単位が切れている場合がある。
 * 元テキスト中の位置を特定し、adjustToWordBoundaries と同様の
 * 展開ルールを適用する。
 *
 * @param from - 分割された差分の旧テキスト
 * @param to - 分割された差分の新テキスト
 * @param origText - 元の完全なテキスト（条文全体）
 * @param searchFrom - origText 内の検索開始位置
 */
function expandSplitBoundary(
  from: string,
  to: string,
  origText: string,
  searchFrom: number,
): { from: string; to: string } {
  const idx = origText.indexOf(from, searchFrom);
  if (idx < 0) return { from, to };

  let start = idx;
  let end = idx + from.length;

  // 右展開: 数字の後に助数詞
  if (end < origText.length && from.length > 0 && isJpNum(from[from.length - 1])) {
    while (end < origText.length && isJpNum(origText[end])) end++;
    if (end < origText.length && isLegalCounter(origText[end])) end++;
  }

  // 左展開: 先行数字列 + 「第」
  if (start > 0 && from.length > 0) {
    const first = from[0];
    const prev = origText[start - 1];
    if (isJpNum(first) && (isJpNum(prev) || prev === "第")) {
      if (isJpNum(prev)) {
        while (start > 0 && isJpNum(origText[start - 1])) start--;
      }
      if (start > 0 && origText[start - 1] === "第") start--;
    } else if (isLegalCounter(first) && isJpNum(prev)) {
      while (start > 0 && isJpNum(origText[start - 1])) start--;
      if (start > 0 && origText[start - 1] === "第") start--;
    }
  }

  // 年号展開
  if (start >= 2 && isJpNum(origText[start])) {
    const era = origText.slice(start - 2, start);
    if (["平成", "令和", "昭和", "大正", "明治"].includes(era)) {
      start -= 2;
    }
  }

  if (start === idx && end === idx + from.length) return { from, to };

  // 展開部分は共通テキストなので from/to 両方に同じ文字を追加
  const leftAdd = origText.slice(start, idx);
  const rightAdd = origText.slice(idx + from.length, end);

  return {
    from: leftAdd + from + rightAdd,
    to: leftAdd + to + rightAdd,
  };
}

/**
 * 単一の差分から Substitution を構築。
 * 削除・追加の場合は周辺テキストから文脈を付与して一意に特定。
 */
function buildSubstitution(
  fromPart: string,
  toPart: string,
  orig: string,
  prefixLen: number,
  suffixLen: number,
): Substitution {
  const suffixText = suffixLen > 0 ? orig.slice(orig.length - suffixLen) : "";
  const prefixText = prefixLen > 0 ? orig.slice(0, prefixLen) : "";

  if (fromPart.length > 0 && toPart.length > 0) {
    // 置換: 「A」を「B」に改める
    let from = fromPart;
    let to = toPart;
    // 引用が短い場合、suffix の先頭から文脈を補って一意性を高める
    // 例: 「公布の」→「令和七年四月一」 ⇒ 「公布の日」→「令和七年四月一日」
    // ただし、数字+助数詞で完結した単位（「七人」「五年」等）は追加不要
    // 引用が短い場合の文脈補完ルール:
    //   - 数字+助数詞（「七人」「五年」等）→ 完結済み、追加不要
    //   - 格助詞で終了（「規定は」「金額を」等）→ 完結済み、追加不要
    //   - 連体修飾「の」で終了（「公布の」等）→ 未完結、次の名詞を追加
    //   - 1文字のみ（「乙」等）→ 文脈追加で一意性を確保
    //   - 2文字以上の語句（「及び」「懲役」等）→ 完結済み、追加不要
    const isCompleteUnit = (s: string) =>
      s.length >= 2 && isLegalCounter(s[s.length - 1]) && isJpNum(s[s.length - 2]);
    const endsWithCompletingParticle = (s: string) =>
      s.length >= 2 && /[はがをにでともへ]$/.test(s);
    // 文脈追加が必要な場合:
    //   1. 1文字のみ → 一意性のため文脈追加
    //   2. 連体「の」で終わる短い引用 → 次の名詞で完結させる
    const needsExtension =
      !isCompleteUnit(from) &&
      !endsWithCompletingParticle(from) &&
      (from.length < 2 || (from.length < 4 && from.endsWith("の")));
    if (needsExtension) {
      const suffix = suffixLen > 0 ? orig.slice(orig.length - suffixLen) : "";
      const ctx = getContextForward(suffix, Math.max(4 - Math.min(from.length, to.length), 1));
      if (ctx.length > 0) {
        from = fromPart + ctx;
        to = toPart + ctx;
      }
    }
    return { type: "replace", from, to, context: "" };
  }

  if (fromPart.length > 0 && toPart.length === 0) {
    // 削除: 前文脈付き置換が法制執務の標準形
    // 例: 「甲及び乙」を「甲」に改める。（前文脈「甲」が残る部分を示す）
    const pctx = getContextBackward(prefixText, Math.max(fromPart.length, 4));
    if (pctx.length > 0) {
      return {
        type: "replace",
        from: pctx + fromPart,
        to: pctx,
        context: "",
      };
    }
    // 前文脈なし（文頭の削除等）: 後文脈を使う
    const ctx = getContextForward(suffixText, Math.max(fromPart.length, 4));
    if (ctx.length > 0) {
      return {
        type: "replace",
        from: fromPart + ctx,
        to: ctx,
        context: "",
      };
    }
    // どちらも文脈なし → 直接削除形式
    return { type: "delete", from: fromPart, to: "", context: "" };
  }

  // 追加: 「前文脈」の下に「追加」を加える
  const pctx = getContextBackward(prefixText, 8);
  if (pctx.length > 0) {
    return { type: "add", from: "", to: toPart, context: pctx };
  }
  // 前文脈なし（冒頭への追加）→ 置換形式
  const ctx = getContextForward(suffixText, 6);
  if (ctx.length > 0) {
    return {
      type: "replace",
      from: ctx,
      to: toPart + ctx,
      context: "",
    };
  }
  return { type: "add", from: "", to: toPart, context: "" };
}

/** suffix テキストから自然な区切りまでの文脈を取得（前方） */
function getContextForward(suffix: string, maxLen: number): string {
  if (suffix.length === 0) return "";
  const limit = Math.min(suffix.length, maxLen);
  // 自然な区切り（読点・句点・括弧閉じ）を探す
  const breakChars = "、。）」；：";
  for (let i = 1; i < limit; i++) {
    if (breakChars.includes(suffix[i])) {
      return suffix.slice(0, i);
    }
  }
  return suffix.slice(0, limit);
}

/** prefix テキストから自然な区切りまでの文脈を取得（後方） */
function getContextBackward(prefix: string, maxLen: number): string {
  if (prefix.length === 0) return "";
  const start = Math.max(0, prefix.length - maxLen);
  const region = prefix.slice(start);
  // 自然な区切りを後方から探す
  const breakChars = "、。（「；：";
  for (let i = region.length - 1; i >= 0; i--) {
    if (breakChars.includes(region[i])) {
      return region.slice(i + 1);
    }
  }
  return region;
}

// ─── ユーティリティ ─────────────────────────────

function toKanjiNum(num: string): string {
  const kanjiMap: Record<string, string> = {
    "１": "一",
    "２": "二",
    "３": "三",
    "４": "四",
    "５": "五",
    "６": "六",
    "７": "七",
    "８": "八",
    "９": "九",
    "０": "〇",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
    "0": "〇",
  };
  return num
    .split("")
    .map((c) => kanjiMap[c] ?? c)
    .join("");
}

function toFullWidthNum(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}

/**
 * Format karamebun lines as copyable text
 */
export function karamebunToText(lines: KaramebunLine[]): string {
  return lines.map((l) => (l.detail ? `${l.text}\n${l.detail}` : l.text)).join("\n\n");
}
