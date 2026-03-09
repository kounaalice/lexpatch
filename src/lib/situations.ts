/**
 * 法令オンボーディング — 状況ベース法令レコメンドデータ
 *
 * categories.ts / ministries.ts と同パターンの静的データファイル。
 * ユーザーが業種・職種・生活状況を選択 → 関連法令カテゴリ + キーワード + 行政機関を返す。
 */

import { LAW_CATEGORIES } from "./categories";

// ─── 型定義 ─────────────────────────────────────────────────

export interface SituationGroup {
  id: "life" | "industry" | "occupation";
  label: string;
  order: number;
}

export interface AgencyLink {
  name: string;
  url: string;
  description: string;
}

export interface SituationTag {
  id: string;
  label: string;
  icon: string;
  group: SituationGroup;
  description: string;
  lawCategorySlugs: string[];
  specificLawKeywords: string[];
  agencyLinks: AgencyLink[];
}

export interface SituationProfile {
  situations: string[];
  completed_at: string | null;
  version: number;
}

export const DEFAULT_SITUATION_PROFILE: SituationProfile = {
  situations: [],
  completed_at: null,
  version: 1,
};

// ─── グループ ────────────────────────────────────────────────

export const SITUATION_GROUPS: SituationGroup[] = [
  { id: "life", label: "生活状況", order: 1 },
  { id: "industry", label: "業種", order: 2 },
  { id: "occupation", label: "職種", order: 3 },
];

const GS = SITUATION_GROUPS;
const sg = (id: SituationGroup["id"]) => GS.find((g) => g.id === id)!;

// ─── 状況タグ ────────────────────────────────────────────────

