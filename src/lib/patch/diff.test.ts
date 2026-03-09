import { describe, it, expect } from "vitest";
import { unifiedDiff, sideBySideDiff } from "./diff";
import type { CanonLine } from "./apply";

const line = (num: string | null, text: string): CanonLine => ({ num, text });

describe("unifiedDiff", () => {
  it("同一の入力で差分なしを返す", () => {
    const lines = [line("１", "同じテキスト")];
    const result = unifiedDiff(lines, lines);
    expect(result.stats.added).toBe(0);
    expect(result.stats.deleted).toBe(0);
    expect(result.stats.unchanged).toBe(1);
    expect(result.lines[0].op).toBe("eq");
  });

  it("追加行を検出する", () => {
    const canon = [line("１", "既存行")];
    const next = [line("１", "既存行"), line("２", "追加行")];
    const result = unifiedDiff(canon, next);
    expect(result.stats.added).toBe(1);
    expect(result.stats.deleted).toBe(0);
    expect(result.lines.find((l) => l.op === "add")?.text).toBe("追加行");
  });

  it("削除行を検出する", () => {
    const canon = [line("１", "残す行"), line("２", "削除行")];
    const next = [line("１", "残す行")];
    const result = unifiedDiff(canon, next);
    expect(result.stats.deleted).toBe(1);
    expect(result.lines.find((l) => l.op === "del")?.text).toBe("削除行");
  });

  it("テキストの変更をdel+addとして検出する", () => {
    const canon = [line("１", "旧テキスト")];
    const next = [line("１", "新テキスト")];
    const result = unifiedDiff(canon, next);
    expect(result.stats.deleted).toBe(1);
    expect(result.stats.added).toBe(1);
  });

  it("空配列同士は差分なし", () => {
    const result = unifiedDiff([], []);
    expect(result.lines).toHaveLength(0);
    expect(result.stats).toEqual({ added: 0, deleted: 0, unchanged: 0 });
  });

  it("空→複数行は全追加", () => {
    const next = [line("１", "a"), line("２", "b")];
    const result = unifiedDiff([], next);
    expect(result.stats.added).toBe(2);
    expect(result.stats.deleted).toBe(0);
  });

  it("複数行→空は全削除", () => {
    const canon = [line("１", "a"), line("２", "b")];
    const result = unifiedDiff(canon, []);
    expect(result.stats.deleted).toBe(2);
    expect(result.stats.added).toBe(0);
  });

  it("textが同じなら番号が変わっても一致とみなす", () => {
    const canon = [line("１", "共通テキスト")];
    const next = [line("２", "共通テキスト")];
    const result = unifiedDiff(canon, next);
    // テキスト同一なのでeqとして扱われる
    expect(result.stats.unchanged).toBe(1);
    expect(result.stats.added).toBe(0);
    expect(result.stats.deleted).toBe(0);
  });
});

describe("sideBySideDiff", () => {
  it("同一の入力でeq行を返す", () => {
    const lines = [line("１", "テキスト")];
    const result = sideBySideDiff(lines, lines);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].op).toBe("eq");
    expect(result.rows[0].left).not.toBeNull();
    expect(result.rows[0].right).not.toBeNull();
  });

  it("del+addの連続をペアにする（置換行）", () => {
    const canon = [line("１", "旧テキスト")];
    const next = [line("１", "新テキスト")];
    const result = sideBySideDiff(canon, next);
    // del+addがペアになって1行に
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].left?.text).toBe("旧テキスト");
    expect(result.rows[0].right?.text).toBe("新テキスト");
  });

  it("追加行のleftはnull", () => {
    const canon: CanonLine[] = [];
    const next = [line("１", "追加行")];
    const result = sideBySideDiff(canon, next);
    expect(result.rows[0].op).toBe("add");
    expect(result.rows[0].left).toBeNull();
    expect(result.rows[0].right?.text).toBe("追加行");
  });

  it("削除行のrightはnull（連続addがない場合）", () => {
    const canon = [line("１", "削除行"), line("２", "残す行")];
    const next = [line("２", "残す行")];
    const result = sideBySideDiff(canon, next);
    const delRow = result.rows.find((r) => r.op === "del");
    expect(delRow?.right).toBeNull();
    expect(delRow?.left?.text).toBe("削除行");
  });

  it("statsが正しく集計される", () => {
    const canon = [line("１", "a"), line("２", "b"), line("３", "c")];
    const next = [line("１", "a"), line("２", "b2"), line("４", "d")];
    const result = sideBySideDiff(canon, next);
    // b→b2 (del+add pair), c→deleted, d→added
    expect(result.stats.unchanged).toBe(1); // a
  });
});
