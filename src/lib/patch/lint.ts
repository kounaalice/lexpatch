import type { PatchData, PatchLine } from "./types";

export type LintSeverity = "error" | "warn" | "info" | "pass";

export interface LintResult {
  severity: LintSeverity;
  rule_name: string;
  message: string;
  target_line: string | null;
}

/**
 * パッチデータに対してLintルールを実行する
 */
export function runLint(patch: PatchData, plainText: string): LintResult[] {
  const results: LintResult[] = [];

  results.push(...ruleTargetArticle(patch));
  results.push(...ruleBalancedOps(patch));
  results.push(...ruleEmptyPatch(patch));
  results.push(...ruleDuplicateNum(patch));
  results.push(...ruleParaNumOrder(patch));
  results.push(...ruleTextLength(patch, plainText));

  // 全ルール通過の場合
  if (results.length === 0) {
    results.push({
      severity: "pass",
      rule_name: "all-clear",
      message: "全チェック通過",
      target_line: null,
    });
  }

  return results;
}

/** 対象条文が指定されているか */
function ruleTargetArticle(patch: PatchData): LintResult[] {
  if (!patch.targetArticle || !patch.targetArticle.trim()) {
    return [
      {
        severity: "error",
        rule_name: "target-article",
        message: "対象条文（第○条）が指定されていません",
        target_line: null,
      },
    ];
  }
  if (!/^第[一二三四五六七八九十百千\d]+条/.test(patch.targetArticle)) {
    return [
      {
        severity: "warn",
        rule_name: "target-article-format",
        message: `対象条文の形式が不正: ${patch.targetArticle}`,
        target_line: null,
      },
    ];
  }
  return [];
}

/** 追加・削除のバランスチェック */
function ruleBalancedOps(patch: PatchData): LintResult[] {
  const adds = patch.lines.filter((l) => l.op === "add");
  const dels = patch.lines.filter((l) => l.op === "del");

  if (adds.length === 0 && dels.length === 0) {
    return [
      {
        severity: "warn",
        rule_name: "no-changes",
        message: "追加行も削除行もありません（変更なし）",
        target_line: null,
      },
    ];
  }

  // 削除だけで追加がない場合（条文削除）
  if (dels.length > 0 && adds.length === 0) {
    return [
      {
        severity: "info",
        rule_name: "delete-only",
        message: `削除のみ（${dels.length}行削除）。条文の全削除を意図していますか？`,
        target_line: null,
      },
    ];
  }

  return [];
}

/** 空パッチ */
function ruleEmptyPatch(patch: PatchData): LintResult[] {
  if (patch.lines.length === 0) {
    return [
      {
        severity: "error",
        rule_name: "empty-patch",
        message: "パッチ内容が空です",
        target_line: null,
      },
    ];
  }
  return [];
}

/** 同一項番号の重複追加チェック */
function ruleDuplicateNum(patch: PatchData): LintResult[] {
  const results: LintResult[] = [];
  const addNums = new Map<string, PatchLine>();

  for (const line of patch.lines) {
    if (line.op === "add" && line.num) {
      if (addNums.has(line.num)) {
        results.push({
          severity: "warn",
          rule_name: "duplicate-num",
          message: `項番号「${line.num}」が複数の追加行に存在します`,
          target_line: line.rawLine,
        });
      } else {
        addNums.set(line.num, line);
      }
    }
  }
  return results;
}

/** 追加行の項番号が連番になっているかチェック */
function ruleParaNumOrder(patch: PatchData): LintResult[] {
  const results: LintResult[] = [];
  const FULL_NUMS = "０１２３４５６７８９";

  function fullToHalf(s: string): number {
    let n = "";
    for (const ch of s) {
      const idx = FULL_NUMS.indexOf(ch);
      n += idx >= 0 ? String(idx) : ch;
    }
    return parseInt(n, 10);
  }

  // 追加行と文脈行の項番号を結合順で見る
  const effectiveLines = patch.lines.filter((l) => l.op !== "del" && l.num && !l.scope);
  let prevNum = 0;
  for (const line of effectiveLines) {
    if (!line.num) continue;
    const n = fullToHalf(line.num);
    if (isNaN(n)) continue;
    if (prevNum > 0 && n !== prevNum + 1 && n !== 1) {
      results.push({
        severity: "warn",
        rule_name: "para-num-gap",
        message: `項番号が不連続: ${prevNum} → ${n}（繰り下げ漏れの可能性）`,
        target_line: line.rawLine,
      });
    }
    prevNum = n;
  }
  return results;
}

/** テキスト長チェック */
function ruleTextLength(_patch: PatchData, plainText: string): LintResult[] {
  const results: LintResult[] = [];
  if (plainText.length > 10000) {
    results.push({
      severity: "warn",
      rule_name: "text-too-long",
      message: `パッチテキストが ${plainText.length} 文字あります（推奨: 10,000字以内）`,
      target_line: null,
    });
  }
  return results;
}
