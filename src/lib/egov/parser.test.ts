import { describe, it, expect } from "vitest";
import { parseLawFullText } from "./parser";
import type { LawNode } from "./types";

// ─── ヘルパー: LawNode を簡潔に生成 ─────────────────────
function n(
  tag: string,
  children: (LawNode | string)[] = [],
  attr: Record<string, string> = {},
): LawNode {
  return { tag, attr, children };
}

// ─── 基本動作 ────────────────────────────────────────────
describe("parseLawFullText — 基本動作", () => {
  it("最小限の入力で StructuredLaw を返す", () => {
    const root = n("Law", [n("LawBody", [n("MainProvision")])]);
    const result = parseLawFullText("test-id", "テスト法", "令和六年法律第一号", root);

    expect(result.law_id).toBe("test-id");
    expect(result.law_title).toBe("テスト法");
    expect(result.law_num).toBe("令和六年法律第一号");
    expect(result.chapters).toEqual([]);
    expect(result.articles).toEqual([]);
    expect(result.preamble).toBeUndefined();
    expect(result.appendixTables).toBeUndefined();
  });

  it("MainProvision が無い場合でも全体からパースする（後方互換）", () => {
    const root = n("Law", [
      n("LawBody", [
        n(
          "Article",
          [
            n("ArticleTitle", ["第一条"]),
            n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本文"])])], { Num: "1" }),
          ],
          { Num: "1" },
        ),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].title).toBe("第一条");
  });
});

// ─── 条（Article）パース ─────────────────────────────────
describe("parseLawFullText — 条（Article）", () => {
  it("ArticleTitle と ArticleCaption を正しく取得する", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["第一条"]),
              n("ArticleCaption", ["（目的）"]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["この法律は…"])])], {
                Num: "1",
              }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].num).toBe("1");
    expect(result.articles[0].title).toBe("第一条");
    expect(result.articles[0].caption).toBe("（目的）");
  });

  it("複数条を正しい順序でパースする", () => {
    const makeArticle = (num: string, title: string) =>
      n(
        "Article",
        [
          n("ArticleTitle", [title]),
          n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" }),
        ],
        { Num: num },
      );

    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          makeArticle("1", "第一条"),
          makeArticle("2", "第二条"),
          makeArticle("3", "第三条"),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles).toHaveLength(3);
    expect(result.articles.map((a) => a.num)).toEqual(["1", "2", "3"]);
  });

  it("Num 属性が無い Article でも空文字でパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Article", [
            n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" }),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].num).toBe("");
    expect(result.articles[0].title).toBe("");
    expect(result.articles[0].caption).toBe("");
  });
});

// ─── 項（Paragraph）パース ───────────────────────────────
describe("parseLawFullText — 項（Paragraph）", () => {
  it("ParagraphSentence > Sentence からテキストを取得する", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [
                    n("Sentence", ["第一文。"]),
                    n("Sentence", ["第二文。"]),
                  ]),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const para = result.articles[0].paragraphs[0];
    expect(para.num).toBe("1");
    expect(para.sentences).toEqual(["第一文。", "第二文。"]);
  });

  it("複数の項を正しくパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["第一項"])])], { Num: "1" }),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["第二項"])])], { Num: "2" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].paragraphs).toHaveLength(2);
    expect(result.articles[0].paragraphs[0].sentences[0]).toBe("第一項");
    expect(result.articles[0].paragraphs[1].sentences[0]).toBe("第二項");
  });

  it("Sentence が直下にある場合のフォールバック処理", () => {
    // ParagraphSentence ではなく直接 Sentence がある場合
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("Sentence", ["フォールバックテキスト"])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].paragraphs[0].sentences).toEqual(["フォールバックテキスト"]);
  });
});