export const SITUATION_TAGS: SituationTag[] = [
  // ── 生活状況 ──
  {
    id: "hitorioya",
    label: "ひとり親",
    icon: "👨‍👧",
    group: sg("life"),
    description: "ひとり親家庭の支援制度・手当に関する法令",
    lawCategorySlugs: ["shakaifukushi", "rodo"],
    specificLawKeywords: ["児童扶養", "母子及び父子", "児童福祉", "生活保護"],
    agencyLinks: [
      {
        name: "こども家庭庁",
        url: "https://www.cfa.go.jp/",
        description: "児童扶養手当・ひとり親支援",
      },
      {
        name: "厚生労働省",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/boshi-katei/",
        description: "母子家庭等自立支援",
      },
    ],
  },
  {
    id: "kaigo",
    label: "介護",
    icon: "🏥",
    group: sg("life"),
    description: "介護保険・高齢者福祉に関する法令",
    lawCategorySlugs: ["shakaifukushi", "shakaihoken"],
    specificLawKeywords: ["介護保険", "老人福祉", "高齢者"],
    agencyLinks: [
      {
        name: "厚生労働省（老健局）",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/kaigo_koureisha/index.html",
        description: "介護保険制度・高齢者福祉",
      },
      {
        name: "地域包括支援センター",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/kaigo_koureisha/chiiki-houkatsu/",
        description: "地域の介護相談窓口",
      },
    ],
  },
  {
    id: "kosodate",
    label: "子育て",
    icon: "👶",
    group: sg("life"),
    description: "子育て・保育・教育に関する法令",
    lawCategorySlugs: ["shakaifukushi", "kyoiku"],
    specificLawKeywords: ["児童福祉", "児童手当", "保育", "幼稚園", "育児", "子ども・子育て"],
    agencyLinks: [
      { name: "こども家庭庁", url: "https://www.cfa.go.jp/", description: "子育て支援・保育制度" },
      { name: "文部科学省", url: "https://www.mext.go.jp/", description: "教育制度・幼稚園" },
    ],
  },
  {
    id: "shitsugyo",
    label: "失業・求職",
    icon: "💼",
    group: sg("life"),
    description: "雇用保険・求職活動に関する法令",
    lawCategorySlugs: ["rodo", "shakaihoken"],
    specificLawKeywords: ["雇用保険", "職業安定", "求職者支援", "労働者派遣"],
    agencyLinks: [
      {
        name: "ハローワーク",
        url: "https://www.hellowork.mhlw.go.jp/",
        description: "求職・雇用保険手続き",
      },
      {
        name: "厚生労働省（職業安定局）",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/",
        description: "雇用対策・求職者支援",
      },
    ],
  },
  {
    id: "shogai",
    label: "障がい",
    icon: "♿",
    group: sg("life"),
    description: "障がい者福祉・支援に関する法令",
    lawCategorySlugs: ["shakaifukushi"],
    specificLawKeywords: ["障害者", "障害者総合支援", "精神保健", "身体障害", "発達障害"],
    agencyLinks: [
      {
        name: "厚生労働省（障害保健福祉部）",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/",
        description: "障害福祉サービス・支援制度",
      },
    ],
  },
  {
    id: "ijyu",
    label: "移住・在留",
    icon: "🌏",
    group: sg("life"),
    description: "在留資格・出入国に関する法令",
    lawCategorySlugs: ["gaiji"],
    specificLawKeywords: ["出入国", "在留", "難民", "外国人"],
    agencyLinks: [
      {
        name: "出入国在留管理庁",
        url: "https://www.moj.go.jp/isa/",
        description: "在留資格・ビザ手続き",
      },
    ],
  },
  {
    id: "souzoku",
    label: "相続・終活",
    icon: "📜",
    group: sg("life"),
    description: "相続・遺言・成年後見に関する法令",
    lawCategorySlugs: ["minji"],
    specificLawKeywords: ["相続", "遺言", "成年後見", "信託"],
    agencyLinks: [
      {
        name: "法務局",
        url: "https://houmukyoku.moj.go.jp/",
        description: "不動産登記・遺言書保管",
      },
      {
        name: "家庭裁判所",
        url: "https://www.courts.go.jp/saiban/syurui/syurui_kazi/index.html",
        description: "相続調停・成年後見",
      },
    ],
  },
  {
    id: "rikon",
    label: "離婚",
    icon: "💔",
    group: sg("life"),
    description: "離婚・親権・養育に関する法令",
    lawCategorySlugs: ["minji", "shakaifukushi"],
    specificLawKeywords: ["民法", "児童扶養", "母子及び父子", "養育費"],
    agencyLinks: [
      {
        name: "家庭裁判所",
        url: "https://www.courts.go.jp/saiban/syurui/syurui_kazi/index.html",
        description: "離婚調停・親権",
      },
      {
        name: "法テラス",
        url: "https://www.houterasu.or.jp/",
        description: "法律相談・弁護士費用支援",
      },
    ],
  },
  {
    id: "saigai",
    label: "災害被害",
    icon: "🌊",
    group: sg("life"),
    description: "災害対策・被災者支援に関する法令",
    lawCategorySlugs: ["saigai"],
    specificLawKeywords: ["災害対策", "被災者", "復興", "災害救助"],
    agencyLinks: [
      {
        name: "内閣府（防災担当）",
        url: "https://www.bousai.go.jp/",
        description: "防災情報・被災者支援",
      },
    ],
  },

  // ── 業種 ──
  {
    id: "it_tech",
    label: "IT・テクノロジー",
    icon: "💻",
    group: sg("industry"),
    description: "IT・通信・デジタルに関する法令",
    lawCategorySlugs: ["denki-tsushin", "sangyo-tsusoku"],
    specificLawKeywords: ["電気通信", "電子署名", "個人情報", "不正アクセス", "プロバイダ責任"],
    agencyLinks: [
      { name: "総務省", url: "https://www.soumu.go.jp/", description: "電気通信・放送・情報通信" },
      { name: "デジタル庁", url: "https://www.digital.go.jp/", description: "デジタル社会形成" },
      { name: "個人情報保護委員会", url: "https://www.ppc.go.jp/", description: "個人情報保護" },
    ],
  },
  {
    id: "kenchiku_fudosan",
    label: "建築・不動産",
    icon: "🏗️",
    group: sg("industry"),
    description: "建築基準・不動産取引に関する法令",
    lawCategorySlugs: ["kenchiku", "tochi", "toshi"],
    specificLawKeywords: ["建築基準", "宅地建物", "不動産登記", "建設業", "借地借家"],
    agencyLinks: [
      { name: "国土交通省", url: "https://www.mlit.go.jp/", description: "建築・不動産・住宅" },
    ],
  },
  {
    id: "iryo",
    label: "医療・福祉",
    icon: "🩺",
    group: sg("industry"),
    description: "医療・薬事・福祉に関する法令",
    lawCategorySlugs: ["kosei", "shakaifukushi"],
    specificLawKeywords: ["医療法", "薬機", "介護保険", "社会福祉", "医師法"],
    agencyLinks: [
      { name: "厚生労働省", url: "https://www.mhlw.go.jp/", description: "医療制度・薬事・福祉" },
    ],
  },
  {
    id: "kyoiku_gakko",
    label: "教育・学校",
    icon: "🎓",
    group: sg("industry"),
    description: "教育制度・学校運営に関する法令",
    lawCategorySlugs: ["kyoiku"],
    specificLawKeywords: ["学校教育", "教育基本", "大学", "教員"],
    agencyLinks: [
      { name: "文部科学省", url: "https://www.mext.go.jp/", description: "教育制度・学校教育" },
    ],
  },
  {
    id: "inshoku",
    label: "飲食・サービス",
    icon: "🍽️",
    group: sg("industry"),
    description: "食品衛生・営業許可に関する法令",
    lawCategorySlugs: ["kosei", "sangyo-tsusoku"],
    specificLawKeywords: ["食品衛生", "食品表示", "風俗営業", "食品安全"],
    agencyLinks: [
      { name: "厚生労働省", url: "https://www.mhlw.go.jp/", description: "食品衛生・営業許可" },
      { name: "消費者庁", url: "https://www.caa.go.jp/", description: "食品表示" },
    ],
  },
  {
    id: "unyu_logistics",
    label: "運輸・物流",
    icon: "🚚",
    group: sg("industry"),
    description: "運送・物流に関する法令",
    lawCategorySlugs: ["rikuun", "kaiunl", "kamotsu"],
    specificLawKeywords: ["道路運送", "貨物", "船舶", "倉庫業"],
    agencyLinks: [
      { name: "国土交通省", url: "https://www.mlit.go.jp/", description: "運輸・物流・倉庫" },
    ],
  },
  {
    id: "nourin",
    label: "農林水産",
    icon: "🌾",
    group: sg("industry"),
    description: "農業・林業・水産業に関する法令",
    lawCategorySlugs: ["nogyo", "ringyo", "suisan"],
    specificLawKeywords: ["農業", "森林", "漁業", "食料", "農地"],
    agencyLinks: [
      { name: "農林水産省", url: "https://www.maff.go.jp/", description: "農林水産行政" },
    ],
  },
  {
    id: "kinyu_hoken",
    label: "金融・保険",
    icon: "🏦",
    group: sg("industry"),
    description: "金融商品・保険業に関する法令",
    lawCategorySlugs: ["kinyu"],
    specificLawKeywords: ["銀行", "金融商品", "保険業", "証券"],
    agencyLinks: [{ name: "金融庁", url: "https://www.fsa.go.jp/", description: "金融行政・保険" }],
  },
  {
    id: "seizo",
    label: "製造業",
    icon: "🏭",
    group: sg("industry"),
    description: "工業・製造物責任に関する法令",
    lawCategorySlugs: ["kogyo", "sangyo-tsusoku"],
    specificLawKeywords: ["工業", "製造物責任", "消費生活用製品", "工業標準"],
    agencyLinks: [
      { name: "経済産業省", url: "https://www.meti.go.jp/", description: "産業・工業政策" },
    ],
  },

  // ── 職種 ──
  {
    id: "jimu",
    label: "事務・管理",
    icon: "📋",
    group: sg("occupation"),
    description: "労務管理・雇用に関する法令",
    lawCategorySlugs: ["rodo"],
    specificLawKeywords: ["労働基準", "労働契約", "最低賃金"],
    agencyLinks: [
      { name: "厚生労働省", url: "https://www.mhlw.go.jp/", description: "労働基準・労働契約" },
    ],
  },
  {
    id: "homu",
    label: "法務・コンプライアンス",
    icon: "⚖️",
    group: sg("occupation"),
    description: "企業法務・コンプライアンスに関する法令",
    lawCategorySlugs: ["minji", "keiji", "shiho"],
    specificLawKeywords: ["会社法", "民法", "金融商品", "独占禁止"],
    agencyLinks: [
      { name: "法務省", url: "https://www.moj.go.jp/", description: "法務行政・企業法務" },
    ],
  },
  {
    id: "keiri",
    label: "経理・財務",
    icon: "🧮",
    group: sg("occupation"),
    description: "税法・会計に関する法令",
    lawCategorySlugs: ["kokuzei", "kinyu"],
    specificLawKeywords: ["法人税", "所得税", "消費税", "相続税"],
    agencyLinks: [{ name: "国税庁", url: "https://www.nta.go.jp/", description: "税務相談・申告" }],
  },
  {
    id: "jinji",
    label: "人事・労務",
    icon: "👥",
    group: sg("occupation"),
    description: "労働法・社会保険に関する法令",
    lawCategorySlugs: ["rodo", "shakaihoken"],
    specificLawKeywords: ["労働基準", "雇用保険", "健康保険", "育児", "労働者派遣"],
    agencyLinks: [
      { name: "厚生労働省", url: "https://www.mhlw.go.jp/", description: "労働基準・社会保険" },
    ],
  },
  {
    id: "komuin",
    label: "公務員",
    icon: "🏛️",
    group: sg("occupation"),
    description: "公務員制度・行政手続に関する法令",
    lawCategorySlugs: ["komuin", "chiho-jichi", "gyosei-tetsu"],
    specificLawKeywords: ["国家公務員", "地方公務員", "行政手続"],
    agencyLinks: [
      { name: "人事院", url: "https://www.jinji.go.jp/", description: "国家公務員制度" },
      { name: "総務省", url: "https://www.soumu.go.jp/", description: "地方公務員制度" },
    ],
  },
  {
    id: "freelance",
    label: "フリーランス",
    icon: "🎯",
    group: sg("occupation"),
    description: "フリーランス保護・税務に関する法令",
    lawCategorySlugs: ["rodo", "kokuzei"],
    specificLawKeywords: ["下請代金", "フリーランス", "所得税", "個人事業"],
    agencyLinks: [
      {
        name: "公正取引委員会",
        url: "https://www.jftc.go.jp/",
        description: "下請法・フリーランス保護",
      },
      { name: "国税庁", url: "https://www.nta.go.jp/", description: "確定申告・税務" },
    ],
  },
];

