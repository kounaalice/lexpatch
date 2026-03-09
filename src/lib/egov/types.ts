// e-Gov 法令API v2 のレスポンス型

export interface LawSearchResult {
  law_id: string;
  law_title: string;
  law_num: string;
  law_type: string;
  promulgation_date: string;
  amendment_enforcement_date?: string; // 最新改正の施行日 "YYYY-MM-DD"
}

export interface LawSearchResponse {
  laws: LawSearchResult[];
  total_count: number;
}

// 構造化された条文データ
export interface Sentence {
  text: string;
}

// 号細分（イ、ロ、ハ… / (1)(2)… — 再帰的にネスト可能）
export interface Subitem {
  title: string; // "イ", "ロ", "(1)" etc.
  sentences: string[];
  subitems?: Subitem[];
}

// 号（一、二、三…）
export interface Item {
  num: string; // "1", "2" etc.
  title: string; // "一", "二" (from ItemTitle)
  sentences: string[];
  subitems?: Subitem[];
}

export interface Paragraph {
  num: string; // "１", "２", "" (本文)
  sentences: string[];
  items?: Item[]; // 号（Paragraph 直下の Item 子要素）
}

export interface Article {
  num: string; // "1", "2", "3_2"
  title: string; // "第一条", "第三条の二"
  caption: string; // （見出し）例: "（基本原則）"
  paragraphs: Paragraph[];
}

export interface Chapter {
  title: string;
  articles: Article[];
}

// 別表セル・行・テーブル
export interface TableColumn {
  text: string;
  colspan?: number;
  rowspan?: number;
}
export interface TableRow {
  columns: TableColumn[];
}
export interface AppendixTable {
  title: string; // "別表第一（第六条、第七条関係）"
  relatedArticle?: string; // RelatedArticleNum テキスト
  rows: TableRow[];
}

export interface StructuredLaw {
  law_id: string;
  law_title: string;
  law_num: string;
  law_type?: string; // "Act" / "CabinetOrder" / "MinisterialOrdinance" etc.
  promulgation_date?: string; // 公布日 (original) "YYYY-MM-DD"
  amendment_date?: string; // 最終改正公布日 "YYYY-MM-DD"
  enforcement_date?: string; // 最終改正施行日 "YYYY-MM-DD"
  chapters: Chapter[];
  // 章立てなしの条文（直接 articles を持つ場合）
  articles: Article[];
  // 前文（日本国憲法等）
  preamble?: Paragraph[];
  // 別表
  appendixTables?: AppendixTable[];
}

// 改正履歴エントリ（/law_revisions/ レスポンス）
export interface LawRevisionEntry {
  law_revision_id: string;
  law_title: string;
  amendment_law_id: string;
  amendment_law_title?: string;
  amendment_promulgate_date?: string; // 改正公布日 "YYYY-MM-DD"
  amendment_enforcement_date: string; // 施行日 "YYYY-MM-DD"
  amendment_enforcement_comment?: string;
  current_revision_status?: string; // "CurrentEnforced" | "PreviousEnforced" | "UnEnforced"
}

// e-Gov API の law_full_text ノード
export interface LawNode {
  tag: string;
  attr: Record<string, string>;
  children: (LawNode | string)[];
}
