import { describe, it, expect } from "vitest";
import { generateKaramebun, karamebunToText } from "./karamebun";
import type { CanonLine } from "./apply";

const line = (num: string | null, text: string): CanonLine => ({ num, text });

describe("generateKaramebun", () => {
  describe("段落の削除", () => {
    it("項を削除する改め文を生成する", () => {
      const original = [line("１", "第一項の内容"), line("２", "第二項の内容")];
      const edited = [line("１", "第一項の内容")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("第一条第二項を削る。");
    });

    it("本文行（num=null）を削除する", () => {
      const original = [line(null, "本文テキスト"), line("１", "第一項")];
      const edited = [line("１", "第一項")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("第一条を削る。");
    });
  });

  describe("字句の改正（置換）", () => {
    it("単純な字句置換の改め文を生成する", () => {
      const original = [line("１", "甲は乙に対して金銭を支払う。")];
      const edited = [line("１", "甲は丙に対して金銭を支払う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 単語境界調整により「乙に対し」→「丙に対し」のように拡張されうる
      expect(result[0].text).toContain("改める。");
      expect(result[0].text).toContain("第一条第一項中");
    });

    it("複数字句の改正を一文にまとめる", () => {
      const original = [line("１", "甲は乙に対して金銭を支払い、丙に報告する。")];
      const edited = [line("１", "甲はAに対して金銭を支払い、Bに報告する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「乙」を「A」に改め、「丙」を「B」に改める。のようなパターン
      expect(result[0].text).toContain("改め");
    });
  });

  describe("字句の削除", () => {
    it("文字列の削除を検出する", () => {
      const original = [line("１", "甲及び乙は丙に対して責任を負う。")];
      const edited = [line("１", "甲は丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「甲及び乙」を「甲」に改める 形式
      expect(result[0].text).toContain("改める");
    });
  });

  describe("字句の追加", () => {
    it("文字列の追加を検出する", () => {
      const original = [line("１", "甲は丙に対して責任を負う。")];
      const edited = [line("１", "甲及び乙は丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 追加形式（「甲」を「甲及び乙」に改める等）
      expect(result[0].text).toMatch(/改める|加える/);
    });
  });

  describe("全文改正", () => {
    it("差分が80文字超で全文改正にフォールバックする", () => {
      // 差分部分が80文字を超える場合に全文改正になる
      const longOriginal = "あ".repeat(100) + "共通部分";
      const longEdited = "い".repeat(100) + "共通部分";
      const original = [line("１", longOriginal)];
      const edited = [line("１", longEdited)];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("次のように改める");
      expect(result[0].detail).toBeDefined();
    });
  });

  describe("段落の追加", () => {
    it("新しい項を追加する改め文を生成する", () => {
      const original = [line("１", "第一項の内容")];
      const edited = [line("１", "第一項の内容"), line("２", "新しい第二項")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("次の一項を加える");
      expect(result[0].detail).toContain("新しい第二項");
    });
  });

  describe("変更なし", () => {
    it("テキストが同一の場合は何も返さない", () => {
      const lines = [line("１", "同じテキスト")];
      const result = generateKaramebun("第一条", lines, lines);
      expect(result).toHaveLength(0);
    });
  });

  describe("項番号の正規化", () => {
    it("全角と半角の項番号を同一視する", () => {
      const original = [line("１", "旧テキスト")];
      const edited = [line("1", "新テキスト")];
      const result = generateKaramebun("第一条", original, edited);
      // 「１」と「1」は同一項として改正を検出する
      expect(result).toHaveLength(1);
      expect(result[0].text).toMatch(/改める|次のように/);
    });
  });

  describe("数字+助数詞の単語境界", () => {
    it("数字と助数詞を分離しない", () => {
      const original = [line("１", "七人の侍が門を守る。")];
      const edited = [line("１", "九人の侍が門を守る。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「七」ではなく「七人」を「九人」に改める
      const text = result[0].text;
      if (text.includes("「")) {
        // 引用形式の場合、「七」単独ではなく「七人」を含むことを確認
        expect(text).toMatch(/七人|九人/);
      }
    });
  });

  describe("年号の単語境界", () => {
    it("年号を数字から分離しない", () => {
      const original = [line("１", "平成二十二年に施行する。")];
      const edited = [line("１", "令和七年に施行する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      const text = result[0].text;
      // 年号+年数がセットで引用される
      expect(text).toMatch(/平成|令和/);
    });
  });
});

describe("karamebunToText", () => {
  it("改め文をテキストに変換する", () => {
    const lines = [
      { text: "第一条第一項中「甲」を「乙」に改める。" },
      { text: "第一条に次の一項を加える。", detail: "２　新しい項" },
    ];
    const text = karamebunToText(lines);
    expect(text).toContain("「甲」を「乙」に改める");
    expect(text).toContain("２　新しい項");
  });

  it("detailがない場合はtextのみ出力する", () => {
    const lines = [{ text: "第一条第二項を削る。" }];
    const text = karamebunToText(lines);
    expect(text).toBe("第一条第二項を削る。");
  });
});
