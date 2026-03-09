import { describe, it, expect } from "vitest";
import {
  getArticleRarity,
  buildArticlePool,
  SSR_ARTICLES,
  GACHA_COST_SINGLE,
  GACHA_COST_TEN,
  BUY_COST,
  RARITY_STARS,
  RARITY_LABEL,
  RARITY_COLOR,
  PACK_DEFS,
  type CardRarity,
} from "./cards";
import type { Article } from "./egov/types";

// ── 定数テスト ──

describe("ガチャコスト定数", () => {
  it("単発ガチャコストが30", () => {
    expect(GACHA_COST_SINGLE).toBe(30);
  });

  it("10連ガチャコストが250", () => {
    expect(GACHA_COST_TEN).toBe(250);
  });

  it("10連は単発10回より割安", () => {
    expect(GACHA_COST_TEN).toBeLessThan(GACHA_COST_SINGLE * 10);
  });
});

describe("BUY_COST", () => {
  it("全レアリティに購入コストが定義されている", () => {
    const rarities: CardRarity[] = ["N", "R", "SR", "SSR"];
    for (const r of rarities) {
      expect(BUY_COST[r]).toBeTypeOf("number");
      expect(BUY_COST[r]).toBeGreaterThan(0);
    }
  });

  it("レアリティが高いほど購入コストが高い", () => {
    expect(BUY_COST.N).toBeLessThan(BUY_COST.R);
    expect(BUY_COST.R).toBeLessThan(BUY_COST.SR);
    expect(BUY_COST.SR).toBeLessThan(BUY_COST.SSR);
  });

  it("各レアリティの購入コストが正しい", () => {
    expect(BUY_COST.N).toBe(20);
    expect(BUY_COST.R).toBe(50);
    expect(BUY_COST.SR).toBe(150);
    expect(BUY_COST.SSR).toBe(500);
  });
});

describe("RARITY_STARS", () => {
  it("全レアリティに星表示が定義されている", () => {
    const rarities: CardRarity[] = ["N", "R", "SR", "SSR"];
    for (const r of rarities) {
      expect(RARITY_STARS[r]).toBeTypeOf("string");
      expect(RARITY_STARS[r].length).toBeGreaterThan(0);
    }
  });
});

describe("RARITY_LABEL", () => {
  it("全レアリティにラベルが定義されている", () => {
    expect(RARITY_LABEL.N).toBe("N");
    expect(RARITY_LABEL.R).toBe("R");
    expect(RARITY_LABEL.SR).toBe("SR");
    expect(RARITY_LABEL.SSR).toBe("SSR");
  });
});

describe("RARITY_COLOR", () => {
  it("全レアリティにカラー設定が定義されている", () => {
    const rarities: CardRarity[] = ["N", "R", "SR", "SSR"];
    for (const r of rarities) {
      expect(RARITY_COLOR[r]).toHaveProperty("border");
      expect(RARITY_COLOR[r]).toHaveProperty("glow");
      expect(RARITY_COLOR[r]).toHaveProperty("bg");
    }
  });
});

describe("SSR_ARTICLES", () => {
  it("SSRテーブルにエントリが存在する", () => {
    expect(SSR_ARTICLES.size).toBeGreaterThan(0);
  });

  it("憲法9条（戦争放棄）がSSRに含まれる", () => {
    expect(SSR_ARTICLES.has("321CONSTITUTION:9")).toBe(true);
  });

  it("民法709条（不法行為）がSSRに含まれる", () => {
    expect(SSR_ARTICLES.has("129AC0000000089:709")).toBe(true);
  });

  it("刑法199条（殺人罪）がSSRに含まれる", () => {
    expect(SSR_ARTICLES.has("140AC0000000045:199")).toBe(true);
  });

  it("労働基準法39条（年次有給休暇）がSSRに含まれる", () => {
    expect(SSR_ARTICLES.has("322AC0000000049:39")).toBe(true);
  });

  it("著作権法30条（私的使用のための複製）がSSRに含まれる", () => {
    expect(SSR_ARTICLES.has("345AC0000000048:30")).toBe(true);
  });

  it("全エントリが lawId:articleNum 形式である", () => {
    for (const entry of SSR_ARTICLES) {
      expect(entry).toMatch(/^.+:.+$/);
    }
  });
});