// ─── ヘルパー関数 ──────────────────────────────────────────────

/** partial JSONB → SituationProfile（mergePrefsパターン） */
export function mergeSituationProfile(
  saved: Record<string, unknown> | null | undefined,
): SituationProfile {
  if (!saved || typeof saved !== "object") return { ...DEFAULT_SITUATION_PROFILE };
  const result = { ...DEFAULT_SITUATION_PROFILE };
  if (Array.isArray(saved.situations)) {
    result.situations = saved.situations.filter((s): s is string => typeof s === "string");
  }
  if (typeof saved.completed_at === "string") {
    result.completed_at = saved.completed_at;
  }
  if (typeof saved.version === "number") {
    result.version = saved.version;
  }
  return result;
}

/** IDからSituationTag取得 */
export function getSituationById(id: string): SituationTag | undefined {
  return SITUATION_TAGS.find((t) => t.id === id);
}

/** グループ別タグ取得 */
export function getSituationsByGroup(groupId: string): SituationTag[] {
  return SITUATION_TAGS.filter((t) => t.group.id === groupId);
}

/** 選択状況から推薦カテゴリslug一覧（重複排除） */
export function getRecommendedLawSlugs(situationIds: string[]): string[] {
  const slugs = new Set<string>();
  for (const id of situationIds) {
    const tag = getSituationById(id);
    if (tag) {
      for (const slug of tag.lawCategorySlugs) slugs.add(slug);
    }
  }
  return Array.from(slugs);
}

/** 選択状況から推薦キーワード一覧（重複排除） */
export function getRecommendedKeywords(situationIds: string[]): string[] {
  const keywords = new Set<string>();
  for (const id of situationIds) {
    const tag = getSituationById(id);
    if (tag) {
      for (const kw of tag.specificLawKeywords) keywords.add(kw);
    }
  }
  return Array.from(keywords);
}

/** 選択状況から推薦カテゴリラベル一覧（重複排除、表示用） */
export function getRecommendedCategoryLabels(situationIds: string[]): string[] {
  const slugs = getRecommendedLawSlugs(situationIds);
  return slugs
    .map((slug) => LAW_CATEGORIES.find((c) => c.slug === slug)?.label)
    .filter(Boolean) as string[];
}

/** 選択状況から関連行政機関リンク（重複排除） */
export function getAgencyLinks(situationIds: string[]): AgencyLink[] {
  const seen = new Set<string>();
  const links: AgencyLink[] = [];
  for (const id of situationIds) {
    const tag = getSituationById(id);
    if (tag) {
      for (const link of tag.agencyLinks) {
        if (!seen.has(link.url)) {
          seen.add(link.url);
          links.push(link);
        }
      }
    }
  }
  return links;
}
