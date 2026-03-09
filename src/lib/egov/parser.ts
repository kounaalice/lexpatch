import type {
  LawNode,
  Article,
  Chapter,
  Paragraph,
  Item,
  Subitem,
  AppendixTable,
  TableRow,
  StructuredLaw,
} from "./types";

// ノードからテキストを再帰的に抽出
function extractText(node: LawNode | string): string {
  if (typeof node === "string") return node;
  return node.children.map(extractText).join("");
}

// 子ノードを tag でフィルタ
function childrenByTag(node: LawNode, tag: string): LawNode[] {
  return node.children.filter((c): c is LawNode => typeof c !== "string" && c.tag === tag);
}

// 特定タグのノードを再帰検索（最初のヒットのみ）
function findFirstByTag(node: LawNode, tag: string): LawNode | null {
  if (node.tag === tag) return node;
  for (const child of node.children) {
    if (typeof child !== "string") {
      const found = findFirstByTag(child, tag);
      if (found) return found;
    }
  }
  return null;
}

// 特定タグのノードを再帰検索（すべて収集）
function findAllByTag(node: LawNode, tag: string): LawNode[] {
  const results: LawNode[] = [];
  if (node.tag === tag) {
    results.push(node);
    return results;
  }
  for (const child of node.children) {
    if (typeof child !== "string") {
      results.push(...findAllByTag(child, tag));
    }
  }
  return results;
}

// ─── Subitem パース（再帰的: Subitem1 > Subitem2 > Subitem3 ...） ───
function parseSubitem(node: LawNode): Subitem {
  let title = "";
  const sentences: string[] = [];
  const subitems: Subitem[] = [];

  for (const child of node.children) {
    if (typeof child === "string") continue;
    // SubitemNTitle (Subitem1Title, Subitem2Title, ...)
    if (child.tag.endsWith("Title") && child.tag.startsWith("Subitem")) {
      title = extractText(child).trim();
    }
    // SubitemNSentence (Subitem1Sentence, Subitem2Sentence, ...)
    else if (child.tag.endsWith("Sentence") && child.tag.startsWith("Subitem")) {
      sentences.push(...collectSentences(child));
    }
    // 再帰: Subitem2 inside Subitem1, etc.
    else if (child.tag.startsWith("Subitem")) {
      subitems.push(parseSubitem(child));
    }
  }

  return { title, sentences, ...(subitems.length > 0 ? { subitems } : {}) };
}

// Sentence タグを再帰収集（Column でラップされているケースに対応）
function collectSentences(container: LawNode): string[] {
  const results: string[] = [];
  for (const child of container.children) {
    if (typeof child === "string") continue;
    if (child.tag === "Sentence") {
      results.push(extractText(child).trim());
    } else if (child.tag === "Column") {
      // ItemSentence > Column > Sentence（著作権法等の定義条文）
      results.push(...collectSentences(child));
    }
  }
  return results;
}

// ─── Item パース（号） ─────────────────────────────
function parseItem(node: LawNode): Item {
  const num = node.attr.Num ?? "";
  let title = "";
  const sentences: string[] = [];
  const subitems: Subitem[] = [];

  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (child.tag === "ItemTitle") {
      title = extractText(child).trim();
    } else if (child.tag === "ItemSentence") {
      sentences.push(...collectSentences(child));
    } else if (child.tag.startsWith("Subitem")) {
      subitems.push(parseSubitem(child));
    }
  }

  return { num, title, sentences, ...(subitems.length > 0 ? { subitems } : {}) };
}

// ─── Paragraph パース（号を含む） ────────────────────
function parseParagraph(node: LawNode): Paragraph {
  const num = node.attr.Num ?? "";
  const sentences: string[] = [];
  const items: Item[] = [];

  // ParagraphSentence > Sentence (or Column > Sentence) + Item children
  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (child.tag === "ParagraphSentence") {
      sentences.push(...collectSentences(child));
    } else if (child.tag === "Item") {
      items.push(parseItem(child));
    }
  }

  // Sentence が直下にある場合（フォールバック）
  if (sentences.length === 0) {
    for (const child of node.children) {
      if (typeof child !== "string" && child.tag === "Sentence") {
        sentences.push(extractText(child).trim());
      }
    }
  }

  return { num, sentences, ...(items.length > 0 ? { items } : {}) };
}

// Article ノードをパース（附則プレフィックス付き）
function parseArticle(node: LawNode, numPrefix = ""): Article {
  const rawNum = node.attr.Num ?? "";
  const num = numPrefix ? `${numPrefix}${rawNum}` : rawNum;
  let title = "";
  let caption = "";
  const paragraphs: Paragraph[] = [];

  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (child.tag === "ArticleTitle") {
      title = extractText(child).trim();
    } else if (child.tag === "ArticleCaption") {
      caption = extractText(child).trim();
    } else if (child.tag === "Paragraph") {
      paragraphs.push(parseParagraph(child));
    }
  }

  return { num, title, caption, paragraphs };
}

// 再帰的に Article ノードを収集（附則プレフィックス付き）
function collectArticles(node: LawNode, numPrefix = ""): Article[] {
  const results: Article[] = [];
  if (node.tag === "Article") {
    results.push(parseArticle(node, numPrefix));
    return results;
  }
  for (const child of node.children) {
    if (typeof child !== "string") {
      results.push(...collectArticles(child, numPrefix));
    }
  }
  return results;
}

