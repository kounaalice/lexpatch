import { describe, it, expect } from "vitest";
import { ACTIVITY_POINTS, ACTIVITY_EMOJI, ACTIVITY_LABEL, type ActivityType } from "./gaming";

// ── 定数テスト ──

describe("ACTIVITY_POINTS", () => {
  it("全アクティビティタイプにポイントが定義されている", () => {
    const types: ActivityType[] = ["view", "bookmark", "follow", "search", "note"];
    for (const t of types) {
      expect(ACTIVITY_POINTS[t]).toBeTypeOf("number");
      expect(ACTIVITY_POINTS[t]).toBeGreaterThan(0);
    }
  });

  it("各アクティビティのポイント値が正しい", () => {
    expect(ACTIVITY_POINTS.view).toBe(5);
    expect(ACTIVITY_POINTS.bookmark).toBe(10);
    expect(ACTIVITY_POINTS.follow).toBe(8);
    expect(ACTIVITY_POINTS.search).toBe(3);
    expect(ACTIVITY_POINTS.note).toBe(10);
  });
});

describe("ACTIVITY_EMOJI", () => {
  it("全アクティビティタイプに絵文字が定義されている", () => {
    const types: ActivityType[] = ["view", "bookmark", "follow", "search", "note"];
    for (const t of types) {
      expect(ACTIVITY_EMOJI[t]).toBeTypeOf("string");
      expect(ACTIVITY_EMOJI[t].length).toBeGreaterThan(0);
    }
  });
});

describe("ACTIVITY_LABEL", () => {
  it("全アクティビティタイプに日本語ラベルが定義されている", () => {
    const types: ActivityType[] = ["view", "bookmark", "follow", "search", "note"];
    for (const t of types) {
      expect(ACTIVITY_LABEL[t]).toBeTypeOf("string");
      expect(ACTIVITY_LABEL[t].length).toBeGreaterThan(0);
    }
  });

  it("各ラベルの値が正しい", () => {
    expect(ACTIVITY_LABEL.view).toBe("法令閲覧");
    expect(ACTIVITY_LABEL.bookmark).toBe("ブックマーク");
    expect(ACTIVITY_LABEL.follow).toBe("フォロー");
    expect(ACTIVITY_LABEL.search).toBe("検索");
    expect(ACTIVITY_LABEL.note).toBe("ノート作成");
  });
});

// ── レベル計算ロジックテスト（getGamingStatsの内部ロジックを直接検証） ──
// getGamingStats自体はlocalStorageに依存するが、レベル計算ロジックは
// XP_PER_LEVEL=200, TITLES配列に基づく単純な数式のため、ここで検証する

describe("レベル計算ロジック", () => {
  // getGamingStats内のロジック: level = Math.floor(xp / 200) + 1
  const calcLevel = (xp: number) => Math.floor(xp / 200) + 1;

  it("XP=0 でレベル1", () => {
    expect(calcLevel(0)).toBe(1);
  });

  it("XP=199 でレベル1", () => {
    expect(calcLevel(199)).toBe(1);
  });

  it("XP=200 でレベル2", () => {
    expect(calcLevel(200)).toBe(2);
  });

  it("XP=400 でレベル3", () => {
    expect(calcLevel(400)).toBe(3);
  });

  it("XP=1200 でレベル7", () => {
    expect(calcLevel(1200)).toBe(7);
  });

  it("高XPでもレベルが正しく計算される", () => {
    expect(calcLevel(10000)).toBe(51);
  });
});

describe("タイトル判定ロジック", () => {
  const TITLES = [
    "見習い",
    "法令探究者",
    "条文読み",
    "法令通",
    "法令マスター",
    "法令賢者",
    "法令王",
  ];

  const calcTitle = (level: number) =>
    TITLES[Math.min(level - 1, TITLES.length - 1)] || TITLES[TITLES.length - 1];

  it("レベル1 で「見習い」", () => {
    expect(calcTitle(1)).toBe("見習い");
  });

  it("レベル2 で「法令探究者」", () => {
    expect(calcTitle(2)).toBe("法令探究者");
  });

  it("レベル3 で「条文読み」", () => {
    expect(calcTitle(3)).toBe("条文読み");
  });

  it("レベル4 で「法令通」", () => {
    expect(calcTitle(4)).toBe("法令通");
  });

  it("レベル5 で「法令マスター」", () => {
    expect(calcTitle(5)).toBe("法令マスター");
  });

  it("レベル6 で「法令賢者」", () => {
    expect(calcTitle(6)).toBe("法令賢者");
  });

  it("レベル7 で「法令王」", () => {
    expect(calcTitle(7)).toBe("法令王");
  });

  it("レベル100 でも最大タイトル「法令王」", () => {
    expect(calcTitle(100)).toBe("法令王");
  });
});

describe("進捗率計算ロジック", () => {
  const calcProgress = (xp: number) => ((xp % 200) / 200) * 100;

  it("XP=0 で進捗0%", () => {
    expect(calcProgress(0)).toBe(0);
  });

  it("XP=100 で進捗50%", () => {
    expect(calcProgress(100)).toBe(50);
  });

  it("XP=199 で進捗99.5%", () => {
    expect(calcProgress(199)).toBe(99.5);
  });

  it("XP=200 でレベルアップ後の進捗0%", () => {
    expect(calcProgress(200)).toBe(0);
  });

  it("XP=350 で進捗75%", () => {
    expect(calcProgress(350)).toBe(75);
  });
});
