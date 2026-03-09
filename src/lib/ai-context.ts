/**
 * AI法令アシスタント — 法令コンテキスト抽出ユーティリティ
 */

import type { StructuredLaw, Article, Paragraph, Subitem } from "@/lib/egov/types";

/** 段落テキストをシリアライズ */
function serializeParagraph(p: Paragraph): string {
  const num = p.num ? `${p.num} ` : "";
  let text = `${num}${p.sentences.join("")}`;
  if (p.items) {
    for (const item of p.items) {
      text += `\n  ${item.title} ${item.sentences.join("")}`;
      if (item.subitems) {
        text += serializeSubitems(item.subitems, 4);
      }
    }
  }
  return text;
}

function serializeSubitems(subitems: Subitem[], indent: number): string {
  let text = "";
  const pad = " ".repeat(indent);
  for (const si of subitems) {
    text += `\n${pad}${si.title} ${si.sentences.join("")}`;
    if (si.subitems) {
      text += serializeSubitems(si.subitems, indent + 2);
    }
  }
  return text;
}

/** Article → テキスト文字列 */
export function serializeArticle(article: Article): string {
  let text = article.title;
  if (article.caption) text += ` ${article.caption}`;
  text += "\n";
  for (const p of article.paragraphs) {
    text += serializeParagraph(p) + "\n";
  }
  return text;
}

/**
 * 対象条文 + 前後N条をテキスト化
 * 対象条文は「>>>」マーカー付き
 */
export function extractArticleContext(
  law: StructuredLaw,
  targetArticleNum: string,
  range = 2,
): string {
  const allArticles =
    law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;

  const idx = allArticles.findIndex(
    (a) => a.num === targetArticleNum || a.title === targetArticleNum,
  );
  if (idx === -1) return "";

  const start = Math.max(0, idx - range);
  const end = Math.min(allArticles.length - 1, idx + range);

  let context = `【${law.law_title}（${law.law_num}）】\n\n`;

  // 章タイトル取得
  if (law.chapters.length > 0) {
    for (const ch of law.chapters) {
      if (ch.articles.some((a) => a.num === allArticles[idx].num)) {
        context += `${ch.title}\n\n`;
        break;
      }
    }
  }

  for (let i = start; i <= end; i++) {
    const a = allArticles[i];
    const marker = i === idx ? ">>> " : "    ";
    const lines = serializeArticle(a).split("\n");
    for (const line of lines) {
      if (line.trim()) context += `${marker}${line}\n`;
    }
    context += "\n";
  }

  return truncateToTokenBudget(context);
}

/**
 * 法令の章・条タイトル一覧（目次）
 */
export function extractLawToc(law: StructuredLaw): string {
  let toc = `【${law.law_title}（${law.law_num}）】\n`;
  if (law.law_type) toc += `法令種別: ${law.law_type}\n`;
  if (law.promulgation_date) toc += `公布日: ${law.promulgation_date}\n`;
  if (law.enforcement_date) toc += `施行日: ${law.enforcement_date}\n`;
  toc += "\n";

  if (law.chapters.length > 0) {
    for (const ch of law.chapters) {
      toc += `${ch.title}\n`;
      for (const a of ch.articles) {
        const caption = a.caption ? ` ${a.caption}` : "";
        toc += `  ${a.title}${caption}\n`;
      }
      toc += "\n";
    }
  } else {
    for (const a of law.articles) {
      const caption = a.caption ? ` ${a.caption}` : "";
      toc += `${a.title}${caption}\n`;
    }
  }

  if (law.appendixTables && law.appendixTables.length > 0) {
    toc += "\n【別表】\n";
    for (const t of law.appendixTables) {
      toc += `  ${t.title}\n`;
    }
  }

  return truncateToTokenBudget(toc);
}

/**
 * テキストを概算トークン予算内に切り詰め
 * 日本語: 約1トークン ≈ 1.5文字（Llama系モデル）
 * デフォルト: 12000文字 ≈ 8000トークン
 */
export function truncateToTokenBudget(text: string, maxChars = 12000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n（以下省略）";
}