// ─── 号（Item）パース ────────────────────────────────────
describe("parseLawFullText — 号（Item）", () => {
  it("Paragraph 内の Item を正しくパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [n("Sentence", ["次の各号に掲げる場合"])]),
                  n(
                    "Item",
                    [n("ItemTitle", ["一"]), n("ItemSentence", [n("Sentence", ["第一号の内容"])])],
                    { Num: "1" },
                  ),
                  n(
                    "Item",
                    [n("ItemTitle", ["二"]), n("ItemSentence", [n("Sentence", ["第二号の内容"])])],
                    { Num: "2" },
                  ),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const para = result.articles[0].paragraphs[0];
    expect(para.items).toHaveLength(2);
    expect(para.items![0].num).toBe("1");
    expect(para.items![0].title).toBe("一");
    expect(para.items![0].sentences).toEqual(["第一号の内容"]);
    expect(para.items![1].num).toBe("2");
    expect(para.items![1].title).toBe("二");
  });

  it("Item が無い Paragraph では items を含まない", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本文のみ"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].paragraphs[0].items).toBeUndefined();
  });

  it("ItemSentence > Column > Sentence の構造もパースする（著作権法等）", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [n("Sentence", ["定義"])]),
                  n(
                    "Item",
                    [
                      n("ItemTitle", ["一"]),
                      n("ItemSentence", [
                        n("Column", [n("Sentence", ["列1の内容"])]),
                        n("Column", [n("Sentence", ["列2の内容"])]),
                      ]),
                    ],
                    { Num: "1" },
                  ),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const item = result.articles[0].paragraphs[0].items![0];
    expect(item.sentences).toEqual(["列1の内容", "列2の内容"]);
  });
});

// ─── 号細分（Subitem）パース ─────────────────────────────
describe("parseLawFullText — 号細分（Subitem）", () => {
  it("Subitem1 を正しくパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [n("Sentence", ["本文"])]),
                  n(
                    "Item",
                    [
                      n("ItemTitle", ["一"]),
                      n("ItemSentence", [n("Sentence", ["号の本文"])]),
                      n("Subitem1", [
                        n("Subitem1Title", ["イ"]),
                        n("Subitem1Sentence", [n("Sentence", ["イの内容"])]),
                      ]),
                      n("Subitem1", [
                        n("Subitem1Title", ["ロ"]),
                        n("Subitem1Sentence", [n("Sentence", ["ロの内容"])]),
                      ]),
                    ],
                    { Num: "1" },
                  ),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const item = result.articles[0].paragraphs[0].items![0];
    expect(item.subitems).toHaveLength(2);
    expect(item.subitems![0].title).toBe("イ");
    expect(item.subitems![0].sentences).toEqual(["イの内容"]);
    expect(item.subitems![1].title).toBe("ロ");
    expect(item.subitems![1].sentences).toEqual(["ロの内容"]);
  });

  it("Subitem の再帰的ネスト（Subitem1 > Subitem2）をパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [n("Sentence", ["本文"])]),
                  n(
                    "Item",
                    [
                      n("ItemTitle", ["一"]),
                      n("ItemSentence", [n("Sentence", ["号"])]),
                      n("Subitem1", [
                        n("Subitem1Title", ["イ"]),
                        n("Subitem1Sentence", [n("Sentence", ["イ本文"])]),
                        n("Subitem2", [
                          n("Subitem2Title", ["(1)"]),
                          n("Subitem2Sentence", [n("Sentence", ["(1)の内容"])]),
                        ]),
                      ]),
                    ],
                    { Num: "1" },
                  ),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const subitem = result.articles[0].paragraphs[0].items![0].subitems![0];
    expect(subitem.title).toBe("イ");
    expect(subitem.subitems).toHaveLength(1);
    expect(subitem.subitems![0].title).toBe("(1)");
    expect(subitem.subitems![0].sentences).toEqual(["(1)の内容"]);
  });

  it("Subitem が無い Item では subitems を含まない", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n(
                "Paragraph",
                [
                  n("ParagraphSentence", [n("Sentence", ["本文"])]),
                  n(
                    "Item",
                    [n("ItemTitle", ["一"]), n("ItemSentence", [n("Sentence", ["号のみ"])])],
                    { Num: "1" },
                  ),
                ],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].paragraphs[0].items![0].subitems).toBeUndefined();
  });
});

