import { describe, it, expect } from "vitest";
import { runLint } from "./lint";
import type { PatchData, PatchLine } from "./types";

function makeLine(l: Partial<PatchLine>): PatchLine {
  return {
    op: l.op ?? "ctx",
    num: l.num ?? null,
    text: l.text ?? "",
    rawLine: l.rawLine ?? "",
  };
}

type PatchInput = Omit<Partial<PatchData>, "lines"> & { lines?: Partial<PatchLine>[] };

function makePatch(overrides: PatchInput = {}): PatchData {
  const lines = (overrides.lines ?? []).map(makeLine);

  return {
    targetArticle: overrides.targetArticle ?? "第一条",
    patchType: overrides.patchType ?? "A",
    lines,
  };
}

describe("runLint", () => {
  describe("ruleTargetArticle", () => {
    it("対象条文が空の場合はerror", () => {
      const patch = makePatch({
        targetArticle: "",
        lines: [{ op: "add", num: "１", text: "追加" }],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "target-article")).toBe(true);
    });

    it("正しい条文形式ならエラーなし", () => {
      const patch = makePatch({
        targetArticle: "第百十二条",
        lines: [{ op: "add", num: "１", text: "追加" }],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "target-article")).toBe(false);
    });

    it("不正な条文形式はwarn", () => {
      const patch = makePatch({
        targetArticle: "不正な形式",
        lines: [{ op: "add", num: "１", text: "追加" }],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "target-article-format")).toBe(true);
    });
  });

  describe("ruleBalancedOps", () => {
    it("add/delどちらもない場合はwarn", () => {
      const patch = makePatch({ lines: [{ op: "ctx", num: "１", text: "コンテキスト" }] });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "no-changes")).toBe(true);
    });

    it("削除のみの場合はinfo", () => {
      const patch = makePatch({ lines: [{ op: "del", num: "１", text: "削除行" }] });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "delete-only")).toBe(true);
    });

    it("add+delがある場合はバランスエラーなし", () => {
      const patch = makePatch({
        lines: [
          { op: "del", num: "１", text: "旧" },
          { op: "add", num: "１", text: "新" },
        ],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "no-changes")).toBe(false);
      expect(results.some((r) => r.rule_name === "delete-only")).toBe(false);
    });
  });

  describe("ruleEmptyPatch", () => {
    it("空パッチはerror", () => {
      const patch = makePatch({ lines: [] });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "empty-patch")).toBe(true);
    });
  });

  describe("ruleDuplicateNum", () => {
    it("同一項番号の追加行が重複する場合はwarn", () => {
      const patch = makePatch({
        lines: [
          { op: "add", num: "２", text: "追加A", rawLine: "+２　追加A" },
          { op: "add", num: "２", text: "追加B", rawLine: "+２　追加B" },
        ],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "duplicate-num")).toBe(true);
    });

    it("異なる項番号の追加行は重複なし", () => {
      const patch = makePatch({
        lines: [
          { op: "add", num: "１", text: "追加A" },
          { op: "add", num: "２", text: "追加B" },
        ],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "duplicate-num")).toBe(false);
    });
  });

  describe("ruleParaNumOrder", () => {
    it("項番号が不連続な場合はwarn", () => {
      const patch = makePatch({
        lines: [
          { op: "ctx", num: "１", text: "A" },
          { op: "ctx", num: "３", text: "C", rawLine: "３　C" },
        ],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "para-num-gap")).toBe(true);
    });

    it("連番の場合はギャップなし", () => {
      const patch = makePatch({
        lines: [
          { op: "ctx", num: "１", text: "A" },
          { op: "add", num: "２", text: "B" },
          { op: "ctx", num: "３", text: "C" },
        ],
      });
      const results = runLint(patch, "テスト");
      expect(results.some((r) => r.rule_name === "para-num-gap")).toBe(false);
    });
  });

  describe("ruleTextLength", () => {
    it("10000文字超のテキストはwarn", () => {
      const patch = makePatch({ lines: [{ op: "add", num: "１", text: "追加" }] });
      const longText = "あ".repeat(10001);
      const results = runLint(patch, longText);
      expect(results.some((r) => r.rule_name === "text-too-long")).toBe(true);
    });

    it("10000文字以内なら問題なし", () => {
      const patch = makePatch({ lines: [{ op: "add", num: "１", text: "追加" }] });
      const results = runLint(patch, "短いテキスト");
      expect(results.some((r) => r.rule_name === "text-too-long")).toBe(false);
    });
  });

  describe("all-clear", () => {
    it("全ルール通過でall-clearを返す", () => {
      const patch = makePatch({
        targetArticle: "第一条",
        lines: [
          { op: "ctx", num: "１", text: "既存" },
          { op: "add", num: "２", text: "追加" },
        ],
      });
      const results = runLint(patch, "短いテキスト");
      expect(results).toHaveLength(1);
      expect(results[0].rule_name).toBe("all-clear");
      expect(results[0].severity).toBe("pass");
    });
  });
});
