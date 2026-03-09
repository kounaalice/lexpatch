import { describe, it, expect } from "vitest";
import { applyPatch, paragraphsToCanonLines } from "./apply";
import type { CanonLine } from "./apply";
import type { PatchData } from "./types";

describe("applyPatch", () => {
  const makeCanon = (...lines: [string | null, string][]): CanonLine[] =>
    lines.map(([num, text]) => ({ num, text }));

  const makePatch = (
    lines: Array<{ op: "add" | "del" | "ctx"; num: string | null; text: string }>,
  ): PatchData => ({
    targetArticle: "第一条",
    patchType: "A",
    lines: lines.map((l) => ({
      ...l,
      rawLine: `${l.op === "add" ? "+" : l.op === "del" ? "-" : ""}${l.num ?? ""}　${l.text}`,
    })),
  });

  it("コンテキスト行のみの場合、Canonをそのまま返す", () => {
    const canon = makeCanon(["１", "この法律は…"], ["２", "前項の規定…"]);
    const patch = makePatch([
      { op: "ctx", num: "１", text: "この法律は…" },
      { op: "ctx", num: "２", text: "前項の規定…" },
    ]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("この法律は…");
  });

  it("add行を正しく挿入する", () => {
    const canon = makeCanon(["１", "既存の項"]);
    const patch = makePatch([
      { op: "ctx", num: "１", text: "既存の項" },
      { op: "add", num: "２", text: "新しい項" },
    ]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(2);
    expect(result[1].num).toBe("２");
    expect(result[1].text).toBe("新しい項");
  });

  it("del行で対応するCanon行を削除する", () => {
    const canon = makeCanon(["１", "残す項"], ["２", "削除する項"]);
    const patch = makePatch([
      { op: "ctx", num: "１", text: "残す項" },
      { op: "del", num: "２", text: "削除する項" },
    ]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("１");
  });

  it("add + del（置換相当）を処理する", () => {
    const canon = makeCanon(["１", "旧テキスト"]);
    const patch = makePatch([
      { op: "del", num: "１", text: "旧テキスト" },
      { op: "add", num: "１", text: "新テキスト" },
    ]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("新テキスト");
  });

  it("本文行（num=null）の追加を先頭に挿入する", () => {
    const canon = makeCanon(["１", "既存項"]);
    const patch = makePatch([{ op: "add", num: null, text: "新しい本文" }]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("新しい本文");
    expect(result[0].num).toBeNull();
  });

  it("本文行（num=null）の削除を処理する", () => {
    const canon = makeCanon([null, "本文テキスト"], ["１", "第一項"]);
    const patch = makePatch([{ op: "del", num: null, text: "本文テキスト" }]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("１");
  });

  it("全角数字の順序に基づいて挿入する", () => {
    const canon = makeCanon(["１", "第一項"], ["３", "第三項"]);
    const patch = makePatch([{ op: "add", num: "２", text: "第二項（挿入）" }]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(3);
    expect(result[0].num).toBe("１");
    expect(result[1].num).toBe("２");
    expect(result[2].num).toBe("３");
  });

  it("空のCanonに追加できる", () => {
    const canon: CanonLine[] = [];
    const patch = makePatch([{ op: "add", num: "１", text: "新条文" }]);
    const result = applyPatch(canon, patch);
    expect(result).toHaveLength(1);
  });
});

describe("paragraphsToCanonLines", () => {
  it("基本的な項を変換する", () => {
    const result = paragraphsToCanonLines([
      { num: "１", sentences: ["この法律は、", "公共の福祉に適合する。"] },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("１");
    expect(result[0].text).toBe("この法律は、公共の福祉に適合する。");
  });

  it("号をindent=1で展開する", () => {
    const result = paragraphsToCanonLines([
      {
        num: "１",
        sentences: ["次に掲げる場合"],
        items: [
          { title: "一", sentences: ["第一号の内容"] },
          { title: "二", sentences: ["第二号の内容"] },
        ],
      },
    ]);
    expect(result).toHaveLength(3);
    expect(result[1].indent).toBe(1);
    expect(result[1].text).toContain("一");
  });

  it("号細分をindent=2で展開する", () => {
    const result = paragraphsToCanonLines([
      {
        num: "１",
        sentences: ["条文"],
        items: [
          {
            title: "一",
            sentences: ["号"],
            subitems: [{ title: "イ", sentences: ["号細分"] }],
          },
        ],
      },
    ]);
    expect(result).toHaveLength(3);
    expect(result[2].indent).toBe(2);
  });

  it("numが空文字の場合nullに変換する", () => {
    const result = paragraphsToCanonLines([{ num: "", sentences: ["本文"] }]);
    expect(result[0].num).toBeNull();
  });
});
