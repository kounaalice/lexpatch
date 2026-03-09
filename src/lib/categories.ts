// e-Gov 法令データ提供システム 50分野
// https://laws.e-gov.go.jp の公式分類に準拠

export interface LawCategory {
  slug: string; // URL用
  label: string; // 表示名（e-Gov category フィールド値）
  searchKeyword: string; // law_title 検索に使うキーワード
  group: CategoryGroup;
}

export interface CategoryGroup {
  id: string;
  label: string;
  color: string; // CSS var or hex
  bg: string;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: "admin", label: "国家・行政", color: "#1B4B8A", bg: "#EBF2FD" },
  { id: "justice", label: "司法・法務", color: "#9B2C2C", bg: "#FDF0EF" },
  { id: "finance", label: "財政", color: "#2D6A4F", bg: "#EAF5ED" },
  { id: "industry", label: "産業・経済", color: "#8B7355", bg: "#FDF8F0" },
  { id: "traffic", label: "交通・通信", color: "#5B3F8F", bg: "#F3EEFC" },
  { id: "land", label: "国土・建設", color: "#A85D00", bg: "#FFF8EB" },
  { id: "society", label: "社会・文化", color: "#2D4A22", bg: "#EBF5EE" },
  { id: "security", label: "安全・防衛", color: "#374151", bg: "#F3F4F6" },
  { id: "jorei", label: "条例・都道府県", color: "#7C3AED", bg: "#F5F3FF" },
];

const G = CATEGORY_GROUPS;
const g = (id: string) => G.find((x) => x.id === id)!;

