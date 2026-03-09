// ── Law name → lawId mapping for direct links ──

/** 主要法令の日本語名 → e-Gov lawId マッピング */
const NAME_TO_ID: Record<string, string> = {
  日本国憲法: "321CONSTITUTION",
  憲法: "321CONSTITUTION",
  民法: "129AC0000000089",
  刑法: "140AC0000000045",
  商法: "132AC0000000048",
  民事訴訟法: "408AC0000000109",
  刑事訴訟法: "323AC0000000131",
  民事執行法: "354AC0000000004",
  民事保全法: "402AC0000000091",
  破産法: "416AC0000000123",
  仲裁法: "403AC0000000090",
  少年法: "322AC0000000059",
  行政手続法: "405AC0000000088",
  行政事件訴訟法: "337AC0000000139",
  国家公務員法: "322AC0000000125",
  地方自治法: "322AC0000000120",
  国家行政組織法: "322AC0000000067",
  労働基準法: "322AC0000000049",
  最低賃金法: "347AC0000000057",
  労働契約法: "419AC0000000128",
  育児介護休業法: "349AC0000000116",
  会社法: "417AC0000000086",
  個人情報保護法: "415AC0000000057",
  著作権法: "345AC0000000048",
  特許法: "334AC0000000121",
  不正競争防止法: "393AC0000000047",
  消費者契約法: "412AC0000000061",
  金融商品取引法: "323AC0000000025",
  独占禁止法: "322AC0000000054",
  道路交通法: "335AC0000000105",
  建築基準法: "325AC0000000201",
  所得税法: "340AC0000000033",
  法人税法: "340AC0000000034",
  消費税法: "363AC0000000108",
  国税通則法: "337AC0000000066",
  地方税法: "325AC0000000226",
  相続税法: "325AC0000000073",
  行政不服審査法: "426AC0000000068",
  国家賠償法: "322AC0000000125",
  情報公開法: "411AC0000000042",
  電子帳簿保存法: "410AC0000000025",
  労働安全衛生法: "347AC0000000057",
  男女雇用機会均等法: "347AC0000000113",
  障害者差別解消法: "425AC0000000065",
  児童福祉法: "322AC0000000164",
  生活保護法: "325AC0000000144",
  介護保険法: "409AC0000000123",
  健康保険法: "211AC0000000070",
  国民健康保険法: "333AC0000000192",
  厚生年金保険法: "329AC0000000115",
  国民年金法: "334AC0000000141",
};

/**
 * 法令名から lawId を解決する。
 * 見つからない場合は null を返す。
 */
export function resolveLawName(nameOrId: string): string | null {
  // Already looks like an e-Gov ID (alphanumeric)
  if (/^[A-Z0-9]+$/i.test(nameOrId)) return null;
  // Direct match
  if (NAME_TO_ID[nameOrId]) return NAME_TO_ID[nameOrId];
  // Partial match (e.g., "民訴法" → not found, but "民事訴訟法" → found)
  for (const [name, id] of Object.entries(NAME_TO_ID)) {
    if (name === nameOrId) return id;
  }
  return null;
}

/** ID → name 逆引き */
const ID_TO_NAME: Record<string, string> = {};
for (const [name, id] of Object.entries(NAME_TO_ID)) {
  if (!ID_TO_NAME[id]) ID_TO_NAME[id] = name; // 最初のエントリを優先
}

export function getLawNameFromId(lawId: string): string | null {
  return ID_TO_NAME[lawId] ?? null;
}

export { NAME_TO_ID, ID_TO_NAME };
