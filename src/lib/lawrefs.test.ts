import { describe, it, expect, beforeEach } from "vitest";
import {
  LAW_REF_MAP,
  getLawRefRegex,
  kanjiToNumber,
  articleRefToNum,
  paragraphRefToNum,
  resolveRelativeArticle,
  resolveRelativeParagraph,
  getUnifiedRefRegex,
} from "./lawrefs";

// ── LAW_REF_MAP ──

describe("LAW_REF_MAP", () => {
  it("主要法令が登録されている", () => {
    expect(LAW_REF_MAP["民法"]).toBe("129AC0000000089");
    expect(LAW_REF_MAP["刑法"]).toBe("140AC0000000045");
    expect(LAW_REF_MAP["会社法"]).toBe("417AC0000000086");
    expect(LAW_REF_MAP["個人情報保護法"]).toBe("415AC0000000057");
  });

  it("中黒を含む法令名が登録されている", () => {
    expect(LAW_REF_MAP["育児・介護休業法"]).toBe("403AC0000000076");
  });

  it("存在しない法令名はundefinedを返す", () => {
    expect(LAW_REF_MAP["架空法"]).toBeUndefined();
  });

  it("全エントリのIDが元号コード+AC形式である", () => {
    for (const [name, id] of Object.entries(LAW_REF_MAP)) {
      expect(id, `${name} のIDが不正`).toMatch(/^\d{3}AC\d{10}$/);
    }
  });
});

// ── kanjiToNumber ──

describe("kanjiToNumber", () => {
  it("一桁の漢数字を変換する", () => {
    expect(kanjiToNumber("一")).toBe(1);
    expect(kanjiToNumber("五")).toBe(5);
    expect(kanjiToNumber("九")).toBe(9);
  });

  it("十の位を正しく変換する", () => {
    expect(kanjiToNumber("十")).toBe(10);
    expect(kanjiToNumber("十一")).toBe(11);
    expect(kanjiToNumber("二十")).toBe(20);
    expect(kanjiToNumber("二十三")).toBe(23);
    expect(kanjiToNumber("九十九")).toBe(99);
  });

  it("百の位を正しく変換する", () => {
    expect(kanjiToNumber("百")).toBe(100);
    expect(kanjiToNumber("百一")).toBe(101);
    expect(kanjiToNumber("百十")).toBe(110);
    expect(kanjiToNumber("百十五")).toBe(115);
    expect(kanjiToNumber("三百")).toBe(300);
    expect(kanjiToNumber("三百二十一")).toBe(321);
    expect(kanjiToNumber("九百九十九")).toBe(999);
  });

  it("千の位を正しく変換する", () => {
    expect(kanjiToNumber("千")).toBe(1000);
    expect(kanjiToNumber("千一")).toBe(1001);
    expect(kanjiToNumber("千百")).toBe(1100);
    expect(kanjiToNumber("二千")).toBe(2000);
  });

  it("七百九のような十の位が省略された数を変換する", () => {
    expect(kanjiToNumber("七百九")).toBe(709);
    expect(kanjiToNumber("五百三")).toBe(503);
  });

  it("空文字列は0を返す", () => {
    expect(kanjiToNumber("")).toBe(0);
  });
});

// ── articleRefToNum ──

describe("articleRefToNum", () => {
  it("単純な条文参照を変換する", () => {
    expect(articleRefToNum("第一条")).toBe("1");
    expect(articleRefToNum("第十条")).toBe("10");
    expect(articleRefToNum("第百条")).toBe("100");
    expect(articleRefToNum("第九十条")).toBe("90");
  });

  it("大きな条番号を変換する", () => {
    expect(articleRefToNum("第七百九条")).toBe("709");
    expect(articleRefToNum("第三百二十一条")).toBe("321");
    expect(articleRefToNum("第千条")).toBe("1000");
  });

  it("枝番号付き条文参照を変換する（の二）", () => {
    expect(articleRefToNum("第七百九条の二")).toBe("709_2");
    expect(articleRefToNum("第一条の三")).toBe("1_3");
  });

  it("複数の枝番号を変換する（の二の三）", () => {
    expect(articleRefToNum("第一条の二の三")).toBe("1_2_3");
    expect(articleRefToNum("第五十条の十の五")).toBe("50_10_5");
  });

  it("不正な形式ではnullを返す", () => {
    expect(articleRefToNum("第一項")).toBeNull();
    expect(articleRefToNum("条")).toBeNull();
    expect(articleRefToNum("民法")).toBeNull();
    expect(articleRefToNum("")).toBeNull();
    expect(articleRefToNum("第一条第二項")).toBeNull();
  });

  it("漢数字以外の文字を含む場合はnullを返す", () => {
    expect(articleRefToNum("第1条")).toBeNull();
    expect(articleRefToNum("第ABC条")).toBeNull();
  });
});