// 再帰的に Chapter/Part/Section ノードを収集
function collectChapters(node: LawNode, numPrefix = ""): Chapter[] {
  const results: Chapter[] = [];
  if (node.tag === "Chapter" || node.tag === "Part" || node.tag === "Section") {
    const titleNode = childrenByTag(node, `${node.tag}Title`)[0];
    const title = titleNode ? extractText(titleNode).trim() : "";
    const articles = collectArticles(node, numPrefix);
    results.push({ title, articles });
    return results;
  }
  for (const child of node.children) {
    if (typeof child !== "string") {
      results.push(...collectChapters(child, numPrefix));
    }
  }
  return results;
}

// ─── AppendixTable パース（別表） ───────────────────
function parseAppendixTable(node: LawNode): AppendixTable {
  const titleNode = childrenByTag(node, "AppdxTableTitle")[0];
  const title = titleNode ? extractText(titleNode).trim() : "別表";
  const relatedNode = childrenByTag(node, "RelatedArticleNum")[0];
  const relatedArticle = relatedNode ? extractText(relatedNode).trim() : undefined;

  const rows: TableRow[] = [];
  // TableStruct > Table > TableRow > TableColumn
  const tableStructNodes = childrenByTag(node, "TableStruct");
  for (const ts of tableStructNodes) {
    const tableNodes = childrenByTag(ts, "Table");
    for (const tbl of tableNodes) {
      for (const child of tbl.children) {
        if (typeof child !== "string" && child.tag === "TableRow") {
          const columns = child.children
            .filter((c): c is LawNode => typeof c !== "string" && c.tag === "TableColumn")
            .map((col) => {
              const text = extractText(col).trim();
              const colspan = col.attr.colspan ? parseInt(col.attr.colspan) : undefined;
              const rowspan = col.attr.rowspan ? parseInt(col.attr.rowspan) : undefined;
              return { text, ...(colspan ? { colspan } : {}), ...(rowspan ? { rowspan } : {}) };
            });
          rows.push({ columns });
        }
      }
    }
  }

  return { title, ...(relatedArticle ? { relatedArticle } : {}), rows };
}

// ─── メイン: e-Gov API の law_full_text JSON → StructuredLaw ───
export function parseLawFullText(
  lawId: string,
  lawTitle: string,
  lawNum: string,
  fullText: LawNode,
): StructuredLaw {
  // 前文（Preamble — 日本国憲法等）
  let preamble: Paragraph[] | undefined;
  const preambleNode = findFirstByTag(fullText, "Preamble");
  if (preambleNode) {
    preamble = childrenByTag(preambleNode, "Paragraph").map(parseParagraph);
    if (preamble.length === 0) preamble = undefined;
  }

  // 本則（MainProvision）を優先パース
  const mainNode = findFirstByTag(fullText, "MainProvision");
  let chapters: Chapter[] = [];
  let articles: Article[] = [];

  if (mainNode) {
    chapters = collectChapters(mainNode);
    if (chapters.length === 0) {
      articles = collectArticles(mainNode);
    }
  } else {
    // MainProvision が見つからない場合は全体をパース（後方互換）
    chapters = collectChapters(fullText);
    if (chapters.length === 0) {
      articles = collectArticles(fullText);
    }
  }

  // 附則（SupplProvision）を別セクションとしてパース
  // 法令によっては複数の SupplProvision ノードが兄弟として並ぶ（国家行政組織法等）
  // 附則内の条番号は "suppl-1", "suppl-2" のようにプレフィックスを付与して
  // 本則第一条と重複しないようにする
  const supplNodes = findAllByTag(fullText, "SupplProvision");
  const allSupplArticles: Article[] = [];
  for (let si = 0; si < supplNodes.length; si++) {
    const prefix = supplNodes.length === 1 ? "suppl-" : `suppl${si}-`;
    allSupplArticles.push(...collectArticles(supplNodes[si], prefix));
  }
  // タイトルを「附則第X条」形式に補正
  for (const a of allSupplArticles) {
    if (!a.title || a.title === "") {
      const rawNum = a.num.replace(/^suppl\d*-/, "");
      a.title = rawNum ? `附則第${numToKanji(rawNum)}条` : "附則";
    } else if (!a.title.startsWith("附則")) {
      a.title = `附則 ${a.title}`;
    }
  }
  if (allSupplArticles.length > 0) {
    // 本則が articles（チャプターなし）にあるとき、附則を chapters に入れると
    // 描画側が chapters だけ表示して本則が消えるバグを防ぐ:
    // 本則 articles を無名チャプターとして先頭に移動してから附則を追加
    if (articles.length > 0 && chapters.length === 0) {
      chapters.push({ title: "", articles });
      articles = [];
    }
    chapters.push({ title: "附則", articles: allSupplArticles });
  }

  // 別表（AppdxTable）
  let appendixTables: AppendixTable[] | undefined;
  const appdxNodes = findAllByTag(fullText, "AppdxTable");
  if (appdxNodes.length > 0) {
    appendixTables = appdxNodes.map(parseAppendixTable);
  }

  return {
    law_id: lawId,
    law_title: lawTitle,
    law_num: lawNum,
    chapters,
    articles,
    ...(preamble ? { preamble } : {}),
    ...(appendixTables ? { appendixTables } : {}),
  };
}

// 数字（アラビア）を漢数字表記に変換（簡易版）
function numToKanji(num: string): string {
  const map: Record<string, string> = {
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
    "10": "十",
  };
  return map[num] ?? num;
}
