import { describe, it, expect } from "vitest";
import { parsePatch } from "./parser";

describe("parsePatch", () => {
  it("空文字列を入力すると空のパッチを返す", () => {
    const result = parsePatch("");
    expect(result.targetArticle).toBe("");
    expect(result.lines).toHaveLength(0);
    expect(result.patchType).toBe("A");
  });

  it("条番号ヘッダを検出する", () => {
    const input = `第百十二条
　代理権の消滅は、善意の第三者に対抗することができない。`;
    const result = parsePatch(input);
    expect(result.targetArticle).toBe("第百十二条");
    expect(result.lines[0].scope).toBe(true);
    expect(result.lines[0].op).toBe("ctx");
  });

  it("add/del/ctx行を正しく分類する", () => {
    const input = `第一条
１　この法律は…
+２　新しい項を追加する。
-３　古い項を削除する。`;
    const result = parsePatch(input);
    const ops = result.lines.map((l) => l.op);
    expect(ops).toEqual(["ctx", "ctx", "add", "del"]);
  });

  it("項番号を正しく抽出する（全角数字）", () => {
    const input = `第一条
１　この法律は…
２　前項の規定にかかわらず…`;
    const result = parsePatch(input);
    const bodyLines = result.lines.filter((l) => !l.scope);
    expect(bodyLines[0].num).toBe("１");
    expect(bodyLines[1].num).toBe("２");
  });

  it("項番号なし（本文行）を正しく処理する", () => {
    const input = `第一条
　代理権の消滅は…`;
    const result = parsePatch(input);
    const bodyLines = result.lines.filter((l) => !l.scope);
    expect(bodyLines[0].num).toBeNull();
    expect(bodyLines[0].text).toContain("代理権の消滅は");
  });

  it("C記法を検出する（条番号ヘッダに+/-がある場合）", () => {
    const input = `+第二条
+１　新しい条文の本文。`;
    const result = parsePatch(input);
    expect(result.patchType).toBe("C");
    expect(result.targetArticle).toBe("第二条");
  });

  it("条の二パターンを正しく認識する", () => {
    const input = `第五条の二
１　特別な規定。`;
    const result = parsePatch(input);
    expect(result.targetArticle).toBe("第五条の二");
  });

  it("targetArticle引数で上書きできる", () => {
    const input = `１　何かの条文。`;
    const result = parsePatch(input, "第九十九条");
    expect(result.targetArticle).toBe("第九十九条");
  });

  it("空行をスキップする", () => {
    const input = `第一条

１　この法律は…

２　前項の場合において…`;
    const result = parsePatch(input);
    // 空行はスキップされるので3行（ヘッダ + 2項）
    expect(result.lines).toHaveLength(3);
  });

  it("半角数字の条番号を認識する", () => {
    const input = `第1条
1　この法律は…`;
    const result = parsePatch(input);
    expect(result.targetArticle).toContain("第1条");
  });

  it("rawLineが元のテキストを保持する", () => {
    const input = `+２　追加する項目。`;
    const result = parsePatch(input);
    expect(result.lines[0].rawLine).toBe("+２　追加する項目。");
  });
});