// ── paragraphRefToNum ──

describe("paragraphRefToNum", () => {
  it("単純な項参照を変換する", () => {
    expect(paragraphRefToNum("第一項")).toBe("1");
    expect(paragraphRefToNum("第三項")).toBe("3");
    expect(paragraphRefToNum("第十項")).toBe("10");
  });

  it("大きな項番号を変換する", () => {
    expect(paragraphRefToNum("第二十三項")).toBe("23");
    expect(paragraphRefToNum("第百項")).toBe("100");
  });

  it("不正な形式ではnullを返す", () => {
    expect(paragraphRefToNum("第一条")).toBeNull();
    expect(paragraphRefToNum("項")).toBeNull();
    expect(paragraphRefToNum("")).toBeNull();
    expect(paragraphRefToNum("第1項")).toBeNull();
  });
});

// ── resolveRelativeArticle ──

describe("resolveRelativeArticle", () => {
  it("前条は現在の条番号 - 1 を返す", () => {
    expect(resolveRelativeArticle("前条", "5")).toBe("4");
    expect(resolveRelativeArticle("前条", "100")).toBe("99");
  });

  it("次条は現在の条番号 + 1 を返す", () => {
    expect(resolveRelativeArticle("次条", "5")).toBe("6");
    expect(resolveRelativeArticle("次条", "1")).toBe("2");
  });

  it("同条は現在の条番号をそのまま返す", () => {
    expect(resolveRelativeArticle("同条", "5")).toBe("5");
    expect(resolveRelativeArticle("同条", "1")).toBe("1");
  });

  it("第一条の前条はnullを返す（0以下にはならない）", () => {
    expect(resolveRelativeArticle("前条", "1")).toBeNull();
  });

  it("枝番号付き条番号で前条・次条はnullを返す", () => {
    expect(resolveRelativeArticle("前条", "3_2")).toBeNull();
    expect(resolveRelativeArticle("次条", "3_2")).toBeNull();
  });

  it("枝番号付き条番号で同条はそのまま返す", () => {
    expect(resolveRelativeArticle("同条", "3_2")).toBe("3_2");
  });

  it("数値でない条番号はnullを返す", () => {
    expect(resolveRelativeArticle("前条", "abc")).toBeNull();
    expect(resolveRelativeArticle("次条", "abc")).toBeNull();
    expect(resolveRelativeArticle("同条", "abc")).toBeNull();
  });
});

// ── resolveRelativeParagraph ──

describe("resolveRelativeParagraph", () => {
  it("前項は現在の項番号 - 1 を返す", () => {
    expect(resolveRelativeParagraph("前項", "3")).toBe("2");
    expect(resolveRelativeParagraph("前項", "10")).toBe("9");
  });

  it("次項は現在の項番号 + 1 を返す", () => {
    expect(resolveRelativeParagraph("次項", "3")).toBe("4");
    expect(resolveRelativeParagraph("次項", "1")).toBe("2");
  });

  it("同項は現在の項番号をそのまま返す", () => {
    expect(resolveRelativeParagraph("同項", "3")).toBe("3");
  });

  it("第一項の前項はnullを返す", () => {
    expect(resolveRelativeParagraph("前項", "1")).toBeNull();
  });

  it("数値でない項番号はnullを返す", () => {
    expect(resolveRelativeParagraph("前項", "abc")).toBeNull();
    expect(resolveRelativeParagraph("次項", "")).toBeNull();
  });
});