describe("PACK_DEFS", () => {
  it("パック定義が存在する", () => {
    expect(PACK_DEFS.length).toBeGreaterThan(0);
  });

  it("各パックにid, label, emoji, lawIds, requiredLevelがある", () => {
    for (const pack of PACK_DEFS) {
      expect(pack.id).toBeTypeOf("string");
      expect(pack.label).toBeTypeOf("string");
      expect(pack.emoji).toBeTypeOf("string");
      expect(Array.isArray(pack.lawIds)).toBe(true);
      expect(pack.requiredLevel).toBeTypeOf("number");
      expect(pack.requiredLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it("六法パックが存在し、6法令IDを含む", () => {
    const roppo = PACK_DEFS.find((p) => p.id === "roppo");
    expect(roppo).toBeDefined();
    expect(roppo!.lawIds).toHaveLength(6);
    expect(roppo!.requiredLevel).toBe(1);
  });

  it("ミックスパックのlawIdsは空配列（全法令対象）", () => {
    const mixed = PACK_DEFS.find((p) => p.id === "mixed");
    expect(mixed).toBeDefined();
    expect(mixed!.lawIds).toHaveLength(0);
  });

  it("パックIDが一意である", () => {
    const ids = PACK_DEFS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── getArticleRarity テスト ──

describe("getArticleRarity", () => {
  describe("SSRハードコードテーブル判定", () => {
    it("憲法9条はSSR", () => {
      expect(getArticleRarity("321CONSTITUTION", "9")).toBe("SSR");
    });

    it("民法709条（不法行為）はSSR", () => {
      expect(getArticleRarity("129AC0000000089", "709")).toBe("SSR");
    });

    it("刑法36条（正当防衛）はSSR", () => {
      expect(getArticleRarity("140AC0000000045", "36")).toBe("SSR");
    });

    it("労働基準法32条（労働時間）はSSR", () => {
      expect(getArticleRarity("322AC0000000049", "32")).toBe("SSR");
    });

    it("個人情報保護法1条（目的）はSSR", () => {
      expect(getArticleRarity("415AC0000000057", "1")).toBe("SSR");
    });
  });

  describe("Article構造ベース判定", () => {
    const makeArticle = (pCount: number, iCount: number, caption?: string): Article => ({
      num: "999",
      title: "第九百九十九条",
      caption: caption || "",
      paragraphs: Array.from({ length: pCount }, (_, i) => ({
        num: String(i + 1),
        sentences: ["テスト文。"],
        items: Array.from({ length: Math.ceil(iCount / pCount) || 0 }, (__, j) => ({
          num: String(j + 1),
          title: "一",
          sentences: ["テスト号。"],
        })),
      })),
    });

    it("10項以上の条文はSSR", () => {
      const article = makeArticle(10, 0);
      expect(getArticleRarity("test_law", "999", article)).toBe("SSR");
    });

    it("15号以上の条文はSSR", () => {
      // 3項 x 5号 = 15号
      const article = makeArticle(3, 15);
      expect(getArticleRarity("test_law", "999", article)).toBe("SSR");
    });

    it("5項以上の条文はSR", () => {
      const article = makeArticle(5, 0);
      expect(getArticleRarity("test_law", "999", article)).toBe("SR");
    });

    it("10号以上の条文はSR", () => {
      // 2項 x 5号 = 10号
      const article = makeArticle(2, 10);
      expect(getArticleRarity("test_law", "999", article)).toBe("SR");
    });

    it("2項以上の条文はR", () => {
      const article = makeArticle(2, 0);
      // items は空にする
      article.paragraphs.forEach((p) => (p.items = []));
      expect(getArticleRarity("test_law", "999", article)).toBe("R");
    });

    it("見出し付きの1項条文はR", () => {
      const article = makeArticle(1, 0);
      article.paragraphs.forEach((p) => (p.items = []));
      article.caption = "（基本原則）";
      expect(getArticleRarity("test_law", "999", article)).toBe("R");
    });

    it("1項・号なし・見出しなしの条文はN", () => {
      const article: Article = {
        num: "999",
        title: "第九百九十九条",
        caption: "",
        paragraphs: [
          {
            num: "1",
            sentences: ["テスト文。"],
          },
        ],
      };
      expect(getArticleRarity("test_law", "999", article)).toBe("N");
    });
  });

  describe("ハッシュベース判定（Articleなし・非SSRテーブル）", () => {
    it("同じcardIdは常に同じレアリティを返す（決定的）", () => {
      const r1 = getArticleRarity("test_law", "42");
      const r2 = getArticleRarity("test_law", "42");
      const r3 = getArticleRarity("test_law", "42");
      expect(r1).toBe(r2);
      expect(r2).toBe(r3);
    });

    it("返り値はN/R/SR/SSRのいずれか", () => {
      const validRarities: CardRarity[] = ["N", "R", "SR", "SSR"];
      // 複数のcardIdで検証
      for (let i = 0; i < 20; i++) {
        const rarity = getArticleRarity("hash_test_law", String(i));
        expect(validRarities).toContain(rarity);
      }
    });

    it("異なるcardIdでレアリティが分散する", () => {
      // 100件テストして全部同じレアリティになる確率は極めて低い
      const rarities = new Set<CardRarity>();
      for (let i = 0; i < 100; i++) {
        rarities.add(getArticleRarity("diversity_law", String(i * 7 + 13)));
      }
      expect(rarities.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("SSRテーブルが構造判定より優先される", () => {
    it("SSRテーブルにある条文はArticle構造に関係なくSSR", () => {
      // 民法709条はSSRテーブルにある → 1項の短い条文でもSSR
      const simpleArticle: Article = {
        num: "709",
        title: "第七百九条",
        caption: "",
        paragraphs: [
          {
            num: "1",
            sentences: [
              "故意又は過失によって他人の権利又は法律上保護される利益を侵害した者は、これによって生じた損害を賠償する責任を負う。",
            ],
          },
        ],
      };
      expect(getArticleRarity("129AC0000000089", "709", simpleArticle)).toBe("SSR");
    });
  });
});

// ── buildArticlePool テスト ──

describe("buildArticlePool", () => {
  it("空の配列から空のプールを返す", () => {
    const pool = buildArticlePool("test_law", []);
    expect(pool).toHaveLength(0);
  });

  it("各Articleに対してlawId, num, rarityを含むエントリを返す", () => {
    const articles: Article[] = [
      {
        num: "1",
        title: "第一条",
        caption: "（目的）",
        paragraphs: [{ num: "1", sentences: ["テスト。"] }],
      },
      {
        num: "2",
        title: "第二条",
        caption: "",
        paragraphs: [{ num: "1", sentences: ["テスト。"] }],
      },
    ];

    const pool = buildArticlePool("test_law", articles);
    expect(pool).toHaveLength(2);

    expect(pool[0].lawId).toBe("test_law");
    expect(pool[0].num).toBe("1");
    expect(["N", "R", "SR", "SSR"]).toContain(pool[0].rarity);

    expect(pool[1].lawId).toBe("test_law");
    expect(pool[1].num).toBe("2");
    expect(["N", "R", "SR", "SSR"]).toContain(pool[1].rarity);
  });

  it("SSRテーブルの条文がプールに含まれる場合SSRレアリティになる", () => {
    // 憲法9条はSSRテーブルにある
    const articles: Article[] = [
      {
        num: "9",
        title: "第九条",
        caption: "",
        paragraphs: [
          { num: "1", sentences: ["日本国民は、正義と秩序を基調とする国際平和を誠実に希求し..."] },
          { num: "2", sentences: ["前項の目的を達するため..."] },
        ],
      },
    ];

    const pool = buildArticlePool("321CONSTITUTION", articles);
    expect(pool).toHaveLength(1);
    expect(pool[0].rarity).toBe("SSR");
  });

  it("Articleの構造に基づいてレアリティを判定する", () => {
    // 10項の条文 → SSR
    const manyParagraphs: Article = {
      num: "100",
      title: "第百条",
      caption: "",
      paragraphs: Array.from({ length: 10 }, (_, i) => ({
        num: String(i + 1),
        sentences: ["項テスト。"],
      })),
    };

    const pool = buildArticlePool("structure_test", [manyParagraphs]);
    expect(pool[0].rarity).toBe("SSR");
  });

  it("プールの順序が入力配列と一致する", () => {
    const articles: Article[] = [
      { num: "5", title: "第五条", caption: "", paragraphs: [{ num: "1", sentences: ["a"] }] },
      { num: "10", title: "第十条", caption: "", paragraphs: [{ num: "1", sentences: ["b"] }] },
      { num: "15", title: "第十五条", caption: "", paragraphs: [{ num: "1", sentences: ["c"] }] },
    ];

    const pool = buildArticlePool("order_test", articles);
    expect(pool.map((p) => p.num)).toEqual(["5", "10", "15"]);
  });
});