// ─── 章（Chapter）/ 編（Part）/ 節（Section）パース ──────
describe("parseLawFullText — 章/編/節", () => {
  it("Chapter ノードをパースして articles に分配する", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Chapter", [
            n("ChapterTitle", ["第一章　総則"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第一条"]),
                n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["総則の内容"])])], {
                  Num: "1",
                }),
              ],
              { Num: "1" },
            ),
          ]),
          n("Chapter", [
            n("ChapterTitle", ["第二章　権利"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第二条"]),
                n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["権利の内容"])])], {
                  Num: "1",
                }),
              ],
              { Num: "2" },
            ),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters).toHaveLength(2);
    expect(result.chapters[0].title).toBe("第一章　総則");
    expect(result.chapters[0].articles).toHaveLength(1);
    expect(result.chapters[1].title).toBe("第二章　権利");
    expect(result.chapters[1].articles).toHaveLength(1);
    // chapters がある場合 articles は空
    expect(result.articles).toEqual([]);
  });

  it("Part ノードも Chapter と同様にパースされる", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Part", [
            n("PartTitle", ["第一編　総則"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第一条"]),
                n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" }),
              ],
              { Num: "1" },
            ),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters).toHaveLength(1);
    expect(result.chapters[0].title).toBe("第一編　総則");
  });

  it("Section ノードも Chapter と同様にパースされる", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Section", [
            n("SectionTitle", ["第一節　通則"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第一条"]),
                n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" }),
              ],
              { Num: "1" },
            ),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters).toHaveLength(1);
    expect(result.chapters[0].title).toBe("第一節　通則");
  });

  it("ChapterTitle が無い Chapter ではタイトルが空文字になる", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Chapter", [
            n(
              "Article",
              [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" })],
              { Num: "1" },
            ),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters[0].title).toBe("");
  });
});

// ─── 附則（SupplProvision）パース ────────────────────────
describe("parseLawFullText — 附則（SupplProvision）", () => {
  it("単一の附則をパースし chapters に追加する", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["第一条"]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["第一条"]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則内容"])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    // 本則 articles が無名 chapter に移動し、附則が追加される
    expect(result.chapters).toHaveLength(2);
    expect(result.chapters[0].title).toBe("");
    expect(result.chapters[0].articles[0].title).toBe("第一条");
    expect(result.chapters[1].title).toBe("附則");
    expect(result.chapters[1].articles[0].num).toBe("suppl-1");
  });

  it("附則条の num に suppl- プレフィックスが付与される", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則1"])])], { Num: "1" })],
            { Num: "1" },
          ),
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則2"])])], { Num: "1" })],
            { Num: "2" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    expect(supplChapter).toBeDefined();
    expect(supplChapter!.articles.map((a) => a.num)).toEqual(["suppl-1", "suppl-2"]);
  });

  it("附則条のタイトルが「附則第X条」形式に補正される", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [
              // タイトルなし → 自動生成
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則"])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    expect(supplChapter!.articles[0].title).toBe("附則第一条");
  });

  it("既存タイトルが「附則」で始まらない場合「附則 」を前置する", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["第一条"]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則"])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    expect(supplChapter!.articles[0].title).toBe("附則 第一条");
  });

  it("複数の SupplProvision がある場合、インデックス付きプレフィックスが付く", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則A"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則B"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    // 複数 SupplProvision → suppl0-, suppl1-
    expect(supplChapter!.articles[0].num).toBe("suppl0-1");
    expect(supplChapter!.articles[1].num).toBe("suppl1-1");
  });

  it("本則が chapters の場合、附則は chapters の末尾に追加される", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Chapter", [
            n("ChapterTitle", ["第一章　総則"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第一条"]),
                n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" }),
              ],
              { Num: "1" },
            ),
          ]),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters).toHaveLength(2);
    expect(result.chapters[0].title).toBe("第一章　総則");
    expect(result.chapters[1].title).toBe("附則");
  });

  it("附則が無い場合は chapters に附則が追加されない", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則のみ"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.chapters).toEqual([]);
    expect(result.articles).toHaveLength(1);
  });
});

// ─── 前文（Preamble）パース ──────────────────────────────
describe("parseLawFullText — 前文（Preamble）", () => {
  it("Preamble ノードを preamble として返す（日本国憲法等）", () => {
    const root = n("Law", [
      n("LawBody", [
        n("Preamble", [
          n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["日本国民は…"])])], { Num: "1" }),
          n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["われらは…"])])], { Num: "2" }),
        ]),
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["条文"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "日本国憲法", "num", root);
    expect(result.preamble).toHaveLength(2);
    expect(result.preamble![0].sentences[0]).toBe("日本国民は…");
    expect(result.preamble![1].sentences[0]).toBe("われらは…");
  });

  it("Preamble 内に Paragraph が無い場合は preamble が undefined", () => {
    const root = n("Law", [n("LawBody", [n("Preamble", []), n("MainProvision")])]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.preamble).toBeUndefined();
  });

  it("Preamble ノード自体が無い場合は preamble が undefined", () => {
    const root = n("Law", [n("LawBody", [n("MainProvision")])]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.preamble).toBeUndefined();
  });
});