// ── getLawRefRegex ──

describe("getLawRefRegex", () => {
  it("法令名にマッチする正規表現を返す", () => {
    const regex = getLawRefRegex();
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.global).toBe(true);
  });

  it("テキスト中の法令名を検出する", () => {
    const regex = getLawRefRegex();
    const text = "民法の規定に基づき、会社法の改正を行う。";
    const matches = [...text.matchAll(regex)].map((m) => m[0]);
    expect(matches).toContain("民法");
    expect(matches).toContain("会社法");
  });

  it("法令名を含まないテキストはマッチしない", () => {
    const regex = getLawRefRegex();
    const text = "本日は晴天なり。";
    const matches = [...text.matchAll(regex)];
    expect(matches).toHaveLength(0);
  });

  it("長い法令名を短い名前より先にマッチさせる", () => {
    const regex = getLawRefRegex();
    // "不正競争防止法" should match as whole, not "不正" separately
    const text = "不正競争防止法を参照する。";
    const matches = [...text.matchAll(regex)].map((m) => m[0]);
    expect(matches).toContain("不正競争防止法");
  });

  it("同じインスタンスをキャッシュして返す", () => {
    const r1 = getLawRefRegex();
    const r2 = getLawRefRegex();
    expect(r1).toBe(r2);
  });

  it("中黒を含む法令名にマッチする", () => {
    const regex = getLawRefRegex();
    const text = "育児・介護休業法の適用について";
    const matches = [...text.matchAll(regex)].map((m) => m[0]);
    expect(matches).toContain("育児・介護休業法");
  });
});

// ── getUnifiedRefRegex ──

