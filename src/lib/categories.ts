// e-Gov 法令データ提供システム 50分野
// https://laws.e-gov.go.jp の分類に準拠

export interface LawCategory {
  slug: string;       // URL用
  label: string;      // 表示名（e-Gov category フィールド値）
  searchKeyword: string; // law_title 検索に使うキーワード
  group: CategoryGroup;
}

export interface CategoryGroup {
  id: string;
  label: string;
  color: string;      // CSS var or hex
  bg: string;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: "state",    label: "国家・統治",    color: "#2D4A22", bg: "#EBF5EE" },
  { id: "justice",  label: "司法・法執行",  color: "#9B2C2C", bg: "#FDF0EF" },
  { id: "civil",    label: "民事・商事",    color: "#1B4B8A", bg: "#EBF2FD" },
  { id: "economy",  label: "経済・産業",    color: "#8B7355", bg: "#FDF8F0" },
  { id: "labor",    label: "労働・社会",    color: "#1B6B35", bg: "#EBF5EE" },
  { id: "infra",    label: "インフラ・環境", color: "#5B3F8F", bg: "#F3EEFC" },
  { id: "primary",  label: "農林水産・食品", color: "#2D6A4F", bg: "#EAF5ED" },
  { id: "security", label: "安全・外交",    color: "#A85D00", bg: "#FFF8EB" },
];

const G = CATEGORY_GROUPS;
const g = (id: string) => G.find((x) => x.id === id)!;

