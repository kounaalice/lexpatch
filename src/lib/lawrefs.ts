/**
 * 主要法令名 → e-Gov 法令ID の静的マップ
 * ID形式: {元号コード}{2桁年}AC{9桁連番}
 *   明=1, 大=2, 昭=3, 平=4, 令=5
 */
export const LAW_REF_MAP: Record<string, string> = {
  // ── 基本法・私法 ──
  民法: "129AC0000000089",
  刑法: "140AC0000000045",
  商法: "132AC0000000048",
  会社法: "417AC0000000086",
  破産法: "416AC0000000075",
  民事再生法: "411AC0000000026",
  手形法: "307AC0000000020",
  借地借家法: "403AC0000000090",
  不動産登記法: "416AC0000000123",
  農地法: "327AC0000000229",

  // ── 訴訟・手続法 ──
  民事訴訟法: "408AC0000000109",
  刑事訴訟法: "323AC0000000131",
  行政事件訴訟法: "337AC0000000139",
  民事執行法: "354AC0000000004",
  民事保全法: "402AC0000000091",
  裁判所法: "322AC0000000059",

  // ── 行政・国家法 ──
  行政手続法: "405AC0000000088",
  行政不服申立法: "426AC0000000068",
  国家賠償法: "322AC0000000125",
  国家公務員法: "322AC0000000120",
  地方公務員法: "325AC0000000261",
  地方自治法: "322AC0000000067",
  国会法: "322AC0000000079",
  公職選挙法: "325AC0000000100",
  財政法: "322AC0000000034",
  会計法: "322AC0000000035",

  // ── 財政・税務 ──
  国税通則法: "337AC0000000066",
  所得税法: "340AC0000000033",
  法人税法: "340AC0000000034",
  相続税法: "325AC0000000073",
  消費税法: "363AC0000000108",
  地方税法: "325AC0000000226",
  関税法: "329AC0000000061",

  // ── 労働・社会保障 ──
  労働基準法: "322AC0000000049",
  労働安全衛生法: "347AC0000000057",
  最低賃金法: "334AC0000000137",
  労働契約法: "419AC0000000128",
  雇用保険法: "349AC0000000116",
  健康保険法: "211AC0000000070",
  国民健康保険法: "333AC0000000192",
  厚生年金保険法: "329AC0000000115",
  国民年金法: "334AC0000000141",
  介護保険法: "409AC0000000123",
  "育児・介護休業法": "403AC0000000076",
  障害者雇用促進法: "335AC0000000123",

  // ── 知的財産 ──
  特許法: "334AC0000000121",
  実用新案法: "334AC0000000123",
  意匠法: "334AC0000000125",
  商標法: "334AC0000000127",
  著作権法: "345AC0000000048",
  不正競争防止法: "405AC0000000047",

  // ── 消費者・競争法 ──
  消費者契約法: "412AC0000000061",
  独占禁止法: "322AC0000000054",
  景品表示法: "337AC0000000134",
  割賦販売法: "336AC0000000159",

  // ── 金融・保険 ──
  金融商品取引法: "418AC0000000025",
  銀行法: "356AC0000000059",
  保険業法: "407AC0000000105",

  // ── 交通・建設・土地 ──
  道路交通法: "335AC0000000105",
  道路法: "327AC0000000180",
  建築基準法: "325AC0000000201",
  都市計画法: "343AC0000000100",
  土地収用法: "326AC0000000219",

  // ── 環境・衛生・医療 ──
  環境基本法: "405AC0000000091",
  廃棄物処理法: "345AC0000000137",
  医療法: "323AC0000000205",
  薬機法: "335AC0000000145",
  消防法: "323AC0000000186",
  食品安全基本法: "415AC0000000048",

  // ── 情報・通信 ──
  個人情報保護法: "415AC0000000057",
  電気通信事業法: "359AC0000000086",
  放送法: "325AC0000000132",
  不正アクセス禁止法: "411AC0000000128",

  // ── 司法・資格 ──
  弁護士法: "324AC0000000205",
  税理士法: "326AC0000000237",
  公認会計士法: "323AC0000000103",
  司法書士法: "325AC0000000197",
  社会保険労務士法: "343AC0000000089",
};

// 長い名前を先にマッチさせるため降順ソート
const _names = Object.keys(LAW_REF_MAP).sort((a, b) => b.length - a.length);

let _regex: RegExp | null = null;

/** 法令名にマッチする正規表現（グローバルフラグ付き） */
export function getLawRefRegex(): RegExp {
  if (!_regex) {
    const escaped = _names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    _regex = new RegExp(`(${escaped.join("|")})`, "g");
  }
  return _regex;
}

// ── 漢数字 → アラビア数字 ──

const KANJI_DIGITS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const KANJI_MULTS: Record<string, number> = {
  十: 10,
  百: 100,
  千: 1000,
};

