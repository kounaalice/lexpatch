import type { LawNode, Article, Chapter, Paragraph, StructuredLaw } from "./types";

// ノードからテキストを再帰的に抽出
function extractText(node: LawNode | string): string {
  if (typeof node === "string") return node;
  return node.children.map(extractText).join("");
}

// 子ノードを tag でフィルタ
function childrenByTag(node: LawNode, tag: string): LawNode[] {
  return node.children.filter(
    (c): c is LawNode => typeof c !== "string" && c.tag === tag
  );
}

// Paragraph ノードをパース
function parseParagraph(node: LawNode): Paragraph {
  const num = node.attr.Num ?? "";
  const sentences: string[] = [];

  // ParagraphSentence > Sentence
  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (child.tag === "ParagraphSentence") {
      for (const sc of child.children) {
        if (typeof sc !== "string" && sc.tag === "Sentence") {
          sentences.push(extractText(sc).trim());
        }
      }
    }
  }

  // Sentence が直下にある場合
  if (sentences.length === 0) {
    for (const child of node.children) {
      if (typeof child !== "string" && child.tag === "Sentence") {
        sentences.push(extractText(child).trim());
      }
    }
  }

  return { num, sentences };
}

// Article ノードをパース
function parseArticle(node: LawNode): Article {
  const num = node.attr.Num ?? "";
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

// 再帰的に Article ノードを収集
function collectArticles(node: LawNode): Article[] {
  const results: Article[] = [];
  if (node.tag === "Article") {
    results.push(parseArticle(node));
    return results;
  }
  for (const child of node.children) {
    if (typeof child !== "string") {
      results.push(...collectArticles(child));
    }
  }
  return results;
}

// 再帰的に Chapter/Part ノードを収集
function collectChapters(node: LawNode): Chapter[] {
  const results: Chapter[] = [];
  if (node.tag === "Chapter" || node.tag === "Part" || node.tag === "Section") {
    const titleNode = childrenByTag(node, `${node.tag}Title`)[0];
    const title = titleNode ? extractText(titleNode).trim() : "";
    const articles = collectArticles(node);
    results.push({ title, articles });
    return results;
  }
  for (const child of node.children) {
    if (typeof child !== "string") {
      results.push(...collectChapters(child));
    }
  }
  return results;
}

// e-Gov API の law_full_text JSON → StructuredLaw
export function parseLawFullText(
  lawId: string,
  lawTitle: string,
  lawNum: string,
  fullText: LawNode
): StructuredLaw {
  const chapters = collectChapters(fullText);

  // 章立てがない場合はトップレベルの条文を直接収集
  const articles =
    chapters.length === 0 ? collectArticles(fullText) : [];

  return { law_id: lawId, law_title: lawTitle, law_num: lawNum, chapters, articles };
}