describe("getUnifiedRefRegex", () => {
  let regex: RegExp;

  beforeEach(() => {
    regex = getUnifiedRefRegex();
  });

  it("グローバルフラグ付き正規表現を返す", () => {
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.global).toBe(true);
  });

  it("同じインスタンスをキャッシュして返す", () => {
    const r1 = getUnifiedRefRegex();
    const r2 = getUnifiedRefRegex();
    expect(r1).toBe(r2);
  });

  // パターン1: 法令名 + 条 + 項 → groups [1][2][3]
  describe("法令名 + 条 + 項 のマッチ", () => {
    it("民法第九十条第二項 にマッチする", () => {
      const text = "民法第九十条第二項の規定により";
      const matches = [...text.matchAll(regex)];
      expect(matches.length).toBeGreaterThanOrEqual(1);
      const m = matches[0];
      expect(m[1]).toBe("民法");
      expect(m[2]).toBe("第九十条");
      expect(m[3]).toBe("第二項");
    });

    it("会社法第三百五十六条第一項 にマッチする", () => {
      const text = "会社法第三百五十六条第一項";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[1]).toBe("会社法");
      expect(m[2]).toBe("第三百五十六条");
      expect(m[3]).toBe("第一項");
    });
  });

  // パターン2: 法令名 + 条 → groups [4][5]
  describe("法令名 + 条 のマッチ", () => {
    it("民法第一条 にマッチする", () => {
      const text = "民法第一条を参照";
      const matches = [...text.matchAll(regex)];
      // 法令名+条 は groups[4][5] （項なし）
      const m = matches[0];
      expect(m[4]).toBe("民法");
      expect(m[5]).toBe("第一条");
    });

    it("個人情報保護法第二十三条 にマッチする", () => {
      const text = "個人情報保護法第二十三条に基づき";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[4]).toBe("個人情報保護法");
      expect(m[5]).toBe("第二十三条");
    });

    it("枝番号付きの法令名+条 にマッチする", () => {
      const text = "民法第七百九条の二を参照";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[4]).toBe("民法");
      expect(m[5]).toBe("第七百九条の二");
    });
  });

  // パターン3: 条 + 項 → groups [6][7]
  describe("条 + 項 のマッチ（同一法令内）", () => {
    it("第一条第二項 にマッチする", () => {
      const text = "第一条第二項の規定";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[6]).toBe("第一条");
      expect(m[7]).toBe("第二項");
    });
  });

  // パターン4: 条のみ → group [8]
  describe("条のみ のマッチ", () => {
    it("第一条 にマッチする", () => {
      const text = "第一条に定める";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[8]).toBe("第一条");
    });

    it("第百条 にマッチする", () => {
      const text = "第百条の適用";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[8]).toBe("第百条");
    });

    it("枝番号付きの条のみ にマッチする", () => {
      const text = "第一条の二を見よ";
      const matches = [...text.matchAll(regex)];
      const m = matches[0];
      expect(m[8]).toBe("第一条の二");
    });
  });

  // パターン5: 法令名のみ → group [9]
  describe("法令名のみ のマッチ", () => {
    it("民法 にマッチする", () => {
      const text = "民法について議論する";
      const matches = [...text.matchAll(regex)];
      // 法令名のみの場合は group[9]
      const hasLawOnly = matches.some((m) => m[9] === "民法");
      expect(hasLawOnly).toBe(true);
    });
  });

  // パターン6: 相対条文 → groups [10][11]
  describe("相対条文参照のマッチ", () => {
    it("前条 にマッチする", () => {
      const text = "前条の規定にかかわらず";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[10]);
      expect(m).toBeDefined();
      expect(m![10]).toBe("前条");
      expect(m![11]).toBeUndefined();
    });

    it("次条 にマッチする", () => {
      const text = "次条に定める手続";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[10]);
      expect(m).toBeDefined();
      expect(m![10]).toBe("次条");
    });

    it("同条 にマッチする", () => {
      const text = "同条第三項の規定";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[10]);
      expect(m).toBeDefined();
      expect(m![10]).toBe("同条");
      expect(m![11]).toBe("第三項");
    });

    it("前条第二項 にマッチする（相対条文 + 項）", () => {
      const text = "前条第二項に規定する";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[10]);
      expect(m).toBeDefined();
      expect(m![10]).toBe("前条");
      expect(m![11]).toBe("第二項");
    });
  });

  // パターン7: 相対項 → group [12]
  describe("相対項参照のマッチ", () => {
    it("前項 にマッチする", () => {
      const text = "前項の規定にかかわらず";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[12]);
      expect(m).toBeDefined();
      expect(m![12]).toBe("前項");
    });

    it("次項 にマッチする", () => {
      const text = "次項において同じ";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[12]);
      expect(m).toBeDefined();
      expect(m![12]).toBe("次項");
    });

    it("同項 にマッチする", () => {
      const text = "同項の規定を準用";
      const matches = [...text.matchAll(regex)];
      const m = matches.find((match) => match[12]);
      expect(m).toBeDefined();
      expect(m![12]).toBe("同項");
    });
  });

  // 複合テスト
  describe("複数参照を含むテキスト", () => {
    it("同一テキスト内の複数法令参照を全て検出する", () => {
      const text = "民法第九十条及び会社法第三百五十六条第一項の規定に基づき、前項の適用を受ける。";
      const matches = [...text.matchAll(regex)];
      // 民法第九十条, 会社法第三百五十六条第一項, 前項 が検出されるはず
      expect(matches.length).toBeGreaterThanOrEqual(3);
    });

    it("法令参照が含まれないテキストはマッチしない", () => {
      const text = "本日は晴天なり。明日も天気が良いでしょう。";
      const matches = [...text.matchAll(regex)];
      expect(matches).toHaveLength(0);
    });
  });

  describe("エッジケース", () => {
    it("空文字列はマッチしない", () => {
      const matches = [...("" as string).matchAll(regex)];
      expect(matches).toHaveLength(0);
    });

    it("条文番号のみの漢数字が単独では法令名としてマッチしない", () => {
      // "一" や "二" 単独は法令名ではない
      const text = "一つの理由がある";
      const matches = [...text.matchAll(regex)];
      const lawOnlyMatches = matches.filter((m) => m[9]);
      // "一" は法令名ではないのでマッチしない
      expect(lawOnlyMatches).toHaveLength(0);
    });
  });
});
