/**
 * 裁判例データの型定義
 * courts.go.jp のデータ構造に対応
 */

/** 裁判種別 */
export type TrialType =
  | "supreme" // 最高裁判例
  | "high" // 高裁判例
  | "lower" // 下級裁判所
  | "administrative" // 行政事件
  | "labor" // 労働事件
  | "ip"; // 知的財産

/** courts.go.jp の detail ページ番号 → TrialType */
export const DETAIL_NUM_TO_TRIAL_TYPE: Record<string, TrialType> = {
  "2": "supreme",
  "3": "high",
  "4": "lower",
  "5": "administrative",
  "6": "labor",
  "7": "ip",
  "8": "ip",
};

export const TRIAL_TYPE_LABEL: Record<TrialType, string> = {
  supreme: "最高裁",
  high: "高裁",
  lower: "下級裁",
  administrative: "行政",
  labor: "労働",
  ip: "知財",
};

/** 裁判例メタデータ（Supabase保存用） */
export interface Precedent {
  id?: string;
  lawsuit_id: string; // courts.go.jp 内部ID
  trial_type: TrialType;
  case_number: string; // "令和5(し)155"
  case_name: string; // "傷害被告事件"
  court_name: string; // "最高裁判所第二小法廷"
  date: string; // "2024-02-14" ISO
  result_type?: string; // "判決" | "決定"
  result?: string; // "棄却" | "破棄差戻"
  article_info?: string; // "刑集 第74巻6号669頁"
  gist?: string; // 判示事項
  case_gist?: string; // 裁判要旨
  ref_law?: string; // 参照法条（生テキスト）
  detail_url: string; // courts.go.jp 詳細URL
  pdf_url?: string; // 判決文PDF URL
  created_at?: string;
}

/** ref_law パース結果の1エントリ */
export interface ParsedLawRef {
  law_name: string; // マッチした法令名 (略称 or 正式名)
  law_id: string; // e-Gov 法令ID
  article: string; // 条番号 "709", "465の2"
  paragraph?: string; // 項番号 "1"
  item?: string; // 号番号 "1"
  raw: string; // 元テキスト
}

/** 法令×条文→判例のインデックスエントリ */
export interface PrecedentRef {
  id?: string;
  precedent_id: string;
  law_id: string;
  law_name: string;
  article: string;
  paragraph?: string;
  item?: string;
}

/** API レスポンス: 条文に関連する判例一覧 */
export interface PrecedentSummary {
  lawsuit_id: string;
  case_number: string;
  case_name: string;
  court_name: string;
  date: string;
  trial_type: TrialType;
  result?: string;
  article_info?: string;
  case_gist?: string;
  detail_url: string;
}
