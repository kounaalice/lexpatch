// e-Gov 法令API v2 のレスポンス型

export interface LawSearchResult {
  law_id: string;
  law_title: string;
  law_num: string;
  law_type: string;
  promulgation_date: string;
}

export interface LawSearchResponse {
  laws: LawSearchResult[];
  total_count: number;
}

// 構造化された条文データ
export interface Sentence {
  text: string;
}

export interface Paragraph {
  num: string;       // "１", "２", "" (本文)
  sentences: string[];
}

export interface Article {
  num: string;       // "1", "2", "3_2"
  title: string;     // "第一条", "第三条の二"
  caption: string;   // （見出し）例: "（基本原則）"
  paragraphs: Paragraph[];
}

export interface Chapter {
  title: string;
  articles: Article[];
}

export interface StructuredLaw {
  law_id: string;
  law_title: string;
  law_num: string;
  chapters: Chapter[];
  // 章立てなしの条文（直接 articles を持つ場合）
  articles: Article[];
}

// e-Gov API の law_full_text ノード
export interface LawNode {
  tag: string;
  attr: Record<string, string>;
  children: (LawNode | string)[];
}