/** 漢数字文字列 → アラビア数字（例: "七百九" → 709, "二十三" → 23） */
export function kanjiToNumber(kanji: string): number {
  let result = 0;
  let current = 0;
  for (const ch of kanji) {
    if (ch in KANJI_DIGITS) {
      current = KANJI_DIGITS[ch];
    } else if (ch in KANJI_MULTS) {
      if (current === 0) current = 1; // 十=10, 百=100
      result += current * KANJI_MULTS[ch];
      current = 0;
    }
  }
  return result + current;
}

/** 条文参照テキスト → URL用記事番号（例: "第七百九条の二" → "709_2"） */
export function articleRefToNum(ref: string): string | null {
  const m = ref.match(/^第([一二三四五六七八九十百千]+)条((?:の[一二三四五六七八九十百千]+)*)$/);
  if (!m) return null;
  let num = String(kanjiToNumber(m[1]));
  if (m[2]) {
    const suffixes = m[2].match(/の([一二三四五六七八九十百千]+)/g);
    if (suffixes) {
      for (const s of suffixes) num += "_" + kanjiToNumber(s.slice(1));
    }
  }
  return num;
}

/** 項参照テキスト → 項番号（例: "第三項" → "3"） */
export function paragraphRefToNum(ref: string): string | null {
  const m = ref.match(/^第([一二三四五六七八九十百千]+)項$/);
  if (!m) return null;
  return String(kanjiToNumber(m[1]));
}

// ── 相対参照の解決 ──

/**
 * 相対条文参照 → 条番号（枝番号なしのみ対応）
 * 「前条」→ currentNum - 1, 「次条」→ currentNum + 1, 「同条」→ currentNum
 */
export function resolveRelativeArticle(
  ref: "前条" | "次条" | "同条",
  currentNum: string,
): string | null {
  // 枝番号つき（"3_2" など）の場合は前条/次条の解決が不正確になるためnull
  if (currentNum.includes("_")) {
    if (ref === "同条") return currentNum;
    return null;
  }
  const n = parseInt(currentNum, 10);
  if (isNaN(n)) return null;
  switch (ref) {
    case "前条":
      return n > 1 ? String(n - 1) : null;
    case "次条":
      return String(n + 1);
    case "同条":
      return currentNum;
  }
}

/**
 * 相対項参照 → 項番号
 * 「前項」→ currentParagraph - 1, 「次項」→ currentParagraph + 1, 「同項」→ currentParagraph
 */
export function resolveRelativeParagraph(
  ref: "前項" | "次項" | "同項",
  currentParagraph: string,
): string | null {
  const n = parseInt(currentParagraph, 10);
  if (isNaN(n)) return null;
  switch (ref) {
    case "前項":
      return n > 1 ? String(n - 1) : null;
    case "次項":
      return String(n + 1);
    case "同項":
      return currentParagraph;
  }
}

// ── 統合正規表現（法令名 + 条文参照 + 項参照 + 相対参照） ──

const KN = "[一二三四五六七八九十百千]+";
const ARTICLE_PAT = `第${KN}条(?:の${KN})*`;
const PARAGRAPH_PAT = `第${KN}項`;

let _unifiedRegex: RegExp | null = null;

/**
 * 法令名＋条文参照＋項参照＋相対参照の統合正規表現（グローバルフラグ付き）
 *
 * マッチ優先順:
 *  1. (法令名)(第○条…)(第○項)  → groups [1][2][3]   他法令の条+項
 *  2. (法令名)(第○条…)          → groups [4][5]      他法令の条のみ
 *  3. (第○条…)(第○項)           → groups [6][7]      同一法令の条+項
 *  4. (第○条…)                   → group  [8]         同一法令の条のみ
 *  5. (法令名)                    → group  [9]         法令トップ
 *  6. (前条|次条|同条)(第○項)?   → groups [10][11]    相対条文+項（任意）
 *  7. (前項|同項|次項)            → group  [12]        相対項
 */
export function getUnifiedRefRegex(): RegExp {
  if (!_unifiedRegex) {
    const escaped = _names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const lawPat = escaped.join("|");
    _unifiedRegex = new RegExp(
      [
        `(${lawPat})(${ARTICLE_PAT})(${PARAGRAPH_PAT})`, // [1][2][3] 法令+条+項
        `(${lawPat})(${ARTICLE_PAT})`, // [4][5]    法令+条
        `(${ARTICLE_PAT})(${PARAGRAPH_PAT})`, // [6][7]    条+項
        `(${ARTICLE_PAT})`, // [8]       条のみ
        `(${lawPat})`, // [9]       法令名のみ
        `(前条|次条|同条)(${PARAGRAPH_PAT})?`, // [10][11]  相対条文+項
        `(前項|同項|次項)`, // [12]      相対項
      ].join("|"),
      "g",
    );
  }
  return _unifiedRegex;
}