// ─── 別表（AppendixTable）パース ─────────────────────────
describe("parseLawFullText — 別表（AppendixTable）", () => {
  it("AppdxTable ノードをパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision"),
        n("AppdxTable", [
          n("AppdxTableTitle", ["別表第一"]),
          n("RelatedArticleNum", ["（第六条関係）"]),
          n("TableStruct", [
            n("Table", [
              n("TableRow", [n("TableColumn", ["項目A"]), n("TableColumn", ["項目B"])]),
              n("TableRow", [n("TableColumn", ["値1"]), n("TableColumn", ["値2"])]),
            ]),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.appendixTables).toHaveLength(1);
    expect(result.appendixTables![0].title).toBe("別表第一");
    expect(result.appendixTables![0].relatedArticle).toBe("（第六条関係）");
    expect(result.appendixTables![0].rows).toHaveLength(2);
    expect(result.appendixTables![0].rows[0].columns).toEqual([
      { text: "項目A" },
      { text: "項目B" },
    ]);
  });

  it("colspan/rowspan 属性が反映される", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision"),
        n("AppdxTable", [
          n("AppdxTableTitle", ["別表"]),
          n("TableStruct", [
            n("Table", [
              n("TableRow", [n("TableColumn", ["結合セル"], { colspan: "2", rowspan: "3" })]),
            ]),
          ]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    const col = result.appendixTables![0].rows[0].columns[0];
    expect(col.colspan).toBe(2);
    expect(col.rowspan).toBe(3);
  });

  it("AppdxTableTitle が無い場合はデフォルト「別表」になる", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision"),
        n("AppdxTable", [
          n("TableStruct", [n("Table", [n("TableRow", [n("TableColumn", ["内容"])])])]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.appendixTables![0].title).toBe("別表");
    expect(result.appendixTables![0].relatedArticle).toBeUndefined();
  });

  it("AppdxTable が無い場合は appendixTables が undefined", () => {
    const root = n("Law", [n("LawBody", [n("MainProvision")])]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.appendixTables).toBeUndefined();
  });

  it("複数の別表をパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision"),
        n("AppdxTable", [
          n("AppdxTableTitle", ["別表第一"]),
          n("TableStruct", [n("Table", [n("TableRow", [n("TableColumn", ["A"])])])]),
        ]),
        n("AppdxTable", [
          n("AppdxTableTitle", ["別表第二"]),
          n("TableStruct", [n("Table", [n("TableRow", [n("TableColumn", ["B"])])])]),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.appendixTables).toHaveLength(2);
    expect(result.appendixTables![0].title).toBe("別表第一");
    expect(result.appendixTables![1].title).toBe("別表第二");
  });
});

// ─── テキスト抽出（extractText）─────────────────────────
describe("parseLawFullText — テキスト抽出", () => {
  it("ネストされたノードからテキストを連結する", () => {
    // Ruby アノテーションなど、テキストが入れ子になるケース
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["第", n("Ruby", ["一"]), "条"]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["内容"])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].title).toBe("第一条");
  });

  it("テキスト前後の空白がトリムされる", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["  第一条  "]),
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["  内容  "])])], { Num: "1" }),
            ],
            { Num: "1" },
          ),
        ]),
      ]),
    ]);
    const result = parseLawFullText("id", "法律", "num", root);
    expect(result.articles[0].title).toBe("第一条");
    expect(result.articles[0].paragraphs[0].sentences[0]).toBe("内容");
  });
});