export const LAW_CATEGORIES: LawCategory[] = [
  // ── 国家・行政 ──
  { slug: "kenpo", label: "憲法", searchKeyword: "憲法", group: g("admin") },
  { slug: "kokkai", label: "国会", searchKeyword: "国会", group: g("admin") },
  { slug: "gyosei-soshiki", label: "行政組織", searchKeyword: "行政組織", group: g("admin") },
  { slug: "komuin", label: "国家公務員", searchKeyword: "国家公務員", group: g("admin") },
  { slug: "gyosei-tetsu", label: "行政手続", searchKeyword: "行政手続", group: g("admin") },
  { slug: "tokei", label: "統計", searchKeyword: "統計", group: g("admin") },
  { slug: "chiho-jichi", label: "地方自治", searchKeyword: "地方自治", group: g("admin") },

  // ── 司法・法務 ──
  { slug: "shiho", label: "司法", searchKeyword: "裁判所", group: g("justice") },
  { slug: "minji", label: "民事", searchKeyword: "民法", group: g("justice") },
  { slug: "keiji", label: "刑事", searchKeyword: "刑事", group: g("justice") },

  // ── 財政 ──
  { slug: "zaimu-tsusoku", label: "財務通則", searchKeyword: "財政", group: g("finance") },
  { slug: "kokuzei", label: "国税", searchKeyword: "国税", group: g("finance") },
  { slug: "kokusai", label: "国債", searchKeyword: "国債", group: g("finance") },
  { slug: "kokuyu-zaisan", label: "国有財産", searchKeyword: "国有財産", group: g("finance") },
  { slug: "chiho-zaisei", label: "地方財政", searchKeyword: "地方財政", group: g("finance") },
  { slug: "kinyu", label: "金融・保険", searchKeyword: "銀行", group: g("finance") },
  { slug: "boeki", label: "外国為替・貿易", searchKeyword: "外国為替", group: g("finance") },

  // ── 産業・経済 ──
  { slug: "sangyo-tsusoku", label: "産業通則", searchKeyword: "産業", group: g("industry") },
  { slug: "kogyo", label: "工業", searchKeyword: "工業", group: g("industry") },
  { slug: "kogyo-m", label: "鉱業", searchKeyword: "鉱業", group: g("industry") },
  { slug: "shogyo", label: "商業", searchKeyword: "商業", group: g("industry") },
  { slug: "kanko", label: "観光", searchKeyword: "観光", group: g("industry") },
  { slug: "nogyo", label: "農業", searchKeyword: "農業", group: g("industry") },
  { slug: "ringyo", label: "林業", searchKeyword: "森林", group: g("industry") },
  { slug: "suisan", label: "水産業", searchKeyword: "漁業", group: g("industry") },

  // ── 交通・通信 ──
  { slug: "doro", label: "道路", searchKeyword: "道路", group: g("traffic") },
  { slug: "rikuun", label: "陸運", searchKeyword: "道路運送", group: g("traffic") },
  { slug: "kaiunl", label: "海運", searchKeyword: "船舶", group: g("traffic") },
  { slug: "koku", label: "航空", searchKeyword: "航空", group: g("traffic") },
  { slug: "kamotsu", label: "貨物運送", searchKeyword: "貨物", group: g("traffic") },
  { slug: "yubin", label: "郵務", searchKeyword: "郵便", group: g("traffic") },
  { slug: "denki-tsushin", label: "電気通信", searchKeyword: "電気通信", group: g("traffic") },

  // ── 国土・建設 ──
  { slug: "kokudo", label: "国土開発事業", searchKeyword: "国土", group: g("land") },
  { slug: "kenchiku", label: "建築・住宅", searchKeyword: "建築", group: g("land") },
  { slug: "toshi", label: "都市計画", searchKeyword: "都市計画", group: g("land") },
  { slug: "tochi", label: "土地", searchKeyword: "土地", group: g("land") },
  { slug: "kassen", label: "河川", searchKeyword: "河川", group: g("land") },
  { slug: "kankyo", label: "環境保全", searchKeyword: "環境", group: g("land") },

  // ── 社会・文化 ──
  { slug: "rodo", label: "労働", searchKeyword: "労働", group: g("society") },
  { slug: "shakaihoken", label: "社会保険", searchKeyword: "社会保険", group: g("society") },
  { slug: "shakaifukushi", label: "社会福祉", searchKeyword: "福祉", group: g("society") },
  { slug: "kosei", label: "厚生", searchKeyword: "厚生", group: g("society") },
  { slug: "kyoiku", label: "教育", searchKeyword: "教育", group: g("society") },
  { slug: "bunka", label: "文化", searchKeyword: "文化", group: g("society") },

  // ── 安全・防衛 ──
  { slug: "boei", label: "防衛", searchKeyword: "防衛", group: g("security") },
  { slug: "gaiji", label: "外事", searchKeyword: "出入国", group: g("security") },
  { slug: "keisatsu", label: "警察", searchKeyword: "警察", group: g("security") },
  { slug: "shobo", label: "消防", searchKeyword: "消防", group: g("security") },
  { slug: "saigai", label: "災害対策", searchKeyword: "災害", group: g("security") },

  // ── 条例・都道府県 ──
  { slug: "jorei-hokkaido", label: "北海道", searchKeyword: "北海道", group: g("jorei") },
  { slug: "jorei-aomori", label: "青森県", searchKeyword: "青森", group: g("jorei") },
  { slug: "jorei-iwate", label: "岩手県", searchKeyword: "岩手", group: g("jorei") },
  { slug: "jorei-miyagi", label: "宮城県", searchKeyword: "宮城", group: g("jorei") },
  { slug: "jorei-akita", label: "秋田県", searchKeyword: "秋田", group: g("jorei") },
  { slug: "jorei-yamagata", label: "山形県", searchKeyword: "山形", group: g("jorei") },
  { slug: "jorei-fukushima", label: "福島県", searchKeyword: "福島", group: g("jorei") },
  { slug: "jorei-ibaraki", label: "茨城県", searchKeyword: "茨城", group: g("jorei") },
  { slug: "jorei-tochigi", label: "栃木県", searchKeyword: "栃木", group: g("jorei") },
  { slug: "jorei-gunma", label: "群馬県", searchKeyword: "群馬", group: g("jorei") },
  { slug: "jorei-saitama", label: "埼玉県", searchKeyword: "埼玉", group: g("jorei") },
  { slug: "jorei-chiba", label: "千葉県", searchKeyword: "千葉", group: g("jorei") },
  { slug: "jorei-tokyo", label: "東京都", searchKeyword: "東京", group: g("jorei") },
  { slug: "jorei-kanagawa", label: "神奈川県", searchKeyword: "神奈川", group: g("jorei") },
  { slug: "jorei-niigata", label: "新潟県", searchKeyword: "新潟", group: g("jorei") },
  { slug: "jorei-toyama", label: "富山県", searchKeyword: "富山", group: g("jorei") },
  { slug: "jorei-ishikawa", label: "石川県", searchKeyword: "石川", group: g("jorei") },
  { slug: "jorei-fukui", label: "福井県", searchKeyword: "福井", group: g("jorei") },
  { slug: "jorei-yamanashi", label: "山梨県", searchKeyword: "山梨", group: g("jorei") },
  { slug: "jorei-nagano", label: "長野県", searchKeyword: "長野", group: g("jorei") },
  { slug: "jorei-gifu", label: "岐阜県", searchKeyword: "岐阜", group: g("jorei") },
  { slug: "jorei-shizuoka", label: "静岡県", searchKeyword: "静岡", group: g("jorei") },
  { slug: "jorei-aichi", label: "愛知県", searchKeyword: "愛知", group: g("jorei") },
  { slug: "jorei-mie", label: "三重県", searchKeyword: "三重", group: g("jorei") },
  { slug: "jorei-shiga", label: "滋賀県", searchKeyword: "滋賀", group: g("jorei") },
  { slug: "jorei-kyoto", label: "京都府", searchKeyword: "京都", group: g("jorei") },
  { slug: "jorei-osaka", label: "大阪府", searchKeyword: "大阪", group: g("jorei") },
  { slug: "jorei-hyogo", label: "兵庫県", searchKeyword: "兵庫", group: g("jorei") },
  { slug: "jorei-nara", label: "奈良県", searchKeyword: "奈良", group: g("jorei") },
  { slug: "jorei-wakayama", label: "和歌山県", searchKeyword: "和歌山", group: g("jorei") },
  { slug: "jorei-tottori", label: "鳥取県", searchKeyword: "鳥取", group: g("jorei") },
  { slug: "jorei-shimane", label: "島根県", searchKeyword: "島根", group: g("jorei") },
  { slug: "jorei-okayama", label: "岡山県", searchKeyword: "岡山", group: g("jorei") },
  { slug: "jorei-hiroshima", label: "広島県", searchKeyword: "広島", group: g("jorei") },
  { slug: "jorei-yamaguchi", label: "山口県", searchKeyword: "山口", group: g("jorei") },
  { slug: "jorei-tokushima", label: "徳島県", searchKeyword: "徳島", group: g("jorei") },
  { slug: "jorei-kagawa", label: "香川県", searchKeyword: "香川", group: g("jorei") },
  { slug: "jorei-ehime", label: "愛媛県", searchKeyword: "愛媛", group: g("jorei") },
  { slug: "jorei-kochi", label: "高知県", searchKeyword: "高知", group: g("jorei") },
  { slug: "jorei-fukuoka", label: "福岡県", searchKeyword: "福岡", group: g("jorei") },
  { slug: "jorei-saga", label: "佐賀県", searchKeyword: "佐賀", group: g("jorei") },
  { slug: "jorei-nagasaki", label: "長崎県", searchKeyword: "長崎", group: g("jorei") },
  { slug: "jorei-kumamoto", label: "熊本県", searchKeyword: "熊本", group: g("jorei") },
  { slug: "jorei-oita", label: "大分県", searchKeyword: "大分", group: g("jorei") },
  { slug: "jorei-miyazaki", label: "宮崎県", searchKeyword: "宮崎", group: g("jorei") },
  { slug: "jorei-kagoshima", label: "鹿児島県", searchKeyword: "鹿児島", group: g("jorei") },
  { slug: "jorei-okinawa", label: "沖縄県", searchKeyword: "沖縄", group: g("jorei") },
];

// slug → カテゴリを取得
export function getCategoryBySlug(slug: string): LawCategory | undefined {
  return LAW_CATEGORIES.find((c) => c.slug === slug);
}

// グループ → カテゴリ一覧
export function getCategoriesByGroup(groupId: string): LawCategory[] {
  return LAW_CATEGORIES.filter((c) => c.group.id === groupId);
}
