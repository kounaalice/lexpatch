/**
 * lawId -> CATEGORY_GROUP 静的マッピング
 * INDEXED_LAW_IDS (api/ai/index/route.ts) のコメント分類に基づく
 * ConstellationMap のノード色・グループ分けに使用
 */

export const LAW_CATEGORY_MAP: Record<string, string> = {
  // 公法 — 憲法・基本法
  "321CONSTITUTION": "admin",
  "322AC0000000003": "admin",
  "325AC0000000147": "admin",
  // 国会・選挙
  "322AC1000000079": "admin",
  "325AC1000000100": "admin",
  // 裁判法
  "322AC0000000059": "justice",
  "322AC0000000061": "justice",
  "324AC1000000205": "justice",
  "416AC0000000063": "justice",
  "141AC0000000053": "justice",
  // 行政組織
  "322AC0000000005": "admin",
  "323AC0000000120": "admin",
  "322AC0000000120": "admin",
  "322AC0000000067": "admin",
  "325AC0000000261": "admin",
  // 行政通則
  "405AC0000000088": "admin",
  "323AC0000000043": "admin",
  "426AC0000000068": "admin",
  "337AC0000000139": "admin",
  "322AC0000000125": "admin",
  "411AC0000000042": "admin",
  "415AC0000000057": "admin",
  // 財政・租税
  "337AC0000000066": "finance",
  "334AC0000000147": "finance",
  "340AC0000000033": "finance",
  "340AC0000000034": "finance",
  "363AC0000000108": "finance",
  "325AC0000000073": "finance",
  "325AC0000000226": "finance",
  // 警察・治安
  "323AC0000000136": "security",
  "323AC1000000186": "security",
  "335AC0000000105": "security",
  "326CO0000000319": "security",
  // 国土整備
  "326AC0100000219": "land",
  "343AC0000000100": "land",
  "325AC0000000201": "land",
  "327AC1000000180": "land",
  "339AC0000000167": "land",
  // 環境
  "405AC0000000091": "land",
  "322AC0000000233": "land",
  "332AC0000000177": "land",
  // 教育
  "418AC0000000120": "society",
  "322AC0000000026": "society",
  // 民事法 — 民法・関連法
  "129AC0000000089": "justice",
  "322AC0000000224": "justice",
  "132AC0000000015": "justice",
  "329AC0000000100": "justice",
  "406AC0000000085": "justice",
  "330AC0000000097": "justice",
  "403AC0000000090": "justice",
  "416AC0000000123": "justice",
  "327AC1000000176": "justice",
  "418AC0000000078": "justice",
  // 商法
  "132AC0000000048": "industry",
  "417AC0000000086": "industry",
  "338AC0000000125": "industry",
  "420AC0000000056": "industry",
  "307AC0000000020": "industry",
  "308AC0000000057": "industry",
  "323AC0000000025": "industry",
  // 民事訴訟・倒産
  "408AC0000000109": "justice",
  "415AC0000000109": "justice",
  "423AC0000000051": "justice",
  "423AC0000000052": "justice",
  "354AC0000000004": "justice",
  "401AC0000000091": "justice",
  "416AC0000000075": "justice",
  "411AC0000000225": "justice",
  "414AC0000000154": "justice",
  // 刑事法
  "140AC0000000045": "justice",
  "323AC0000000131": "justice",
  "323AC0000000168": "justice",
  "417AC0000000050": "justice",
  // 社会法 — 労働法
  "322AC0000000049": "society",
  "419AC0000000128": "society",
  "324AC0000000174": "society",
  "321AC0000000025": "society",
  "347AC0000000057": "society",
  "334AC0000000137": "society",
  "347AC0000000113": "society",
  "403AC0000000076": "society",
  "360AC0000000088": "society",
  "405AC0000000076": "society",
  "322AC0000000050": "society",
  "349AC0000000116": "society",
  "416AC0000000045": "society",
  "416AC0000000122": "society",
  // 社会保障
  "211AC0000000070": "society",
  "333AC0000000192": "society",
  "334AC0000000141": "society",
  "329AC0000000115": "society",
  "409AC0000000123": "society",
  "322AC0000000164": "society",
  "325AC0000000144": "society",
  // 産業法 — 経済法・消費者法
  "322AC0000000054": "industry",
  "343AC1000000078": "industry",
  "412AC0000000061": "industry",
  "351AC0000000057": "industry",
  "337AC0000000134": "industry",
  // 知的財産
  "345AC0000000048": "industry",
  "334AC0000000121": "industry",
  "334AC0000000125": "industry",
  "334AC0000000127": "industry",
  "405AC0000000047": "industry",
  // 情報通信
  "359AC0000000086": "traffic",
};

/** lawId からカテゴリグループIDを取得（不明な場合は "admin"） */
export function getCategoryGroupId(lawId: string): string {
  return LAW_CATEGORY_MAP[lawId] ?? "admin";
}