// ─── numToKanji 間接テスト ───────────────────────────────
describe("parseLawFullText — numToKanji（附則タイトル生成経由）", () => {
  const makeSupplRoot = (articleNum: string) =>
    n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n(
            "Article",
            [n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["本則"])])], { Num: "1" })],
            { Num: "1" },
          ),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [
              // タイトルなし → numToKanji で生成
              n("Paragraph", [n("ParagraphSentence", [n("Sentence", ["附則"])])], { Num: "1" }),
            ],
            { Num: articleNum },
          ),
        ]),
      ]),
    ]);

  it.each([
    ["1", "附則第一条"],
    ["2", "附則第二条"],
    ["3", "附則第三条"],
    ["5", "附則第五条"],
    ["10", "附則第十条"],
  ])("Num=%s → タイトル %s", (num, expectedTitle) => {
    const result = parseLawFullText("id", "法律", "num", makeSupplRoot(num));
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    expect(supplChapter!.articles[0].title).toBe(expectedTitle);
  });

  it("漢数字マッピング外の値はそのまま使われる", () => {
    const result = parseLawFullText("id", "法律", "num", makeSupplRoot("99"));
    const supplChapter = result.chapters.find((c) => c.title === "附則");
    // numToKanji に "99" のマッピングは無いのでそのまま
    expect(supplChapter!.articles[0].title).toBe("附則第99条");
  });
});

// ─── 統合テスト: 現実的な法令構造 ───────────────────────
describe("parseLawFullText — 統合テスト", () => {
  it("章構成 + 附則 + 別表を含む法令を正しくパースする", () => {
    const root = n("Law", [
      n("LawBody", [
        n("MainProvision", [
          n("Chapter", [
            n("ChapterTitle", ["第一章　総則"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第一条"]),
                n("ArticleCaption", ["（目的）"]),
                n(
                  "Paragraph",
                  [
                    n("ParagraphSentence", [
                      n("Sentence", ["この法律は、テストの目的を定めるものとする。"]),
                    ]),
                  ],
                  { Num: "1" },
                ),
              ],
              { Num: "1" },
            ),
          ]),
          n("Chapter", [
            n("ChapterTitle", ["第二章　定義"]),
            n(
              "Article",
              [
                n("ArticleTitle", ["第二条"]),
                n("ArticleCaption", ["（定義）"]),
                n(
                  "Paragraph",
                  [
                    n("ParagraphSentence", [
                      n("Sentence", [
                        "この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。",
                      ]),
                    ]),
                    n(
                      "Item",
                      [n("ItemTitle", ["一"]), n("ItemSentence", [n("Sentence", ["用語Aの定義"])])],
                      { Num: "1" },
                    ),
                    n(
                      "Item",
                      [n("ItemTitle", ["二"]), n("ItemSentence", [n("Sentence", ["用語Bの定義"])])],
                      { Num: "2" },
                    ),
                  ],
                  { Num: "1" },
                ),
              ],
              { Num: "2" },
            ),
          ]),
        ]),
        n("SupplProvision", [
          n(
            "Article",
            [
              n("ArticleTitle", ["附則第一条"]),
              n(
                "Paragraph",
                [n("ParagraphSentence", [n("Sentence", ["この法律は、公布の日から施行する。"])])],
                { Num: "1" },
              ),
            ],
            { Num: "1" },
          ),
        ]),
        n("AppdxTable", [
          n("AppdxTableTitle", ["別表（第二条関係）"]),
          n("TableStruct", [
            n("Table", [n("TableRow", [n("TableColumn", ["用語"]), n("TableColumn", ["定義"])])]),
          ]),
        ]),
      ]),
    ]);

    const result = parseLawFullText("test-law-001", "テスト法", "令和六年法律第百号", root);

    // 基本情報
    expect(result.law_id).toBe("test-law-001");
    expect(result.law_title).toBe("テスト法");
    expect(result.law_num).toBe("令和六年法律第百号");

    // 章構成: 2章 + 附則
    expect(result.chapters).toHaveLength(3);
    expect(result.chapters[0].title).toBe("第一章　総則");
    expect(result.chapters[1].title).toBe("第二章　定義");
    expect(result.chapters[2].title).toBe("附則");

    // 本則の条
    expect(result.chapters[0].articles[0].title).toBe("第一条");
    expect(result.chapters[0].articles[0].caption).toBe("（目的）");

    // 号
    const defArticle = result.chapters[1].articles[0];
    expect(defArticle.paragraphs[0].items).toHaveLength(2);

    // 附則
    expect(result.chapters[2].articles[0].paragraphs[0].sentences[0]).toBe(
      "この法律は、公布の日から施行する。",
    );

    // 別表
    expect(result.appendixTables).toHaveLength(1);
    expect(result.appendixTables![0].title).toBe("別表（第二条関係）");

    // articles は空（chapters に吸収済み）
    expect(result.articles).toEqual([]);

    // 前文なし
    expect(result.preamble).toBeUndefined();
  });
});