export const LAW_CATEGORIES: LawCategory[] = [
  // 国家・統治
  { slug: "kenpo",       label: "憲法",       searchKeyword: "憲法",       group: g("state") },
  { slug: "kokkai",      label: "国会",       searchKeyword: "国会",       group: g("state") },
  { slug: "naikaku",     label: "内閣",       searchKeyword: "内閣",       group: g("state") },
  { slug: "gyosei",      label: "行政組織",   searchKeyword: "行政組織",   group: g("state") },
  { slug: "komuin",      label: "公務員",     searchKeyword: "公務員",     group: g("state") },
  { slug: "chiho",       label: "地方自治",   searchKeyword: "地方自治",   group: g("state") },
  { slug: "zaisei",      label: "財政・会計", searchKeyword: "財政",       group: g("state") },
  { slug: "kokuyuzaisan",label: "国有財産",   searchKeyword: "国有財産",   group: g("state") },

  // 司法・法執行
  { slug: "saibansho",   label: "裁判所",     searchKeyword: "裁判所",     group: g("justice") },
  { slug: "keiji",       label: "刑事",       searchKeyword: "刑法",       group: g("justice") },
  { slug: "shonenho",    label: "少年",       searchKeyword: "少年",       group: g("justice") },
  { slug: "kyosei",      label: "矯正・更生", searchKeyword: "矯正",       group: g("justice") },
  { slug: "keisatsu",    label: "警察",       searchKeyword: "警察",       group: g("justice") },
  { slug: "shobo",       label: "消防",       searchKeyword: "消防",       group: g("justice") },
  { slug: "sosho",       label: "訴訟手続",   searchKeyword: "訴訟",       group: g("justice") },

  // 民事・商事
  { slug: "minji",       label: "民事",       searchKeyword: "民法",       group: g("civil") },
  { slug: "koseki",      label: "戸籍・住民", searchKeyword: "戸籍",       group: g("civil") },
  { slug: "shoji",       label: "商事",       searchKeyword: "商法",       group: g("civil") },
  { slug: "kaisha",      label: "会社・法人", searchKeyword: "会社",       group: g("civil") },
  { slug: "chizai",      label: "知的財産",   searchKeyword: "特許",       group: g("civil") },
  { slug: "fudosan",     label: "不動産・登記",searchKeyword: "不動産",    group: g("civil") },
  { slug: "shohisha",    label: "消費者保護", searchKeyword: "消費者",     group: g("civil") },

  // 経済・産業
  { slug: "zeimu",       label: "国税",       searchKeyword: "所得税",     group: g("economy") },
  { slug: "chihoze",     label: "地方税",     searchKeyword: "地方税",     group: g("economy") },
  { slug: "kanzei",      label: "関税",       searchKeyword: "関税",       group: g("economy") },
  { slug: "kinyu",       label: "金融・保険", searchKeyword: "銀行",       group: g("economy") },
  { slug: "shoken",      label: "証券・投資", searchKeyword: "金融商品",   group: g("economy") },
  { slug: "dokkin",      label: "独占禁止",   searchKeyword: "独占禁止",   group: g("economy") },
  { slug: "chusho",      label: "中小企業",   searchKeyword: "中小企業",   group: g("economy") },
  { slug: "boeki",       label: "外為・貿易", searchKeyword: "外国為替",   group: g("economy") },

  // 労働・社会
  { slug: "rodo",        label: "労働",       searchKeyword: "労働基準",   group: g("labor") },
  { slug: "koyohoken",   label: "雇用保険",   searchKeyword: "雇用保険",   group: g("labor") },
  { slug: "shakaihoken", label: "社会保険",   searchKeyword: "社会保険",   group: g("labor") },
  { slug: "nenkin",      label: "年金",       searchKeyword: "年金",       group: g("labor") },
  { slug: "fukushi",     label: "福祉・援護", searchKeyword: "福祉",       group: g("labor") },
  { slug: "iryo",        label: "医療",       searchKeyword: "医療",       group: g("labor") },
  { slug: "yakuji",      label: "薬事・食品", searchKeyword: "薬機法",     group: g("labor") },
  { slug: "kyoiku",      label: "教育",       searchKeyword: "教育",       group: g("labor") },
  { slug: "bunka",       label: "文化・芸術", searchKeyword: "文化",       group: g("labor") },
  { slug: "kagaku",      label: "科学技術",   searchKeyword: "科学技術",   group: g("labor") },

  // インフラ・環境
  { slug: "kokudo",      label: "国土・建設", searchKeyword: "建設",       group: g("infra") },
  { slug: "jutaku",      label: "住宅",       searchKeyword: "住宅",       group: g("infra") },
  { slug: "doro",        label: "道路・交通", searchKeyword: "道路",       group: g("infra") },
  { slug: "tetsudo",     label: "鉄道・航空", searchKeyword: "鉄道",       group: g("infra") },
  { slug: "kaiji",       label: "港湾・海事", searchKeyword: "海上",       group: g("infra") },
  { slug: "energy",      label: "エネルギー", searchKeyword: "電気",       group: g("infra") },
  { slug: "kankyo",      label: "環境・公害", searchKeyword: "環境",       group: g("infra") },

  // 農林水産・食品
  { slug: "nogyo",       label: "農業・農地", searchKeyword: "農業",       group: g("primary") },
  { slug: "ringyo",      label: "林業",       searchKeyword: "森林",       group: g("primary") },
  { slug: "suisan",      label: "水産",       searchKeyword: "漁業",       group: g("primary") },

  // 安全・外交
  { slug: "joho",        label: "情報通信",   searchKeyword: "電気通信",   group: g("security") },
  { slug: "boei",        label: "防衛・安全", searchKeyword: "防衛",       group: g("security") },
  { slug: "gaiko",       label: "外交・条約", searchKeyword: "条約",       group: g("security") },
  { slug: "saigai",      label: "災害対策",   searchKeyword: "災害",       group: g("security") },
];

// slug → カテゴリを取得
export function getCategoryBySlug(slug: string): LawCategory | undefined {
  return LAW_CATEGORIES.find((c) => c.slug === slug);
}

// グループ → カテゴリ一覧
export function getCategoriesByGroup(groupId: string): LawCategory[] {
  return LAW_CATEGORIES.filter((c) => c.group.id === groupId);
}
