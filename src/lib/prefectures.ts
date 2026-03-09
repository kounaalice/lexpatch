// 都道府県の公式サイト・例規集URLマッピング

export interface PrefectureInfo {
  slug: string; // categories.ts の slug と一致
  name: string;
  topUrl: string; // 公式サイト
  region: string; // 地域ブロック
}

export const PREFECTURES: PrefectureInfo[] = [
  {
    slug: "jorei-hokkaido",
    name: "北海道",
    topUrl: "https://www.pref.hokkaido.lg.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-aomori",
    name: "青森県",
    topUrl: "https://www.pref.aomori.lg.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-iwate",
    name: "岩手県",
    topUrl: "https://www.pref.iwate.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-miyagi",
    name: "宮城県",
    topUrl: "https://www.pref.miyagi.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-akita",
    name: "秋田県",
    topUrl: "https://www.pref.akita.lg.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-yamagata",
    name: "山形県",
    topUrl: "https://www.pref.yamagata.jp/",
    region: "北海道・東北",
  },
  {
    slug: "jorei-fukushima",
    name: "福島県",
    topUrl: "https://www.pref.fukushima.lg.jp/",
    region: "北海道・東北",
  },
  { slug: "jorei-ibaraki", name: "茨城県", topUrl: "https://www.pref.ibaraki.jp/", region: "関東" },
  {
    slug: "jorei-tochigi",
    name: "栃木県",
    topUrl: "https://www.pref.tochigi.lg.jp/",
    region: "関東",
  },
  { slug: "jorei-gunma", name: "群馬県", topUrl: "https://www.pref.gunma.jp/", region: "関東" },
  {
    slug: "jorei-saitama",
    name: "埼玉県",
    topUrl: "https://www.pref.saitama.lg.jp/",
    region: "関東",
  },
  { slug: "jorei-chiba", name: "千葉県", topUrl: "https://www.pref.chiba.lg.jp/", region: "関東" },
  { slug: "jorei-tokyo", name: "東京都", topUrl: "https://www.metro.tokyo.lg.jp/", region: "関東" },
  {
    slug: "jorei-kanagawa",
    name: "神奈川県",
    topUrl: "https://www.pref.kanagawa.jp/",
    region: "関東",
  },
  {
    slug: "jorei-niigata",
    name: "新潟県",
    topUrl: "https://www.pref.niigata.lg.jp/",
    region: "中部",
  },
  { slug: "jorei-toyama", name: "富山県", topUrl: "https://www.pref.toyama.jp/", region: "中部" },
  {
    slug: "jorei-ishikawa",
    name: "石川県",
    topUrl: "https://www.pref.ishikawa.lg.jp/",
    region: "中部",
  },
  { slug: "jorei-fukui", name: "福井県", topUrl: "https://www.pref.fukui.lg.jp/", region: "中部" },
  {
    slug: "jorei-yamanashi",
    name: "山梨県",
    topUrl: "https://www.pref.yamanashi.jp/",
    region: "中部",
  },
  {
    slug: "jorei-nagano",
    name: "長野県",
    topUrl: "https://www.pref.nagano.lg.jp/",
    region: "中部",
  },
  { slug: "jorei-gifu", name: "岐阜県", topUrl: "https://www.pref.gifu.lg.jp/", region: "中部" },
  {
    slug: "jorei-shizuoka",
    name: "静岡県",
    topUrl: "https://www.pref.shizuoka.jp/",
    region: "中部",
  },
  { slug: "jorei-aichi", name: "愛知県", topUrl: "https://www.pref.aichi.jp/", region: "中部" },
  { slug: "jorei-mie", name: "三重県", topUrl: "https://www.pref.mie.lg.jp/", region: "中部" },
  { slug: "jorei-shiga", name: "滋賀県", topUrl: "https://www.pref.shiga.lg.jp/", region: "近畿" },
  { slug: "jorei-kyoto", name: "京都府", topUrl: "https://www.pref.kyoto.jp/", region: "近畿" },
  { slug: "jorei-osaka", name: "大阪府", topUrl: "https://www.pref.osaka.lg.jp/", region: "近畿" },
  { slug: "jorei-hyogo", name: "兵庫県", topUrl: "https://web.pref.hyogo.lg.jp/", region: "近畿" },
  { slug: "jorei-nara", name: "奈良県", topUrl: "https://www.pref.nara.jp/", region: "近畿" },
  {
    slug: "jorei-wakayama",
    name: "和歌山県",
    topUrl: "https://www.pref.wakayama.lg.jp/",
    region: "近畿",
  },
  {
    slug: "jorei-tottori",
    name: "鳥取県",
    topUrl: "https://www.pref.tottori.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-shimane",
    name: "島根県",
    topUrl: "https://www.pref.shimane.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-okayama",
    name: "岡山県",
    topUrl: "https://www.pref.okayama.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-hiroshima",
    name: "広島県",
    topUrl: "https://www.pref.hiroshima.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-yamaguchi",
    name: "山口県",
    topUrl: "https://www.pref.yamaguchi.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-tokushima",
    name: "徳島県",
    topUrl: "https://www.pref.tokushima.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-kagawa",
    name: "香川県",
    topUrl: "https://www.pref.kagawa.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-ehime",
    name: "愛媛県",
    topUrl: "https://www.pref.ehime.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-kochi",
    name: "高知県",
    topUrl: "https://www.pref.kochi.lg.jp/",
    region: "中国・四国",
  },
  {
    slug: "jorei-fukuoka",
    name: "福岡県",
    topUrl: "https://www.pref.fukuoka.lg.jp/",
    region: "九州・沖縄",
  },
  {
    slug: "jorei-saga",
    name: "佐賀県",
    topUrl: "https://www.pref.saga.lg.jp/",
    region: "九州・沖縄",
  },
  {
    slug: "jorei-nagasaki",
    name: "長崎県",
    topUrl: "https://www.pref.nagasaki.jp/",
    region: "九州・沖縄",
  },
  {
    slug: "jorei-kumamoto",
    name: "熊本県",
    topUrl: "https://www.pref.kumamoto.jp/",
    region: "九州・沖縄",
  },
  { slug: "jorei-oita", name: "大分県", topUrl: "https://www.pref.oita.jp/", region: "九州・沖縄" },
  {
    slug: "jorei-miyazaki",
    name: "宮崎県",
    topUrl: "https://www.pref.miyazaki.lg.jp/",
    region: "九州・沖縄",
  },
  {
    slug: "jorei-kagoshima",
    name: "鹿児島県",
    topUrl: "https://www.pref.kagoshima.jp/",
    region: "九州・沖縄",
  },
  {
    slug: "jorei-okinawa",
    name: "沖縄県",
    topUrl: "https://www.pref.okinawa.jp/",
    region: "九州・沖縄",
  },
];

export function getPrefectureBySlug(slug: string): PrefectureInfo | undefined {
  return PREFECTURES.find((p) => p.slug === slug);
}

export function getPrefecturesByRegion(region: string): PrefectureInfo[] {
  return PREFECTURES.filter((p) => p.region === region);
}

export const REGIONS = ["北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"];

/** 都庁/道庁/府庁/県庁 を正しく返す */
export function getOfficeLabel(slug: string): string {
  if (slug === "jorei-hokkaido") return "道庁";
  if (slug === "jorei-tokyo") return "都庁";
  if (slug === "jorei-osaka" || slug === "jorei-kyoto") return "府庁";
  return "県庁";
}
