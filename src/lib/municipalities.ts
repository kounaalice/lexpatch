// 全国市区町村データ（都道府県別・全1,741市区町村）
// 村のない県: 石川県・滋賀県・兵庫県・広島県・香川県・愛媛県・長崎県・佐賀県
// ※ 富山県は舟橋村が存在、栃木県は村なし（町のみ）
// 町のない県: なし（全県に町が存在）

export interface MunicipalityInfo {
  name: string;
  slug: string;
  topUrl: string;
  isCapital?: boolean;
  isDesignated?: boolean;
  region?: string;
}

export const MUNICIPALITIES: Record<string, MunicipalityInfo[]> = {
  // ═══════════════════════════════════════════════════════════
  // 北海道 (35市・129町・15村 = 179市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-hokkaido": [
    // ── 市 (35) ──
    {
      name: "札幌市",
      slug: "sapporo",
      topUrl: "https://www.city.sapporo.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "旭川市",
      slug: "asahikawa",
      topUrl: "https://www.city.asahikawa.hokkaido.jp/",
      region: "市",
    },
    {
      name: "函館市",
      slug: "hakodate",
      topUrl: "https://www.city.hakodate.hokkaido.jp/",
      region: "市",
    },
    { name: "釧路市", slug: "kushiro", topUrl: "https://www.city.kushiro.lg.jp/", region: "市" },
    {
      name: "帯広市",
      slug: "obihiro",
      topUrl: "https://www.city.obihiro.hokkaido.jp/",
      region: "市",
    },
    { name: "北見市", slug: "kitami", topUrl: "https://www.city.kitami.lg.jp/", region: "市" },
    { name: "小樽市", slug: "otaru", topUrl: "https://www.city.otaru.lg.jp/", region: "市" },
    {
      name: "苫小牧市",
      slug: "tomakomai",
      topUrl: "https://www.city.tomakomai.hokkaido.jp/",
      region: "市",
    },
    {
      name: "江別市",
      slug: "ebetsu",
      topUrl: "https://www.city.ebetsu.hokkaido.jp/",
      region: "市",
    },
    { name: "室蘭市", slug: "muroran", topUrl: "https://www.city.muroran.lg.jp/", region: "市" },
    {
      name: "岩見沢市",
      slug: "iwamizawa",
      topUrl: "https://www.city.iwamizawa.hokkaido.jp/",
      region: "市",
    },
    { name: "千歳市", slug: "chitose", topUrl: "https://www.city.chitose.lg.jp/", region: "市" },
    { name: "恵庭市", slug: "eniwa", topUrl: "https://www.city.eniwa.hokkaido.jp/", region: "市" },
    {
      name: "北広島市",
      slug: "kitahiroshima",
      topUrl: "https://www.city.kitahiroshima.hokkaido.jp/",
      region: "市",
    },
    {
      name: "石狩市",
      slug: "ishikari",
      topUrl: "https://www.city.ishikari.hokkaido.jp/",
      region: "市",
    },
    {
      name: "登別市",
      slug: "noboribetsu",
      topUrl: "https://www.city.noboribetsu.lg.jp/",
      region: "市",
    },
    { name: "伊達市", slug: "date", topUrl: "https://www.city.date.hokkaido.jp/", region: "市" },
    { name: "名寄市", slug: "nayoro", topUrl: "https://www.city.nayoro.lg.jp/", region: "市" },
    {
      name: "根室市",
      slug: "nemuro",
      topUrl: "https://www.city.nemuro.hokkaido.jp/",
      region: "市",
    },
    {
      name: "稚内市",
      slug: "wakkanai",
      topUrl: "https://www.city.wakkanai.hokkaido.jp/",
      region: "市",
    },
    { name: "留萌市", slug: "rumoi", topUrl: "https://www.city.rumoi.hokkaido.jp/", region: "市" },
    { name: "紋別市", slug: "mombetsu", topUrl: "https://www.city.mombetsu.lg.jp/", region: "市" },
    { name: "美唄市", slug: "bibai", topUrl: "https://www.city.bibai.hokkaido.jp/", region: "市" },
    {
      name: "芦別市",
      slug: "ashibetsu",
      topUrl: "https://www.city.ashibetsu.hokkaido.jp/",
      region: "市",
    },
    {
      name: "赤平市",
      slug: "akabira",
      topUrl: "https://www.city.akabira.hokkaido.jp/",
      region: "市",
    },
    {
      name: "三笠市",
      slug: "mikasa",
      topUrl: "https://www.city.mikasa.hokkaido.jp/",
      region: "市",
    },
    {
      name: "滝川市",
      slug: "takikawa",
      topUrl: "https://www.city.takikawa.hokkaido.jp/",
      region: "市",
    },
    { name: "砂川市", slug: "sunagawa", topUrl: "https://www.city.sunagawa.lg.jp/", region: "市" },
    {
      name: "歌志内市",
      slug: "utashinai",
      topUrl: "https://www.city.utashinai.hokkaido.jp/",
      region: "市",
    },
    { name: "深川市", slug: "fukagawa", topUrl: "https://www.city.fukagawa.lg.jp/", region: "市" },
    {
      name: "富良野市",
      slug: "furano",
      topUrl: "https://www.city.furano.hokkaido.jp/",
      region: "市",
    },
    {
      name: "士別市",
      slug: "shibetsu-shi",
      topUrl: "https://www.city.shibetsu.lg.jp/",
      region: "市",
    },
    {
      name: "網走市",
      slug: "abashiri",
      topUrl: "https://www.city.abashiri.hokkaido.jp/",
      region: "市",
    },
    { name: "夕張市", slug: "yubari", topUrl: "https://www.city.yubari.lg.jp/", region: "市" },
    {
      name: "北斗市",
      slug: "hokuto-h",
      topUrl: "https://www.city.hokuto.hokkaido.jp/",
      region: "市",
    },
    // ── 石狩振興局 町村 ──
    {
      name: "当別町",
      slug: "tobetsu",
      topUrl: "https://www.town.tobetsu.hokkaido.jp/",
      region: "石狩振興局",
    },
    {
      name: "新篠津村",
      slug: "shinshinotsu",
      topUrl: "https://www.vill.shinshinotsu.hokkaido.jp/",
      region: "石狩振興局",
    },
    // ── 渡島総合振興局 町 ──
    {
      name: "松前町",
      slug: "matsumae",
      topUrl: "https://www.town.matsumae.hokkaido.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "福島町",
      slug: "fukushima-h",
      topUrl: "https://www.town.fukushima.hokkaido.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "知内町",
      slug: "shiriuchi",
      topUrl: "https://www.town.shiriuchi.hokkaido.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "木古内町",
      slug: "kikonai",
      topUrl: "https://www.town.kikonai.hokkaido.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "七飯町",
      slug: "nanae",
      topUrl: "https://www.town.nanae.hokkaido.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "鹿部町",
      slug: "shikabe",
      topUrl: "https://www.town.shikabe.lg.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "森町",
      slug: "mori",
      topUrl: "https://www.town.hokkaido-mori.lg.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "八雲町",
      slug: "yakumo",
      topUrl: "https://www.town.yakumo.lg.jp/",
      region: "渡島総合振興局",
    },
    {
      name: "長万部町",
      slug: "oshamambe",
      topUrl: "https://www.town.oshamambe.lg.jp/",
      region: "渡島総合振興局",
    },
    // ── 檜山振興局 町 ──
    {
      name: "江差町",
      slug: "esashi-h",
      topUrl: "https://www.town.esashi.hokkaido.jp/",
      region: "檜山振興局",
    },
    {
      name: "上ノ国町",
      slug: "kaminokuni",
      topUrl: "https://www.town.kaminokuni.lg.jp/",
      region: "檜山振興局",
    },
    {
      name: "厚沢部町",
      slug: "assabu",
      topUrl: "https://www.town.assabu.lg.jp/",
      region: "檜山振興局",
    },
    {
      name: "乙部町",
      slug: "otobe",
      topUrl: "https://www.town.otobe.lg.jp/",
      region: "檜山振興局",
    },
    {
      name: "奥尻町",
      slug: "okushiri",
      topUrl: "https://www.town.okushiri.lg.jp/",
      region: "檜山振興局",
    },
    {
      name: "今金町",
      slug: "imakane",
      topUrl: "https://www.town.imakane.lg.jp/",
      region: "檜山振興局",
    },
    {
      name: "せたな町",
      slug: "setana",
      topUrl: "https://www.town.setana.lg.jp/",
      region: "檜山振興局",
    },
    // ── 後志総合振興局 町村 ──
    {
      name: "島牧村",
      slug: "shimamaki",
      topUrl: "https://www.vill.shimamaki.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "寿都町",
      slug: "suttsu",
      topUrl: "https://www.town.suttu.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "黒松内町",
      slug: "kuromatsunai",
      topUrl: "https://www.town.kuromatsunai.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "蘭越町",
      slug: "rankoshi",
      topUrl: "https://www.town.rankoshi.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "ニセコ町",
      slug: "niseko",
      topUrl: "https://www.town.niseko.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "真狩村",
      slug: "makkari",
      topUrl: "https://www.vill.makkari.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "留寿都村",
      slug: "rusutsu",
      topUrl: "https://www.vill.rusutsu.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "喜茂別町",
      slug: "kimobetsu",
      topUrl: "https://www.town.kimobetsu.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "京極町",
      slug: "kyogoku",
      topUrl: "https://www.town.kyogoku.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "倶知安町",
      slug: "kutchan",
      topUrl: "https://www.town.kutchan.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "共和町",
      slug: "kyowa",
      topUrl: "https://www.town.kyowa.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "岩内町",
      slug: "iwanai",
      topUrl: "https://www.town.iwanai.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "泊村",
      slug: "tomari",
      topUrl: "https://www.vill.tomari.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "神恵内村",
      slug: "kamoenai",
      topUrl: "https://www.vill.kamoenai.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "積丹町",
      slug: "shakotan",
      topUrl: "https://www.town.shakotan.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "古平町",
      slug: "furubira",
      topUrl: "https://www.town.furubira.lg.jp/",
      region: "後志総合振興局",
    },
    {
      name: "仁木町",
      slug: "niki",
      topUrl: "https://www.town.niki.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "余市町",
      slug: "yoichi",
      topUrl: "https://www.town.yoichi.hokkaido.jp/",
      region: "後志総合振興局",
    },
    {
      name: "赤井川村",
      slug: "akaigawa",
      topUrl: "https://www.vill.akaigawa.hokkaido.jp/",
      region: "後志総合振興局",
    },
    // ── 空知総合振興局 町 ──
    {
      name: "南幌町",
      slug: "nanporo",
      topUrl: "https://www.town.nanporo.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "奈井江町",
      slug: "naie",
      topUrl: "https://www.town.naie.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "上砂川町",
      slug: "kamisunagawa",
      topUrl: "https://www.town.kamisunagawa.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "由仁町",
      slug: "yuni",
      topUrl: "https://www.town.yuni.lg.jp/",
      region: "空知総合振興局",
    },
    {
      name: "長沼町",
      slug: "naganuma",
      topUrl: "https://www.town.naganuma.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "栗山町",
      slug: "kuriyama",
      topUrl: "https://www.town.kuriyama.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "月形町",
      slug: "tsukigata",
      topUrl: "https://www.town.tsukigata.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "浦臼町",
      slug: "urausu",
      topUrl: "https://www.town.urausu.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "新十津川町",
      slug: "shintotsukawa",
      topUrl: "https://www.town.shintotsukawa.lg.jp/",
      region: "空知総合振興局",
    },
    {
      name: "妹背牛町",
      slug: "moseushi",
      topUrl: "https://www.town.moseushi.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "秩父別町",
      slug: "chippubetsu",
      topUrl: "https://www.town.chippubetsu.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "雨竜町",
      slug: "uryu",
      topUrl: "https://www.town.uryu.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "北竜町",
      slug: "hokuryu",
      topUrl: "https://www.town.hokuryu.hokkaido.jp/",
      region: "空知総合振興局",
    },
    {
      name: "沼田町",
      slug: "numata-h",
      topUrl: "https://www.town.numata.hokkaido.jp/",
      region: "空知総合振興局",
    },
    // ── 上川総合振興局 町村 ──
    {
      name: "鷹栖町",
      slug: "takasu",
      topUrl: "https://www.town.takasu.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "東神楽町",
      slug: "higashikagura",
      topUrl: "https://www.town.higashikagura.lg.jp/",
      region: "上川総合振興局",
    },
    {
      name: "当麻町",
      slug: "tohma",
      topUrl: "https://www.town.tohma.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "比布町",
      slug: "pippu",
      topUrl: "https://www.town.pippu.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "愛別町",
      slug: "aibetsu",
      topUrl: "https://www.town.aibetsu.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "上川町",
      slug: "kamikawa-t",
      topUrl: "https://www.town.kamikawa.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "東川町",
      slug: "higashikawa",
      topUrl: "https://town.higashikawa.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "美瑛町",
      slug: "biei",
      topUrl: "https://town.biei.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "上富良野町",
      slug: "kamifurano",
      topUrl: "https://www.town.kamifurano.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "中富良野町",
      slug: "nakafurano",
      topUrl: "https://www.town.nakafurano.lg.jp/",
      region: "上川総合振興局",
    },
    {
      name: "南富良野町",
      slug: "minamifurano",
      topUrl: "https://www.town.minamifurano.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "占冠村",
      slug: "shimukappu",
      topUrl: "https://www.vill.shimukappu.lg.jp/",
      region: "上川総合振興局",
    },
    {
      name: "和寒町",
      slug: "wassamu",
      topUrl: "https://www.town.wassamu.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "剣淵町",
      slug: "kenbuchi",
      topUrl: "https://www.town.kenbuchi.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "下川町",
      slug: "shimokawa",
      topUrl: "https://www.town.shimokawa.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "美深町",
      slug: "bifuka",
      topUrl: "https://www.town.bifuka.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "音威子府村",
      slug: "otoineppu",
      topUrl: "https://www.vill.otoineppu.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "中川町",
      slug: "nakagawa-h",
      topUrl: "https://www.town.nakagawa.hokkaido.jp/",
      region: "上川総合振興局",
    },
    {
      name: "幌加内町",
      slug: "horokanai",
      topUrl: "https://www.town.horokanai.hokkaido.jp/",
      region: "上川総合振興局",
    },
    // ── 留萌振興局 町村 ──
    {
      name: "増毛町",
      slug: "mashike",
      topUrl: "https://www.town.mashike.hokkaido.jp/",
      region: "留萌振興局",
    },
    {
      name: "小平町",
      slug: "obira",
      topUrl: "https://www.town.obira.hokkaido.jp/",
      region: "留萌振興局",
    },
    {
      name: "苫前町",
      slug: "tomamae",
      topUrl: "https://www.town.tomamae.lg.jp/",
      region: "留萌振興局",
    },
    {
      name: "羽幌町",
      slug: "haboro",
      topUrl: "https://www.town.haboro.lg.jp/",
      region: "留萌振興局",
    },
    {
      name: "初山別村",
      slug: "shosanbetsu",
      topUrl: "https://www.vill.shosanbetsu.lg.jp/",
      region: "留萌振興局",
    },
    {
      name: "遠別町",
      slug: "embetsu",
      topUrl: "https://www.town.embetsu.hokkaido.jp/",
      region: "留萌振興局",
    },
    {
      name: "天塩町",
      slug: "teshio",
      topUrl: "https://www.town.teshio.hokkaido.jp/",
      region: "留萌振興局",
    },
    // ── 宗谷総合振興局 町村 ──
    {
      name: "猿払村",
      slug: "sarufutsu",
      topUrl: "https://www.vill.sarufutsu.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "浜頓別町",
      slug: "hamatonbetsu",
      topUrl: "https://www.town.hamatonbetsu.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "中頓別町",
      slug: "nakatonbetsu",
      topUrl: "https://www.town.nakatonbetsu.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "枝幸町",
      slug: "esashi-s",
      topUrl: "https://www.town.esashi.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "豊富町",
      slug: "toyotomi",
      topUrl: "https://www.town.toyotomi.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "礼文町",
      slug: "rebun",
      topUrl: "https://www.town.rebun.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "利尻町",
      slug: "rishiri",
      topUrl: "https://www.town.rishiri.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "利尻富士町",
      slug: "rishirifuji",
      topUrl: "https://www.town.rishirifuji.hokkaido.jp/",
      region: "宗谷総合振興局",
    },
    {
      name: "幌延町",
      slug: "horonobe",
      topUrl: "https://www.town.horonobe.lg.jp/",
      region: "宗谷総合振興局",
    },
    // ── オホーツク総合振興局 町村 ──
    {
      name: "美幌町",
      slug: "bihoro",
      topUrl: "https://www.town.bihoro.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "津別町",
      slug: "tsubetsu",
      topUrl: "https://www.town.tsubetsu.lg.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "斜里町",
      slug: "shari",
      topUrl: "https://www.town.shari.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "清里町",
      slug: "kiyosato-h",
      topUrl: "https://www.town.kiyosato.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "小清水町",
      slug: "koshimizu",
      topUrl: "https://www.town.koshimizu.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "訓子府町",
      slug: "kunneppu",
      topUrl: "https://www.town.kunneppu.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "置戸町",
      slug: "oketo",
      topUrl: "https://www.town.oketo.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "佐呂間町",
      slug: "saroma",
      topUrl: "https://www.town.saroma.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "遠軽町",
      slug: "engaru",
      topUrl: "https://www.engaru.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "湧別町",
      slug: "yubetsu",
      topUrl: "https://www.town.yubetsu.lg.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "滝上町",
      slug: "takinoue",
      topUrl: "https://town.takinoue.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "興部町",
      slug: "okoppe",
      topUrl: "https://www.town.okoppe.lg.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "西興部村",
      slug: "nishiokoppe",
      topUrl: "https://www.vill.nishiokoppe.lg.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "雄武町",
      slug: "omu",
      topUrl: "https://www.town.omu.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    {
      name: "大空町",
      slug: "ozora",
      topUrl: "https://www.town.ozora.hokkaido.jp/",
      region: "オホーツク総合振興局",
    },
    // ── 胆振総合振興局 町村 ──
    {
      name: "豊浦町",
      slug: "toyoura",
      topUrl: "https://www.town.toyoura.hokkaido.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "壮瞥町",
      slug: "sobetsu",
      topUrl: "https://www.town.sobetsu.lg.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "白老町",
      slug: "shiraoi",
      topUrl: "https://www.town.shiraoi.hokkaido.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "厚真町",
      slug: "atsuma",
      topUrl: "https://www.town.atsuma.hokkaido.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "洞爺湖町",
      slug: "toyako",
      topUrl: "https://www.town.toyako.hokkaido.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "安平町",
      slug: "abira",
      topUrl: "https://www.town.abira.lg.jp/",
      region: "胆振総合振興局",
    },
    {
      name: "むかわ町",
      slug: "mukawa",
      topUrl: "https://www.town.mukawa.lg.jp/",
      region: "胆振総合振興局",
    },
    // ── 日高振興局 町 ──
    {
      name: "日高町",
      slug: "hidaka-h",
      topUrl: "https://www.town.hidaka.hokkaido.jp/",
      region: "日高振興局",
    },
    {
      name: "平取町",
      slug: "biratori",
      topUrl: "https://www.town.biratori.hokkaido.jp/",
      region: "日高振興局",
    },
    { name: "新冠町", slug: "niikappu", topUrl: "https://www.niikappu.jp/", region: "日高振興局" },
    {
      name: "浦河町",
      slug: "urakawa",
      topUrl: "https://www.town.urakawa.hokkaido.jp/",
      region: "日高振興局",
    },
    { name: "様似町", slug: "samani", topUrl: "https://www.samani.jp/", region: "日高振興局" },
    {
      name: "えりも町",
      slug: "erimo",
      topUrl: "https://www.town.erimo.lg.jp/",
      region: "日高振興局",
    },
    {
      name: "新ひだか町",
      slug: "shinhidaka",
      topUrl: "https://www.shinhidaka.hokkaido.jp/",
      region: "日高振興局",
    },
    // ── 十勝総合振興局 町村 ──
    {
      name: "音更町",
      slug: "otofuke",
      topUrl: "https://www.town.otofuke.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "士幌町",
      slug: "shihoro",
      topUrl: "https://www.shihoro.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "上士幌町",
      slug: "kamishihoro",
      topUrl: "https://www.town.kamishihoro.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "鹿追町",
      slug: "shikaoi",
      topUrl: "https://www.town.shikaoi.lg.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "新得町",
      slug: "shintoku",
      topUrl: "https://www.shintoku-town.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "清水町",
      slug: "shimizu-h",
      topUrl: "https://www.town.shimizu.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    { name: "芽室町", slug: "memuro", topUrl: "https://www.memuro.net/", region: "十勝総合振興局" },
    {
      name: "中札内村",
      slug: "nakasatsunai",
      topUrl: "https://www.vill.nakasatsunai.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "更別村",
      slug: "sarabetsu",
      topUrl: "https://www.sarabetsu.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "大樹町",
      slug: "taiki",
      topUrl: "https://www.town.taiki.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "広尾町",
      slug: "hiroo",
      topUrl: "https://www.town.hiroo.lg.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "幕別町",
      slug: "makubetsu",
      topUrl: "https://www.town.makubetsu.lg.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "池田町",
      slug: "ikeda-h",
      topUrl: "https://www.town.hokkaido-ikeda.lg.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "豊頃町",
      slug: "toyokoro",
      topUrl: "https://www.town.toyokoro.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "本別町",
      slug: "honbetsu",
      topUrl: "https://www.town.honbetsu.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "足寄町",
      slug: "ashoro",
      topUrl: "https://www.town.ashoro.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "陸別町",
      slug: "rikubetsu",
      topUrl: "https://www.town.rikubetsu.hokkaido.jp/",
      region: "十勝総合振興局",
    },
    {
      name: "浦幌町",
      slug: "urahoro",
      topUrl: "https://www.urahoro.jp/",
      region: "十勝総合振興局",
    },
    // ── 釧路総合振興局 町村 ──
    {
      name: "釧路町",
      slug: "kushiro-t",
      topUrl: "https://www.town.kushiro.lg.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "厚岸町",
      slug: "akkeshi",
      topUrl: "https://www.akkeshi-town.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "浜中町",
      slug: "hamanaka",
      topUrl: "https://www.townhamanaka.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "標茶町",
      slug: "shibecha",
      topUrl: "https://www.town.shibecha.hokkaido.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "弟子屈町",
      slug: "teshikaga",
      topUrl: "https://www.town.teshikaga.hokkaido.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "鶴居村",
      slug: "tsurui",
      topUrl: "https://www.vill.tsurui.lg.jp/",
      region: "釧路総合振興局",
    },
    {
      name: "白糠町",
      slug: "shiranuka",
      topUrl: "https://www.town.shiranuka.lg.jp/",
      region: "釧路総合振興局",
    },
    // ── 根室振興局 町村 ──
    { name: "別海町", slug: "betsukai", topUrl: "https://betsukai.jp/", region: "根室振興局" },
    {
      name: "中標津町",
      slug: "nakashibetsu",
      topUrl: "https://www.nakashibetsu.jp/",
      region: "根室振興局",
    },
    {
      name: "標津町",
      slug: "shibetsu-t",
      topUrl: "https://www.shibetsutown.jp/",
      region: "根室振興局",
    },
    { name: "羅臼町", slug: "rausu", topUrl: "https://www.rausu-town.jp/", region: "根室振興局" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 青森県 (10市・22町・8村 = 40市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-aomori": [
    // ── 市 (10) ──
    {
      name: "青森市",
      slug: "aomori-city",
      topUrl: "https://www.city.aomori.aomori.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "八戸市",
      slug: "hachinohe",
      topUrl: "https://www.city.hachinohe.aomori.jp/",
      region: "市",
    },
    { name: "弘前市", slug: "hirosaki", topUrl: "https://www.city.hirosaki.lg.jp/", region: "市" },
    { name: "十和田市", slug: "towada", topUrl: "https://www.city.towada.lg.jp/", region: "市" },
    { name: "むつ市", slug: "mutsu", topUrl: "https://www.city.mutsu.lg.jp/", region: "市" },
    {
      name: "五所川原市",
      slug: "goshogawara",
      topUrl: "https://www.city.goshogawara.lg.jp/",
      region: "市",
    },
    { name: "三沢市", slug: "misawa", topUrl: "https://www.city.misawa.lg.jp/", region: "市" },
    {
      name: "黒石市",
      slug: "kuroishi",
      topUrl: "https://www.city.kuroishi.aomori.jp/",
      region: "市",
    },
    {
      name: "つがる市",
      slug: "tsugaru",
      topUrl: "https://www.city.tsugaru.aomori.jp/",
      region: "市",
    },
    { name: "平川市", slug: "hirakawa", topUrl: "https://www.city.hirakawa.lg.jp/", region: "市" },
    // ── 東津軽郡 ──
    {
      name: "平内町",
      slug: "hiranai",
      topUrl: "https://www.town.hiranai.aomori.jp/",
      region: "東津軽郡",
    },
    {
      name: "今別町",
      slug: "imabetsu",
      topUrl: "https://www.town.imabetsu.lg.jp/",
      region: "東津軽郡",
    },
    {
      name: "蓬田村",
      slug: "yomogita",
      topUrl: "https://www.vill.yomogita.lg.jp/",
      region: "東津軽郡",
    },
    {
      name: "外ヶ浜町",
      slug: "sotogahama",
      topUrl: "https://www.town.sotogahama.lg.jp/",
      region: "東津軽郡",
    },
    // ── 西津軽郡 ──
    {
      name: "鰺ヶ沢町",
      slug: "ajigasawa",
      topUrl: "https://www.town.ajigasawa.lg.jp/",
      region: "西津軽郡",
    },
    {
      name: "深浦町",
      slug: "fukaura",
      topUrl: "https://www.town.fukaura.lg.jp/",
      region: "西津軽郡",
    },
    // ── 中津軽郡 ──
    {
      name: "西目屋村",
      slug: "nishimeya",
      topUrl: "https://www.vill.nishimeya.lg.jp/",
      region: "中津軽郡",
    },
    // ── 南津軽郡 ──
    {
      name: "藤崎町",
      slug: "fujisaki",
      topUrl: "https://www.town.fujisaki.lg.jp/",
      region: "南津軽郡",
    },
    { name: "大鰐町", slug: "owani", topUrl: "https://www.town.owani.lg.jp/", region: "南津軽郡" },
    {
      name: "田舎館村",
      slug: "inakadate",
      topUrl: "https://www.vill.inakadate.lg.jp/",
      region: "南津軽郡",
    },
    // ── 北津軽郡 ──
    {
      name: "板柳町",
      slug: "itayanagi",
      topUrl: "https://www.town.itayanagi.aomori.jp/",
      region: "北津軽郡",
    },
    {
      name: "鶴田町",
      slug: "tsuruta",
      topUrl: "https://www.town.tsuruta.lg.jp/",
      region: "北津軽郡",
    },
    {
      name: "中泊町",
      slug: "nakadomari",
      topUrl: "https://www.town.nakadomari.lg.jp/",
      region: "北津軽郡",
    },
    // ── 上北郡 ──
    {
      name: "野辺地町",
      slug: "noheji",
      topUrl: "https://www.town.noheji.aomori.jp/",
      region: "上北郡",
    },
    {
      name: "七戸町",
      slug: "shichinohe",
      topUrl: "https://www.town.shichinohe.lg.jp/",
      region: "上北郡",
    },
    {
      name: "六戸町",
      slug: "rokunohe",
      topUrl: "https://www.town.rokunohe.aomori.jp/",
      region: "上北郡",
    },
    {
      name: "横浜町",
      slug: "yokohama-a",
      topUrl: "https://www.town.yokohama.lg.jp/",
      region: "上北郡",
    },
    {
      name: "東北町",
      slug: "tohoku-machi",
      topUrl: "https://www.town.tohoku.lg.jp/",
      region: "上北郡",
    },
    { name: "六ヶ所村", slug: "rokkasho", topUrl: "https://www.rokkasho.jp/", region: "上北郡" },
    {
      name: "おいらせ町",
      slug: "oirase",
      topUrl: "https://www.town.oirase.aomori.jp/",
      region: "上北郡",
    },
    // ── 下北郡 ──
    { name: "大間町", slug: "oma", topUrl: "https://www.town.oma.lg.jp/", region: "下北郡" },
    {
      name: "東通村",
      slug: "higashidoori",
      topUrl: "https://www.vill.higashidoori.lg.jp/",
      region: "下北郡",
    },
    {
      name: "風間浦村",
      slug: "kazamaura",
      topUrl: "https://www.vill.kazamaura.lg.jp/",
      region: "下北郡",
    },
    { name: "佐井村", slug: "sai", topUrl: "https://www.vill.sai.lg.jp/", region: "下北郡" },
    // ── 三戸郡 ──
    {
      name: "三戸町",
      slug: "sannohe",
      topUrl: "https://www.town.sannohe.lg.jp/",
      region: "三戸郡",
    },
    { name: "五戸町", slug: "gonohe", topUrl: "https://www.town.gonohe.lg.jp/", region: "三戸郡" },
    { name: "田子町", slug: "takko", topUrl: "https://www.town.takko.lg.jp/", region: "三戸郡" },
    {
      name: "南部町",
      slug: "nanbu-a",
      topUrl: "https://www.town.aomori-nanbu.lg.jp/",
      region: "三戸郡",
    },
    {
      name: "階上町",
      slug: "hashikami",
      topUrl: "https://www.town.hashikami.lg.jp/",
      region: "三戸郡",
    },
    {
      name: "新郷村",
      slug: "shingo",
      topUrl: "https://www.vill.shingo.aomori.jp/",
      region: "三戸郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 岩手県 (14市・15町・4村 = 33市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-iwate": [
    // ── 市 (14) ──
    {
      name: "盛岡市",
      slug: "morioka",
      topUrl: "https://www.city.morioka.iwate.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "一関市",
      slug: "ichinoseki",
      topUrl: "https://www.city.ichinoseki.iwate.jp/",
      region: "市",
    },
    { name: "奥州市", slug: "oshu", topUrl: "https://www.city.oshu.iwate.jp/", region: "市" },
    {
      name: "花巻市",
      slug: "hanamaki",
      topUrl: "https://www.city.hanamaki.iwate.jp/",
      region: "市",
    },
    {
      name: "北上市",
      slug: "kitakami",
      topUrl: "https://www.city.kitakami.iwate.jp/",
      region: "市",
    },
    { name: "宮古市", slug: "miyako", topUrl: "https://www.city.miyako.iwate.jp/", region: "市" },
    {
      name: "大船渡市",
      slug: "ofunato",
      topUrl: "https://www.city.ofunato.iwate.jp/",
      region: "市",
    },
    {
      name: "釜石市",
      slug: "kamaishi",
      topUrl: "https://www.city.kamaishi.iwate.jp/",
      region: "市",
    },
    { name: "久慈市", slug: "kuji", topUrl: "https://www.city.kuji.iwate.jp/", region: "市" },
    { name: "遠野市", slug: "tono", topUrl: "https://www.city.tono.iwate.jp/", region: "市" },
    {
      name: "陸前高田市",
      slug: "rikuzentakata",
      topUrl: "https://www.city.rikuzentakata.iwate.jp/",
      region: "市",
    },
    { name: "二戸市", slug: "ninohe", topUrl: "https://www.city.ninohe.lg.jp/", region: "市" },
    {
      name: "八幡平市",
      slug: "hachimantai",
      topUrl: "https://www.city.hachimantai.lg.jp/",
      region: "市",
    },
    {
      name: "滝沢市",
      slug: "takizawa",
      topUrl: "https://www.city.takizawa.iwate.jp/",
      region: "市",
    },
    // ── 岩手郡 ──
    {
      name: "雫石町",
      slug: "shizukuishi",
      topUrl: "https://www.town.shizukuishi.iwate.jp/",
      region: "岩手郡",
    },
    {
      name: "葛巻町",
      slug: "kuzumaki",
      topUrl: "https://www.town.kuzumaki.iwate.jp/",
      region: "岩手郡",
    },
    {
      name: "岩手町",
      slug: "iwate-machi",
      topUrl: "https://www.town.iwate.iwate.jp/",
      region: "岩手郡",
    },
    // ── 紫波郡 ──
    { name: "紫波町", slug: "shiwa", topUrl: "https://www.town.shiwa.iwate.jp/", region: "紫波郡" },
    {
      name: "矢巾町",
      slug: "yahaba",
      topUrl: "https://www.town.yahaba.iwate.jp/",
      region: "紫波郡",
    },
    // ── 和賀郡 ──
    {
      name: "西和賀町",
      slug: "nishiwaga",
      topUrl: "https://www.town.nishiwaga.lg.jp/",
      region: "和賀郡",
    },
    // ── 胆沢郡 ──
    {
      name: "金ケ崎町",
      slug: "kanegasaki",
      topUrl: "https://www.town.kanegasaki.iwate.jp/",
      region: "胆沢郡",
    },
    // ── 西磐井郡 ──
    {
      name: "平泉町",
      slug: "hiraizumi",
      topUrl: "https://www.town.hiraizumi.iwate.jp/",
      region: "西磐井郡",
    },
    // ── 気仙郡 ──
    {
      name: "住田町",
      slug: "sumita",
      topUrl: "https://www.town.sumita.iwate.jp/",
      region: "気仙郡",
    },
    // ── 上閉伊郡 ──
    {
      name: "大槌町",
      slug: "otsuchi",
      topUrl: "https://www.town.otsuchi.iwate.jp/",
      region: "上閉伊郡",
    },
    // ── 下閉伊郡 ──
    {
      name: "山田町",
      slug: "yamada-i",
      topUrl: "https://www.town.yamada.iwate.jp/",
      region: "下閉伊郡",
    },
    {
      name: "岩泉町",
      slug: "iwaizumi",
      topUrl: "https://www.town.iwaizumi.lg.jp/",
      region: "下閉伊郡",
    },
    {
      name: "田野畑村",
      slug: "tanohata",
      topUrl: "https://www.vill.tanohata.iwate.jp/",
      region: "下閉伊郡",
    },
    {
      name: "普代村",
      slug: "fudai",
      topUrl: "https://www.vill.fudai.iwate.jp/",
      region: "下閉伊郡",
    },
    // ── 九戸郡 ──
    {
      name: "軽米町",
      slug: "karumai",
      topUrl: "https://www.town.karumai.iwate.jp/",
      region: "九戸郡",
    },
    { name: "野田村", slug: "noda", topUrl: "https://www.vill.noda.iwate.jp/", region: "九戸郡" },
    {
      name: "九戸村",
      slug: "kunohe",
      topUrl: "https://www.vill.kunohe.iwate.jp/",
      region: "九戸郡",
    },
    {
      name: "洋野町",
      slug: "hirono-i",
      topUrl: "https://www.town.hirono.iwate.jp/",
      region: "九戸郡",
    },
    // ── 二戸郡 ──
    {
      name: "一戸町",
      slug: "ichinohe",
      topUrl: "https://www.town.ichinohe.iwate.jp/",
      region: "二戸郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 宮城県 (14市・20町・1村 = 35市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-miyagi": [
    // ── 市 (14) ──
    {
      name: "仙台市",
      slug: "sendai",
      topUrl: "https://www.city.sendai.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "石巻市",
      slug: "ishinomaki",
      topUrl: "https://www.city.ishinomaki.lg.jp/",
      region: "市",
    },
    { name: "大崎市", slug: "osaki", topUrl: "https://www.city.osaki.miyagi.jp/", region: "市" },
    { name: "登米市", slug: "tome", topUrl: "https://www.city.tome.miyagi.jp/", region: "市" },
    { name: "栗原市", slug: "kurihara", topUrl: "https://www.kuriharacity.jp/", region: "市" },
    {
      name: "気仙沼市",
      slug: "kesennuma",
      topUrl: "https://www.city.kesennuma.lg.jp/",
      region: "市",
    },
    { name: "名取市", slug: "natori", topUrl: "https://www.city.natori.miyagi.jp/", region: "市" },
    {
      name: "多賀城市",
      slug: "tagajo",
      topUrl: "https://www.city.tagajo.miyagi.jp/",
      region: "市",
    },
    {
      name: "塩竈市",
      slug: "shiogama",
      topUrl: "https://www.city.shiogama.miyagi.jp/",
      region: "市",
    },
    {
      name: "岩沼市",
      slug: "iwanuma",
      topUrl: "https://www.city.iwanuma.miyagi.jp/",
      region: "市",
    },
    {
      name: "白石市",
      slug: "shiroishi",
      topUrl: "https://www.city.shiroishi.miyagi.jp/",
      region: "市",
    },
    { name: "角田市", slug: "kakuda", topUrl: "https://www.city.kakuda.lg.jp/", region: "市" },
    {
      name: "東松島市",
      slug: "higashimatsushima",
      topUrl: "https://www.city.higashimatsushima.miyagi.jp/",
      region: "市",
    },
    { name: "富谷市", slug: "tomiya", topUrl: "https://www.tomiya-city.miyagi.jp/", region: "市" },
    // ── 刈田郡 ──
    { name: "蔵王町", slug: "zao", topUrl: "https://www.town.zao.miyagi.jp/", region: "刈田郡" },
    {
      name: "七ヶ宿町",
      slug: "shichikashuku",
      topUrl: "https://www.town.shichikashuku.miyagi.jp/",
      region: "刈田郡",
    },
    // ── 柴田郡 ──
    {
      name: "大河原町",
      slug: "ogawara",
      topUrl: "https://www.town.ogawara.miyagi.jp/",
      region: "柴田郡",
    },
    {
      name: "村田町",
      slug: "murata",
      topUrl: "https://www.town.murata.miyagi.jp/",
      region: "柴田郡",
    },
    {
      name: "柴田町",
      slug: "shibata-m",
      topUrl: "https://www.town.shibata.miyagi.jp/",
      region: "柴田郡",
    },
    {
      name: "川崎町",
      slug: "kawasaki-m",
      topUrl: "https://www.town.kawasaki.miyagi.jp/",
      region: "柴田郡",
    },
    // ── 伊具郡 ──
    {
      name: "丸森町",
      slug: "marumori",
      topUrl: "https://www.town.marumori.miyagi.jp/",
      region: "伊具郡",
    },
    // ── 亘理郡 ──
    {
      name: "亘理町",
      slug: "watari",
      topUrl: "https://www.town.watari.miyagi.jp/",
      region: "亘理郡",
    },
    {
      name: "山元町",
      slug: "yamamoto-m",
      topUrl: "https://www.town.yamamoto.miyagi.jp/",
      region: "亘理郡",
    },
    // ── 宮城郡 ──
    {
      name: "松島町",
      slug: "matsushima",
      topUrl: "https://www.town.miyagi-matsushima.lg.jp/",
      region: "宮城郡",
    },
    {
      name: "七ヶ浜町",
      slug: "shichigahama",
      topUrl: "https://www.shichigahama.com/",
      region: "宮城郡",
    },
    { name: "利府町", slug: "rifu", topUrl: "https://www.town.rifu.miyagi.jp/", region: "宮城郡" },
    // ── 黒川郡 ──
    {
      name: "大和町",
      slug: "taiwa",
      topUrl: "https://www.town.taiwa.miyagi.jp/",
      region: "黒川郡",
    },
    {
      name: "大郷町",
      slug: "osato",
      topUrl: "https://www.town.miyagi-osato.lg.jp/",
      region: "黒川郡",
    },
    {
      name: "大衡村",
      slug: "ohira",
      topUrl: "https://www.village.ohira.miyagi.jp/",
      region: "黒川郡",
    },
    // ── 加美郡 ──
    {
      name: "色麻町",
      slug: "shikama",
      topUrl: "https://www.town.shikama.miyagi.jp/",
      region: "加美郡",
    },
    { name: "加美町", slug: "kami", topUrl: "https://www.town.kami.miyagi.jp/", region: "加美郡" },
    // ── 遠田郡 ──
    {
      name: "涌谷町",
      slug: "wakuya",
      topUrl: "https://www.town.wakuya.miyagi.jp/",
      region: "遠田郡",
    },
    {
      name: "美里町",
      slug: "misato-m",
      topUrl: "https://www.town.misato.miyagi.jp/",
      region: "遠田郡",
    },
    // ── 牡鹿郡 ──
    {
      name: "女川町",
      slug: "onagawa",
      topUrl: "https://www.town.onagawa.miyagi.jp/",
      region: "牡鹿郡",
    },
    // ── 本吉郡 ──
    {
      name: "南三陸町",
      slug: "minamisanriku",
      topUrl: "https://www.town.minamisanriku.miyagi.jp/",
      region: "本吉郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 秋田県 (13市・9町・3村 = 25市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-akita": [
    // ── 市 (13) ──
    {
      name: "秋田市",
      slug: "akita-city",
      topUrl: "https://www.city.akita.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "横手市", slug: "yokote", topUrl: "https://www.city.yokote.lg.jp/", region: "市" },
    { name: "大仙市", slug: "daisen", topUrl: "https://www.city.daisen.lg.jp/", region: "市" },
    {
      name: "由利本荘市",
      slug: "yurihonjo",
      topUrl: "https://www.city.yurihonjo.lg.jp/",
      region: "市",
    },
    { name: "大館市", slug: "odate", topUrl: "https://www.city.odate.lg.jp/", region: "市" },
    { name: "能代市", slug: "noshiro", topUrl: "https://www.city.noshiro.lg.jp/", region: "市" },
    { name: "湯沢市", slug: "yuzawa-a", topUrl: "https://www.city-yuzawa.jp/", region: "市" },
    {
      name: "北秋田市",
      slug: "kitaakita",
      topUrl: "https://www.city.kitaakita.akita.jp/",
      region: "市",
    },
    { name: "潟上市", slug: "katagami", topUrl: "https://www.city.katagami.lg.jp/", region: "市" },
    { name: "鹿角市", slug: "kazuno", topUrl: "https://www.city.kazuno.akita.jp/", region: "市" },
    { name: "にかほ市", slug: "nikaho", topUrl: "https://www.city.nikaho.akita.jp/", region: "市" },
    { name: "仙北市", slug: "semboku", topUrl: "https://www.city.semboku.akita.jp/", region: "市" },
    { name: "男鹿市", slug: "oga", topUrl: "https://www.city.oga.akita.jp/", region: "市" },
    // ── 鹿角郡 ──
    {
      name: "小坂町",
      slug: "kosaka",
      topUrl: "https://www.town.kosaka.akita.jp/",
      region: "鹿角郡",
    },
    // ── 北秋田郡 ──
    {
      name: "上小阿仁村",
      slug: "kamikoani",
      topUrl: "https://www.vill.kamikoani.akita.jp/",
      region: "北秋田郡",
    },
    // ── 山本郡 ──
    {
      name: "藤里町",
      slug: "fujisato",
      topUrl: "https://www.town.fujisato.akita.jp/",
      region: "山本郡",
    },
    {
      name: "三種町",
      slug: "mitane",
      topUrl: "https://www.town.mitane.akita.jp/",
      region: "山本郡",
    },
    { name: "八峰町", slug: "happo", topUrl: "https://www.town.happo.lg.jp/", region: "山本郡" },
    // ── 南秋田郡 ──
    {
      name: "五城目町",
      slug: "gojome",
      topUrl: "https://www.town.gojome.akita.jp/",
      region: "南秋田郡",
    },
    {
      name: "八郎潟町",
      slug: "hachirogata",
      topUrl: "https://www.town.hachirogata.akita.jp/",
      region: "南秋田郡",
    },
    {
      name: "井川町",
      slug: "ikawa",
      topUrl: "https://www.town.ikawa.akita.jp/",
      region: "南秋田郡",
    },
    {
      name: "大潟村",
      slug: "ogata",
      topUrl: "https://www.vill.ogata.akita.jp/",
      region: "南秋田郡",
    },
    // ── 仙北郡 ──
    {
      name: "美郷町",
      slug: "misato-a",
      topUrl: "https://www.town.misato.akita.jp/",
      region: "仙北郡",
    },
    // ── 雄勝郡 ──
    { name: "羽後町", slug: "ugo", topUrl: "https://www.town.ugo.lg.jp/", region: "雄勝郡" },
    {
      name: "東成瀬村",
      slug: "higashinaruse",
      topUrl: "https://www.higashinaruse.com/",
      region: "雄勝郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 山形県 (13市・19町・3村 = 35市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-yamagata": [
    // ── 市 (13) ──
    {
      name: "山形市",
      slug: "yamagata-city",
      topUrl: "https://www.city.yamagata-yamagata.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "鶴岡市", slug: "tsuruoka", topUrl: "https://www.city.tsuruoka.lg.jp/", region: "市" },
    { name: "酒田市", slug: "sakata", topUrl: "https://www.city.sakata.lg.jp/", region: "市" },
    {
      name: "米沢市",
      slug: "yonezawa",
      topUrl: "https://www.city.yonezawa.yamagata.jp/",
      region: "市",
    },
    { name: "天童市", slug: "tendo", topUrl: "https://www.city.tendo.yamagata.jp/", region: "市" },
    {
      name: "東根市",
      slug: "higashine",
      topUrl: "https://www.city.higashine.yamagata.jp/",
      region: "市",
    },
    {
      name: "新庄市",
      slug: "shinjo",
      topUrl: "https://www.city.shinjo.yamagata.jp/",
      region: "市",
    },
    {
      name: "寒河江市",
      slug: "sagae",
      topUrl: "https://www.city.sagae.yamagata.jp/",
      region: "市",
    },
    {
      name: "上山市",
      slug: "kaminoyama",
      topUrl: "https://www.city.kaminoyama.yamagata.jp/",
      region: "市",
    },
    { name: "南陽市", slug: "nanyo", topUrl: "https://www.city.nanyo.yamagata.jp/", region: "市" },
    { name: "長井市", slug: "nagai", topUrl: "https://www.city.nagai.yamagata.jp/", region: "市" },
    { name: "村山市", slug: "murayama", topUrl: "https://www.city.murayama.lg.jp/", region: "市" },
    {
      name: "尾花沢市",
      slug: "obanazawa",
      topUrl: "https://www.city.obanazawa.yamagata.jp/",
      region: "市",
    },
    // ── 東村山郡 ──
    {
      name: "山辺町",
      slug: "yamanobe",
      topUrl: "https://www.town.yamanobe.yamagata.jp/",
      region: "東村山郡",
    },
    {
      name: "中山町",
      slug: "nakayama-y",
      topUrl: "https://www.town.nakayama.yamagata.jp/",
      region: "東村山郡",
    },
    // ── 西村山郡 ──
    {
      name: "河北町",
      slug: "kahoku-y",
      topUrl: "https://www.town.kahoku.yamagata.jp/",
      region: "西村山郡",
    },
    {
      name: "西川町",
      slug: "nishikawa",
      topUrl: "https://www.town.nishikawa.yamagata.jp/",
      region: "西村山郡",
    },
    {
      name: "朝日町",
      slug: "asahi-y",
      topUrl: "https://www.town.asahi.yamagata.jp/",
      region: "西村山郡",
    },
    { name: "大江町", slug: "oe", topUrl: "https://www.town.oe.yamagata.jp/", region: "西村山郡" },
    // ── 北村山郡 ──
    {
      name: "大石田町",
      slug: "oishida",
      topUrl: "https://www.town.oishida.yamagata.jp/",
      region: "北村山郡",
    },
    // ── 最上郡 ──
    {
      name: "金山町",
      slug: "kaneyama-y",
      topUrl: "https://www.town.kaneyama.yamagata.jp/",
      region: "最上郡",
    },
    { name: "最上町", slug: "mogami", topUrl: "https://mogami-town.jp/", region: "最上郡" },
    {
      name: "舟形町",
      slug: "funagata",
      topUrl: "https://www.town.funagata.yamagata.jp/",
      region: "最上郡",
    },
    {
      name: "真室川町",
      slug: "mamurogawa",
      topUrl: "https://www.town.mamurogawa.yamagata.jp/",
      region: "最上郡",
    },
    {
      name: "大蔵村",
      slug: "okura",
      topUrl: "https://www.vill.okura.yamagata.jp/",
      region: "最上郡",
    },
    {
      name: "鮭川村",
      slug: "sakegawa",
      topUrl: "https://www.vill.sakegawa.yamagata.jp/",
      region: "最上郡",
    },
    {
      name: "戸沢村",
      slug: "tozawa",
      topUrl: "https://www.vill.tozawa.yamagata.jp/",
      region: "最上郡",
    },
    // ── 東置賜郡 ──
    {
      name: "高畠町",
      slug: "takahata",
      topUrl: "https://www.town.takahata.yamagata.jp/",
      region: "東置賜郡",
    },
    {
      name: "川西町",
      slug: "kawanishi-y",
      topUrl: "https://www.town.kawanishi.yamagata.jp/",
      region: "東置賜郡",
    },
    // ── 西置賜郡 ──
    {
      name: "小国町",
      slug: "oguni",
      topUrl: "https://www.town.oguni.yamagata.jp/",
      region: "西置賜郡",
    },
    {
      name: "白鷹町",
      slug: "shirataka",
      topUrl: "https://www.town.shirataka.lg.jp/",
      region: "西置賜郡",
    },
    {
      name: "飯豊町",
      slug: "iide",
      topUrl: "https://www.town.iide.yamagata.jp/",
      region: "西置賜郡",
    },
    // ── 東田川郡 ──
    {
      name: "三川町",
      slug: "mikawa-y",
      topUrl: "https://www.town.mikawa.yamagata.jp/",
      region: "東田川郡",
    },
    {
      name: "庄内町",
      slug: "shonai",
      topUrl: "https://www.town.shonai.yamagata.jp/",
      region: "東田川郡",
    },
    // ── 飽海郡 ──
    {
      name: "遊佐町",
      slug: "yuza",
      topUrl: "https://www.town.yuza.yamagata.jp/",
      region: "飽海郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 福島県 (13市・31町・15村 = 59市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-fukushima": [
    // ── 市 (13) ──
    {
      name: "福島市",
      slug: "fukushima-city",
      topUrl: "https://www.city.fukushima.fukushima.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "郡山市", slug: "koriyama", topUrl: "https://www.city.koriyama.lg.jp/", region: "市" },
    { name: "いわき市", slug: "iwaki", topUrl: "https://www.city.iwaki.lg.jp/", region: "市" },
    {
      name: "会津若松市",
      slug: "aizuwakamatsu",
      topUrl: "https://www.city.aizuwakamatsu.fukushima.jp/",
      region: "市",
    },
    {
      name: "須賀川市",
      slug: "sukagawa",
      topUrl: "https://www.city.sukagawa.fukushima.jp/",
      region: "市",
    },
    {
      name: "白河市",
      slug: "shirakawa",
      topUrl: "https://www.city.shirakawa.fukushima.jp/",
      region: "市",
    },
    {
      name: "喜多方市",
      slug: "kitakata",
      topUrl: "https://www.city.kitakata.fukushima.jp/",
      region: "市",
    },
    {
      name: "二本松市",
      slug: "nihonmatsu",
      topUrl: "https://www.city.nihonmatsu.lg.jp/",
      region: "市",
    },
    { name: "相馬市", slug: "soma", topUrl: "https://www.city.soma.fukushima.jp/", region: "市" },
    {
      name: "南相馬市",
      slug: "minamisoma",
      topUrl: "https://www.city.minamisoma.lg.jp/",
      region: "市",
    },
    { name: "田村市", slug: "tamura", topUrl: "https://www.city.tamura.lg.jp/", region: "市" },
    {
      name: "伊達市",
      slug: "date-f",
      topUrl: "https://www.city.fukushima-date.lg.jp/",
      region: "市",
    },
    { name: "本宮市", slug: "motomiya", topUrl: "https://www.city.motomiya.lg.jp/", region: "市" },
    // ── 伊達郡 ──
    {
      name: "桑折町",
      slug: "koori",
      topUrl: "https://www.town.koori.fukushima.jp/",
      region: "伊達郡",
    },
    {
      name: "国見町",
      slug: "kunimi",
      topUrl: "https://www.town.kunimi.fukushima.jp/",
      region: "伊達郡",
    },
    {
      name: "川俣町",
      slug: "kawamata",
      topUrl: "https://www.town.kawamata.lg.jp/",
      region: "伊達郡",
    },
    // ── 安達郡 ──
    {
      name: "大玉村",
      slug: "otama",
      topUrl: "https://www.vill.otama.fukushima.jp/",
      region: "安達郡",
    },
    // ── 岩瀬郡 ──
    {
      name: "鏡石町",
      slug: "kagamiishi",
      topUrl: "https://www.town.kagamiishi.fukushima.jp/",
      region: "岩瀬郡",
    },
    {
      name: "天栄村",
      slug: "tenei",
      topUrl: "https://www.vill.tenei.fukushima.jp/",
      region: "岩瀬郡",
    },
    // ── 南会津郡 ──
    {
      name: "下郷町",
      slug: "shimogo",
      topUrl: "https://www.town.shimogo.fukushima.jp/",
      region: "南会津郡",
    },
    {
      name: "檜枝岐村",
      slug: "hinoemata",
      topUrl: "https://www.vill.hinoemata.lg.jp/",
      region: "南会津郡",
    },
    {
      name: "只見町",
      slug: "tadami",
      topUrl: "https://www.town.tadami.lg.jp/",
      region: "南会津郡",
    },
    {
      name: "南会津町",
      slug: "minamiaizu",
      topUrl: "https://www.town.minamiaizu.fukushima.jp/",
      region: "南会津郡",
    },
    // ── 耶麻郡 ──
    {
      name: "北塩原村",
      slug: "kitashiobara",
      topUrl: "https://www.vill.kitashiobara.fukushima.jp/",
      region: "耶麻郡",
    },
    {
      name: "西会津町",
      slug: "nishiaizu",
      topUrl: "https://www.town.nishiaizu.fukushima.jp/",
      region: "耶麻郡",
    },
    {
      name: "磐梯町",
      slug: "bandai",
      topUrl: "https://www.town.bandai.fukushima.jp/",
      region: "耶麻郡",
    },
    {
      name: "猪苗代町",
      slug: "inawashiro",
      topUrl: "https://www.town.inawashiro.fukushima.jp/",
      region: "耶麻郡",
    },
    // ── 河沼郡 ──
    {
      name: "会津坂下町",
      slug: "aizubange",
      topUrl: "https://www.town.aizubange.fukushima.jp/",
      region: "河沼郡",
    },
    {
      name: "湯川村",
      slug: "yugawa",
      topUrl: "https://www.vill.yugawa.fukushima.jp/",
      region: "河沼郡",
    },
    {
      name: "柳津町",
      slug: "yanaizu",
      topUrl: "https://www.town.yanaizu.fukushima.jp/",
      region: "河沼郡",
    },
    // ── 大沼郡 ──
    {
      name: "三島町",
      slug: "mishima-f",
      topUrl: "https://www.town.mishima.fukushima.jp/",
      region: "大沼郡",
    },
    {
      name: "金山町",
      slug: "kaneyama-f",
      topUrl: "https://www.town.kaneyama.fukushima.jp/",
      region: "大沼郡",
    },
    {
      name: "昭和村",
      slug: "showa-f",
      topUrl: "https://www.vill.showa.fukushima.jp/",
      region: "大沼郡",
    },
    {
      name: "会津美里町",
      slug: "aizumisato",
      topUrl: "https://www.town.aizumisato.fukushima.jp/",
      region: "大沼郡",
    },
    // ── 西白河郡 ──
    {
      name: "西郷村",
      slug: "nishigo",
      topUrl: "https://www.vill.nishigo.fukushima.jp/",
      region: "西白河郡",
    },
    {
      name: "泉崎村",
      slug: "izumizaki",
      topUrl: "https://www.vill.izumizaki.fukushima.jp/",
      region: "西白河郡",
    },
    {
      name: "中島村",
      slug: "nakajima-f",
      topUrl: "https://www.vill.nakajima.fukushima.jp/",
      region: "西白河郡",
    },
    {
      name: "矢吹町",
      slug: "yabuki",
      topUrl: "https://www.town.yabuki.fukushima.jp/",
      region: "西白河郡",
    },
    // ── 東白川郡 ──
    {
      name: "棚倉町",
      slug: "tanagura",
      topUrl: "https://www.town.tanagura.fukushima.jp/",
      region: "東白川郡",
    },
    {
      name: "矢祭町",
      slug: "yamatsuri",
      topUrl: "https://www.town.yamatsuri.fukushima.jp/",
      region: "東白川郡",
    },
    {
      name: "塙町",
      slug: "hanawa-f",
      topUrl: "https://www.town.hanawa.fukushima.jp/",
      region: "東白川郡",
    },
    {
      name: "鮫川村",
      slug: "samegawa",
      topUrl: "https://www.vill.samegawa.fukushima.jp/",
      region: "東白川郡",
    },
    // ── 石川郡 ──
    {
      name: "石川町",
      slug: "ishikawa-f",
      topUrl: "https://www.town.ishikawa.fukushima.jp/",
      region: "石川郡",
    },
    {
      name: "玉川村",
      slug: "tamakawa",
      topUrl: "https://www.vill.tamakawa.fukushima.jp/",
      region: "石川郡",
    },
    {
      name: "平田村",
      slug: "hirata",
      topUrl: "https://www.vill.hirata.fukushima.jp/",
      region: "石川郡",
    },
    {
      name: "浅川町",
      slug: "asakawa",
      topUrl: "https://www.town.asakawa.fukushima.jp/",
      region: "石川郡",
    },
    {
      name: "古殿町",
      slug: "furudono",
      topUrl: "https://www.town.furudono.fukushima.jp/",
      region: "石川郡",
    },
    // ── 田村郡 ──
    {
      name: "三春町",
      slug: "miharu",
      topUrl: "https://www.town.miharu.fukushima.jp/",
      region: "田村郡",
    },
    {
      name: "小野町",
      slug: "ono-f",
      topUrl: "https://www.town.ono.fukushima.jp/",
      region: "田村郡",
    },
    // ── 双葉郡 ──
    {
      name: "広野町",
      slug: "hirono-f",
      topUrl: "https://www.town.hirono.fukushima.jp/",
      region: "双葉郡",
    },
    { name: "楢葉町", slug: "naraha", topUrl: "https://www.town.naraha.lg.jp/", region: "双葉郡" },
    {
      name: "富岡町",
      slug: "tomioka",
      topUrl: "https://www.town.tomioka.fukushima.jp/",
      region: "双葉郡",
    },
    { name: "川内村", slug: "kawauchi", topUrl: "https://www.kawauchimura.jp/", region: "双葉郡" },
    {
      name: "大熊町",
      slug: "okuma",
      topUrl: "https://www.town.okuma.fukushima.jp/",
      region: "双葉郡",
    },
    {
      name: "双葉町",
      slug: "futaba",
      topUrl: "https://www.town.futaba.fukushima.jp/",
      region: "双葉郡",
    },
    {
      name: "浪江町",
      slug: "namie",
      topUrl: "https://www.town.namie.fukushima.jp/",
      region: "双葉郡",
    },
    { name: "葛尾村", slug: "katsurao", topUrl: "https://www.katsurao.org/", region: "双葉郡" },
    // ── 相馬郡 ──
    { name: "新地町", slug: "shinchi", topUrl: "https://www.shinchi-town.jp/", region: "相馬郡" },
    {
      name: "飯舘村",
      slug: "iitate",
      topUrl: "https://www.vill.iitate.fukushima.jp/",
      region: "相馬郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 茨城県 (32市・10町・2村 = 44市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-ibaraki": [
    // ── 市 (32) ──
    {
      name: "水戸市",
      slug: "mito",
      topUrl: "https://www.city.mito.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "つくば市", slug: "tsukuba", topUrl: "https://www.city.tsukuba.lg.jp/", region: "市" },
    { name: "日立市", slug: "hitachi", topUrl: "https://www.city.hitachi.lg.jp/", region: "市" },
    {
      name: "ひたちなか市",
      slug: "hitachinaka",
      topUrl: "https://www.city.hitachinaka.lg.jp/",
      region: "市",
    },
    { name: "古河市", slug: "koga", topUrl: "https://www.city.ibaraki-koga.lg.jp/", region: "市" },
    {
      name: "土浦市",
      slug: "tsuchiura",
      topUrl: "https://www.city.tsuchiura.lg.jp/",
      region: "市",
    },
    { name: "取手市", slug: "toride", topUrl: "https://www.city.toride.ibaraki.jp/", region: "市" },
    { name: "筑西市", slug: "chikusei", topUrl: "https://www.city.chikusei.lg.jp/", region: "市" },
    { name: "神栖市", slug: "kamisu", topUrl: "https://www.city.kamisu.ibaraki.jp/", region: "市" },
    { name: "牛久市", slug: "ushiku", topUrl: "https://www.city.ushiku.lg.jp/", region: "市" },
    {
      name: "龍ケ崎市",
      slug: "ryugasaki",
      topUrl: "https://www.city.ryugasaki.ibaraki.jp/",
      region: "市",
    },
    { name: "笠間市", slug: "kasama", topUrl: "https://www.city.kasama.lg.jp/", region: "市" },
    { name: "石岡市", slug: "ishioka", topUrl: "https://www.city.ishioka.lg.jp/", region: "市" },
    {
      name: "鹿嶋市",
      slug: "kashima-i",
      topUrl: "https://www.city.ibaraki-kashima.lg.jp/",
      region: "市",
    },
    { name: "守谷市", slug: "moriya", topUrl: "https://www.city.moriya.ibaraki.jp/", region: "市" },
    { name: "常総市", slug: "joso", topUrl: "https://www.city.joso.lg.jp/", region: "市" },
    { name: "那珂市", slug: "naka", topUrl: "https://www.city.naka.lg.jp/", region: "市" },
    { name: "坂東市", slug: "bando", topUrl: "https://www.city.bando.lg.jp/", region: "市" },
    {
      name: "常陸太田市",
      slug: "hitachiota",
      topUrl: "https://www.city.hitachiota.ibaraki.jp/",
      region: "市",
    },
    { name: "結城市", slug: "yuki", topUrl: "https://www.city.yuki.lg.jp/", region: "市" },
    { name: "小美玉市", slug: "omitama", topUrl: "https://www.city.omitama.lg.jp/", region: "市" },
    {
      name: "つくばみらい市",
      slug: "tsukubamirai",
      topUrl: "https://www.city.tsukubamirai.lg.jp/",
      region: "市",
    },
    {
      name: "下妻市",
      slug: "shimotsuma",
      topUrl: "https://www.city.shimotsuma.lg.jp/",
      region: "市",
    },
    {
      name: "北茨城市",
      slug: "kitaibaraki",
      topUrl: "https://www.city.kitaibaraki.lg.jp/",
      region: "市",
    },
    { name: "稲敷市", slug: "inashiki", topUrl: "https://www.city.inashiki.lg.jp/", region: "市" },
    {
      name: "桜川市",
      slug: "sakuragawa",
      topUrl: "https://www.city.sakuragawa.lg.jp/",
      region: "市",
    },
    {
      name: "高萩市",
      slug: "takahagi",
      topUrl: "https://www.city.takahagi.ibaraki.jp/",
      region: "市",
    },
    { name: "潮来市", slug: "itako", topUrl: "https://www.city.itako.lg.jp/", region: "市" },
    {
      name: "常陸大宮市",
      slug: "hitachiomiya",
      topUrl: "https://www.city.hitachiomiya.lg.jp/",
      region: "市",
    },
    {
      name: "かすみがうら市",
      slug: "kasumigaura",
      topUrl: "https://www.city.kasumigaura.lg.jp/",
      region: "市",
    },
    {
      name: "行方市",
      slug: "namegata",
      topUrl: "https://www.city.namegata.ibaraki.jp/",
      region: "市",
    },
    { name: "鉾田市", slug: "hokota", topUrl: "https://www.city.hokota.lg.jp/", region: "市" },
    // ── 東茨城郡 ──
    {
      name: "茨城町",
      slug: "ibaraki-machi",
      topUrl: "https://www.town.ibaraki.lg.jp/",
      region: "東茨城郡",
    },
    { name: "大洗町", slug: "oarai", topUrl: "https://www.town.oarai.lg.jp/", region: "東茨城郡" },
    {
      name: "城里町",
      slug: "shirosato",
      topUrl: "https://www.town.shirosato.lg.jp/",
      region: "東茨城郡",
    },
    // ── 那珂郡 ──
    {
      name: "東海村",
      slug: "tokai",
      topUrl: "https://www.vill.tokai.ibaraki.jp/",
      region: "那珂郡",
    },
    // ── 久慈郡 ──
    {
      name: "大子町",
      slug: "daigo",
      topUrl: "https://www.town.daigo.ibaraki.jp/",
      region: "久慈郡",
    },
    // ── 稲敷郡 ──
    { name: "美浦村", slug: "miho", topUrl: "https://www.vill.miho.lg.jp/", region: "稲敷郡" },
    { name: "阿見町", slug: "ami", topUrl: "https://www.town.ami.lg.jp/", region: "稲敷郡" },
    {
      name: "河内町",
      slug: "kawachi-i",
      topUrl: "https://www.town.ibaraki-kawachi.lg.jp/",
      region: "稲敷郡",
    },
    // ── 結城郡 ──
    {
      name: "八千代町",
      slug: "yachiyo-i",
      topUrl: "https://www.town.ibaraki-yachiyo.lg.jp/",
      region: "結城郡",
    },
    // ── 猿島郡 ──
    { name: "五霞町", slug: "goka", topUrl: "https://www.town.goka.lg.jp/", region: "猿島郡" },
    {
      name: "境町",
      slug: "sakai-i",
      topUrl: "https://www.town.sakai.ibaraki.jp/",
      region: "猿島郡",
    },
    // ── 北相馬郡 ──
    {
      name: "利根町",
      slug: "tone",
      topUrl: "https://www.town.tone.ibaraki.jp/",
      region: "北相馬郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 栃木県 (14市・11町 = 25市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-tochigi": [
    // ── 市 (14) ──
    {
      name: "宇都宮市",
      slug: "utsunomiya",
      topUrl: "https://www.city.utsunomiya.tochigi.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "小山市", slug: "oyama", topUrl: "https://www.city.oyama.tochigi.jp/", region: "市" },
    {
      name: "足利市",
      slug: "ashikaga",
      topUrl: "https://www.city.ashikaga.tochigi.jp/",
      region: "市",
    },
    {
      name: "栃木市",
      slug: "tochigi-city",
      topUrl: "https://www.city.tochigi.lg.jp/",
      region: "市",
    },
    { name: "佐野市", slug: "sano", topUrl: "https://www.city.sano.lg.jp/", region: "市" },
    {
      name: "那須塩原市",
      slug: "nasushiobara",
      topUrl: "https://www.city.nasushiobara.lg.jp/",
      region: "市",
    },
    { name: "鹿沼市", slug: "kanuma", topUrl: "https://www.city.kanuma.tochigi.jp/", region: "市" },
    { name: "日光市", slug: "nikko", topUrl: "https://www.city.nikko.lg.jp/", region: "市" },
    { name: "真岡市", slug: "moka", topUrl: "https://www.city.moka.lg.jp/", region: "市" },
    {
      name: "大田原市",
      slug: "ohtawara",
      topUrl: "https://www.city.ohtawara.tochigi.jp/",
      region: "市",
    },
    {
      name: "下野市",
      slug: "shimotsuke",
      topUrl: "https://www.city.shimotsuke.lg.jp/",
      region: "市",
    },
    {
      name: "さくら市",
      slug: "sakura-t",
      topUrl: "https://www.city.tochigi-sakura.lg.jp/",
      region: "市",
    },
    { name: "矢板市", slug: "yaita", topUrl: "https://www.city.yaita.tochigi.jp/", region: "市" },
    {
      name: "那須烏山市",
      slug: "nasukarasuyama",
      topUrl: "https://www.city.nasukarasuyama.lg.jp/",
      region: "市",
    },
    // ── 河内郡 ──
    {
      name: "上三川町",
      slug: "kaminokawa",
      topUrl: "https://www.town.kaminokawa.lg.jp/",
      region: "河内郡",
    },
    // ── 芳賀郡 ──
    {
      name: "益子町",
      slug: "mashiko",
      topUrl: "https://www.town.mashiko.tochigi.jp/",
      region: "芳賀郡",
    },
    {
      name: "茂木町",
      slug: "motegi",
      topUrl: "https://www.town.motegi.tochigi.jp/",
      region: "芳賀郡",
    },
    {
      name: "市貝町",
      slug: "ichikai",
      topUrl: "https://www.town.ichikai.tochigi.jp/",
      region: "芳賀郡",
    },
    { name: "芳賀町", slug: "haga", topUrl: "https://www.town.haga.tochigi.jp/", region: "芳賀郡" },
    // ── 下都賀郡 ──
    {
      name: "壬生町",
      slug: "mibu",
      topUrl: "https://www.town.mibu.tochigi.jp/",
      region: "下都賀郡",
    },
    { name: "野木町", slug: "nogi", topUrl: "https://www.town.nogi.lg.jp/", region: "下都賀郡" },
    // ── 塩谷郡 ──
    {
      name: "塩谷町",
      slug: "shioya",
      topUrl: "https://www.town.shioya.tochigi.jp/",
      region: "塩谷郡",
    },
    {
      name: "高根沢町",
      slug: "takanezawa",
      topUrl: "https://www.town.takanezawa.tochigi.jp/",
      region: "塩谷郡",
    },
    // ── 那須郡 ──
    { name: "那須町", slug: "nasu", topUrl: "https://www.town.nasu.lg.jp/", region: "那須郡" },
    {
      name: "那珂川町",
      slug: "nakagawa-t",
      topUrl: "https://www.town.tochigi-nakagawa.lg.jp/",
      region: "那須郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 群馬県 (12市・15町・8村 = 35市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-gunma": [
    // ── 市 (12) ──
    {
      name: "前橋市",
      slug: "maebashi",
      topUrl: "https://www.city.maebashi.gunma.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "高崎市",
      slug: "takasaki",
      topUrl: "https://www.city.takasaki.gunma.jp/",
      region: "市",
    },
    { name: "太田市", slug: "ota", topUrl: "https://www.city.ota.gunma.jp/", region: "市" },
    { name: "伊勢崎市", slug: "isesaki", topUrl: "https://www.city.isesaki.lg.jp/", region: "市" },
    { name: "桐生市", slug: "kiryu", topUrl: "https://www.city.kiryu.lg.jp/", region: "市" },
    {
      name: "館林市",
      slug: "tatebayashi",
      topUrl: "https://www.city.tatebayashi.gunma.jp/",
      region: "市",
    },
    {
      name: "渋川市",
      slug: "shibukawa",
      topUrl: "https://www.city.shibukawa.lg.jp/",
      region: "市",
    },
    { name: "藤岡市", slug: "fujioka", topUrl: "https://www.city.fujioka.gunma.jp/", region: "市" },
    { name: "安中市", slug: "annaka", topUrl: "https://www.city.annaka.lg.jp/", region: "市" },
    { name: "みどり市", slug: "midori", topUrl: "https://www.city.midori.gunma.jp/", region: "市" },
    { name: "富岡市", slug: "tomioka-g", topUrl: "https://www.city.tomioka.lg.jp/", region: "市" },
    { name: "沼田市", slug: "numata", topUrl: "https://www.city.numata.gunma.jp/", region: "市" },
    // ── 北群馬郡 ──
    {
      name: "榛東村",
      slug: "shinto",
      topUrl: "https://www.vill.shinto.gunma.jp/",
      region: "北群馬郡",
    },
    {
      name: "吉岡町",
      slug: "yoshioka",
      topUrl: "https://www.town.yoshioka.gunma.jp/",
      region: "北群馬郡",
    },
    // ── 多野郡 ──
    { name: "上野村", slug: "ueno-g", topUrl: "https://www.uenomura.jp/", region: "多野郡" },
    { name: "神流町", slug: "kanna", topUrl: "https://www.town.kanna.gunma.jp/", region: "多野郡" },
    // ── 甘楽郡 ──
    {
      name: "下仁田町",
      slug: "shimonita",
      topUrl: "https://www.town.shimonita.lg.jp/",
      region: "甘楽郡",
    },
    { name: "南牧村", slug: "nanmoku", topUrl: "https://www.nanmoku.ne.jp/", region: "甘楽郡" },
    { name: "甘楽町", slug: "kanra", topUrl: "https://www.town.kanra.lg.jp/", region: "甘楽郡" },
    // ── 吾妻郡 ──
    {
      name: "中之条町",
      slug: "nakanojo",
      topUrl: "https://www.town.nakanojo.gunma.jp/",
      region: "吾妻郡",
    },
    {
      name: "長野原町",
      slug: "naganohara",
      topUrl: "https://www.town.naganohara.gunma.jp/",
      region: "吾妻郡",
    },
    {
      name: "嬬恋村",
      slug: "tsumagoi",
      topUrl: "https://www.vill.tsumagoi.gunma.jp/",
      region: "吾妻郡",
    },
    {
      name: "草津町",
      slug: "kusatsu-g",
      topUrl: "https://www.town.kusatsu.gunma.jp/",
      region: "吾妻郡",
    },
    {
      name: "高山村",
      slug: "takayama-g",
      topUrl: "https://www.vill.takayama.gunma.jp/",
      region: "吾妻郡",
    },
    {
      name: "東吾妻町",
      slug: "higashiagatsuma",
      topUrl: "https://www.town.higashiagatsuma.gunma.jp/",
      region: "吾妻郡",
    },
    // ── 利根郡 ──
    {
      name: "片品村",
      slug: "katashina",
      topUrl: "https://www.vill.katashina.gunma.jp/",
      region: "利根郡",
    },
    {
      name: "川場村",
      slug: "kawaba",
      topUrl: "https://www.vill.kawaba.gunma.jp/",
      region: "利根郡",
    },
    {
      name: "昭和村",
      slug: "showa-g",
      topUrl: "https://www.vill.showa.gunma.jp/",
      region: "利根郡",
    },
    {
      name: "みなかみ町",
      slug: "minakami",
      topUrl: "https://www.town.minakami.gunma.jp/",
      region: "利根郡",
    },
    // ── 佐波郡 ──
    {
      name: "玉村町",
      slug: "tamamura",
      topUrl: "https://www.town.tamamura.lg.jp/",
      region: "佐波郡",
    },
    // ── 邑楽郡 ──
    {
      name: "板倉町",
      slug: "itakura",
      topUrl: "https://www.town.itakura.gunma.jp/",
      region: "邑楽郡",
    },
    {
      name: "明和町",
      slug: "meiwa-g",
      topUrl: "https://www.town.meiwa.gunma.jp/",
      region: "邑楽郡",
    },
    {
      name: "千代田町",
      slug: "chiyoda-g",
      topUrl: "https://www.town.chiyoda.gunma.jp/",
      region: "邑楽郡",
    },
    {
      name: "大泉町",
      slug: "oizumi",
      topUrl: "https://www.town.oizumi.gunma.jp/",
      region: "邑楽郡",
    },
    { name: "邑楽町", slug: "ora", topUrl: "https://www.town.ora.gunma.jp/", region: "邑楽郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 埼玉県 (40市・22町・1村 = 63市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-saitama": [
    // ── 市 (40) ──
    {
      name: "さいたま市",
      slug: "saitama-city",
      topUrl: "https://www.city.saitama.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "川越市",
      slug: "kawagoe",
      topUrl: "https://www.city.kawagoe.saitama.jp/",
      region: "市",
    },
    {
      name: "川口市",
      slug: "kawaguchi",
      topUrl: "https://www.city.kawaguchi.lg.jp/",
      region: "市",
    },
    {
      name: "越谷市",
      slug: "koshigaya",
      topUrl: "https://www.city.koshigaya.saitama.jp/",
      region: "市",
    },
    {
      name: "所沢市",
      slug: "tokorozawa",
      topUrl: "https://www.city.tokorozawa.saitama.jp/",
      region: "市",
    },
    {
      name: "春日部市",
      slug: "kasukabe",
      topUrl: "https://www.city.kasukabe.lg.jp/",
      region: "市",
    },
    { name: "草加市", slug: "soka", topUrl: "https://www.city.soka.saitama.jp/", region: "市" },
    { name: "上尾市", slug: "ageo", topUrl: "https://www.city.ageo.lg.jp/", region: "市" },
    { name: "熊谷市", slug: "kumagaya", topUrl: "https://www.city.kumagaya.lg.jp/", region: "市" },
    { name: "新座市", slug: "niiza", topUrl: "https://www.city.niiza.lg.jp/", region: "市" },
    { name: "狭山市", slug: "sayama", topUrl: "https://www.city.sayama.saitama.jp/", region: "市" },
    { name: "久喜市", slug: "kuki", topUrl: "https://www.city.kuki.lg.jp/", region: "市" },
    { name: "入間市", slug: "iruma", topUrl: "https://www.city.iruma.saitama.jp/", region: "市" },
    { name: "深谷市", slug: "fukaya", topUrl: "https://www.city.fukaya.saitama.jp/", region: "市" },
    { name: "三郷市", slug: "misato-s", topUrl: "https://www.city.misato.lg.jp/", region: "市" },
    { name: "朝霞市", slug: "asaka", topUrl: "https://www.city.asaka.lg.jp/", region: "市" },
    { name: "戸田市", slug: "toda", topUrl: "https://www.city.toda.saitama.jp/", region: "市" },
    {
      name: "鴻巣市",
      slug: "kounosu",
      topUrl: "https://www.city.kounosu.saitama.jp/",
      region: "市",
    },
    { name: "加須市", slug: "kazo", topUrl: "https://www.city.kazo.lg.jp/", region: "市" },
    {
      name: "富士見市",
      slug: "fujimi",
      topUrl: "https://www.city.fujimi.saitama.jp/",
      region: "市",
    },
    {
      name: "ふじみ野市",
      slug: "fujimino",
      topUrl: "https://www.city.fujimino.saitama.jp/",
      region: "市",
    },
    { name: "坂戸市", slug: "sakado", topUrl: "https://www.city.sakado.lg.jp/", region: "市" },
    {
      name: "東松山市",
      slug: "higashimatsuyama",
      topUrl: "https://www.city.higashimatsuyama.lg.jp/",
      region: "市",
    },
    { name: "八潮市", slug: "yashio", topUrl: "https://www.city.yashio.lg.jp/", region: "市" },
    { name: "行田市", slug: "gyoda", topUrl: "https://www.city.gyoda.lg.jp/", region: "市" },
    { name: "飯能市", slug: "hanno", topUrl: "https://www.city.hanno.lg.jp/", region: "市" },
    { name: "本庄市", slug: "honjo", topUrl: "https://www.city.honjo.lg.jp/", region: "市" },
    { name: "志木市", slug: "shiki", topUrl: "https://www.city.shiki.lg.jp/", region: "市" },
    { name: "和光市", slug: "wako", topUrl: "https://www.city.wako.lg.jp/", region: "市" },
    { name: "桶川市", slug: "okegawa", topUrl: "https://www.city.okegawa.lg.jp/", region: "市" },
    { name: "北本市", slug: "kitamoto", topUrl: "https://www.city.kitamoto.lg.jp/", region: "市" },
    { name: "蕨市", slug: "warabi", topUrl: "https://www.city.warabi.saitama.jp/", region: "市" },
    { name: "秩父市", slug: "chichibu", topUrl: "https://www.city.chichibu.lg.jp/", region: "市" },
    { name: "日高市", slug: "hidaka-s", topUrl: "https://www.city.hidaka.lg.jp/", region: "市" },
    {
      name: "吉川市",
      slug: "yoshikawa",
      topUrl: "https://www.city.yoshikawa.saitama.jp/",
      region: "市",
    },
    { name: "蓮田市", slug: "hasuda", topUrl: "https://www.city.hasuda.saitama.jp/", region: "市" },
    { name: "幸手市", slug: "satte", topUrl: "https://www.city.satte.lg.jp/", region: "市" },
    { name: "白岡市", slug: "shiraoka", topUrl: "https://www.city.shiraoka.lg.jp/", region: "市" },
    { name: "羽生市", slug: "hanyu", topUrl: "https://www.city.hanyu.lg.jp/", region: "市" },
    {
      name: "鶴ヶ島市",
      slug: "tsurugashima",
      topUrl: "https://www.city.tsurugashima.lg.jp/",
      region: "市",
    },
    // ── 北足立郡 ──
    {
      name: "伊奈町",
      slug: "ina-s",
      topUrl: "https://www.town.saitama-ina.lg.jp/",
      region: "北足立郡",
    },
    // ── 入間郡 ──
    {
      name: "三芳町",
      slug: "miyoshi-s",
      topUrl: "https://www.town.saitama-miyoshi.lg.jp/",
      region: "入間郡",
    },
    {
      name: "毛呂山町",
      slug: "moroyama",
      topUrl: "https://www.town.moroyama.saitama.jp/",
      region: "入間郡",
    },
    {
      name: "越生町",
      slug: "ogose",
      topUrl: "https://www.town.ogose.saitama.jp/",
      region: "入間郡",
    },
    // ── 比企郡 ──
    {
      name: "滑川町",
      slug: "namegawa",
      topUrl: "https://www.town.namegawa.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "嵐山町",
      slug: "ranzan",
      topUrl: "https://www.town.ranzan.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "小川町",
      slug: "ogawa-s",
      topUrl: "https://www.town.ogawa.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "川島町",
      slug: "kawajima",
      topUrl: "https://www.town.kawajima.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "吉見町",
      slug: "yoshimi",
      topUrl: "https://www.town.yoshimi.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "鳩山町",
      slug: "hatoyama",
      topUrl: "https://www.town.hatoyama.saitama.jp/",
      region: "比企郡",
    },
    {
      name: "ときがわ町",
      slug: "tokigawa",
      topUrl: "https://www.town.tokigawa.lg.jp/",
      region: "比企郡",
    },
    // ── 秩父郡 ──
    {
      name: "横瀬町",
      slug: "yokoze",
      topUrl: "https://www.town.yokoze.saitama.jp/",
      region: "秩父郡",
    },
    {
      name: "皆野町",
      slug: "minano",
      topUrl: "https://www.town.minano.saitama.jp/",
      region: "秩父郡",
    },
    {
      name: "長瀞町",
      slug: "nagatoro",
      topUrl: "https://www.town.nagatoro.saitama.jp/",
      region: "秩父郡",
    },
    { name: "小鹿野町", slug: "ogano", topUrl: "https://www.town.ogano.lg.jp/", region: "秩父郡" },
    {
      name: "東秩父村",
      slug: "higashichichibu",
      topUrl: "https://www.vill.higashichichibu.saitama.jp/",
      region: "秩父郡",
    },
    // ── 児玉郡 ──
    {
      name: "美里町",
      slug: "misato-ss",
      topUrl: "https://www.town.saitama-misato.lg.jp/",
      region: "児玉郡",
    },
    {
      name: "神川町",
      slug: "kamikawa-s",
      topUrl: "https://www.town.kamikawa.saitama.jp/",
      region: "児玉郡",
    },
    {
      name: "上里町",
      slug: "kamisato",
      topUrl: "https://www.town.kamisato.saitama.jp/",
      region: "児玉郡",
    },
    // ── 大里郡 ──
    {
      name: "寄居町",
      slug: "yorii",
      topUrl: "https://www.town.yorii.saitama.jp/",
      region: "大里郡",
    },
    // ── 南埼玉郡 ──
    {
      name: "宮代町",
      slug: "miyashiro",
      topUrl: "https://www.town.miyashiro.lg.jp/",
      region: "南埼玉郡",
    },
    // ── 北葛飾郡 ──
    {
      name: "杉戸町",
      slug: "sugito",
      topUrl: "https://www.town.sugito.lg.jp/",
      region: "北葛飾郡",
    },
    {
      name: "松伏町",
      slug: "matsubushi",
      topUrl: "https://www.town.matsubushi.lg.jp/",
      region: "北葛飾郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 千葉県 (37市・16町・1村 = 54市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-chiba": [
    // ── 市 (37) ──
    {
      name: "千葉市",
      slug: "chiba-city",
      topUrl: "https://www.city.chiba.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "船橋市",
      slug: "funabashi",
      topUrl: "https://www.city.funabashi.lg.jp/",
      region: "市",
    },
    { name: "柏市", slug: "kashiwa", topUrl: "https://www.city.kashiwa.lg.jp/", region: "市" },
    { name: "松戸市", slug: "matsudo", topUrl: "https://www.city.matsudo.chiba.jp/", region: "市" },
    { name: "市川市", slug: "ichikawa", topUrl: "https://www.city.ichikawa.lg.jp/", region: "市" },
    {
      name: "市原市",
      slug: "ichihara",
      topUrl: "https://www.city.ichihara.chiba.jp/",
      region: "市",
    },
    { name: "八千代市", slug: "yachiyo", topUrl: "https://www.city.yachiyo.lg.jp/", region: "市" },
    {
      name: "流山市",
      slug: "nagareyama",
      topUrl: "https://www.city.nagareyama.chiba.jp/",
      region: "市",
    },
    { name: "佐倉市", slug: "sakura-c", topUrl: "https://www.city.sakura.lg.jp/", region: "市" },
    {
      name: "習志野市",
      slug: "narashino",
      topUrl: "https://www.city.narashino.lg.jp/",
      region: "市",
    },
    { name: "浦安市", slug: "urayasu", topUrl: "https://www.city.urayasu.lg.jp/", region: "市" },
    { name: "野田市", slug: "noda", topUrl: "https://www.city.noda.chiba.jp/", region: "市" },
    {
      name: "木更津市",
      slug: "kisarazu",
      topUrl: "https://www.city.kisarazu.lg.jp/",
      region: "市",
    },
    { name: "我孫子市", slug: "abiko", topUrl: "https://www.city.abiko.chiba.jp/", region: "市" },
    { name: "成田市", slug: "narita", topUrl: "https://www.city.narita.chiba.jp/", region: "市" },
    {
      name: "鎌ケ谷市",
      slug: "kamagaya",
      topUrl: "https://www.city.kamagaya.chiba.jp/",
      region: "市",
    },
    { name: "印西市", slug: "inzai", topUrl: "https://www.city.inzai.lg.jp/", region: "市" },
    {
      name: "四街道市",
      slug: "yotsukaido",
      topUrl: "https://www.city.yotsukaido.chiba.jp/",
      region: "市",
    },
    { name: "君津市", slug: "kimitsu", topUrl: "https://www.city.kimitsu.lg.jp/", region: "市" },
    {
      name: "袖ケ浦市",
      slug: "sodegaura",
      topUrl: "https://www.city.sodegaura.lg.jp/",
      region: "市",
    },
    { name: "白井市", slug: "shiroi", topUrl: "https://www.city.shiroi.chiba.jp/", region: "市" },
    { name: "富津市", slug: "futtsu", topUrl: "https://www.city.futtsu.lg.jp/", region: "市" },
    { name: "茂原市", slug: "mobara", topUrl: "https://www.city.mobara.chiba.jp/", region: "市" },
    { name: "東金市", slug: "togane", topUrl: "https://www.city.togane.chiba.jp/", region: "市" },
    { name: "旭市", slug: "asahi-c", topUrl: "https://www.city.asahi.lg.jp/", region: "市" },
    { name: "銚子市", slug: "choshi", topUrl: "https://www.city.choshi.chiba.jp/", region: "市" },
    { name: "匝瑳市", slug: "sosa", topUrl: "https://www.city.sosa.lg.jp/", region: "市" },
    { name: "香取市", slug: "katori", topUrl: "https://www.city.katori.lg.jp/", region: "市" },
    { name: "山武市", slug: "sammu", topUrl: "https://www.city.sammu.lg.jp/", region: "市" },
    { name: "いすみ市", slug: "isumi", topUrl: "https://www.city.isumi.lg.jp/", region: "市" },
    {
      name: "大網白里市",
      slug: "oamishirasato",
      topUrl: "https://www.city.oamishirasato.lg.jp/",
      region: "市",
    },
    {
      name: "館山市",
      slug: "tateyama",
      topUrl: "https://www.city.tateyama.chiba.jp/",
      region: "市",
    },
    { name: "鴨川市", slug: "kamogawa", topUrl: "https://www.city.kamogawa.lg.jp/", region: "市" },
    {
      name: "南房総市",
      slug: "minamiboso",
      topUrl: "https://www.city.minamiboso.chiba.jp/",
      region: "市",
    },
    { name: "勝浦市", slug: "katsuura", topUrl: "https://www.city.katsuura.lg.jp/", region: "市" },
    { name: "富里市", slug: "tomisato", topUrl: "https://www.city.tomisato.lg.jp/", region: "市" },
    {
      name: "八街市",
      slug: "yachimata",
      topUrl: "https://www.city.yachimata.lg.jp/",
      region: "市",
    },
    // ── 印旛郡 ──
    {
      name: "酒々井町",
      slug: "shisui",
      topUrl: "https://www.town.shisui.chiba.jp/",
      region: "印旛郡",
    },
    { name: "栄町", slug: "sakae-c", topUrl: "https://www.town.sakae.chiba.jp/", region: "印旛郡" },
    // ── 香取郡 ──
    {
      name: "神崎町",
      slug: "kozaki",
      topUrl: "https://www.town.kozaki.chiba.jp/",
      region: "香取郡",
    },
    { name: "多古町", slug: "tako", topUrl: "https://www.town.tako.chiba.jp/", region: "香取郡" },
    { name: "東庄町", slug: "tosho", topUrl: "https://www.town.tosho.chiba.jp/", region: "香取郡" },
    // ── 山武郡 ──
    {
      name: "九十九里町",
      slug: "kujukuri",
      topUrl: "https://www.town.kujukuri.chiba.jp/",
      region: "山武郡",
    },
    {
      name: "芝山町",
      slug: "shibayama",
      topUrl: "https://www.town.shibayama.lg.jp/",
      region: "山武郡",
    },
    {
      name: "横芝光町",
      slug: "yokoshibahikari",
      topUrl: "https://www.town.yokoshibahikari.chiba.jp/",
      region: "山武郡",
    },
    // ── 長生郡 ──
    {
      name: "一宮町",
      slug: "ichinomiya-c",
      topUrl: "https://www.town.ichinomiya.chiba.jp/",
      region: "長生郡",
    },
    {
      name: "睦沢町",
      slug: "mutsuzawa",
      topUrl: "https://www.town.mutsuzawa.chiba.jp/",
      region: "長生郡",
    },
    {
      name: "長生村",
      slug: "chosei",
      topUrl: "https://www.vill.chosei.chiba.jp/",
      region: "長生郡",
    },
    {
      name: "白子町",
      slug: "shirako",
      topUrl: "https://www.town.shirako.lg.jp/",
      region: "長生郡",
    },
    {
      name: "長柄町",
      slug: "nagara",
      topUrl: "https://www.town.nagara.chiba.jp/",
      region: "長生郡",
    },
    {
      name: "長南町",
      slug: "chonan",
      topUrl: "https://www.town.chonan.chiba.jp/",
      region: "長生郡",
    },
    // ── 夷隅郡 ──
    {
      name: "大多喜町",
      slug: "otaki",
      topUrl: "https://www.town.otaki.chiba.jp/",
      region: "夷隅郡",
    },
    {
      name: "御宿町",
      slug: "onjuku",
      topUrl: "https://www.town.onjuku.chiba.jp/",
      region: "夷隅郡",
    },
    // ── 安房郡 ──
    {
      name: "鋸南町",
      slug: "kyonan",
      topUrl: "https://www.town.kyonan.chiba.jp/",
      region: "安房郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 東京都 (23区・26市・5町・8村 = 62市区町村)
  // ※島しょ部の町村を含む
  // ═══════════════════════════════════════════════════════════
  "jorei-tokyo": [
    // ── 23特別区 ──
    {
      name: "千代田区",
      slug: "chiyoda",
      topUrl: "https://www.city.chiyoda.lg.jp/",
      region: "23特別区",
    },
    { name: "中央区", slug: "chuo", topUrl: "https://www.city.chuo.lg.jp/", region: "23特別区" },
    {
      name: "港区",
      slug: "minato",
      topUrl: "https://www.city.minato.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "新宿区",
      slug: "shinjuku",
      topUrl: "https://www.city.shinjuku.lg.jp/",
      isCapital: true,
      region: "23特別区",
    },
    {
      name: "文京区",
      slug: "bunkyo",
      topUrl: "https://www.city.bunkyo.lg.jp/",
      region: "23特別区",
    },
    { name: "台東区", slug: "taito", topUrl: "https://www.city.taito.lg.jp/", region: "23特別区" },
    {
      name: "墨田区",
      slug: "sumida",
      topUrl: "https://www.city.sumida.lg.jp/",
      region: "23特別区",
    },
    { name: "江東区", slug: "koto", topUrl: "https://www.city.koto.lg.jp/", region: "23特別区" },
    {
      name: "品川区",
      slug: "shinagawa",
      topUrl: "https://www.city.shinagawa.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "目黒区",
      slug: "meguro",
      topUrl: "https://www.city.meguro.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "大田区",
      slug: "ota-ku",
      topUrl: "https://www.city.ota.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "世田谷区",
      slug: "setagaya",
      topUrl: "https://www.city.setagaya.lg.jp/",
      region: "23特別区",
    },
    {
      name: "渋谷区",
      slug: "shibuya",
      topUrl: "https://www.city.shibuya.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "中野区",
      slug: "nakano",
      topUrl: "https://www.city.tokyo-nakano.lg.jp/",
      region: "23特別区",
    },
    {
      name: "杉並区",
      slug: "suginami",
      topUrl: "https://www.city.suginami.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "豊島区",
      slug: "toshima",
      topUrl: "https://www.city.toshima.lg.jp/",
      region: "23特別区",
    },
    { name: "北区", slug: "kita", topUrl: "https://www.city.kita.tokyo.jp/", region: "23特別区" },
    {
      name: "荒川区",
      slug: "arakawa",
      topUrl: "https://www.city.arakawa.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "板橋区",
      slug: "itabashi",
      topUrl: "https://www.city.itabashi.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "練馬区",
      slug: "nerima",
      topUrl: "https://www.city.nerima.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "足立区",
      slug: "adachi",
      topUrl: "https://www.city.adachi.tokyo.jp/",
      region: "23特別区",
    },
    {
      name: "葛飾区",
      slug: "katsushika",
      topUrl: "https://www.city.katsushika.lg.jp/",
      region: "23特別区",
    },
    {
      name: "江戸川区",
      slug: "edogawa",
      topUrl: "https://www.city.edogawa.tokyo.jp/",
      region: "23特別区",
    },
    // ── 市 (26) ──
    {
      name: "八王子市",
      slug: "hachioji",
      topUrl: "https://www.city.hachioji.tokyo.jp/",
      region: "市",
    },
    { name: "町田市", slug: "machida", topUrl: "https://www.city.machida.tokyo.jp/", region: "市" },
    { name: "府中市", slug: "fuchu", topUrl: "https://www.city.fuchu.tokyo.jp/", region: "市" },
    { name: "調布市", slug: "chofu", topUrl: "https://www.city.chofu.tokyo.jp/", region: "市" },
    {
      name: "西東京市",
      slug: "nishitokyo",
      topUrl: "https://www.city.nishitokyo.lg.jp/",
      region: "市",
    },
    { name: "小平市", slug: "kodaira", topUrl: "https://www.city.kodaira.tokyo.jp/", region: "市" },
    { name: "三鷹市", slug: "mitaka", topUrl: "https://www.city.mitaka.lg.jp/", region: "市" },
    { name: "日野市", slug: "hino", topUrl: "https://www.city.hino.lg.jp/", region: "市" },
    {
      name: "立川市",
      slug: "tachikawa",
      topUrl: "https://www.city.tachikawa.lg.jp/",
      region: "市",
    },
    {
      name: "東村山市",
      slug: "higashimurayama",
      topUrl: "https://www.city.higashimurayama.tokyo.jp/",
      region: "市",
    },
    { name: "多摩市", slug: "tama", topUrl: "https://www.city.tama.lg.jp/", region: "市" },
    { name: "青梅市", slug: "ome", topUrl: "https://www.city.ome.tokyo.jp/", region: "市" },
    {
      name: "武蔵野市",
      slug: "musashino",
      topUrl: "https://www.city.musashino.lg.jp/",
      region: "市",
    },
    {
      name: "国分寺市",
      slug: "kokubunji",
      topUrl: "https://www.city.kokubunji.tokyo.jp/",
      region: "市",
    },
    { name: "小金井市", slug: "koganei", topUrl: "https://www.city.koganei.lg.jp/", region: "市" },
    {
      name: "東久留米市",
      slug: "higashikurume",
      topUrl: "https://www.city.higashikurume.lg.jp/",
      region: "市",
    },
    { name: "昭島市", slug: "akishima", topUrl: "https://www.city.akishima.lg.jp/", region: "市" },
    { name: "稲城市", slug: "inagi", topUrl: "https://www.city.inagi.tokyo.jp/", region: "市" },
    {
      name: "東大和市",
      slug: "higashiyamato",
      topUrl: "https://www.city.higashiyamato.lg.jp/",
      region: "市",
    },
    {
      name: "あきる野市",
      slug: "akiruno",
      topUrl: "https://www.city.akiruno.tokyo.jp/",
      region: "市",
    },
    { name: "狛江市", slug: "komae", topUrl: "https://www.city.komae.tokyo.jp/", region: "市" },
    { name: "清瀬市", slug: "kiyose", topUrl: "https://www.city.kiyose.lg.jp/", region: "市" },
    {
      name: "国立市",
      slug: "kunitachi",
      topUrl: "https://www.city.kunitachi.tokyo.jp/",
      region: "市",
    },
    {
      name: "武蔵村山市",
      slug: "musashimurayama",
      topUrl: "https://www.city.musashimurayama.lg.jp/",
      region: "市",
    },
    { name: "福生市", slug: "fussa", topUrl: "https://www.city.fussa.tokyo.jp/", region: "市" },
    { name: "羽村市", slug: "hamura", topUrl: "https://www.city.hamura.tokyo.jp/", region: "市" },
    // ── 西多摩郡 ──
    {
      name: "瑞穂町",
      slug: "mizuho",
      topUrl: "https://www.town.mizuho.tokyo.jp/",
      region: "西多摩郡",
    },
    {
      name: "日の出町",
      slug: "hinode",
      topUrl: "https://www.town.hinode.tokyo.jp/",
      region: "西多摩郡",
    },
    {
      name: "檜原村",
      slug: "hinohara",
      topUrl: "https://www.vill.hinohara.tokyo.jp/",
      region: "西多摩郡",
    },
    {
      name: "奥多摩町",
      slug: "okutama",
      topUrl: "https://www.town.okutama.tokyo.jp/",
      region: "西多摩郡",
    },
    // ── 島しょ部 ──
    {
      name: "大島町",
      slug: "oshima-t",
      topUrl: "https://www.town.oshima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "利島村",
      slug: "toshima-v",
      topUrl: "https://www.vill.toshima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "新島村",
      slug: "niijima",
      topUrl: "https://www.vill.niijima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "神津島村",
      slug: "kouzushima",
      topUrl: "https://www.vill.kouzushima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "三宅村",
      slug: "miyake",
      topUrl: "https://www.vill.miyake.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "御蔵島村",
      slug: "mikurasima",
      topUrl: "https://www.vill.mikurasima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "八丈町",
      slug: "hachijo",
      topUrl: "https://www.town.hachijo.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "青ヶ島村",
      slug: "aogashima",
      topUrl: "https://www.vill.aogashima.tokyo.jp/",
      region: "島しょ部",
    },
    {
      name: "小笠原村",
      slug: "ogasawara",
      topUrl: "https://www.vill.ogasawara.tokyo.jp/",
      region: "島しょ部",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 神奈川県 (19市・13町・1村 = 33市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-kanagawa": [
    // ── 市 (19) ──
    {
      name: "横浜市",
      slug: "yokohama",
      topUrl: "https://www.city.yokohama.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "川崎市",
      slug: "kawasaki",
      topUrl: "https://www.city.kawasaki.jp/",
      isDesignated: true,
      region: "市",
    },
    {
      name: "相模原市",
      slug: "sagamihara",
      topUrl: "https://www.city.sagamihara.kanagawa.jp/",
      isDesignated: true,
      region: "市",
    },
    {
      name: "藤沢市",
      slug: "fujisawa",
      topUrl: "https://www.city.fujisawa.kanagawa.jp/",
      region: "市",
    },
    {
      name: "横須賀市",
      slug: "yokosuka",
      topUrl: "https://www.city.yokosuka.kanagawa.jp/",
      region: "市",
    },
    {
      name: "平塚市",
      slug: "hiratsuka",
      topUrl: "https://www.city.hiratsuka.kanagawa.jp/",
      region: "市",
    },
    {
      name: "茅ヶ崎市",
      slug: "chigasaki",
      topUrl: "https://www.city.chigasaki.kanagawa.jp/",
      region: "市",
    },
    { name: "大和市", slug: "yamato", topUrl: "https://www.city.yamato.lg.jp/", region: "市" },
    {
      name: "厚木市",
      slug: "atsugi",
      topUrl: "https://www.city.atsugi.kanagawa.jp/",
      region: "市",
    },
    {
      name: "小田原市",
      slug: "odawara",
      topUrl: "https://www.city.odawara.kanagawa.jp/",
      region: "市",
    },
    {
      name: "鎌倉市",
      slug: "kamakura",
      topUrl: "https://www.city.kamakura.kanagawa.jp/",
      region: "市",
    },
    {
      name: "秦野市",
      slug: "hadano",
      topUrl: "https://www.city.hadano.kanagawa.jp/",
      region: "市",
    },
    {
      name: "海老名市",
      slug: "ebina",
      topUrl: "https://www.city.ebina.kanagawa.jp/",
      region: "市",
    },
    { name: "座間市", slug: "zama", topUrl: "https://www.city.zama.kanagawa.jp/", region: "市" },
    {
      name: "伊勢原市",
      slug: "isehara",
      topUrl: "https://www.city.isehara.kanagawa.jp/",
      region: "市",
    },
    { name: "綾瀬市", slug: "ayase", topUrl: "https://www.city.ayase.kanagawa.jp/", region: "市" },
    { name: "逗子市", slug: "zushi", topUrl: "https://www.city.zushi.kanagawa.jp/", region: "市" },
    { name: "三浦市", slug: "miura", topUrl: "https://www.city.miura.kanagawa.jp/", region: "市" },
    {
      name: "南足柄市",
      slug: "minamiashigara",
      topUrl: "https://www.city.minamiashigara.kanagawa.jp/",
      region: "市",
    },
    // ── 三浦郡 ──
    { name: "葉山町", slug: "hayama", topUrl: "https://www.town.hayama.lg.jp/", region: "三浦郡" },
    // ── 高座郡 ──
    {
      name: "寒川町",
      slug: "samukawa",
      topUrl: "https://www.town.samukawa.kanagawa.jp/",
      region: "高座郡",
    },
    // ── 中郡 ──
    { name: "大磯町", slug: "oiso", topUrl: "https://www.town.oiso.kanagawa.jp/", region: "中郡" },
    {
      name: "二宮町",
      slug: "ninomiya",
      topUrl: "https://www.town.ninomiya.kanagawa.jp/",
      region: "中郡",
    },
    // ── 足柄上郡 ──
    {
      name: "中井町",
      slug: "nakai",
      topUrl: "https://www.town.nakai.kanagawa.jp/",
      region: "足柄上郡",
    },
    { name: "大井町", slug: "oi", topUrl: "https://www.town.oi.kanagawa.jp/", region: "足柄上郡" },
    {
      name: "松田町",
      slug: "matsuda",
      topUrl: "https://www.town.matsuda.kanagawa.jp/",
      region: "足柄上郡",
    },
    {
      name: "山北町",
      slug: "yamakita",
      topUrl: "https://www.town.yamakita.kanagawa.jp/",
      region: "足柄上郡",
    },
    {
      name: "開成町",
      slug: "kaisei",
      topUrl: "https://www.town.kaisei.kanagawa.jp/",
      region: "足柄上郡",
    },
    // ── 足柄下郡 ──
    {
      name: "箱根町",
      slug: "hakone",
      topUrl: "https://www.town.hakone.kanagawa.jp/",
      region: "足柄下郡",
    },
    {
      name: "真鶴町",
      slug: "manazuru",
      topUrl: "https://www.town.manazuru.kanagawa.jp/",
      region: "足柄下郡",
    },
    {
      name: "湯河原町",
      slug: "yugawara",
      topUrl: "https://www.town.yugawara.kanagawa.jp/",
      region: "足柄下郡",
    },
    // ── 愛甲郡 ──
    {
      name: "愛川町",
      slug: "aikawa",
      topUrl: "https://www.town.aikawa.kanagawa.jp/",
      region: "愛甲郡",
    },
    {
      name: "清川村",
      slug: "kiyokawa",
      topUrl: "https://www.town.kiyokawa.kanagawa.jp/",
      region: "愛甲郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 新潟県 (20市・6町・4村 = 30市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-niigata": [
    // ── 市 (20) ──
    {
      name: "新潟市",
      slug: "niigata-city",
      topUrl: "https://www.city.niigata.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "長岡市",
      slug: "nagaoka",
      topUrl: "https://www.city.nagaoka.niigata.jp/",
      region: "市",
    },
    { name: "上越市", slug: "joetsu", topUrl: "https://www.city.joetsu.niigata.jp/", region: "市" },
    { name: "三条市", slug: "sanjo", topUrl: "https://www.city.sanjo.niigata.jp/", region: "市" },
    { name: "新発田市", slug: "shibata", topUrl: "https://www.city.shibata.lg.jp/", region: "市" },
    {
      name: "柏崎市",
      slug: "kashiwazaki",
      topUrl: "https://www.city.kashiwazaki.lg.jp/",
      region: "市",
    },
    { name: "燕市", slug: "tsubame", topUrl: "https://www.city.tsubame.niigata.jp/", region: "市" },
    { name: "村上市", slug: "murakami", topUrl: "https://www.city.murakami.lg.jp/", region: "市" },
    { name: "佐渡市", slug: "sado", topUrl: "https://www.city.sado.niigata.jp/", region: "市" },
    {
      name: "十日町市",
      slug: "tokamachi",
      topUrl: "https://www.city.tokamachi.lg.jp/",
      region: "市",
    },
    { name: "五泉市", slug: "gosen", topUrl: "https://www.city.gosen.lg.jp/", region: "市" },
    {
      name: "南魚沼市",
      slug: "minamiuonuma",
      topUrl: "https://www.city.minamiuonuma.niigata.jp/",
      region: "市",
    },
    { name: "阿賀野市", slug: "agano", topUrl: "https://www.city.agano.niigata.jp/", region: "市" },
    {
      name: "見附市",
      slug: "mitsuke",
      topUrl: "https://www.city.mitsuke.niigata.jp/",
      region: "市",
    },
    { name: "魚沼市", slug: "uonuma", topUrl: "https://www.city.uonuma.lg.jp/", region: "市" },
    { name: "小千谷市", slug: "ojiya", topUrl: "https://www.city.ojiya.niigata.jp/", region: "市" },
    {
      name: "糸魚川市",
      slug: "itoigawa",
      topUrl: "https://www.city.itoigawa.lg.jp/",
      region: "市",
    },
    { name: "妙高市", slug: "myoko", topUrl: "https://www.city.myoko.niigata.jp/", region: "市" },
    { name: "胎内市", slug: "tainai", topUrl: "https://www.city.tainai.niigata.jp/", region: "市" },
    { name: "加茂市", slug: "kamo", topUrl: "https://www.city.kamo.niigata.jp/", region: "市" },
    // ── 北蒲原郡 ──
    {
      name: "聖籠町",
      slug: "seiro",
      topUrl: "https://www.town.seiro.niigata.jp/",
      region: "北蒲原郡",
    },
    // ── 西蒲原郡 ──
    {
      name: "弥彦村",
      slug: "yahiko",
      topUrl: "https://www.vill.yahiko.niigata.jp/",
      region: "西蒲原郡",
    },
    // ── 南蒲原郡 ──
    {
      name: "田上町",
      slug: "tagami",
      topUrl: "https://www.town.tagami.niigata.jp/",
      region: "南蒲原郡",
    },
    // ── 東蒲原郡 ──
    { name: "阿賀町", slug: "aga", topUrl: "https://www.town.aga.niigata.jp/", region: "東蒲原郡" },
    // ── 三島郡 ──
    {
      name: "出雲崎町",
      slug: "izumozaki",
      topUrl: "https://www.town.izumozaki.niigata.jp/",
      region: "三島郡",
    },
    // ── 南魚沼郡 ──
    {
      name: "湯沢町",
      slug: "yuzawa-n",
      topUrl: "https://www.town.yuzawa.lg.jp/",
      region: "南魚沼郡",
    },
    // ── 中魚沼郡 ──
    {
      name: "津南町",
      slug: "tsunan",
      topUrl: "https://www.town.tsunan.niigata.jp/",
      region: "中魚沼郡",
    },
    // ── 刈羽郡 ──
    {
      name: "刈羽村",
      slug: "kariwa",
      topUrl: "https://www.vill.kariwa.niigata.jp/",
      region: "刈羽郡",
    },
    // ── 岩船郡 ──
    {
      name: "関川村",
      slug: "sekikawa",
      topUrl: "https://www.vill.sekikawa.niigata.jp/",
      region: "岩船郡",
    },
    {
      name: "粟島浦村",
      slug: "awashimaura",
      topUrl: "https://www.vill.awashimaura.lg.jp/",
      region: "岩船郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 富山県 (10市・4町・1村 = 15市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-toyama": [
    // ── 市 (10) ──
    {
      name: "富山市",
      slug: "toyama-city",
      topUrl: "https://www.city.toyama.lg.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "高岡市",
      slug: "takaoka",
      topUrl: "https://www.city.takaoka.toyama.jp/",
      region: "市",
    },
    { name: "射水市", slug: "imizu", topUrl: "https://www.city.imizu.toyama.jp/", region: "市" },
    { name: "南砺市", slug: "nanto", topUrl: "https://www.city.nanto.toyama.jp/", region: "市" },
    { name: "氷見市", slug: "himi", topUrl: "https://www.city.himi.toyama.jp/", region: "市" },
    { name: "砺波市", slug: "tonami", topUrl: "https://www.city.tonami.toyama.jp/", region: "市" },
    { name: "黒部市", slug: "kurobe", topUrl: "https://www.city.kurobe.toyama.jp/", region: "市" },
    { name: "小矢部市", slug: "oyabe", topUrl: "https://www.city.oyabe.toyama.jp/", region: "市" },
    {
      name: "滑川市",
      slug: "namerikawa",
      topUrl: "https://www.city.namerikawa.toyama.jp/",
      region: "市",
    },
    { name: "魚津市", slug: "uozu", topUrl: "https://www.city.uozu.toyama.jp/", region: "市" },
    // ── 中新川郡 ──
    {
      name: "舟橋村",
      slug: "funahashi",
      topUrl: "https://www.vill.funahashi.toyama.jp/",
      region: "中新川郡",
    },
    {
      name: "上市町",
      slug: "kamiichi",
      topUrl: "https://www.town.kamiichi.toyama.jp/",
      region: "中新川郡",
    },
    {
      name: "立山町",
      slug: "tateyama",
      topUrl: "https://www.town.tateyama.toyama.jp/",
      region: "中新川郡",
    },
    // ── 下新川郡 ──
    {
      name: "入善町",
      slug: "nyuzen",
      topUrl: "https://www.town.nyuzen.toyama.jp/",
      region: "下新川郡",
    },
    {
      name: "朝日町",
      slug: "asahi-to",
      topUrl: "https://www.town.asahi.toyama.jp/",
      region: "下新川郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 石川県 (11市・8町 = 19市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-ishikawa": [
    // ── 市 (11) ──
    {
      name: "金沢市",
      slug: "kanazawa",
      topUrl: "https://www.city.kanazawa.ishikawa.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "白山市", slug: "hakusan", topUrl: "https://www.city.hakusan.lg.jp/", region: "市" },
    { name: "小松市", slug: "komatsu", topUrl: "https://www.city.komatsu.lg.jp/", region: "市" },
    { name: "加賀市", slug: "kaga", topUrl: "https://www.city.kaga.ishikawa.jp/", region: "市" },
    { name: "七尾市", slug: "nanao", topUrl: "https://www.city.nanao.lg.jp/", region: "市" },
    {
      name: "野々市市",
      slug: "nonoichi",
      topUrl: "https://www.city.nonoichi.lg.jp/",
      region: "市",
    },
    { name: "能美市", slug: "nomi", topUrl: "https://www.city.nomi.ishikawa.jp/", region: "市" },
    {
      name: "かほく市",
      slug: "kahoku",
      topUrl: "https://www.city.kahoku.ishikawa.jp/",
      region: "市",
    },
    {
      name: "輪島市",
      slug: "wajima",
      topUrl: "https://www.city.wajima.ishikawa.jp/",
      region: "市",
    },
    { name: "珠洲市", slug: "suzu", topUrl: "https://www.city.suzu.lg.jp/", region: "市" },
    { name: "羽咋市", slug: "hakui", topUrl: "https://www.city.hakui.lg.jp/", region: "市" },
    // ── 能美郡 ──
    {
      name: "川北町",
      slug: "kawakita",
      topUrl: "https://www.town.kawakita.ishikawa.jp/",
      region: "能美郡",
    },
    // ── 河北郡 ──
    {
      name: "津幡町",
      slug: "tsubata",
      topUrl: "https://www.town.tsubata.lg.jp/",
      region: "河北郡",
    },
    {
      name: "内灘町",
      slug: "uchinada",
      topUrl: "https://www.town.uchinada.lg.jp/",
      region: "河北郡",
    },
    // ── 羽咋郡 ──
    { name: "志賀町", slug: "shika", topUrl: "https://www.town.shika.lg.jp/", region: "羽咋郡" },
    {
      name: "宝達志水町",
      slug: "hodatsushimizu",
      topUrl: "https://www.hodatsushimizu.jp/",
      region: "羽咋郡",
    },
    // ── 鹿島郡 ──
    {
      name: "中能登町",
      slug: "nakanoto",
      topUrl: "https://www.town.nakanoto.ishikawa.jp/",
      region: "鹿島郡",
    },
    // ── 鳳珠郡 ──
    {
      name: "穴水町",
      slug: "anamizu",
      topUrl: "https://www.town.anamizu.lg.jp/",
      region: "鳳珠郡",
    },
    { name: "能登町", slug: "noto", topUrl: "https://www.town.noto.lg.jp/", region: "鳳珠郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 福井県 (9市・8町 = 17市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-fukui": [
    // ── 市 (9) ──
    {
      name: "福井市",
      slug: "fukui-city",
      topUrl: "https://www.city.fukui.lg.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "坂井市",
      slug: "sakai-f",
      topUrl: "https://www.city.fukui-sakai.lg.jp/",
      region: "市",
    },
    { name: "越前市", slug: "echizen", topUrl: "https://www.city.echizen.lg.jp/", region: "市" },
    { name: "鯖江市", slug: "sabae", topUrl: "https://www.city.sabae.fukui.jp/", region: "市" },
    { name: "敦賀市", slug: "tsuruga", topUrl: "https://www.city.tsuruga.lg.jp/", region: "市" },
    { name: "大野市", slug: "ono-f", topUrl: "https://www.city.ono.fukui.jp/", region: "市" },
    { name: "小浜市", slug: "obama", topUrl: "https://www.city.obama.fukui.jp/", region: "市" },
    { name: "あわら市", slug: "awara", topUrl: "https://www.city.awara.lg.jp/", region: "市" },
    {
      name: "勝山市",
      slug: "katsuyama",
      topUrl: "https://www.city.katsuyama.fukui.jp/",
      region: "市",
    },
    // ── 吉田郡 ──
    {
      name: "永平寺町",
      slug: "eiheiji",
      topUrl: "https://www.town.eiheiji.lg.jp/",
      region: "吉田郡",
    },
    // ── 今立郡 ──
    {
      name: "池田町",
      slug: "ikeda-f",
      topUrl: "https://www.town.ikeda.fukui.jp/",
      region: "今立郡",
    },
    // ── 南条郡 ──
    {
      name: "南越前町",
      slug: "minamiechizen",
      topUrl: "https://www.town.minamiechizen.lg.jp/",
      region: "南条郡",
    },
    // ── 丹生郡 ──
    {
      name: "越前町",
      slug: "echizen-t",
      topUrl: "https://www.town.echizen.fukui.jp/",
      region: "丹生郡",
    },
    // ── 三方郡 ──
    {
      name: "美浜町",
      slug: "mihama-f",
      topUrl: "https://www.town.mihama.fukui.jp/",
      region: "三方郡",
    },
    // ── 大飯郡 ──
    {
      name: "高浜町",
      slug: "takahama",
      topUrl: "https://www.town.takahama.fukui.jp/",
      region: "大飯郡",
    },
    { name: "おおい町", slug: "ohi", topUrl: "https://www.town.ohi.fukui.jp/", region: "大飯郡" },
    // ── 三方上中郡 ──
    {
      name: "若狭町",
      slug: "wakasa",
      topUrl: "https://www.town.fukui-wakasa.lg.jp/",
      region: "三方上中郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 山梨県 (13市・8町・6村 = 27市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-yamanashi": [
    // ── 市 (13) ──
    {
      name: "甲府市",
      slug: "kofu",
      topUrl: "https://www.city.kofu.yamanashi.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "甲斐市", slug: "kai", topUrl: "https://www.city.kai.yamanashi.jp/", region: "市" },
    {
      name: "南アルプス市",
      slug: "minami-alps",
      topUrl: "https://www.city.minami-alps.yamanashi.jp/",
      region: "市",
    },
    {
      name: "笛吹市",
      slug: "fuefuki",
      topUrl: "https://www.city.fuefuki.yamanashi.jp/",
      region: "市",
    },
    {
      name: "富士吉田市",
      slug: "fujiyoshida",
      topUrl: "https://www.city.fujiyoshida.yamanashi.jp/",
      region: "市",
    },
    {
      name: "北杜市",
      slug: "hokuto",
      topUrl: "https://www.city.hokuto.yamanashi.jp/",
      region: "市",
    },
    {
      name: "山梨市",
      slug: "yamanashi-city",
      topUrl: "https://www.city.yamanashi.yamanashi.jp/",
      region: "市",
    },
    { name: "甲州市", slug: "koshu", topUrl: "https://www.city.koshu.yamanashi.jp/", region: "市" },
    { name: "中央市", slug: "chuo-y", topUrl: "https://www.city.chuo.yamanashi.jp/", region: "市" },
    { name: "都留市", slug: "tsuru", topUrl: "https://www.city.tsuru.yamanashi.jp/", region: "市" },
    {
      name: "大月市",
      slug: "otsuki",
      topUrl: "https://www.city.otsuki.yamanashi.jp/",
      region: "市",
    },
    { name: "韮崎市", slug: "nirasaki", topUrl: "https://www.city.nirasaki.lg.jp/", region: "市" },
    {
      name: "上野原市",
      slug: "uenohara",
      topUrl: "https://www.city.uenohara.yamanashi.jp/",
      region: "市",
    },
    // ── 西八代郡 ──
    {
      name: "市川三郷町",
      slug: "ichikawamisato",
      topUrl: "https://www.town.ichikawamisato.yamanashi.jp/",
      region: "西八代郡",
    },
    // ── 南巨摩郡 ──
    {
      name: "早川町",
      slug: "hayakawa",
      topUrl: "https://www.town.hayakawa.yamanashi.jp/",
      region: "南巨摩郡",
    },
    {
      name: "身延町",
      slug: "minobu",
      topUrl: "https://www.town.minobu.lg.jp/",
      region: "南巨摩郡",
    },
    {
      name: "南部町",
      slug: "nanbu-y",
      topUrl: "https://www.town.nanbu.yamanashi.jp/",
      region: "南巨摩郡",
    },
    {
      name: "富士川町",
      slug: "fujikawa",
      topUrl: "https://www.town.fujikawa.yamanashi.jp/",
      region: "南巨摩郡",
    },
    // ── 中巨摩郡 ──
    {
      name: "昭和町",
      slug: "showa-y",
      topUrl: "https://www.town.showa.yamanashi.jp/",
      region: "中巨摩郡",
    },
    // ── 南都留郡 ──
    { name: "道志村", slug: "doshi", topUrl: "https://www.vill.doshi.lg.jp/", region: "南都留郡" },
    {
      name: "西桂町",
      slug: "nishikatsura",
      topUrl: "https://www.town.nishikatsura.yamanashi.jp/",
      region: "南都留郡",
    },
    {
      name: "忍野村",
      slug: "oshino",
      topUrl: "https://www.vill.oshino.lg.jp/",
      region: "南都留郡",
    },
    {
      name: "山中湖村",
      slug: "yamanakako",
      topUrl: "https://www.vill.yamanakako.lg.jp/",
      region: "南都留郡",
    },
    {
      name: "鳴沢村",
      slug: "narusawa",
      topUrl: "https://www.vill.narusawa.yamanashi.jp/",
      region: "南都留郡",
    },
    {
      name: "富士河口湖町",
      slug: "fujikawaguchiko",
      topUrl: "https://www.town.fujikawaguchiko.lg.jp/",
      region: "南都留郡",
    },
    // ── 北都留郡 ──
    {
      name: "小菅村",
      slug: "kosuge",
      topUrl: "https://www.vill.kosuge.yamanashi.jp/",
      region: "北都留郡",
    },
    {
      name: "丹波山村",
      slug: "tabayama",
      topUrl: "https://www.vill.tabayama.yamanashi.jp/",
      region: "北都留郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 長野県 (19市・23町・35村 = 77市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-nagano": [
    // ── 市 (19) ──
    {
      name: "長野市",
      slug: "nagano-city",
      topUrl: "https://www.city.nagano.nagano.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "松本市",
      slug: "matsumoto",
      topUrl: "https://www.city.matsumoto.nagano.jp/",
      region: "市",
    },
    { name: "上田市", slug: "ueda", topUrl: "https://www.city.ueda.nagano.jp/", region: "市" },
    { name: "飯田市", slug: "iida", topUrl: "https://www.city.iida.lg.jp/", region: "市" },
    { name: "佐久市", slug: "saku", topUrl: "https://www.city.saku.nagano.jp/", region: "市" },
    {
      name: "安曇野市",
      slug: "azumino",
      topUrl: "https://www.city.azumino.nagano.jp/",
      region: "市",
    },
    { name: "伊那市", slug: "ina", topUrl: "https://www.city.ina.nagano.jp/", region: "市" },
    { name: "塩尻市", slug: "shiojiri", topUrl: "https://www.city.shiojiri.lg.jp/", region: "市" },
    { name: "千曲市", slug: "chikuma", topUrl: "https://www.city.chikuma.lg.jp/", region: "市" },
    { name: "茅野市", slug: "chino", topUrl: "https://www.city.chino.lg.jp/", region: "市" },
    { name: "須坂市", slug: "suzaka", topUrl: "https://www.city.suzaka.nagano.jp/", region: "市" },
    { name: "岡谷市", slug: "okaya", topUrl: "https://www.city.okaya.lg.jp/", region: "市" },
    { name: "諏訪市", slug: "suwa", topUrl: "https://www.city.suwa.lg.jp/", region: "市" },
    {
      name: "中野市",
      slug: "nakano-n",
      topUrl: "https://www.city.nakano.nagano.jp/",
      region: "市",
    },
    { name: "小諸市", slug: "komoro", topUrl: "https://www.city.komoro.lg.jp/", region: "市" },
    {
      name: "駒ヶ根市",
      slug: "komagane",
      topUrl: "https://www.city.komagane.nagano.jp/",
      region: "市",
    },
    { name: "大町市", slug: "omachi", topUrl: "https://www.city.omachi.nagano.jp/", region: "市" },
    { name: "飯山市", slug: "iiyama", topUrl: "https://www.city.iiyama.nagano.jp/", region: "市" },
    { name: "東御市", slug: "tomi", topUrl: "https://www.city.tomi.nagano.jp/", region: "市" },
    // ── 南佐久郡 ──
    {
      name: "小海町",
      slug: "koumi",
      topUrl: "https://www.town.koumi.nagano.jp/",
      region: "南佐久郡",
    },
    {
      name: "川上村",
      slug: "kawakami-n",
      topUrl: "https://www.vill.kawakami.nagano.jp/",
      region: "南佐久郡",
    },
    {
      name: "南牧村",
      slug: "minamimaki",
      topUrl: "https://www.vill.minamimaki.nagano.jp/",
      region: "南佐久郡",
    },
    {
      name: "南相木村",
      slug: "minamiaiki",
      topUrl: "https://www.vill.minamiaiki.nagano.jp/",
      region: "南佐久郡",
    },
    {
      name: "北相木村",
      slug: "kitaaiki",
      topUrl: "https://www.vill.kitaaiki.nagano.jp/",
      region: "南佐久郡",
    },
    {
      name: "佐久穂町",
      slug: "sakuho",
      topUrl: "https://www.town.sakuho.nagano.jp/",
      region: "南佐久郡",
    },
    // ── 北佐久郡 ──
    {
      name: "軽井沢町",
      slug: "karuizawa",
      topUrl: "https://www.town.karuizawa.lg.jp/",
      region: "北佐久郡",
    },
    {
      name: "御代田町",
      slug: "miyota",
      topUrl: "https://www.town.miyota.nagano.jp/",
      region: "北佐久郡",
    },
    {
      name: "立科町",
      slug: "tateshina",
      topUrl: "https://www.town.tateshina.nagano.jp/",
      region: "北佐久郡",
    },
    // ── 小県郡 ──
    { name: "青木村", slug: "aoki", topUrl: "https://www.vill.aoki.nagano.jp/", region: "小県郡" },
    {
      name: "長和町",
      slug: "nagawa",
      topUrl: "https://www.town.nagawa.nagano.jp/",
      region: "小県郡",
    },
    // ── 諏訪郡 ──
    {
      name: "下諏訪町",
      slug: "shimosuwa",
      topUrl: "https://www.town.shimosuwa.lg.jp/",
      region: "諏訪郡",
    },
    {
      name: "富士見町",
      slug: "fujimi-n",
      topUrl: "https://www.town.fujimi.lg.jp/",
      region: "諏訪郡",
    },
    { name: "原村", slug: "hara", topUrl: "https://www.vill.hara.nagano.jp/", region: "諏訪郡" },
    // ── 上伊那郡 ──
    {
      name: "辰野町",
      slug: "tatsuno-n",
      topUrl: "https://www.town.tatsuno.nagano.jp/",
      region: "上伊那郡",
    },
    {
      name: "箕輪町",
      slug: "minowa",
      topUrl: "https://www.town.minowa.lg.jp/",
      region: "上伊那郡",
    },
    {
      name: "飯島町",
      slug: "iijima",
      topUrl: "https://www.town.iijima.lg.jp/",
      region: "上伊那郡",
    },
    {
      name: "南箕輪村",
      slug: "minamiminowa",
      topUrl: "https://www.vill.minamiminowa.lg.jp/",
      region: "上伊那郡",
    },
    {
      name: "中川村",
      slug: "nakagawa-n",
      topUrl: "https://www.vill.nakagawa.nagano.jp/",
      region: "上伊那郡",
    },
    {
      name: "宮田村",
      slug: "miyada",
      topUrl: "https://www.vill.miyada.nagano.jp/",
      region: "上伊那郡",
    },
    // ── 下伊那郡 ──
    {
      name: "松川町",
      slug: "matsukawa-n",
      topUrl: "https://www.town.matsukawa.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "高森町",
      slug: "takamori",
      topUrl: "https://www.town.takamori.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "阿南町",
      slug: "anan-n",
      topUrl: "https://www.town.anan.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "阿智村",
      slug: "achi",
      topUrl: "https://www.vill.achi.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "平谷村",
      slug: "hiraya",
      topUrl: "https://www.vill.hiraya.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "根羽村",
      slug: "neba",
      topUrl: "https://www.vill.neba.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "下條村",
      slug: "shimojo",
      topUrl: "https://www.vill.shimojo.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "売木村",
      slug: "urugi",
      topUrl: "https://www.vill.urugi.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "天龍村",
      slug: "tenryu",
      topUrl: "https://www.vill.tenryu.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "泰阜村",
      slug: "yasuoka",
      topUrl: "https://www.vill.yasuoka.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "喬木村",
      slug: "takagi",
      topUrl: "https://www.vill.takagi.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "豊丘村",
      slug: "toyooka-n",
      topUrl: "https://www.vill.toyooka.nagano.jp/",
      region: "下伊那郡",
    },
    {
      name: "大鹿村",
      slug: "oshika",
      topUrl: "https://www.vill.oshika.nagano.jp/",
      region: "下伊那郡",
    },
    // ── 木曽郡 ──
    {
      name: "上松町",
      slug: "agematsu",
      topUrl: "https://www.town.agematsu.nagano.jp/",
      region: "木曽郡",
    },
    {
      name: "南木曽町",
      slug: "nagiso",
      topUrl: "https://www.town.nagiso.nagano.jp/",
      region: "木曽郡",
    },
    {
      name: "木祖村",
      slug: "kiso-mura",
      topUrl: "https://www.vill.kiso.nagano.jp/",
      region: "木曽郡",
    },
    {
      name: "王滝村",
      slug: "otaki-n",
      topUrl: "https://www.vill.otaki.nagano.jp/",
      region: "木曽郡",
    },
    {
      name: "大桑村",
      slug: "okuwa",
      topUrl: "https://www.vill.okuwa.nagano.jp/",
      region: "木曽郡",
    },
    { name: "木曽町", slug: "kiso-machi", topUrl: "https://www.town-kiso.com/", region: "木曽郡" },
    // ── 東筑摩郡 ──
    { name: "麻績村", slug: "omi", topUrl: "https://www.vill.omi.nagano.jp/", region: "東筑摩郡" },
    {
      name: "生坂村",
      slug: "ikusaka",
      topUrl: "https://www.vill.ikusaka.nagano.jp/",
      region: "東筑摩郡",
    },
    {
      name: "山形村",
      slug: "yamagata-n",
      topUrl: "https://www.vill.yamagata.nagano.jp/",
      region: "東筑摩郡",
    },
    {
      name: "朝日村",
      slug: "asahi-n",
      topUrl: "https://www.vill.asahi.nagano.jp/",
      region: "東筑摩郡",
    },
    {
      name: "筑北村",
      slug: "chikuhoku",
      topUrl: "https://www.vill.chikuhoku.lg.jp/",
      region: "東筑摩郡",
    },
    // ── 北安曇郡 ──
    {
      name: "池田町",
      slug: "ikeda-n",
      topUrl: "https://www.town.ikeda.nagano.jp/",
      region: "北安曇郡",
    },
    {
      name: "松川村",
      slug: "matsukawa-v",
      topUrl: "https://www.vill.matsukawa.nagano.jp/",
      region: "北安曇郡",
    },
    {
      name: "白馬村",
      slug: "hakuba",
      topUrl: "https://www.vill.hakuba.lg.jp/",
      region: "北安曇郡",
    },
    {
      name: "小谷村",
      slug: "otari",
      topUrl: "https://www.vill.otari.nagano.jp/",
      region: "北安曇郡",
    },
    // ── 埴科郡 ──
    {
      name: "坂城町",
      slug: "sakaki",
      topUrl: "https://www.town.sakaki.nagano.jp/",
      region: "埴科郡",
    },
    // ── 上高井郡 ──
    {
      name: "小布施町",
      slug: "obuse",
      topUrl: "https://www.town.obuse.nagano.jp/",
      region: "上高井郡",
    },
    {
      name: "高山村",
      slug: "takayama-n",
      topUrl: "https://www.vill.takayama.nagano.jp/",
      region: "上高井郡",
    },
    // ── 下高井郡 ──
    {
      name: "山ノ内町",
      slug: "yamanouchi",
      topUrl: "https://www.town.yamanouchi.nagano.jp/",
      region: "下高井郡",
    },
    {
      name: "木島平村",
      slug: "kijimadaira",
      topUrl: "https://www.vill.kijimadaira.lg.jp/",
      region: "下高井郡",
    },
    {
      name: "野沢温泉村",
      slug: "nozawaonsen",
      topUrl: "https://www.vill.nozawaonsen.nagano.jp/",
      region: "下高井郡",
    },
    // ── 上水内郡 ──
    {
      name: "信濃町",
      slug: "shinanomachi",
      topUrl: "https://www.town.shinano.lg.jp/",
      region: "上水内郡",
    },
    {
      name: "小川村",
      slug: "ogawa-n",
      topUrl: "https://www.vill.ogawa.nagano.jp/",
      region: "上水内郡",
    },
    {
      name: "飯綱町",
      slug: "iizuna",
      topUrl: "https://www.town.iizuna.nagano.jp/",
      region: "上水内郡",
    },
    // ── 下水内郡 ──
    {
      name: "栄村",
      slug: "sakae-n",
      topUrl: "https://www.vill.sakae.nagano.jp/",
      region: "下水内郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 岐阜県 (21市・19町・2村 = 42市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-gifu": [
    // ── 市 (21) ──
    {
      name: "岐阜市",
      slug: "gifu-city",
      topUrl: "https://www.city.gifu.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "大垣市", slug: "ogaki", topUrl: "https://www.city.ogaki.lg.jp/", region: "市" },
    {
      name: "各務原市",
      slug: "kakamigahara",
      topUrl: "https://www.city.kakamigahara.lg.jp/",
      region: "市",
    },
    { name: "多治見市", slug: "tajimi", topUrl: "https://www.city.tajimi.lg.jp/", region: "市" },
    { name: "可児市", slug: "kani", topUrl: "https://www.city.kani.lg.jp/", region: "市" },
    { name: "高山市", slug: "takayama", topUrl: "https://www.city.takayama.lg.jp/", region: "市" },
    { name: "関市", slug: "seki", topUrl: "https://www.city.seki.lg.jp/", region: "市" },
    {
      name: "中津川市",
      slug: "nakatsugawa",
      topUrl: "https://www.city.nakatsugawa.lg.jp/",
      region: "市",
    },
    { name: "羽島市", slug: "hashima", topUrl: "https://www.city.hashima.lg.jp/", region: "市" },
    {
      name: "美濃加茂市",
      slug: "minokamo",
      topUrl: "https://www.city.minokamo.gifu.jp/",
      region: "市",
    },
    { name: "土岐市", slug: "toki", topUrl: "https://www.city.toki.lg.jp/", region: "市" },
    { name: "恵那市", slug: "ena", topUrl: "https://www.city.ena.lg.jp/", region: "市" },
    { name: "瑞浪市", slug: "mizunami", topUrl: "https://www.city.mizunami.lg.jp/", region: "市" },
    { name: "郡上市", slug: "gujo", topUrl: "https://www.city.gujo.gifu.jp/", region: "市" },
    { name: "瑞穂市", slug: "mizuho-g", topUrl: "https://www.city.mizuho.lg.jp/", region: "市" },
    { name: "本巣市", slug: "motosu", topUrl: "https://www.city.motosu.lg.jp/", region: "市" },
    { name: "下呂市", slug: "gero", topUrl: "https://www.city.gero.lg.jp/", region: "市" },
    { name: "海津市", slug: "kaizu", topUrl: "https://www.city.kaizu.lg.jp/", region: "市" },
    {
      name: "山県市",
      slug: "yamagata-g",
      topUrl: "https://www.city.yamagata.gifu.jp/",
      region: "市",
    },
    { name: "飛騨市", slug: "hida", topUrl: "https://www.city.hida.gifu.jp/", region: "市" },
    { name: "美濃市", slug: "mino", topUrl: "https://www.city.mino.gifu.jp/", region: "市" },
    // ── 羽島郡 ──
    { name: "岐南町", slug: "ginan", topUrl: "https://www.town.ginan.lg.jp/", region: "羽島郡" },
    {
      name: "笠松町",
      slug: "kasamatsu",
      topUrl: "https://www.town.kasamatsu.gifu.jp/",
      region: "羽島郡",
    },
    // ── 養老郡 ──
    { name: "養老町", slug: "yoro", topUrl: "https://www.town.yoro.gifu.jp/", region: "養老郡" },
    // ── 不破郡 ──
    { name: "垂井町", slug: "tarui", topUrl: "https://www.town.tarui.lg.jp/", region: "不破郡" },
    {
      name: "関ケ原町",
      slug: "sekigahara",
      topUrl: "https://www.town.sekigahara.gifu.jp/",
      region: "不破郡",
    },
    // ── 安八郡 ──
    { name: "神戸町", slug: "godo", topUrl: "https://www.town.godo.gifu.jp/", region: "安八郡" },
    {
      name: "輪之内町",
      slug: "wanouchi",
      topUrl: "https://www.town.wanouchi.lg.jp/",
      region: "安八郡",
    },
    {
      name: "安八町",
      slug: "anpachi",
      topUrl: "https://www.town.anpachi.lg.jp/",
      region: "安八郡",
    },
    // ── 揖斐郡 ──
    {
      name: "揖斐川町",
      slug: "ibigawa",
      topUrl: "https://www.town.ibigawa.lg.jp/",
      region: "揖斐郡",
    },
    { name: "大野町", slug: "ono-g", topUrl: "https://www.town.ono.gifu.jp/", region: "揖斐郡" },
    {
      name: "池田町",
      slug: "ikeda-g",
      topUrl: "https://www.town.ikeda.gifu.jp/",
      region: "揖斐郡",
    },
    // ── 本巣郡 ──
    {
      name: "北方町",
      slug: "kitagata",
      topUrl: "https://www.town.kitagata.gifu.jp/",
      region: "本巣郡",
    },
    // ── 加茂郡 ──
    {
      name: "坂祝町",
      slug: "sakahogi",
      topUrl: "https://www.town.sakahogi.gifu.jp/",
      region: "加茂郡",
    },
    {
      name: "富加町",
      slug: "tomika",
      topUrl: "https://www.town.tomika.gifu.jp/",
      region: "加茂郡",
    },
    {
      name: "川辺町",
      slug: "kawabe",
      topUrl: "https://www.town.kawabe.gifu.jp/",
      region: "加茂郡",
    },
    {
      name: "七宗町",
      slug: "hichiso",
      topUrl: "https://www.town.hichiso.lg.jp/",
      region: "加茂郡",
    },
    {
      name: "八百津町",
      slug: "yaotsu",
      topUrl: "https://www.town.yaotsu.lg.jp/",
      region: "加茂郡",
    },
    {
      name: "白川町",
      slug: "shirakawa-g",
      topUrl: "https://www.town.shirakawa.lg.jp/",
      region: "加茂郡",
    },
    {
      name: "東白川村",
      slug: "higashishirakawa",
      topUrl: "https://www.vill.higashishirakawa.gifu.jp/",
      region: "加茂郡",
    },
    // ── 可児郡 ──
    { name: "御嵩町", slug: "mitake", topUrl: "https://www.town.mitake.lg.jp/", region: "可児郡" },
    // ── 大野郡 ──
    {
      name: "白川村",
      slug: "shirakawa-v",
      topUrl: "https://www.vill.shirakawa.lg.jp/",
      region: "大野郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 静岡県 (23市・12町 = 35市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-shizuoka": [
    // ── 市 (23) ──
    {
      name: "静岡市",
      slug: "shizuoka-city",
      topUrl: "https://www.city.shizuoka.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "浜松市",
      slug: "hamamatsu",
      topUrl: "https://www.city.hamamatsu.shizuoka.jp/",
      isDesignated: true,
      region: "市",
    },
    { name: "富士市", slug: "fuji", topUrl: "https://www.city.fuji.shizuoka.jp/", region: "市" },
    {
      name: "沼津市",
      slug: "numazu",
      topUrl: "https://www.city.numazu.shizuoka.jp/",
      region: "市",
    },
    { name: "磐田市", slug: "iwata", topUrl: "https://www.city.iwata.shizuoka.jp/", region: "市" },
    { name: "藤枝市", slug: "fujieda", topUrl: "https://www.city.fujieda.lg.jp/", region: "市" },
    { name: "焼津市", slug: "yaizu", topUrl: "https://www.city.yaizu.lg.jp/", region: "市" },
    {
      name: "富士宮市",
      slug: "fujinomiya",
      topUrl: "https://www.city.fujinomiya.lg.jp/",
      region: "市",
    },
    {
      name: "掛川市",
      slug: "kakegawa",
      topUrl: "https://www.city.kakegawa.shizuoka.jp/",
      region: "市",
    },
    {
      name: "三島市",
      slug: "mishima",
      topUrl: "https://www.city.mishima.shizuoka.jp/",
      region: "市",
    },
    {
      name: "島田市",
      slug: "shimada",
      topUrl: "https://www.city.shimada.shizuoka.jp/",
      region: "市",
    },
    {
      name: "袋井市",
      slug: "fukuroi",
      topUrl: "https://www.city.fukuroi.shizuoka.jp/",
      region: "市",
    },
    {
      name: "裾野市",
      slug: "susono",
      topUrl: "https://www.city.susono.shizuoka.jp/",
      region: "市",
    },
    { name: "御殿場市", slug: "gotemba", topUrl: "https://www.city.gotemba.lg.jp/", region: "市" },
    { name: "湖西市", slug: "kosai", topUrl: "https://www.city.kosai.shizuoka.jp/", region: "市" },
    {
      name: "菊川市",
      slug: "kikugawa",
      topUrl: "https://www.city.kikugawa.shizuoka.jp/",
      region: "市",
    },
    { name: "伊東市", slug: "ito", topUrl: "https://www.city.ito.shizuoka.jp/", region: "市" },
    {
      name: "牧之原市",
      slug: "makinohara",
      topUrl: "https://www.city.makinohara.shizuoka.jp/",
      region: "市",
    },
    { name: "伊豆市", slug: "izu", topUrl: "https://www.city.izu.shizuoka.jp/", region: "市" },
    {
      name: "伊豆の国市",
      slug: "izunokuni",
      topUrl: "https://www.city.izunokuni.shizuoka.jp/",
      region: "市",
    },
    {
      name: "御前崎市",
      slug: "omaezaki",
      topUrl: "https://www.city.omaezaki.shizuoka.jp/",
      region: "市",
    },
    { name: "熱海市", slug: "atami", topUrl: "https://www.city.atami.lg.jp/", region: "市" },
    {
      name: "下田市",
      slug: "shimoda",
      topUrl: "https://www.city.shimoda.shizuoka.jp/",
      region: "市",
    },
    // ── 賀茂郡 ──
    {
      name: "東伊豆町",
      slug: "higashiizu",
      topUrl: "https://www.town.higashiizu.shizuoka.jp/",
      region: "賀茂郡",
    },
    {
      name: "河津町",
      slug: "kawazu",
      topUrl: "https://www.town.kawazu.shizuoka.jp/",
      region: "賀茂郡",
    },
    {
      name: "南伊豆町",
      slug: "minamiizu",
      topUrl: "https://www.town.minamiizu.shizuoka.jp/",
      region: "賀茂郡",
    },
    {
      name: "松崎町",
      slug: "matsuzaki",
      topUrl: "https://www.town.matsuzaki.shizuoka.jp/",
      region: "賀茂郡",
    },
    {
      name: "西伊豆町",
      slug: "nishiizu",
      topUrl: "https://www.town.nishiizu.shizuoka.jp/",
      region: "賀茂郡",
    },
    // ── 田方郡 ──
    {
      name: "函南町",
      slug: "kannami",
      topUrl: "https://www.town.kannami.shizuoka.jp/",
      region: "田方郡",
    },
    // ── 駿東郡 ──
    {
      name: "清水町",
      slug: "shimizu-s",
      topUrl: "https://www.town.shimizu.shizuoka.jp/",
      region: "駿東郡",
    },
    {
      name: "長泉町",
      slug: "nagaizumi",
      topUrl: "https://www.town.nagaizumi.lg.jp/",
      region: "駿東郡",
    },
    {
      name: "小山町",
      slug: "oyama-s",
      topUrl: "https://www.town.oyama.shizuoka.jp/",
      region: "駿東郡",
    },
    // ── 榛原郡 ──
    {
      name: "吉田町",
      slug: "yoshida-s",
      topUrl: "https://www.town.yoshida.shizuoka.jp/",
      region: "榛原郡",
    },
    {
      name: "川根本町",
      slug: "kawanehon",
      topUrl: "https://www.town.kawanehon.shizuoka.jp/",
      region: "榛原郡",
    },
    // ── 周智郡 ──
    {
      name: "森町",
      slug: "mori-s",
      topUrl: "https://www.town.morimachi.shizuoka.jp/",
      region: "周智郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 愛知県 (38市・14町・2村 = 54市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-aichi": [
    // ── 市 (38) ──
    {
      name: "名古屋市",
      slug: "nagoya",
      topUrl: "https://www.city.nagoya.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    { name: "豊田市", slug: "toyota", topUrl: "https://www.city.toyota.aichi.jp/", region: "市" },
    { name: "岡崎市", slug: "okazaki", topUrl: "https://www.city.okazaki.lg.jp/", region: "市" },
    {
      name: "豊橋市",
      slug: "toyohashi",
      topUrl: "https://www.city.toyohashi.lg.jp/",
      region: "市",
    },
    {
      name: "一宮市",
      slug: "ichinomiya",
      topUrl: "https://www.city.ichinomiya.aichi.jp/",
      region: "市",
    },
    { name: "春日井市", slug: "kasugai", topUrl: "https://www.city.kasugai.lg.jp/", region: "市" },
    { name: "安城市", slug: "anjo", topUrl: "https://www.city.anjo.aichi.jp/", region: "市" },
    { name: "豊川市", slug: "toyokawa", topUrl: "https://www.city.toyokawa.lg.jp/", region: "市" },
    { name: "西尾市", slug: "nishio", topUrl: "https://www.city.nishio.aichi.jp/", region: "市" },
    { name: "刈谷市", slug: "kariya", topUrl: "https://www.city.kariya.lg.jp/", region: "市" },
    { name: "小牧市", slug: "komaki", topUrl: "https://www.city.komaki.aichi.jp/", region: "市" },
    { name: "稲沢市", slug: "inazawa", topUrl: "https://www.city.inazawa.aichi.jp/", region: "市" },
    { name: "瀬戸市", slug: "seto", topUrl: "https://www.city.seto.aichi.jp/", region: "市" },
    { name: "半田市", slug: "handa", topUrl: "https://www.city.handa.lg.jp/", region: "市" },
    { name: "東海市", slug: "tokai-a", topUrl: "https://www.city.tokai.aichi.jp/", region: "市" },
    { name: "江南市", slug: "konan-a", topUrl: "https://www.city.konan.lg.jp/", region: "市" },
    { name: "大府市", slug: "obu", topUrl: "https://www.city.obu.aichi.jp/", region: "市" },
    { name: "日進市", slug: "nisshin", topUrl: "https://www.city.nisshin.lg.jp/", region: "市" },
    { name: "あま市", slug: "ama", topUrl: "https://www.city.ama.aichi.jp/", region: "市" },
    { name: "知多市", slug: "chita", topUrl: "https://www.city.chita.lg.jp/", region: "市" },
    { name: "蒲郡市", slug: "gamagori", topUrl: "https://www.city.gamagori.lg.jp/", region: "市" },
    { name: "犬山市", slug: "inuyama", topUrl: "https://www.city.inuyama.aichi.jp/", region: "市" },
    { name: "碧南市", slug: "hekinan", topUrl: "https://www.city.hekinan.lg.jp/", region: "市" },
    { name: "知立市", slug: "chiryu", topUrl: "https://www.city.chiryu.aichi.jp/", region: "市" },
    {
      name: "みよし市",
      slug: "miyoshi",
      topUrl: "https://www.city.aichi-miyoshi.lg.jp/",
      region: "市",
    },
    {
      name: "尾張旭市",
      slug: "owariasahi",
      topUrl: "https://www.city.owariasahi.lg.jp/",
      region: "市",
    },
    { name: "津島市", slug: "tsushima", topUrl: "https://www.city.tsushima.lg.jp/", region: "市" },
    { name: "岩倉市", slug: "iwakura", topUrl: "https://www.city.iwakura.aichi.jp/", region: "市" },
    { name: "愛西市", slug: "aisai", topUrl: "https://www.city.aisai.lg.jp/", region: "市" },
    { name: "清須市", slug: "kiyosu", topUrl: "https://www.city.kiyosu.aichi.jp/", region: "市" },
    {
      name: "北名古屋市",
      slug: "kitanagoya",
      topUrl: "https://www.city.kitanagoya.lg.jp/",
      region: "市",
    },
    { name: "弥富市", slug: "yatomi", topUrl: "https://www.city.yatomi.lg.jp/", region: "市" },
    {
      name: "長久手市",
      slug: "nagakute",
      topUrl: "https://www.city.nagakute.lg.jp/",
      region: "市",
    },
    {
      name: "常滑市",
      slug: "tokoname",
      topUrl: "https://www.city.tokoname.aichi.jp/",
      region: "市",
    },
    { name: "田原市", slug: "tahara", topUrl: "https://www.city.tahara.aichi.jp/", region: "市" },
    {
      name: "新城市",
      slug: "shinshiro",
      topUrl: "https://www.city.shinshiro.lg.jp/",
      region: "市",
    },
    {
      name: "高浜市",
      slug: "takahama-a",
      topUrl: "https://www.city.takahama.lg.jp/",
      region: "市",
    },
    { name: "豊明市", slug: "toyoake", topUrl: "https://www.city.toyoake.lg.jp/", region: "市" },
    // ── 愛知郡 ──
    {
      name: "東郷町",
      slug: "togo",
      topUrl: "https://www.town.aichi-togo.lg.jp/",
      region: "愛知郡",
    },
    // ── 西春日井郡 ──
    {
      name: "豊山町",
      slug: "toyoyama",
      topUrl: "https://www.town.toyoyama.lg.jp/",
      region: "西春日井郡",
    },
    // ── 丹羽郡 ──
    { name: "大口町", slug: "oguchi", topUrl: "https://www.town.oguchi.lg.jp/", region: "丹羽郡" },
    { name: "扶桑町", slug: "fuso", topUrl: "https://www.town.fuso.lg.jp/", region: "丹羽郡" },
    // ── 海部郡 ──
    { name: "大治町", slug: "oharu", topUrl: "https://www.town.oharu.aichi.jp/", region: "海部郡" },
    { name: "蟹江町", slug: "kanie", topUrl: "https://www.town.kanie.aichi.jp/", region: "海部郡" },
    {
      name: "飛島村",
      slug: "tobishima",
      topUrl: "https://www.vill.tobishima.aichi.jp/",
      region: "海部郡",
    },
    // ── 知多郡 ──
    { name: "阿久比町", slug: "agui", topUrl: "https://www.town.agui.lg.jp/", region: "知多郡" },
    {
      name: "東浦町",
      slug: "higashiura",
      topUrl: "https://www.town.aichi-higashiura.lg.jp/",
      region: "知多郡",
    },
    {
      name: "南知多町",
      slug: "minamichita",
      topUrl: "https://www.town.minamichita.lg.jp/",
      region: "知多郡",
    },
    {
      name: "美浜町",
      slug: "mihama-a",
      topUrl: "https://www.town.aichi-mihama.lg.jp/",
      region: "知多郡",
    },
    {
      name: "武豊町",
      slug: "taketoyo",
      topUrl: "https://www.town.taketoyo.lg.jp/",
      region: "知多郡",
    },
    // ── 額田郡 ──
    { name: "幸田町", slug: "kota", topUrl: "https://www.town.kota.lg.jp/", region: "額田郡" },
    // ── 北設楽郡 ──
    {
      name: "設楽町",
      slug: "shitara",
      topUrl: "https://www.town.shitara.lg.jp/",
      region: "北設楽郡",
    },
    { name: "東栄町", slug: "toei", topUrl: "https://www.town.toei.aichi.jp/", region: "北設楽郡" },
    {
      name: "豊根村",
      slug: "toyone",
      topUrl: "https://www.vill.toyone.aichi.jp/",
      region: "北設楽郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 三重県 (14市・15町 = 29市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-mie": [
    // ── 市 (14) ──
    {
      name: "津市",
      slug: "tsu",
      topUrl: "https://www.info.city.tsu.mie.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "四日市市",
      slug: "yokkaichi",
      topUrl: "https://www.city.yokkaichi.lg.jp/",
      region: "市",
    },
    { name: "鈴鹿市", slug: "suzuka", topUrl: "https://www.city.suzuka.lg.jp/", region: "市" },
    {
      name: "松阪市",
      slug: "matsusaka",
      topUrl: "https://www.city.matsusaka.mie.jp/",
      region: "市",
    },
    { name: "桑名市", slug: "kuwana", topUrl: "https://www.city.kuwana.lg.jp/", region: "市" },
    { name: "伊勢市", slug: "ise", topUrl: "https://www.city.ise.mie.jp/", region: "市" },
    { name: "名張市", slug: "nabari", topUrl: "https://www.city.nabari.lg.jp/", region: "市" },
    { name: "伊賀市", slug: "iga", topUrl: "https://www.city.iga.lg.jp/", region: "市" },
    { name: "亀山市", slug: "kameyama", topUrl: "https://www.city.kameyama.mie.jp/", region: "市" },
    { name: "志摩市", slug: "shima", topUrl: "https://www.city.shima.mie.jp/", region: "市" },
    { name: "いなべ市", slug: "inabe", topUrl: "https://www.city.inabe.mie.jp/", region: "市" },
    { name: "鳥羽市", slug: "toba", topUrl: "https://www.city.toba.mie.jp/", region: "市" },
    { name: "尾鷲市", slug: "owase", topUrl: "https://www.city.owase.lg.jp/", region: "市" },
    { name: "熊野市", slug: "kumano-m", topUrl: "https://www.city.kumano.mie.jp/", region: "市" },
    // ── 桑名郡 ──
    {
      name: "木曽岬町",
      slug: "kisosaki",
      topUrl: "https://www.town.kisosaki.lg.jp/",
      region: "桑名郡",
    },
    // ── 員弁郡 ──
    { name: "東員町", slug: "toin", topUrl: "https://www.town.toin.lg.jp/", region: "員弁郡" },
    // ── 三重郡 ──
    { name: "菰野町", slug: "komono", topUrl: "https://www.town.komono.mie.jp/", region: "三重郡" },
    { name: "朝日町", slug: "asahi-m", topUrl: "https://www.town.asahi.mie.jp/", region: "三重郡" },
    {
      name: "川越町",
      slug: "kawagoe-m",
      topUrl: "https://www.town.kawagoe.mie.jp/",
      region: "三重郡",
    },
    // ── 多気郡 ──
    { name: "多気町", slug: "taki", topUrl: "https://www.town.taki.mie.jp/", region: "多気郡" },
    { name: "明和町", slug: "meiwa-m", topUrl: "https://www.town.meiwa.mie.jp/", region: "多気郡" },
    { name: "大台町", slug: "odai", topUrl: "https://www.town.odai.lg.jp/", region: "多気郡" },
    // ── 度会郡 ──
    { name: "玉城町", slug: "tamaki", topUrl: "https://www.town.tamaki.mie.jp/", region: "度会郡" },
    {
      name: "度会町",
      slug: "watarai",
      topUrl: "https://www.town.watarai.lg.jp/",
      region: "度会郡",
    },
    { name: "大紀町", slug: "taiki-m", topUrl: "https://www.town.taiki.mie.jp/", region: "度会郡" },
    {
      name: "南伊勢町",
      slug: "minamiise",
      topUrl: "https://www.town.minamiise.lg.jp/",
      region: "度会郡",
    },
    // ── 北牟婁郡 ──
    {
      name: "紀北町",
      slug: "kihoku",
      topUrl: "https://www.town.mie-kihoku.lg.jp/",
      region: "北牟婁郡",
    },
    // ── 南牟婁郡 ──
    {
      name: "御浜町",
      slug: "mihama-m",
      topUrl: "https://www.town.mihama.mie.jp/",
      region: "南牟婁郡",
    },
    { name: "紀宝町", slug: "kiho", topUrl: "https://www.town.kiho.lg.jp/", region: "南牟婁郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 滋賀県 (13市・6町 = 19市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-shiga": [
    // ── 市 (13) ──
    {
      name: "大津市",
      slug: "otsu",
      topUrl: "https://www.city.otsu.lg.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "草津市",
      slug: "kusatsu-s",
      topUrl: "https://www.city.kusatsu.shiga.jp/",
      region: "市",
    },
    { name: "長浜市", slug: "nagahama", topUrl: "https://www.city.nagahama.lg.jp/", region: "市" },
    {
      name: "東近江市",
      slug: "higashiomi",
      topUrl: "https://www.city.higashiomi.shiga.jp/",
      region: "市",
    },
    { name: "彦根市", slug: "hikone", topUrl: "https://www.city.hikone.lg.jp/", region: "市" },
    { name: "甲賀市", slug: "koka", topUrl: "https://www.city.koka.lg.jp/", region: "市" },
    {
      name: "近江八幡市",
      slug: "omihachiman",
      topUrl: "https://www.city.omihachiman.lg.jp/",
      region: "市",
    },
    {
      name: "守山市",
      slug: "moriyama-s",
      topUrl: "https://www.city.moriyama.lg.jp/",
      region: "市",
    },
    { name: "栗東市", slug: "ritto", topUrl: "https://www.city.ritto.lg.jp/", region: "市" },
    { name: "野洲市", slug: "yasu", topUrl: "https://www.city.yasu.lg.jp/", region: "市" },
    {
      name: "湖南市",
      slug: "konan-s",
      topUrl: "https://www.city.shiga-konan.lg.jp/",
      region: "市",
    },
    {
      name: "高島市",
      slug: "takashima",
      topUrl: "https://www.city.takashima.lg.jp/",
      region: "市",
    },
    { name: "米原市", slug: "maibara", topUrl: "https://www.city.maibara.lg.jp/", region: "市" },
    // ── 蒲生郡 ──
    {
      name: "日野町",
      slug: "hino-s",
      topUrl: "https://www.town.shiga-hino.lg.jp/",
      region: "蒲生郡",
    },
    { name: "竜王町", slug: "ryuoh", topUrl: "https://www.town.ryuoh.shiga.jp/", region: "蒲生郡" },
    // ── 愛知郡 ──
    { name: "愛荘町", slug: "aisho", topUrl: "https://www.town.aisho.shiga.jp/", region: "愛知郡" },
    // ── 犬上郡 ──
    {
      name: "豊郷町",
      slug: "toyosato",
      topUrl: "https://www.town.toyosato.shiga.jp/",
      region: "犬上郡",
    },
    { name: "甲良町", slug: "koura", topUrl: "https://www.town.koura.shiga.jp/", region: "犬上郡" },
    { name: "多賀町", slug: "taga", topUrl: "https://www.town.taga.lg.jp/", region: "犬上郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 京都府 (15市・10町・1村 = 26市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-kyoto": [
    // ── 市 (15) ──
    {
      name: "京都市",
      slug: "kyoto-city",
      topUrl: "https://www.city.kyoto.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    { name: "宇治市", slug: "uji", topUrl: "https://www.city.uji.kyoto.jp/", region: "市" },
    { name: "亀岡市", slug: "kameoka", topUrl: "https://www.city.kameoka.kyoto.jp/", region: "市" },
    {
      name: "長岡京市",
      slug: "nagaokakyo",
      topUrl: "https://www.city.nagaokakyo.lg.jp/",
      region: "市",
    },
    { name: "舞鶴市", slug: "maizuru", topUrl: "https://www.city.maizuru.kyoto.jp/", region: "市" },
    {
      name: "福知山市",
      slug: "fukuchiyama",
      topUrl: "https://www.city.fukuchiyama.lg.jp/",
      region: "市",
    },
    { name: "城陽市", slug: "joyo", topUrl: "https://www.city.joyo.kyoto.jp/", region: "市" },
    {
      name: "木津川市",
      slug: "kizugawa",
      topUrl: "https://www.city.kizugawa.lg.jp/",
      region: "市",
    },
    { name: "向日市", slug: "muko", topUrl: "https://www.city.muko.kyoto.jp/", region: "市" },
    { name: "八幡市", slug: "yawata", topUrl: "https://www.city.yawata.kyoto.jp/", region: "市" },
    { name: "京田辺市", slug: "kyotanabe", topUrl: "https://www.kyotanabe.jp/", region: "市" },
    {
      name: "京丹後市",
      slug: "kyotango",
      topUrl: "https://www.city.kyotango.lg.jp/",
      region: "市",
    },
    { name: "綾部市", slug: "ayabe", topUrl: "https://www.city.ayabe.lg.jp/", region: "市" },
    { name: "宮津市", slug: "miyazu", topUrl: "https://www.city.miyazu.kyoto.jp/", region: "市" },
    { name: "南丹市", slug: "nantan", topUrl: "https://www.city.nantan.kyoto.jp/", region: "市" },
    // ── 乙訓郡 ──
    {
      name: "大山崎町",
      slug: "oyamazaki",
      topUrl: "https://www.town.oyamazaki.lg.jp/",
      region: "乙訓郡",
    },
    // ── 久世郡 ──
    {
      name: "久御山町",
      slug: "kumiyama",
      topUrl: "https://www.town.kumiyama.lg.jp/",
      region: "久世郡",
    },
    // ── 綴喜郡 ──
    { name: "井手町", slug: "ide", topUrl: "https://www.town.ide.kyoto.jp/", region: "綴喜郡" },
    {
      name: "宇治田原町",
      slug: "ujitawara",
      topUrl: "https://www.town.ujitawara.kyoto.jp/",
      region: "綴喜郡",
    },
    // ── 相楽郡 ──
    { name: "笠置町", slug: "kasagi", topUrl: "https://www.town.kasagi.lg.jp/", region: "相楽郡" },
    { name: "和束町", slug: "wazuka", topUrl: "https://www.town.wazuka.lg.jp/", region: "相楽郡" },
    { name: "精華町", slug: "seika", topUrl: "https://www.town.seika.kyoto.jp/", region: "相楽郡" },
    {
      name: "南山城村",
      slug: "minamiyamashiro",
      topUrl: "https://www.vill.minamiyamashiro.lg.jp/",
      region: "相楽郡",
    },
    // ── 船井郡 ──
    {
      name: "京丹波町",
      slug: "kyotamba",
      topUrl: "https://www.town.kyotamba.kyoto.jp/",
      region: "船井郡",
    },
    // ── 与謝郡 ──
    { name: "伊根町", slug: "ine", topUrl: "https://www.town.ine.kyoto.jp/", region: "与謝郡" },
    {
      name: "与謝野町",
      slug: "yosano",
      topUrl: "https://www.town.yosano.lg.jp/",
      region: "与謝郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 大阪府 (33市・9町・1村 = 43市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-osaka": [
    // ── 市 (33) ──
    {
      name: "大阪市",
      slug: "osaka-city",
      topUrl: "https://www.city.osaka.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "堺市",
      slug: "sakai",
      topUrl: "https://www.city.sakai.lg.jp/",
      isDesignated: true,
      region: "市",
    },
    {
      name: "東大阪市",
      slug: "higashiosaka",
      topUrl: "https://www.city.higashiosaka.lg.jp/",
      region: "市",
    },
    {
      name: "豊中市",
      slug: "toyonaka",
      topUrl: "https://www.city.toyonaka.osaka.jp/",
      region: "市",
    },
    {
      name: "枚方市",
      slug: "hirakata",
      topUrl: "https://www.city.hirakata.osaka.jp/",
      region: "市",
    },
    { name: "吹田市", slug: "suita", topUrl: "https://www.city.suita.osaka.jp/", region: "市" },
    {
      name: "高槻市",
      slug: "takatsuki",
      topUrl: "https://www.city.takatsuki.osaka.jp/",
      region: "市",
    },
    {
      name: "茨木市",
      slug: "ibaraki-o",
      topUrl: "https://www.city.ibaraki.osaka.jp/",
      region: "市",
    },
    { name: "八尾市", slug: "yao", topUrl: "https://www.city.yao.osaka.jp/", region: "市" },
    {
      name: "寝屋川市",
      slug: "neyagawa",
      topUrl: "https://www.city.neyagawa.osaka.jp/",
      region: "市",
    },
    {
      name: "岸和田市",
      slug: "kishiwada",
      topUrl: "https://www.city.kishiwada.osaka.jp/",
      region: "市",
    },
    { name: "和泉市", slug: "izumi", topUrl: "https://www.city.osaka-izumi.lg.jp/", region: "市" },
    {
      name: "守口市",
      slug: "moriguchi",
      topUrl: "https://www.city.moriguchi.osaka.jp/",
      region: "市",
    },
    { name: "門真市", slug: "kadoma", topUrl: "https://www.city.kadoma.osaka.jp/", region: "市" },
    { name: "箕面市", slug: "minoh", topUrl: "https://www.city.minoh.lg.jp/", region: "市" },
    { name: "大東市", slug: "daito", topUrl: "https://www.city.daito.lg.jp/", region: "市" },
    {
      name: "松原市",
      slug: "matsubara",
      topUrl: "https://www.city.matsubara.lg.jp/",
      region: "市",
    },
    {
      name: "富田林市",
      slug: "tondabayashi",
      topUrl: "https://www.city.tondabayashi.lg.jp/",
      region: "市",
    },
    {
      name: "羽曳野市",
      slug: "habikino",
      topUrl: "https://www.city.habikino.lg.jp/",
      region: "市",
    },
    {
      name: "河内長野市",
      slug: "kawachinagano",
      topUrl: "https://www.city.kawachinagano.lg.jp/",
      region: "市",
    },
    { name: "池田市", slug: "ikeda-o", topUrl: "https://www.city.ikeda.osaka.jp/", region: "市" },
    {
      name: "泉佐野市",
      slug: "izumisano",
      topUrl: "https://www.city.izumisano.lg.jp/",
      region: "市",
    },
    { name: "貝塚市", slug: "kaizuka", topUrl: "https://www.city.kaizuka.lg.jp/", region: "市" },
    { name: "摂津市", slug: "settsu", topUrl: "https://www.city.settsu.osaka.jp/", region: "市" },
    { name: "交野市", slug: "katano", topUrl: "https://www.city.katano.osaka.jp/", region: "市" },
    {
      name: "泉大津市",
      slug: "izumiotsu",
      topUrl: "https://www.city.izumiotsu.lg.jp/",
      region: "市",
    },
    {
      name: "柏原市",
      slug: "kashiwara",
      topUrl: "https://www.city.kashiwara.osaka.jp/",
      region: "市",
    },
    {
      name: "藤井寺市",
      slug: "fujiidera",
      topUrl: "https://www.city.fujiidera.lg.jp/",
      region: "市",
    },
    { name: "泉南市", slug: "sennan", topUrl: "https://www.city.sennan.lg.jp/", region: "市" },
    {
      name: "大阪狭山市",
      slug: "osakasayama",
      topUrl: "https://www.city.osakasayama.osaka.jp/",
      region: "市",
    },
    { name: "高石市", slug: "takaishi", topUrl: "https://www.city.takaishi.lg.jp/", region: "市" },
    {
      name: "四條畷市",
      slug: "shijonawate",
      topUrl: "https://www.city.shijonawate.lg.jp/",
      region: "市",
    },
    { name: "阪南市", slug: "hannan", topUrl: "https://www.city.hannan.lg.jp/", region: "市" },
    // ── 三島郡 ──
    {
      name: "島本町",
      slug: "shimamoto",
      topUrl: "https://www.town.shimamoto.lg.jp/",
      region: "三島郡",
    },
    // ── 豊能郡 ──
    {
      name: "豊能町",
      slug: "toyono",
      topUrl: "https://www.town.toyono.osaka.jp/",
      region: "豊能郡",
    },
    { name: "能勢町", slug: "nose", topUrl: "https://www.town.nose.osaka.jp/", region: "豊能郡" },
    // ── 泉北郡 ──
    {
      name: "忠岡町",
      slug: "tadaoka",
      topUrl: "https://www.town.tadaoka.osaka.jp/",
      region: "泉北郡",
    },
    // ── 泉南郡 ──
    {
      name: "熊取町",
      slug: "kumatori",
      topUrl: "https://www.town.kumatori.lg.jp/",
      region: "泉南郡",
    },
    {
      name: "田尻町",
      slug: "tajiri",
      topUrl: "https://www.town.tajiri.osaka.jp/",
      region: "泉南郡",
    },
    { name: "岬町", slug: "misaki", topUrl: "https://www.town.misaki.osaka.jp/", region: "泉南郡" },
    // ── 南河内郡 ──
    {
      name: "太子町",
      slug: "taishi-o",
      topUrl: "https://www.town.taishi.osaka.jp/",
      region: "南河内郡",
    },
    {
      name: "河南町",
      slug: "kanan",
      topUrl: "https://www.town.kanan.osaka.jp/",
      region: "南河内郡",
    },
    {
      name: "千早赤阪村",
      slug: "chihayaakasaka",
      topUrl: "https://www.vill.chihayaakasaka.osaka.jp/",
      region: "南河内郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 兵庫県 (29市・12町 = 41市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-hyogo": [
    // ── 市 (29) ──
    {
      name: "神戸市",
      slug: "kobe",
      topUrl: "https://www.city.kobe.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    { name: "姫路市", slug: "himeji", topUrl: "https://www.city.himeji.lg.jp/", region: "市" },
    { name: "西宮市", slug: "nishinomiya", topUrl: "https://www.nishi.or.jp/", region: "市" },
    {
      name: "尼崎市",
      slug: "amagasaki",
      topUrl: "https://www.city.amagasaki.hyogo.jp/",
      region: "市",
    },
    { name: "明石市", slug: "akashi", topUrl: "https://www.city.akashi.lg.jp/", region: "市" },
    {
      name: "加古川市",
      slug: "kakogawa",
      topUrl: "https://www.city.kakogawa.lg.jp/",
      region: "市",
    },
    {
      name: "宝塚市",
      slug: "takarazuka",
      topUrl: "https://www.city.takarazuka.hyogo.jp/",
      region: "市",
    },
    { name: "伊丹市", slug: "itami", topUrl: "https://www.city.itami.lg.jp/", region: "市" },
    {
      name: "川西市",
      slug: "kawanishi",
      topUrl: "https://www.city.kawanishi.hyogo.jp/",
      region: "市",
    },
    { name: "三田市", slug: "sanda", topUrl: "https://www.city.sanda.lg.jp/", region: "市" },
    { name: "高砂市", slug: "takasago", topUrl: "https://www.city.takasago.lg.jp/", region: "市" },
    { name: "芦屋市", slug: "ashiya", topUrl: "https://www.city.ashiya.lg.jp/", region: "市" },
    { name: "豊岡市", slug: "toyooka", topUrl: "https://www.city.toyooka.lg.jp/", region: "市" },
    { name: "三木市", slug: "miki", topUrl: "https://www.city.miki.lg.jp/", region: "市" },
    { name: "たつの市", slug: "tatsuno", topUrl: "https://www.city.tatsuno.lg.jp/", region: "市" },
    { name: "丹波市", slug: "tamba", topUrl: "https://www.city.tamba.lg.jp/", region: "市" },
    { name: "赤穂市", slug: "ako", topUrl: "https://www.city.ako.lg.jp/", region: "市" },
    { name: "小野市", slug: "ono-h", topUrl: "https://www.city.ono.hyogo.jp/", region: "市" },
    { name: "加西市", slug: "kasai", topUrl: "https://www.city.kasai.hyogo.jp/", region: "市" },
    {
      name: "篠山市",
      slug: "sasayama",
      topUrl: "https://www.city.tambasasayama.lg.jp/",
      region: "市",
    },
    { name: "養父市", slug: "yabu", topUrl: "https://www.city.yabu.hyogo.jp/", region: "市" },
    { name: "洲本市", slug: "sumoto", topUrl: "https://www.city.sumoto.lg.jp/", region: "市" },
    { name: "淡路市", slug: "awaji", topUrl: "https://www.city.awaji.lg.jp/", region: "市" },
    {
      name: "南あわじ市",
      slug: "minamiawaji",
      topUrl: "https://www.city.minamiawaji.hyogo.jp/",
      region: "市",
    },
    { name: "朝来市", slug: "asago", topUrl: "https://www.city.asago.hyogo.jp/", region: "市" },
    { name: "宍粟市", slug: "shiso", topUrl: "https://www.city.shiso.lg.jp/", region: "市" },
    { name: "加東市", slug: "kato", topUrl: "https://www.city.kato.lg.jp/", region: "市" },
    { name: "相生市", slug: "aioi", topUrl: "https://www.city.aioi.lg.jp/", region: "市" },
    {
      name: "西脇市",
      slug: "nishiwaki",
      topUrl: "https://www.city.nishiwaki.lg.jp/",
      region: "市",
    },
    // ── 川辺郡 ──
    {
      name: "猪名川町",
      slug: "inagawa",
      topUrl: "https://www.town.inagawa.lg.jp/",
      region: "川辺郡",
    },
    // ── 多可郡 ──
    { name: "多可町", slug: "taka", topUrl: "https://www.town.taka.lg.jp/", region: "多可郡" },
    // ── 加古郡 ──
    {
      name: "稲美町",
      slug: "inami",
      topUrl: "https://www.town.hyogo-inami.lg.jp/",
      region: "加古郡",
    },
    { name: "播磨町", slug: "harima", topUrl: "https://www.town.harima.lg.jp/", region: "加古郡" },
    // ── 神崎郡 ──
    {
      name: "市川町",
      slug: "ichikawa-h",
      topUrl: "https://www.town.ichikawa.hyogo.jp/",
      region: "神崎郡",
    },
    {
      name: "福崎町",
      slug: "fukusaki",
      topUrl: "https://www.town.fukusaki.hyogo.jp/",
      region: "神崎郡",
    },
    {
      name: "神河町",
      slug: "kamikawa-h",
      topUrl: "https://www.town.kamikawa.hyogo.jp/",
      region: "神崎郡",
    },
    // ── 揖保郡 ──
    {
      name: "太子町",
      slug: "taishi-h",
      topUrl: "https://www.town.hyogo-taishi.lg.jp/",
      region: "揖保郡",
    },
    // ── 赤穂郡 ──
    {
      name: "上郡町",
      slug: "kamigori",
      topUrl: "https://www.town.kamigori.hyogo.jp/",
      region: "赤穂郡",
    },
    // ── 佐用郡 ──
    { name: "佐用町", slug: "sayo", topUrl: "https://www.town.sayo.lg.jp/", region: "佐用郡" },
    // ── 美方郡 ──
    {
      name: "香美町",
      slug: "kami-h",
      topUrl: "https://www.town.mikata-kami.lg.jp/",
      region: "美方郡",
    },
    {
      name: "新温泉町",
      slug: "shinonsen",
      topUrl: "https://www.town.shinonsen.hyogo.jp/",
      region: "美方郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 奈良県 (12市・15町・12村 = 39市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-nara": [
    // ── 市 (12) ──
    {
      name: "奈良市",
      slug: "nara-city",
      topUrl: "https://www.city.nara.lg.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "橿原市",
      slug: "kashihara",
      topUrl: "https://www.city.kashihara.nara.jp/",
      region: "市",
    },
    { name: "生駒市", slug: "ikoma", topUrl: "https://www.city.ikoma.lg.jp/", region: "市" },
    {
      name: "大和郡山市",
      slug: "yamatokoriyama",
      topUrl: "https://www.city.yamatokoriyama.lg.jp/",
      region: "市",
    },
    { name: "香芝市", slug: "kashiba", topUrl: "https://www.city.kashiba.lg.jp/", region: "市" },
    { name: "天理市", slug: "tenri", topUrl: "https://www.city.tenri.nara.jp/", region: "市" },
    {
      name: "大和高田市",
      slug: "yamatotakada",
      topUrl: "https://www.city.yamatotakada.nara.jp/",
      region: "市",
    },
    { name: "桜井市", slug: "sakurai", topUrl: "https://www.city.sakurai.lg.jp/", region: "市" },
    {
      name: "葛城市",
      slug: "katsuragi",
      topUrl: "https://www.city.katsuragi.nara.jp/",
      region: "市",
    },
    { name: "五條市", slug: "gojo", topUrl: "https://www.city.gojo.lg.jp/", region: "市" },
    { name: "宇陀市", slug: "uda", topUrl: "https://www.city.uda.nara.jp/", region: "市" },
    { name: "御所市", slug: "gose", topUrl: "https://www.city.gose.nara.jp/", region: "市" },
    // ── 山辺郡 ──
    {
      name: "山添村",
      slug: "yamazoe",
      topUrl: "https://www.vill.yamazoe.nara.jp/",
      region: "山辺郡",
    },
    // ── 生駒郡 ──
    {
      name: "平群町",
      slug: "heguri",
      topUrl: "https://www.town.heguri.nara.jp/",
      region: "生駒郡",
    },
    { name: "三郷町", slug: "sango", topUrl: "https://www.town.sango.nara.jp/", region: "生駒郡" },
    {
      name: "斑鳩町",
      slug: "ikaruga",
      topUrl: "https://www.town.ikaruga.nara.jp/",
      region: "生駒郡",
    },
    { name: "安堵町", slug: "ando", topUrl: "https://www.town.ando.nara.jp/", region: "生駒郡" },
    // ── 磯城郡 ──
    {
      name: "川西町",
      slug: "kawanishi-na",
      topUrl: "https://www.town.kawanishi.nara.jp/",
      region: "磯城郡",
    },
    {
      name: "三宅町",
      slug: "miyake-n",
      topUrl: "https://www.town.miyake.lg.jp/",
      region: "磯城郡",
    },
    {
      name: "田原本町",
      slug: "tawaramoto",
      topUrl: "https://www.town.tawaramoto.nara.jp/",
      region: "磯城郡",
    },
    // ── 宇陀郡 ──
    { name: "曽爾村", slug: "soni", topUrl: "https://www.vill.soni.nara.jp/", region: "宇陀郡" },
    {
      name: "御杖村",
      slug: "mitsue",
      topUrl: "https://www.vill.mitsue.nara.jp/",
      region: "宇陀郡",
    },
    // ── 高市郡 ──
    {
      name: "高取町",
      slug: "takatori",
      topUrl: "https://www.town.takatori.nara.jp/",
      region: "高市郡",
    },
    { name: "明日香村", slug: "asuka", topUrl: "https://www.asukamura.jp/", region: "高市郡" },
    // ── 北葛城郡 ──
    {
      name: "上牧町",
      slug: "kanmaki",
      topUrl: "https://www.town.kanmaki.nara.jp/",
      region: "北葛城郡",
    },
    { name: "王寺町", slug: "oji", topUrl: "https://www.town.oji.nara.jp/", region: "北葛城郡" },
    {
      name: "広陵町",
      slug: "koryo",
      topUrl: "https://www.town.koryo.nara.jp/",
      region: "北葛城郡",
    },
    {
      name: "河合町",
      slug: "kawai",
      topUrl: "https://www.town.kawai.nara.jp/",
      region: "北葛城郡",
    },
    // ── 吉野郡 ──
    {
      name: "吉野町",
      slug: "yoshino",
      topUrl: "https://www.town.yoshino.nara.jp/",
      region: "吉野郡",
    },
    { name: "大淀町", slug: "oyodo", topUrl: "https://www.town.oyodo.lg.jp/", region: "吉野郡" },
    {
      name: "下市町",
      slug: "shimoichi",
      topUrl: "https://www.town.shimoichi.lg.jp/",
      region: "吉野郡",
    },
    {
      name: "黒滝村",
      slug: "kurotaki",
      topUrl: "https://www.vill.kurotaki.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "天川村",
      slug: "tenkawa",
      topUrl: "https://www.vill.tenkawa.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "野迫川村",
      slug: "nosegawa",
      topUrl: "https://www.vill.nosegawa.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "十津川村",
      slug: "totsukawa",
      topUrl: "https://www.vill.totsukawa.lg.jp/",
      region: "吉野郡",
    },
    {
      name: "下北山村",
      slug: "shimokitayama",
      topUrl: "https://www.vill.shimokitayama.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "上北山村",
      slug: "kamikitayama",
      topUrl: "https://www.vill.kamikitayama.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "川上村",
      slug: "kawakami-n",
      topUrl: "https://www.vill.kawakami.nara.jp/",
      region: "吉野郡",
    },
    {
      name: "東吉野村",
      slug: "higashiyoshino",
      topUrl: "https://www.vill.higashiyoshino.nara.jp/",
      region: "吉野郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 和歌山県 (9市・20町・1村 = 30市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-wakayama": [
    // ── 市 (9) ──
    {
      name: "和歌山市",
      slug: "wakayama-city",
      topUrl: "https://www.city.wakayama.wakayama.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "田辺市", slug: "tanabe", topUrl: "https://www.city.tanabe.lg.jp/", region: "市" },
    {
      name: "橋本市",
      slug: "hashimoto",
      topUrl: "https://www.city.hashimoto.lg.jp/",
      region: "市",
    },
    {
      name: "紀の川市",
      slug: "kinokawa",
      topUrl: "https://www.city.kinokawa.lg.jp/",
      region: "市",
    },
    { name: "岩出市", slug: "iwade", topUrl: "https://www.city.iwade.lg.jp/", region: "市" },
    { name: "海南市", slug: "kainan", topUrl: "https://www.city.kainan.lg.jp/", region: "市" },
    { name: "有田市", slug: "arida", topUrl: "https://www.city.arida.lg.jp/", region: "市" },
    { name: "御坊市", slug: "gobo", topUrl: "https://www.city.gobo.wakayama.jp/", region: "市" },
    { name: "新宮市", slug: "shingu", topUrl: "https://www.city.shingu.lg.jp/", region: "市" },
    // ── 海草郡 ──
    {
      name: "紀美野町",
      slug: "kimino",
      topUrl: "https://www.town.kimino.wakayama.jp/",
      region: "海草郡",
    },
    // ── 伊都郡 ──
    {
      name: "かつらぎ町",
      slug: "katsuragi-w",
      topUrl: "https://www.town.katsuragi.wakayama.jp/",
      region: "伊都郡",
    },
    {
      name: "九度山町",
      slug: "kudoyama",
      topUrl: "https://www.town.kudoyama.wakayama.jp/",
      region: "伊都郡",
    },
    {
      name: "高野町",
      slug: "koya",
      topUrl: "https://www.town.koya.wakayama.jp/",
      region: "伊都郡",
    },
    // ── 有田郡 ──
    {
      name: "湯浅町",
      slug: "yuasa",
      topUrl: "https://www.town.yuasa.wakayama.jp/",
      region: "有田郡",
    },
    {
      name: "広川町",
      slug: "hirogawa",
      topUrl: "https://www.town.hirogawa.wakayama.jp/",
      region: "有田郡",
    },
    {
      name: "有田川町",
      slug: "aridagawa",
      topUrl: "https://www.town.aridagawa.lg.jp/",
      region: "有田郡",
    },
    // ── 日高郡 ──
    {
      name: "美浜町",
      slug: "mihama-w",
      topUrl: "https://www.town.mihama.wakayama.jp/",
      region: "日高郡",
    },
    {
      name: "日高町",
      slug: "hidaka-w",
      topUrl: "https://www.town.hidaka.wakayama.jp/",
      region: "日高郡",
    },
    {
      name: "由良町",
      slug: "yura",
      topUrl: "https://www.town.yura.wakayama.jp/",
      region: "日高郡",
    },
    {
      name: "印南町",
      slug: "inami-w",
      topUrl: "https://www.town.wakayama-inami.lg.jp/",
      region: "日高郡",
    },
    {
      name: "みなべ町",
      slug: "minabe",
      topUrl: "https://www.town.minabe.lg.jp/",
      region: "日高郡",
    },
    {
      name: "日高川町",
      slug: "hidakagawa",
      topUrl: "https://www.town.hidakagawa.lg.jp/",
      region: "日高郡",
    },
    // ── 西牟婁郡 ──
    {
      name: "白浜町",
      slug: "shirahama",
      topUrl: "https://www.town.shirahama.wakayama.jp/",
      region: "西牟婁郡",
    },
    {
      name: "上富田町",
      slug: "kamitonda",
      topUrl: "https://www.town.kamitonda.lg.jp/",
      region: "西牟婁郡",
    },
    {
      name: "すさみ町",
      slug: "susami",
      topUrl: "https://www.town.susami.lg.jp/",
      region: "西牟婁郡",
    },
    // ── 東牟婁郡 ──
    {
      name: "那智勝浦町",
      slug: "nachikatsuura",
      topUrl: "https://www.town.nachikatsuura.wakayama.jp/",
      region: "東牟婁郡",
    },
    {
      name: "太地町",
      slug: "taiji",
      topUrl: "https://www.town.taiji.wakayama.jp/",
      region: "東牟婁郡",
    },
    {
      name: "古座川町",
      slug: "kozagawa",
      topUrl: "https://www.town.kozagawa.wakayama.jp/",
      region: "東牟婁郡",
    },
    {
      name: "北山村",
      slug: "kitayama",
      topUrl: "https://www.vill.kitayama.wakayama.jp/",
      region: "東牟婁郡",
    },
    {
      name: "串本町",
      slug: "kushimoto",
      topUrl: "https://www.town.kushimoto.wakayama.jp/",
      region: "東牟婁郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 鳥取県 (4市・14町・1村 = 19市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-tottori": [
    // ── 市 (4) ──
    {
      name: "鳥取市",
      slug: "tottori-city",
      topUrl: "https://www.city.tottori.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "米子市", slug: "yonago", topUrl: "https://www.city.yonago.lg.jp/", region: "市" },
    {
      name: "倉吉市",
      slug: "kurayoshi",
      topUrl: "https://www.city.kurayoshi.lg.jp/",
      region: "市",
    },
    {
      name: "境港市",
      slug: "sakaiminato",
      topUrl: "https://www.city.sakaiminato.lg.jp/",
      region: "市",
    },
    // ── 岩美郡 ──
    { name: "岩美町", slug: "iwami-t", topUrl: "https://www.iwami.gr.jp/", region: "岩美郡" },
    // ── 八頭郡 ──
    {
      name: "若桜町",
      slug: "wakasa-t",
      topUrl: "https://www.town.wakasa.tottori.jp/",
      region: "八頭郡",
    },
    {
      name: "智頭町",
      slug: "chizu",
      topUrl: "https://www.town.chizu.tottori.jp/",
      region: "八頭郡",
    },
    { name: "八頭町", slug: "yazu", topUrl: "https://www.town.yazu.tottori.jp/", region: "八頭郡" },
    // ── 東伯郡 ──
    {
      name: "三朝町",
      slug: "misasa",
      topUrl: "https://www.town.misasa.tottori.jp/",
      region: "東伯郡",
    },
    { name: "湯梨浜町", slug: "yurihama", topUrl: "https://www.yurihama.jp/", region: "東伯郡" },
    {
      name: "琴浦町",
      slug: "kotoura",
      topUrl: "https://www.town.kotoura.tottori.jp/",
      region: "東伯郡",
    },
    { name: "北栄町", slug: "hokuei", topUrl: "https://www.e-hokuei.net/", region: "東伯郡" },
    // ── 西伯郡 ──
    {
      name: "日吉津村",
      slug: "hiezu",
      topUrl: "https://www.vill.hiezu.tottori.jp/",
      region: "西伯郡",
    },
    { name: "大山町", slug: "daisen-t", topUrl: "https://www.daisen.jp/", region: "西伯郡" },
    {
      name: "南部町",
      slug: "nanbu-t",
      topUrl: "https://www.town.nanbu.tottori.jp/",
      region: "西伯郡",
    },
    { name: "伯耆町", slug: "hoki", topUrl: "https://www.houki-town.jp/", region: "西伯郡" },
    // ── 日野郡 ──
    {
      name: "日南町",
      slug: "nichinan-t",
      topUrl: "https://www.town.nichinan.lg.jp/",
      region: "日野郡",
    },
    {
      name: "日野町",
      slug: "hino-t",
      topUrl: "https://www.town.hino.tottori.jp/",
      region: "日野郡",
    },
    { name: "江府町", slug: "kofu-t", topUrl: "https://www.town-kofu.jp/", region: "日野郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 島根県 (8市・10町・1村 = 19市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-shimane": [
    // ── 市 (8) ──
    {
      name: "松江市",
      slug: "matsue",
      topUrl: "https://www.city.matsue.shimane.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "出雲市", slug: "izumo", topUrl: "https://www.city.izumo.shimane.jp/", region: "市" },
    { name: "浜田市", slug: "hamada", topUrl: "https://www.city.hamada.shimane.jp/", region: "市" },
    { name: "益田市", slug: "masuda", topUrl: "https://www.city.masuda.lg.jp/", region: "市" },
    { name: "大田市", slug: "ohda", topUrl: "https://www.city.ohda.lg.jp/", region: "市" },
    { name: "安来市", slug: "yasugi", topUrl: "https://www.city.yasugi.shimane.jp/", region: "市" },
    { name: "江津市", slug: "gotsu", topUrl: "https://www.city.gotsu.lg.jp/", region: "市" },
    { name: "雲南市", slug: "unnan", topUrl: "https://www.city.unnan.shimane.jp/", region: "市" },
    // ── 仁多郡 ──
    {
      name: "奥出雲町",
      slug: "okuizumo",
      topUrl: "https://www.town.okuizumo.shimane.jp/",
      region: "仁多郡",
    },
    // ── 飯石郡 ──
    { name: "飯南町", slug: "iinan", topUrl: "https://www.iinan.jp/", region: "飯石郡" },
    // ── 邑智郡 ──
    {
      name: "川本町",
      slug: "kawamoto",
      topUrl: "https://www.town.shimane-kawamoto.lg.jp/",
      region: "邑智郡",
    },
    {
      name: "美郷町",
      slug: "misato-sh",
      topUrl: "https://www.town.shimane-misato.lg.jp/",
      region: "邑智郡",
    },
    { name: "邑南町", slug: "ohnan", topUrl: "https://www.town.ohnan.lg.jp/", region: "邑智郡" },
    // ── 鹿足郡 ──
    {
      name: "津和野町",
      slug: "tsuwano",
      topUrl: "https://www.town.tsuwano.lg.jp/",
      region: "鹿足郡",
    },
    {
      name: "吉賀町",
      slug: "yoshika",
      topUrl: "https://www.town.yoshika.lg.jp/",
      region: "鹿足郡",
    },
    // ── 隠岐郡 ──
    {
      name: "海士町",
      slug: "ama-sh",
      topUrl: "https://www.town.ama.shimane.jp/",
      region: "隠岐郡",
    },
    {
      name: "西ノ島町",
      slug: "nishinoshima",
      topUrl: "https://www.town.nishinoshima.shimane.jp/",
      region: "隠岐郡",
    },
    { name: "知夫村", slug: "chibu", topUrl: "https://www.vill.chibu.lg.jp/", region: "隠岐郡" },
    {
      name: "隠岐の島町",
      slug: "okinoshima",
      topUrl: "https://www.town.okinoshima.shimane.jp/",
      region: "隠岐郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 岡山県 (15市・10町・2村 = 27市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-okayama": [
    // ── 市 (15) ──
    {
      name: "岡山市",
      slug: "okayama-city",
      topUrl: "https://www.city.okayama.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "倉敷市",
      slug: "kurashiki",
      topUrl: "https://www.city.kurashiki.okayama.jp/",
      region: "市",
    },
    { name: "津山市", slug: "tsuyama", topUrl: "https://www.city.tsuyama.lg.jp/", region: "市" },
    { name: "総社市", slug: "soja", topUrl: "https://www.city.soja.okayama.jp/", region: "市" },
    { name: "玉野市", slug: "tamano", topUrl: "https://www.city.tamano.lg.jp/", region: "市" },
    {
      name: "笠岡市",
      slug: "kasaoka",
      topUrl: "https://www.city.kasaoka.okayama.jp/",
      region: "市",
    },
    { name: "井原市", slug: "ibara", topUrl: "https://www.city.ibara.okayama.jp/", region: "市" },
    { name: "真庭市", slug: "maniwa", topUrl: "https://www.city.maniwa.lg.jp/", region: "市" },
    {
      name: "瀬戸内市",
      slug: "setouchi",
      topUrl: "https://www.city.setouchi.lg.jp/",
      region: "市",
    },
    { name: "赤磐市", slug: "akaiwa", topUrl: "https://www.city.akaiwa.lg.jp/", region: "市" },
    { name: "備前市", slug: "bizen", topUrl: "https://www.city.bizen.lg.jp/", region: "市" },
    { name: "浅口市", slug: "asakuchi", topUrl: "https://www.city.asakuchi.lg.jp/", region: "市" },
    {
      name: "高梁市",
      slug: "takahashi",
      topUrl: "https://www.city.takahashi.lg.jp/",
      region: "市",
    },
    { name: "新見市", slug: "niimi", topUrl: "https://www.city.niimi.okayama.jp/", region: "市" },
    { name: "美作市", slug: "mimasaka", topUrl: "https://www.city.mimasaka.lg.jp/", region: "市" },
    // ── 和気郡 ──
    { name: "和気町", slug: "wake", topUrl: "https://www.town.wake.lg.jp/", region: "和気郡" },
    // ── 都窪郡 ──
    {
      name: "早島町",
      slug: "hayashima",
      topUrl: "https://www.town.hayashima.lg.jp/",
      region: "都窪郡",
    },
    // ── 浅口郡 ──
    {
      name: "里庄町",
      slug: "satosho",
      topUrl: "https://www.town.satosho.okayama.jp/",
      region: "浅口郡",
    },
    // ── 小田郡 ──
    { name: "矢掛町", slug: "yakage", topUrl: "https://www.town.yakage.lg.jp/", region: "小田郡" },
    // ── 真庭郡 ──
    {
      name: "新庄村",
      slug: "shinjo-o",
      topUrl: "https://www.vill.shinjo.okayama.jp/",
      region: "真庭郡",
    },
    // ── 苫田郡 ──
    {
      name: "鏡野町",
      slug: "kagamino",
      topUrl: "https://www.town.kagamino.lg.jp/",
      region: "苫田郡",
    },
    // ── 勝田郡 ──
    { name: "勝央町", slug: "shoo", topUrl: "https://www.town.shoo.lg.jp/", region: "勝田郡" },
    { name: "奈義町", slug: "nagi", topUrl: "https://www.town.nagi.okayama.jp/", region: "勝田郡" },
    // ── 英田郡 ──
    {
      name: "西粟倉村",
      slug: "nishiawakura",
      topUrl: "https://www.vill.nishiawakura.okayama.jp/",
      region: "英田郡",
    },
    // ── 久米郡 ──
    {
      name: "久米南町",
      slug: "kumenan",
      topUrl: "https://www.town.kumenan.lg.jp/",
      region: "久米郡",
    },
    {
      name: "美咲町",
      slug: "misaki-o",
      topUrl: "https://www.town.misaki.okayama.jp/",
      region: "久米郡",
    },
    // ── 加賀郡 ──
    {
      name: "吉備中央町",
      slug: "kibichuo",
      topUrl: "https://www.town.kibichuo.lg.jp/",
      region: "加賀郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 広島県 (14市・9町 = 23市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-hiroshima": [
    // ── 市 (14) ──
    {
      name: "広島市",
      slug: "hiroshima-city",
      topUrl: "https://www.city.hiroshima.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "福山市",
      slug: "fukuyama",
      topUrl: "https://www.city.fukuyama.hiroshima.jp/",
      region: "市",
    },
    { name: "呉市", slug: "kure", topUrl: "https://www.city.kure.lg.jp/", region: "市" },
    {
      name: "東広島市",
      slug: "higashihiroshima",
      topUrl: "https://www.city.higashihiroshima.lg.jp/",
      region: "市",
    },
    {
      name: "尾道市",
      slug: "onomichi",
      topUrl: "https://www.city.onomichi.hiroshima.jp/",
      region: "市",
    },
    {
      name: "廿日市市",
      slug: "hatsukaichi",
      topUrl: "https://www.city.hatsukaichi.hiroshima.jp/",
      region: "市",
    },
    {
      name: "三原市",
      slug: "mihara",
      topUrl: "https://www.city.mihara.hiroshima.jp/",
      region: "市",
    },
    {
      name: "三次市",
      slug: "miyoshi-h",
      topUrl: "https://www.city.miyoshi.hiroshima.jp/",
      region: "市",
    },
    {
      name: "庄原市",
      slug: "shobara",
      topUrl: "https://www.city.shobara.hiroshima.jp/",
      region: "市",
    },
    { name: "竹原市", slug: "takehara", topUrl: "https://www.city.takehara.lg.jp/", region: "市" },
    {
      name: "府中市",
      slug: "fuchu-h",
      topUrl: "https://www.city.fuchu.hiroshima.jp/",
      region: "市",
    },
    { name: "大竹市", slug: "otake", topUrl: "https://www.city.otake.hiroshima.jp/", region: "市" },
    { name: "安芸高田市", slug: "akitakata", topUrl: "https://www.akitakata.jp/", region: "市" },
    {
      name: "江田島市",
      slug: "etajima",
      topUrl: "https://www.city.etajima.hiroshima.jp/",
      region: "市",
    },
    // ── 安芸郡 ──
    {
      name: "府中町",
      slug: "fuchu-t",
      topUrl: "https://www.town.fuchu.hiroshima.jp/",
      region: "安芸郡",
    },
    { name: "海田町", slug: "kaita", topUrl: "https://www.town.kaita.lg.jp/", region: "安芸郡" },
    {
      name: "熊野町",
      slug: "kumano-h",
      topUrl: "https://www.town.kumano.hiroshima.jp/",
      region: "安芸郡",
    },
    { name: "坂町", slug: "saka", topUrl: "https://www.town.saka.lg.jp/", region: "安芸郡" },
    // ── 山県郡 ──
    {
      name: "安芸太田町",
      slug: "akiota",
      topUrl: "https://www.town.akiota.lg.jp/",
      region: "山県郡",
    },
    {
      name: "北広島町",
      slug: "kitahiroshima-h",
      topUrl: "https://www.town.kitahiroshima.lg.jp/",
      region: "山県郡",
    },
    // ── 豊田郡 ──
    {
      name: "大崎上島町",
      slug: "osakikamijima",
      topUrl: "https://www.town.osakikamijima.hiroshima.jp/",
      region: "豊田郡",
    },
    // ── 世羅郡 ──
    {
      name: "世羅町",
      slug: "sera",
      topUrl: "https://www.town.sera.hiroshima.jp/",
      region: "世羅郡",
    },
    // ── 神石郡 ──
    {
      name: "神石高原町",
      slug: "jinsekikogen",
      topUrl: "https://www.jinsekikogen.jp/",
      region: "神石郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 山口県 (13市・6町 = 19市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-yamaguchi": [
    // ── 市 (13) ──
    {
      name: "山口市",
      slug: "yamaguchi-city",
      topUrl: "https://www.city.yamaguchi.lg.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "下関市",
      slug: "shimonoseki",
      topUrl: "https://www.city.shimonoseki.lg.jp/",
      region: "市",
    },
    { name: "宇部市", slug: "ube", topUrl: "https://www.city.ube.yamaguchi.jp/", region: "市" },
    { name: "周南市", slug: "shunan", topUrl: "https://www.city.shunan.lg.jp/", region: "市" },
    { name: "岩国市", slug: "iwakuni", topUrl: "https://www.city.iwakuni.lg.jp/", region: "市" },
    { name: "防府市", slug: "hofu", topUrl: "https://www.city.hofu.yamaguchi.jp/", region: "市" },
    {
      name: "下松市",
      slug: "kudamatsu",
      topUrl: "https://www.city.kudamatsu.lg.jp/",
      region: "市",
    },
    { name: "光市", slug: "hikari", topUrl: "https://www.city.hikari.lg.jp/", region: "市" },
    { name: "萩市", slug: "hagi", topUrl: "https://www.city.hagi.lg.jp/", region: "市" },
    {
      name: "長門市",
      slug: "nagato",
      topUrl: "https://www.city.nagato.yamaguchi.jp/",
      region: "市",
    },
    { name: "柳井市", slug: "yanai", topUrl: "https://www.city-yanai.jp/", region: "市" },
    { name: "美祢市", slug: "mine", topUrl: "https://www.city.mine.lg.jp/", region: "市" },
    {
      name: "山陽小野田市",
      slug: "sanyo-onoda",
      topUrl: "https://www.city.sanyo-onoda.lg.jp/",
      region: "市",
    },
    // ── 大島郡 ──
    {
      name: "周防大島町",
      slug: "suo-oshima",
      topUrl: "https://www.town.suo-oshima.lg.jp/",
      region: "大島郡",
    },
    // ── 玖珂郡 ──
    { name: "和木町", slug: "waki", topUrl: "https://www.town.waki.lg.jp/", region: "玖珂郡" },
    // ── 熊毛郡 ──
    {
      name: "上関町",
      slug: "kaminoseki",
      topUrl: "https://www.town.kaminoseki.lg.jp/",
      region: "熊毛郡",
    },
    {
      name: "田布施町",
      slug: "tabuse",
      topUrl: "https://www.town.tabuse.lg.jp/",
      region: "熊毛郡",
    },
    { name: "平生町", slug: "hirao", topUrl: "https://www.town.hirao.lg.jp/", region: "熊毛郡" },
    // ── 阿武郡 ──
    { name: "阿武町", slug: "abu", topUrl: "https://www.town.abu.lg.jp/", region: "阿武郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 徳島県 (8市・15町・1村 = 24市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-tokushima": [
    // ── 市 (8) ──
    {
      name: "徳島市",
      slug: "tokushima-city",
      topUrl: "https://www.city.tokushima.tokushima.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "阿南市", slug: "anan", topUrl: "https://www.city.anan.tokushima.jp/", region: "市" },
    {
      name: "鳴門市",
      slug: "naruto",
      topUrl: "https://www.city.naruto.tokushima.jp/",
      region: "市",
    },
    {
      name: "吉野川市",
      slug: "yoshinogawa",
      topUrl: "https://www.city.yoshinogawa.lg.jp/",
      region: "市",
    },
    {
      name: "小松島市",
      slug: "komatsushima",
      topUrl: "https://www.city.komatsushima.lg.jp/",
      region: "市",
    },
    { name: "阿波市", slug: "awa", topUrl: "https://www.city.awa.lg.jp/", region: "市" },
    { name: "美馬市", slug: "mima", topUrl: "https://www.city.mima.lg.jp/", region: "市" },
    {
      name: "三好市",
      slug: "miyoshi-to",
      topUrl: "https://www.city.miyoshi.tokushima.jp/",
      region: "市",
    },
    // ── 勝浦郡 ──
    {
      name: "勝浦町",
      slug: "katsuura-to",
      topUrl: "https://www.town.katsuura.lg.jp/",
      region: "勝浦郡",
    },
    { name: "上勝町", slug: "kamikatsu", topUrl: "https://www.kamikatsu.jp/", region: "勝浦郡" },
    // ── 名東郡 ──
    {
      name: "佐那河内村",
      slug: "sanagochi",
      topUrl: "https://www.vill.sanagochi.lg.jp/",
      region: "名東郡",
    },
    // ── 名西郡 ──
    { name: "石井町", slug: "ishii", topUrl: "https://www.town.ishii.lg.jp/", region: "名西郡" },
    {
      name: "神山町",
      slug: "kamiyama",
      topUrl: "https://www.town.kamiyama.lg.jp/",
      region: "名西郡",
    },
    // ── 那賀郡 ──
    {
      name: "那賀町",
      slug: "naka-to",
      topUrl: "https://www.town.tokushima-naka.lg.jp/",
      region: "那賀郡",
    },
    // ── 海部郡 ──
    { name: "牟岐町", slug: "mugi", topUrl: "https://www.town.mugi.lg.jp/", region: "海部郡" },
    { name: "美波町", slug: "minami", topUrl: "https://www.town.minami.lg.jp/", region: "海部郡" },
    { name: "海陽町", slug: "kaiyo", topUrl: "https://www.town.kaiyo.lg.jp/", region: "海部郡" },
    // ── 板野郡 ──
    {
      name: "松茂町",
      slug: "matsushige",
      topUrl: "https://www.town.matsushige.tokushima.jp/",
      region: "板野郡",
    },
    {
      name: "北島町",
      slug: "kitajima",
      topUrl: "https://www.town.kitajima.lg.jp/",
      region: "板野郡",
    },
    {
      name: "藍住町",
      slug: "aizumi",
      topUrl: "https://www.town.aizumi.tokushima.jp/",
      region: "板野郡",
    },
    {
      name: "板野町",
      slug: "itano",
      topUrl: "https://www.town.itano.tokushima.jp/",
      region: "板野郡",
    },
    {
      name: "上板町",
      slug: "kamiita",
      topUrl: "https://www.town.kamiita.lg.jp/",
      region: "板野郡",
    },
    // ── 美馬郡 ──
    {
      name: "つるぎ町",
      slug: "tsurugi",
      topUrl: "https://www.town.tokushima-tsurugi.lg.jp/",
      region: "美馬郡",
    },
    // ── 三好郡 ──
    {
      name: "東みよし町",
      slug: "higashimiyoshi",
      topUrl: "https://www.town.higashimiyoshi.lg.jp/",
      region: "三好郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 香川県 (8市・9町 = 17市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-kagawa": [
    // ── 市 (8) ──
    {
      name: "高松市",
      slug: "takamatsu",
      topUrl: "https://www.city.takamatsu.kagawa.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "丸亀市", slug: "marugame", topUrl: "https://www.city.marugame.lg.jp/", region: "市" },
    { name: "坂出市", slug: "sakaide", topUrl: "https://www.city.sakaide.lg.jp/", region: "市" },
    {
      name: "観音寺市",
      slug: "kanonji",
      topUrl: "https://www.city.kanonji.kagawa.jp/",
      region: "市",
    },
    {
      name: "さぬき市",
      slug: "sanuki",
      topUrl: "https://www.city.sanuki.kagawa.jp/",
      region: "市",
    },
    {
      name: "善通寺市",
      slug: "zentsuji",
      topUrl: "https://www.city.zentsuji.kagawa.jp/",
      region: "市",
    },
    {
      name: "東かがわ市",
      slug: "higashikagawa",
      topUrl: "https://www.city.higashikagawa.lg.jp/",
      region: "市",
    },
    { name: "三豊市", slug: "mitoyo", topUrl: "https://www.city.mitoyo.lg.jp/", region: "市" },
    // ── 小豆郡 ──
    {
      name: "土庄町",
      slug: "tonosho",
      topUrl: "https://www.town.tonosho.kagawa.jp/",
      region: "小豆郡",
    },
    {
      name: "小豆島町",
      slug: "shodoshima",
      topUrl: "https://www.town.shodoshima.lg.jp/",
      region: "小豆郡",
    },
    // ── 木田郡 ──
    { name: "三木町", slug: "miki-k", topUrl: "https://www.town.miki.lg.jp/", region: "木田郡" },
    // ── 香川郡 ──
    {
      name: "直島町",
      slug: "naoshima",
      topUrl: "https://www.town.naoshima.lg.jp/",
      region: "香川郡",
    },
    // ── 綾歌郡 ──
    {
      name: "宇多津町",
      slug: "utazu",
      topUrl: "https://www.town.utazu.kagawa.jp/",
      region: "綾歌郡",
    },
    {
      name: "綾川町",
      slug: "ayagawa",
      topUrl: "https://www.town.ayagawa.lg.jp/",
      region: "綾歌郡",
    },
    // ── 仲多度郡 ──
    {
      name: "琴平町",
      slug: "kotohira",
      topUrl: "https://www.town.kotohira.kagawa.jp/",
      region: "仲多度郡",
    },
    {
      name: "多度津町",
      slug: "tadotsu",
      topUrl: "https://www.town.tadotsu.lg.jp/",
      region: "仲多度郡",
    },
    {
      name: "まんのう町",
      slug: "manno",
      topUrl: "https://www.town.manno.lg.jp/",
      region: "仲多度郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 愛媛県 (11市・9町 = 20市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-ehime": [
    // ── 市 (11) ──
    {
      name: "松山市",
      slug: "matsuyama",
      topUrl: "https://www.city.matsuyama.ehime.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "今治市", slug: "imabari", topUrl: "https://www.city.imabari.ehime.jp/", region: "市" },
    { name: "新居浜市", slug: "niihama", topUrl: "https://www.city.niihama.lg.jp/", region: "市" },
    { name: "西条市", slug: "saijo", topUrl: "https://www.city.saijo.ehime.jp/", region: "市" },
    {
      name: "四国中央市",
      slug: "shikokuchuo",
      topUrl: "https://www.city.shikokuchuo.ehime.jp/",
      region: "市",
    },
    {
      name: "宇和島市",
      slug: "uwajima",
      topUrl: "https://www.city.uwajima.ehime.jp/",
      region: "市",
    },
    { name: "大洲市", slug: "ozu", topUrl: "https://www.city.ozu.ehime.jp/", region: "市" },
    { name: "西予市", slug: "seiyo", topUrl: "https://www.city.seiyo.ehime.jp/", region: "市" },
    { name: "東温市", slug: "toon", topUrl: "https://www.city.toon.ehime.jp/", region: "市" },
    { name: "伊予市", slug: "iyo", topUrl: "https://www.city.iyo.lg.jp/", region: "市" },
    {
      name: "八幡浜市",
      slug: "yawatahama",
      topUrl: "https://www.city.yawatahama.ehime.jp/",
      region: "市",
    },
    // ── 越智郡 ──
    {
      name: "上島町",
      slug: "kamijima",
      topUrl: "https://www.town.kamijima.lg.jp/",
      region: "越智郡",
    },
    // ── 温泉郡 ──
    {
      name: "久万高原町",
      slug: "kumakogen",
      topUrl: "https://www.kumakogen.jp/",
      region: "温泉郡",
    },
    // ── 伊予郡 ──
    {
      name: "松前町",
      slug: "masaki",
      topUrl: "https://www.town.masaki.ehime.jp/",
      region: "伊予郡",
    },
    { name: "砥部町", slug: "tobe", topUrl: "https://www.town.tobe.ehime.jp/", region: "伊予郡" },
    // ── 喜多郡 ──
    {
      name: "内子町",
      slug: "uchiko",
      topUrl: "https://www.town.uchiko.ehime.jp/",
      region: "喜多郡",
    },
    // ── 西宇和郡 ──
    {
      name: "伊方町",
      slug: "ikata",
      topUrl: "https://www.town.ikata.ehime.jp/",
      region: "西宇和郡",
    },
    // ── 北宇和郡 ──
    {
      name: "松野町",
      slug: "matsuno",
      topUrl: "https://www.town.matsuno.ehime.jp/",
      region: "北宇和郡",
    },
    {
      name: "鬼北町",
      slug: "kihoku-e",
      topUrl: "https://www.town.kihoku.ehime.jp/",
      region: "北宇和郡",
    },
    // ── 南宇和郡 ──
    {
      name: "愛南町",
      slug: "ainan",
      topUrl: "https://www.town.ainan.ehime.jp/",
      region: "南宇和郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 高知県 (11市・17町・6村 = 34市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-kochi": [
    // ── 市 (11) ──
    {
      name: "高知市",
      slug: "kochi-city",
      topUrl: "https://www.city.kochi.kochi.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "南国市", slug: "nankoku", topUrl: "https://www.city.nankoku.lg.jp/", region: "市" },
    {
      name: "四万十市",
      slug: "shimanto",
      topUrl: "https://www.city.shimanto.lg.jp/",
      region: "市",
    },
    {
      name: "香南市",
      slug: "konan-k",
      topUrl: "https://www.city.kochi-konan.lg.jp/",
      region: "市",
    },
    { name: "香美市", slug: "kami-k", topUrl: "https://www.city.kami.lg.jp/", region: "市" },
    { name: "土佐市", slug: "tosa", topUrl: "https://www.city.tosa.lg.jp/", region: "市" },
    { name: "須崎市", slug: "susaki", topUrl: "https://www.city.susaki.lg.jp/", region: "市" },
    { name: "宿毛市", slug: "sukumo", topUrl: "https://www.city.sukumo.kochi.jp/", region: "市" },
    { name: "安芸市", slug: "aki", topUrl: "https://www.city.aki.kochi.jp/", region: "市" },
    {
      name: "土佐清水市",
      slug: "tosashimizu",
      topUrl: "https://www.city.tosashimizu.kochi.jp/",
      region: "市",
    },
    { name: "室戸市", slug: "muroto", topUrl: "https://www.city.muroto.kochi.jp/", region: "市" },
    // ── 安芸郡 ──
    { name: "東洋町", slug: "toyo", topUrl: "https://www.town.toyo.kochi.jp/", region: "安芸郡" },
    {
      name: "奈半利町",
      slug: "nahari",
      topUrl: "https://www.town.nahari.kochi.jp/",
      region: "安芸郡",
    },
    { name: "田野町", slug: "tano", topUrl: "https://www.town.tano.kochi.jp/", region: "安芸郡" },
    {
      name: "安田町",
      slug: "yasuda",
      topUrl: "https://www.town.yasuda.kochi.jp/",
      region: "安芸郡",
    },
    {
      name: "北川村",
      slug: "kitagawa",
      topUrl: "https://www.vill.kitagawa.kochi.jp/",
      region: "安芸郡",
    },
    { name: "馬路村", slug: "umaji", topUrl: "https://www.vill.umaji.kochi.jp/", region: "安芸郡" },
    {
      name: "芸西村",
      slug: "geisei",
      topUrl: "https://www.vill.geisei.kochi.jp/",
      region: "安芸郡",
    },
    // ── 長岡郡 ──
    {
      name: "本山町",
      slug: "motoyama",
      topUrl: "https://www.town.motoyama.kochi.jp/",
      region: "長岡郡",
    },
    { name: "大豊町", slug: "otoyo", topUrl: "https://www.town.otoyo.kochi.jp/", region: "長岡郡" },
    // ── 土佐郡 ──
    { name: "土佐町", slug: "tosa-t", topUrl: "https://www.town.tosa.kochi.jp/", region: "土佐郡" },
    { name: "大川村", slug: "okawa", topUrl: "https://www.vill.okawa.kochi.jp/", region: "土佐郡" },
    // ── 吾川郡 ──
    { name: "いの町", slug: "ino", topUrl: "https://www.town.ino.kochi.jp/", region: "吾川郡" },
    {
      name: "仁淀川町",
      slug: "niyodogawa",
      topUrl: "https://www.town.niyodogawa.lg.jp/",
      region: "吾川郡",
    },
    // ── 高岡郡 ──
    {
      name: "中土佐町",
      slug: "nakatosa",
      topUrl: "https://www.town.nakatosa.lg.jp/",
      region: "高岡郡",
    },
    { name: "佐川町", slug: "sakawa", topUrl: "https://www.town.sakawa.lg.jp/", region: "高岡郡" },
    { name: "越知町", slug: "ochi", topUrl: "https://www.town.ochi.kochi.jp/", region: "高岡郡" },
    {
      name: "檮原町",
      slug: "yusuhara",
      topUrl: "https://www.town.yusuhara.kochi.jp/",
      region: "高岡郡",
    },
    {
      name: "日高村",
      slug: "hidaka-k",
      topUrl: "https://www.vill.hidaka.kochi.jp/",
      region: "高岡郡",
    },
    {
      name: "津野町",
      slug: "tsuno",
      topUrl: "https://www.town.kochi-tsuno.lg.jp/",
      region: "高岡郡",
    },
    {
      name: "四万十町",
      slug: "shimanto-t",
      topUrl: "https://www.town.shimanto.lg.jp/",
      region: "高岡郡",
    },
    // ── 幡多郡 ──
    {
      name: "大月町",
      slug: "otsuki-k",
      topUrl: "https://www.town.otsuki.kochi.jp/",
      region: "幡多郡",
    },
    {
      name: "三原村",
      slug: "mihara-k",
      topUrl: "https://www.vill.mihara.kochi.jp/",
      region: "幡多郡",
    },
    {
      name: "黒潮町",
      slug: "kuroshio",
      topUrl: "https://www.town.kuroshio.lg.jp/",
      region: "幡多郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 福岡県 (29市・29町・2村 = 60市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-fukuoka": [
    // ── 市 (29) ──
    {
      name: "福岡市",
      slug: "fukuoka-city",
      topUrl: "https://www.city.fukuoka.lg.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "北九州市",
      slug: "kitakyushu",
      topUrl: "https://www.city.kitakyushu.lg.jp/",
      isDesignated: true,
      region: "市",
    },
    {
      name: "久留米市",
      slug: "kurume",
      topUrl: "https://www.city.kurume.fukuoka.jp/",
      region: "市",
    },
    { name: "飯塚市", slug: "iizuka", topUrl: "https://www.city.iizuka.lg.jp/", region: "市" },
    { name: "大牟田市", slug: "omuta", topUrl: "https://www.city.omuta.lg.jp/", region: "市" },
    { name: "春日市", slug: "kasuga", topUrl: "https://www.city.kasuga.fukuoka.jp/", region: "市" },
    {
      name: "筑紫野市",
      slug: "chikushino",
      topUrl: "https://www.city.chikushino.fukuoka.jp/",
      region: "市",
    },
    { name: "大野城市", slug: "onojo", topUrl: "https://www.city.onojo.fukuoka.jp/", region: "市" },
    { name: "太宰府市", slug: "dazaifu", topUrl: "https://www.city.dazaifu.lg.jp/", region: "市" },
    { name: "宗像市", slug: "munakata", topUrl: "https://www.city.munakata.lg.jp/", region: "市" },
    { name: "糸島市", slug: "itoshima", topUrl: "https://www.city.itoshima.lg.jp/", region: "市" },
    { name: "福津市", slug: "fukutsu", topUrl: "https://www.city.fukutsu.lg.jp/", region: "市" },
    { name: "古賀市", slug: "koga-f", topUrl: "https://www.city.koga.fukuoka.jp/", region: "市" },
    { name: "直方市", slug: "nogata", topUrl: "https://www.city.nogata.fukuoka.jp/", region: "市" },
    { name: "田川市", slug: "tagawa", topUrl: "https://www.city.tagawa.fukuoka.jp/", region: "市" },
    {
      name: "柳川市",
      slug: "yanagawa",
      topUrl: "https://www.city.yanagawa.fukuoka.jp/",
      region: "市",
    },
    { name: "八女市", slug: "yame", topUrl: "https://www.city.yame.fukuoka.jp/", region: "市" },
    {
      name: "行橋市",
      slug: "yukuhashi",
      topUrl: "https://www.city.yukuhashi.fukuoka.jp/",
      region: "市",
    },
    { name: "小郡市", slug: "ogori", topUrl: "https://www.city.ogori.fukuoka.jp/", region: "市" },
    { name: "中間市", slug: "nakama", topUrl: "https://www.city.nakama.lg.jp/", region: "市" },
    { name: "朝倉市", slug: "asakura", topUrl: "https://www.city.asakura.lg.jp/", region: "市" },
    {
      name: "那珂川市",
      slug: "nakagawa-f",
      topUrl: "https://www.city.nakagawa.lg.jp/",
      region: "市",
    },
    { name: "筑後市", slug: "chikugo", topUrl: "https://www.city.chikugo.lg.jp/", region: "市" },
    { name: "大川市", slug: "okawa-f", topUrl: "https://www.city.okawa.lg.jp/", region: "市" },
    { name: "豊前市", slug: "buzen", topUrl: "https://www.city.buzen.lg.jp/", region: "市" },
    { name: "うきは市", slug: "ukiha", topUrl: "https://www.city.ukiha.fukuoka.jp/", region: "市" },
    { name: "嘉麻市", slug: "kama", topUrl: "https://www.city.kama.lg.jp/", region: "市" },
    { name: "みやま市", slug: "miyama", topUrl: "https://www.city.miyama.lg.jp/", region: "市" },
    { name: "宮若市", slug: "miyawaka", topUrl: "https://www.city.miyawaka.lg.jp/", region: "市" },
    // ── 糟屋郡 ──
    { name: "宇美町", slug: "umi", topUrl: "https://www.town.umi.lg.jp/", region: "糟屋郡" },
    {
      name: "篠栗町",
      slug: "sasaguri",
      topUrl: "https://www.town.sasaguri.fukuoka.jp/",
      region: "糟屋郡",
    },
    { name: "志免町", slug: "shime", topUrl: "https://www.town.shime.lg.jp/", region: "糟屋郡" },
    { name: "須恵町", slug: "sue", topUrl: "https://www.town.sue.fukuoka.jp/", region: "糟屋郡" },
    {
      name: "新宮町",
      slug: "shingu-f",
      topUrl: "https://www.town.shingu.fukuoka.jp/",
      region: "糟屋郡",
    },
    {
      name: "久山町",
      slug: "hisayama",
      topUrl: "https://www.town.hisayama.fukuoka.jp/",
      region: "糟屋郡",
    },
    {
      name: "粕屋町",
      slug: "kasuya",
      topUrl: "https://www.town.kasuya.fukuoka.jp/",
      region: "糟屋郡",
    },
    // ── 遠賀郡 ──
    {
      name: "芦屋町",
      slug: "ashiya-f",
      topUrl: "https://www.town.ashiya.lg.jp/",
      region: "遠賀郡",
    },
    {
      name: "水巻町",
      slug: "mizumaki",
      topUrl: "https://www.town.mizumaki.lg.jp/",
      region: "遠賀郡",
    },
    {
      name: "岡垣町",
      slug: "okagaki",
      topUrl: "https://www.town.okagaki.lg.jp/",
      region: "遠賀郡",
    },
    { name: "遠賀町", slug: "onga", topUrl: "https://www.town.onga.lg.jp/", region: "遠賀郡" },
    // ── 鞍手郡 ──
    { name: "小竹町", slug: "kotake", topUrl: "https://www.town.kotake.lg.jp/", region: "鞍手郡" },
    { name: "鞍手町", slug: "kurate", topUrl: "https://www.town.kurate.lg.jp/", region: "鞍手郡" },
    // ── 嘉穂郡 ──
    {
      name: "桂川町",
      slug: "keisen",
      topUrl: "https://www.town.keisen.fukuoka.jp/",
      region: "嘉穂郡",
    },
    // ── 朝倉郡 ──
    {
      name: "筑前町",
      slug: "chikuzen",
      topUrl: "https://www.town.chikuzen.fukuoka.jp/",
      region: "朝倉郡",
    },
    { name: "東峰村", slug: "toho", topUrl: "https://www.vill.toho.fukuoka.jp/", region: "朝倉郡" },
    // ── 三井郡 ──
    {
      name: "大刀洗町",
      slug: "tachiarai",
      topUrl: "https://www.town.tachiarai.fukuoka.jp/",
      region: "三井郡",
    },
    // ── 三潴郡 ──
    { name: "大木町", slug: "oki", topUrl: "https://www.town.oki.fukuoka.jp/", region: "三潴郡" },
    // ── 八女郡 ──
    {
      name: "広川町",
      slug: "hirokawa-f",
      topUrl: "https://www.town.hirokawa.fukuoka.jp/",
      region: "八女郡",
    },
    // ── 田川郡 ──
    {
      name: "香春町",
      slug: "kawara",
      topUrl: "https://www.town.kawara.fukuoka.jp/",
      region: "田川郡",
    },
    {
      name: "添田町",
      slug: "soeda",
      topUrl: "https://www.town.soeda.fukuoka.jp/",
      region: "田川郡",
    },
    { name: "糸田町", slug: "itoda", topUrl: "https://www.town.itoda.lg.jp/", region: "田川郡" },
    {
      name: "川崎町",
      slug: "kawasaki-f",
      topUrl: "https://www.town.kawasaki.fukuoka.jp/",
      region: "田川郡",
    },
    { name: "大任町", slug: "oto", topUrl: "https://www.town.oto.fukuoka.jp/", region: "田川郡" },
    { name: "赤村", slug: "aka", topUrl: "https://www.vill.aka.lg.jp/", region: "田川郡" },
    {
      name: "福智町",
      slug: "fukuchi",
      topUrl: "https://www.town.fukuchi.lg.jp/",
      region: "田川郡",
    },
    // ── 京都郡 ──
    { name: "苅田町", slug: "kanda", topUrl: "https://www.town.kanda.lg.jp/", region: "京都郡" },
    {
      name: "みやこ町",
      slug: "miyako-f",
      topUrl: "https://www.town.miyako.lg.jp/",
      region: "京都郡",
    },
    // ── 築上郡 ──
    {
      name: "吉富町",
      slug: "yoshitomi",
      topUrl: "https://www.town.yoshitomi.lg.jp/",
      region: "築上郡",
    },
    { name: "上毛町", slug: "koge", topUrl: "https://www.town.koge.lg.jp/", region: "築上郡" },
    {
      name: "築上町",
      slug: "chikujo",
      topUrl: "https://www.town.chikujo.fukuoka.jp/",
      region: "築上郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 佐賀県 (10市・10町 = 20市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-saga": [
    // ── 市 (10) ──
    {
      name: "佐賀市",
      slug: "saga-city",
      topUrl: "https://www.city.saga.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "唐津市", slug: "karatsu", topUrl: "https://www.city.karatsu.lg.jp/", region: "市" },
    { name: "鳥栖市", slug: "tosu", topUrl: "https://www.city.tosu.lg.jp/", region: "市" },
    { name: "伊万里市", slug: "imari", topUrl: "https://www.city.imari.saga.jp/", region: "市" },
    { name: "武雄市", slug: "takeo", topUrl: "https://www.city.takeo.lg.jp/", region: "市" },
    {
      name: "鹿島市",
      slug: "kashima-sa",
      topUrl: "https://www.city.saga-kashima.lg.jp/",
      region: "市",
    },
    { name: "小城市", slug: "ogi", topUrl: "https://www.city.ogi.lg.jp/", region: "市" },
    { name: "嬉野市", slug: "ureshino", topUrl: "https://www.city.ureshino.lg.jp/", region: "市" },
    { name: "神埼市", slug: "kanzaki", topUrl: "https://www.city.kanzaki.saga.jp/", region: "市" },
    { name: "多久市", slug: "taku", topUrl: "https://www.city.taku.lg.jp/", region: "市" },
    // ── 神埼郡 ──
    {
      name: "吉野ヶ里町",
      slug: "yoshinogari",
      topUrl: "https://www.town.yoshinogari.saga.jp/",
      region: "神埼郡",
    },
    // ── 三養基郡 ──
    {
      name: "基山町",
      slug: "kiyama",
      topUrl: "https://www.town.kiyama.lg.jp/",
      region: "三養基郡",
    },
    {
      name: "上峰町",
      slug: "kamimine",
      topUrl: "https://www.town.kamimine.lg.jp/",
      region: "三養基郡",
    },
    {
      name: "みやき町",
      slug: "miyaki",
      topUrl: "https://www.town.miyaki.lg.jp/",
      region: "三養基郡",
    },
    // ── 東松浦郡 ──
    {
      name: "玄海町",
      slug: "genkai",
      topUrl: "https://www.town.genkai.saga.jp/",
      region: "東松浦郡",
    },
    // ── 西松浦郡 ──
    { name: "有田町", slug: "arita", topUrl: "https://www.town.arita.lg.jp/", region: "西松浦郡" },
    // ── 杵島郡 ──
    {
      name: "大町町",
      slug: "omachi-sa",
      topUrl: "https://www.town.omachi.saga.jp/",
      region: "杵島郡",
    },
    {
      name: "江北町",
      slug: "kohoku",
      topUrl: "https://www.town.kohoku.saga.jp/",
      region: "杵島郡",
    },
    {
      name: "白石町",
      slug: "shiroishi-sa",
      topUrl: "https://www.town.shiroishi.lg.jp/",
      region: "杵島郡",
    },
    // ── 藤津郡 ──
    { name: "太良町", slug: "tara", topUrl: "https://www.town.tara.lg.jp/", region: "藤津郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 長崎県 (13市・8町 = 21市町) ※村なし
  // ═══════════════════════════════════════════════════════════
  "jorei-nagasaki": [
    // ── 市 (13) ──
    {
      name: "長崎市",
      slug: "nagasaki-city",
      topUrl: "https://www.city.nagasaki.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "佐世保市", slug: "sasebo", topUrl: "https://www.city.sasebo.lg.jp/", region: "市" },
    {
      name: "諫早市",
      slug: "isahaya",
      topUrl: "https://www.city.isahaya.nagasaki.jp/",
      region: "市",
    },
    { name: "大村市", slug: "omura", topUrl: "https://www.city.omura.nagasaki.jp/", region: "市" },
    {
      name: "島原市",
      slug: "shimabara",
      topUrl: "https://www.city.shimabara.lg.jp/",
      region: "市",
    },
    { name: "雲仙市", slug: "unzen", topUrl: "https://www.city.unzen.nagasaki.jp/", region: "市" },
    {
      name: "南島原市",
      slug: "minamishimabara",
      topUrl: "https://www.city.minamishimabara.lg.jp/",
      region: "市",
    },
    {
      name: "平戸市",
      slug: "hirado",
      topUrl: "https://www.city.hirado.nagasaki.jp/",
      region: "市",
    },
    { name: "五島市", slug: "goto", topUrl: "https://www.city.goto.nagasaki.jp/", region: "市" },
    { name: "壱岐市", slug: "iki", topUrl: "https://www.city.iki.nagasaki.jp/", region: "市" },
    {
      name: "対馬市",
      slug: "tsushima-n",
      topUrl: "https://www.city.tsushima.nagasaki.jp/",
      region: "市",
    },
    {
      name: "西海市",
      slug: "saikai",
      topUrl: "https://www.city.saikai.nagasaki.jp/",
      region: "市",
    },
    { name: "松浦市", slug: "matsuura", topUrl: "https://www.city.matsuura.lg.jp/", region: "市" },
    // ── 西彼杵郡 ──
    {
      name: "長与町",
      slug: "nagayo",
      topUrl: "https://www.town.nagayo.lg.jp/",
      region: "西彼杵郡",
    },
    {
      name: "時津町",
      slug: "togitsu",
      topUrl: "https://www.town.togitsu.nagasaki.jp/",
      region: "西彼杵郡",
    },
    // ── 東彼杵郡 ──
    {
      name: "東彼杵町",
      slug: "higashisonogi",
      topUrl: "https://www.town.higashisonogi.lg.jp/",
      region: "東彼杵郡",
    },
    {
      name: "川棚町",
      slug: "kawatana",
      topUrl: "https://www.town.kawatana.lg.jp/",
      region: "東彼杵郡",
    },
    {
      name: "波佐見町",
      slug: "hasami",
      topUrl: "https://www.town.hasami.lg.jp/",
      region: "東彼杵郡",
    },
    // ── 北松浦郡 ──
    {
      name: "小値賀町",
      slug: "ojika",
      topUrl: "https://www.town.ojika.lg.jp/",
      region: "北松浦郡",
    },
    {
      name: "佐々町",
      slug: "saza",
      topUrl: "https://www.town.saza.nagasaki.jp/",
      region: "北松浦郡",
    },
    // ── 南松浦郡 ──
    {
      name: "新上五島町",
      slug: "shinkamigoto",
      topUrl: "https://www.town.shinkamigoto.nagasaki.jp/",
      region: "南松浦郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 熊本県 (14市・23町・8村 = 45市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-kumamoto": [
    // ── 市 (14) ──
    {
      name: "熊本市",
      slug: "kumamoto-city",
      topUrl: "https://www.city.kumamoto.jp/",
      isCapital: true,
      isDesignated: true,
      region: "市",
    },
    {
      name: "八代市",
      slug: "yatsushiro",
      topUrl: "https://www.city.yatsushiro.lg.jp/",
      region: "市",
    },
    {
      name: "天草市",
      slug: "amakusa",
      topUrl: "https://www.city.amakusa.kumamoto.jp/",
      region: "市",
    },
    { name: "玉名市", slug: "tamana", topUrl: "https://www.city.tamana.lg.jp/", region: "市" },
    { name: "合志市", slug: "koshi", topUrl: "https://www.city.koshi.lg.jp/", region: "市" },
    { name: "宇城市", slug: "uki", topUrl: "https://www.city.uki.kumamoto.jp/", region: "市" },
    { name: "菊池市", slug: "kikuchi", topUrl: "https://www.city.kikuchi.lg.jp/", region: "市" },
    { name: "荒尾市", slug: "arao", topUrl: "https://www.city.arao.lg.jp/", region: "市" },
    {
      name: "山鹿市",
      slug: "yamaga",
      topUrl: "https://www.city.yamaga.kumamoto.jp/",
      region: "市",
    },
    { name: "宇土市", slug: "uto", topUrl: "https://www.city.uto.lg.jp/", region: "市" },
    {
      name: "人吉市",
      slug: "hitoyoshi",
      topUrl: "https://www.city.hitoyoshi.lg.jp/",
      region: "市",
    },
    {
      name: "上天草市",
      slug: "kamiamakusa",
      topUrl: "https://www.city.kamiamakusa.kumamoto.jp/",
      region: "市",
    },
    { name: "水俣市", slug: "minamata", topUrl: "https://www.city.minamata.lg.jp/", region: "市" },
    { name: "阿蘇市", slug: "aso", topUrl: "https://www.city.aso.kumamoto.jp/", region: "市" },
    // ── 下益城郡 ──
    {
      name: "美里町",
      slug: "misato-ku",
      topUrl: "https://www.town.kumamoto-misato.lg.jp/",
      region: "下益城郡",
    },
    // ── 玉名郡 ──
    {
      name: "玉東町",
      slug: "gyokuto",
      topUrl: "https://www.town.gyokuto.kumamoto.jp/",
      region: "玉名郡",
    },
    { name: "南関町", slug: "nankan", topUrl: "https://www.town.nankan.lg.jp/", region: "玉名郡" },
    { name: "長洲町", slug: "nagasu", topUrl: "https://www.town.nagasu.lg.jp/", region: "玉名郡" },
    { name: "和水町", slug: "nagomi", topUrl: "https://www.town.nagomi.lg.jp/", region: "玉名郡" },
    // ── 菊池郡 ──
    {
      name: "大津町",
      slug: "ozu-ku",
      topUrl: "https://www.town.ozu.kumamoto.jp/",
      region: "菊池郡",
    },
    { name: "菊陽町", slug: "kikuyo", topUrl: "https://www.town.kikuyo.lg.jp/", region: "菊池郡" },
    // ── 阿蘇郡 ──
    {
      name: "南小国町",
      slug: "minamioguni",
      topUrl: "https://www.town.minamioguni.lg.jp/",
      region: "阿蘇郡",
    },
    {
      name: "小国町",
      slug: "oguni-ku",
      topUrl: "https://www.town.oguni.kumamoto.jp/",
      region: "阿蘇郡",
    },
    { name: "産山村", slug: "ubuyama", topUrl: "https://www.ubuyama-v.jp/", region: "阿蘇郡" },
    {
      name: "高森町",
      slug: "takamori-ku",
      topUrl: "https://www.town.takamori.kumamoto.jp/",
      region: "阿蘇郡",
    },
    {
      name: "西原村",
      slug: "nishihara-ku",
      topUrl: "https://www.vill.nishihara.kumamoto.jp/",
      region: "阿蘇郡",
    },
    {
      name: "南阿蘇村",
      slug: "minamiaso",
      topUrl: "https://www.vill.minamiaso.lg.jp/",
      region: "阿蘇郡",
    },
    // ── 上益城郡 ──
    {
      name: "御船町",
      slug: "mifune",
      topUrl: "https://www.town.mifune.kumamoto.jp/",
      region: "上益城郡",
    },
    {
      name: "嘉島町",
      slug: "kashima-ku",
      topUrl: "https://www.town.kashima.kumamoto.jp/",
      region: "上益城郡",
    },
    {
      name: "益城町",
      slug: "mashiki",
      topUrl: "https://www.town.mashiki.lg.jp/",
      region: "上益城郡",
    },
    {
      name: "甲佐町",
      slug: "kosa",
      topUrl: "https://www.town.kosa.kumamoto.jp/",
      region: "上益城郡",
    },
    {
      name: "山都町",
      slug: "yamato-ku",
      topUrl: "https://www.town.yamato.kumamoto.jp/",
      region: "上益城郡",
    },
    // ── 八代郡 ──
    {
      name: "氷川町",
      slug: "hikawa",
      topUrl: "https://www.town.hikawa.kumamoto.jp/",
      region: "八代郡",
    },
    // ── 葦北郡 ──
    {
      name: "芦北町",
      slug: "ashikita",
      topUrl: "https://www.town.ashikita.lg.jp/",
      region: "葦北郡",
    },
    {
      name: "津奈木町",
      slug: "tsunagi",
      topUrl: "https://www.town.tsunagi.lg.jp/",
      region: "葦北郡",
    },
    // ── 球磨郡 ──
    { name: "錦町", slug: "nishiki", topUrl: "https://www.town.nishiki.lg.jp/", region: "球磨郡" },
    {
      name: "多良木町",
      slug: "taragi",
      topUrl: "https://www.town.taragi.lg.jp/",
      region: "球磨郡",
    },
    {
      name: "湯前町",
      slug: "yunomae",
      topUrl: "https://www.town.yunomae.lg.jp/",
      region: "球磨郡",
    },
    {
      name: "水上村",
      slug: "mizukami",
      topUrl: "https://www.vill.mizukami.lg.jp/",
      region: "球磨郡",
    },
    { name: "相良村", slug: "sagara", topUrl: "https://www.vill.sagara.lg.jp/", region: "球磨郡" },
    { name: "五木村", slug: "itsuki", topUrl: "https://www.vill.itsuki.lg.jp/", region: "球磨郡" },
    { name: "山江村", slug: "yamae", topUrl: "https://www.vill.yamae.lg.jp/", region: "球磨郡" },
    { name: "球磨村", slug: "kuma", topUrl: "https://www.vill.kuma.lg.jp/", region: "球磨郡" },
    {
      name: "あさぎり町",
      slug: "asagiri",
      topUrl: "https://www.town.asagiri.lg.jp/",
      region: "球磨郡",
    },
    // ── 天草郡 ──
    {
      name: "苓北町",
      slug: "reihoku",
      topUrl: "https://www.town.reihoku.kumamoto.jp/",
      region: "天草郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 大分県 (14市・3町・1村 = 18市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-oita": [
    // ── 市 (14) ──
    {
      name: "大分市",
      slug: "oita-city",
      topUrl: "https://www.city.oita.oita.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "別府市", slug: "beppu", topUrl: "https://www.city.beppu.oita.jp/", region: "市" },
    { name: "中津市", slug: "nakatsu", topUrl: "https://www.city-nakatsu.jp/", region: "市" },
    { name: "佐伯市", slug: "saiki", topUrl: "https://www.city.saiki.oita.jp/", region: "市" },
    { name: "日田市", slug: "hita", topUrl: "https://www.city.hita.oita.jp/", region: "市" },
    { name: "宇佐市", slug: "usa", topUrl: "https://www.city.usa.oita.jp/", region: "市" },
    { name: "臼杵市", slug: "usuki", topUrl: "https://www.city.usuki.oita.jp/", region: "市" },
    {
      name: "豊後大野市",
      slug: "bungoono",
      topUrl: "https://www.city.bungoono.oita.jp/",
      region: "市",
    },
    { name: "杵築市", slug: "kitsuki", topUrl: "https://www.city.kitsuki.lg.jp/", region: "市" },
    { name: "竹田市", slug: "taketa", topUrl: "https://www.city.taketa.oita.jp/", region: "市" },
    {
      name: "豊後高田市",
      slug: "bungotakada",
      topUrl: "https://www.city.bungotakada.oita.jp/",
      region: "市",
    },
    {
      name: "国東市",
      slug: "kunisaki",
      topUrl: "https://www.city.kunisaki.oita.jp/",
      region: "市",
    },
    { name: "由布市", slug: "yufu", topUrl: "https://www.city.yufu.oita.jp/", region: "市" },
    {
      name: "津久見市",
      slug: "tsukumi",
      topUrl: "https://www.city.tsukumi.oita.jp/",
      region: "市",
    },
    // ── 速見郡 ──
    { name: "日出町", slug: "hiji", topUrl: "https://www.town.hiji.lg.jp/", region: "速見郡" },
    // ── 玖珠郡 ──
    {
      name: "九重町",
      slug: "kokonoe",
      topUrl: "https://www.town.kokonoe.oita.jp/",
      region: "玖珠郡",
    },
    { name: "玖珠町", slug: "kusu", topUrl: "https://www.town.kusu.oita.jp/", region: "玖珠郡" },
    // ── 東国東郡 ──
    { name: "姫島村", slug: "himeshima", topUrl: "https://www.himeshima.jp/", region: "東国東郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 宮崎県 (9市・14町・3村 = 26市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-miyazaki": [
    // ── 市 (9) ──
    {
      name: "宮崎市",
      slug: "miyazaki-city",
      topUrl: "https://www.city.miyazaki.miyazaki.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "都城市",
      slug: "miyakonojo",
      topUrl: "https://www.city.miyakonojo.miyazaki.jp/",
      region: "市",
    },
    {
      name: "延岡市",
      slug: "nobeoka",
      topUrl: "https://www.city.nobeoka.miyazaki.jp/",
      region: "市",
    },
    { name: "日南市", slug: "nichinan", topUrl: "https://www.city.nichinan.lg.jp/", region: "市" },
    { name: "日向市", slug: "hyuga", topUrl: "https://www.city.hyuga.miyazaki.jp/", region: "市" },
    {
      name: "小林市",
      slug: "kobayashi",
      topUrl: "https://www.city.kobayashi.lg.jp/",
      region: "市",
    },
    { name: "えびの市", slug: "ebino", topUrl: "https://www.city.ebino.lg.jp/", region: "市" },
    { name: "串間市", slug: "kushima", topUrl: "https://www.city.kushima.lg.jp/", region: "市" },
    { name: "西都市", slug: "saito", topUrl: "https://www.city.saito.lg.jp/", region: "市" },
    // ── 北諸県郡 ──
    {
      name: "三股町",
      slug: "mimata",
      topUrl: "https://www.town.mimata.lg.jp/",
      region: "北諸県郡",
    },
    // ── 西諸県郡 ──
    {
      name: "高原町",
      slug: "takaharu",
      topUrl: "https://www.town.takaharu.lg.jp/",
      region: "西諸県郡",
    },
    // ── 東諸県郡 ──
    {
      name: "国富町",
      slug: "kunitomi",
      topUrl: "https://www.town.kunitomi.miyazaki.jp/",
      region: "東諸県郡",
    },
    { name: "綾町", slug: "aya", topUrl: "https://www.town.aya.miyazaki.jp/", region: "東諸県郡" },
    // ── 児湯郡 ──
    {
      name: "高鍋町",
      slug: "takanabe",
      topUrl: "https://www.town.takanabe.lg.jp/",
      region: "児湯郡",
    },
    {
      name: "新富町",
      slug: "shintomi",
      topUrl: "https://www.town.shintomi.lg.jp/",
      region: "児湯郡",
    },
    {
      name: "西米良村",
      slug: "nishimera",
      topUrl: "https://www.vill.nishimera.lg.jp/",
      region: "児湯郡",
    },
    { name: "木城町", slug: "kijo", topUrl: "https://www.town.kijo.lg.jp/", region: "児湯郡" },
    {
      name: "川南町",
      slug: "kawaminami",
      topUrl: "https://www.town.kawaminami.miyazaki.jp/",
      region: "児湯郡",
    },
    { name: "都農町", slug: "tsuno", topUrl: "https://www.town.tsuno.lg.jp/", region: "児湯郡" },
    // ── 東臼杵郡 ──
    {
      name: "門川町",
      slug: "kadogawa",
      topUrl: "https://www.town.kadogawa.lg.jp/",
      region: "東臼杵郡",
    },
    {
      name: "諸塚村",
      slug: "morotsuka",
      topUrl: "https://www.vill.morotsuka.miyazaki.jp/",
      region: "東臼杵郡",
    },
    {
      name: "椎葉村",
      slug: "shiiba",
      topUrl: "https://www.vill.shiiba.miyazaki.jp/",
      region: "東臼杵郡",
    },
    {
      name: "美郷町",
      slug: "misato-mi",
      topUrl: "https://www.town.miyazaki-misato.lg.jp/",
      region: "東臼杵郡",
    },
    // ── 西臼杵郡 ──
    {
      name: "高千穂町",
      slug: "takachiho",
      topUrl: "https://www.town.takachiho.lg.jp/",
      region: "西臼杵郡",
    },
    {
      name: "日之影町",
      slug: "hinokage",
      topUrl: "https://www.town.hinokage.lg.jp/",
      region: "西臼杵郡",
    },
    {
      name: "五ヶ瀬町",
      slug: "gokase",
      topUrl: "https://www.town.gokase.miyazaki.jp/",
      region: "西臼杵郡",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // 鹿児島県 (19市・20町・4村 = 43市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-kagoshima": [
    // ── 市 (19) ──
    {
      name: "鹿児島市",
      slug: "kagoshima-city",
      topUrl: "https://www.city.kagoshima.lg.jp/",
      isCapital: true,
      region: "市",
    },
    { name: "霧島市", slug: "kirishima", topUrl: "https://www.city-kirishima.jp/", region: "市" },
    { name: "鹿屋市", slug: "kanoya", topUrl: "https://www.city.kanoya.lg.jp/", region: "市" },
    {
      name: "薩摩川内市",
      slug: "satsumasendai",
      topUrl: "https://www.city.satsumasendai.lg.jp/",
      region: "市",
    },
    { name: "姶良市", slug: "aira", topUrl: "https://www.city.aira.lg.jp/", region: "市" },
    {
      name: "出水市",
      slug: "izumi-ka",
      topUrl: "https://www.city.izumi.kagoshima.jp/",
      region: "市",
    },
    { name: "日置市", slug: "hioki", topUrl: "https://www.city.hioki.lg.jp/", region: "市" },
    { name: "奄美市", slug: "amami", topUrl: "https://www.city.amami.lg.jp/", region: "市" },
    { name: "指宿市", slug: "ibusuki", topUrl: "https://www.city.ibusuki.lg.jp/", region: "市" },
    { name: "曽於市", slug: "soo", topUrl: "https://www.city.soo.kagoshima.jp/", region: "市" },
    {
      name: "南さつま市",
      slug: "minamisatsuma",
      topUrl: "https://www.city.minamisatsuma.lg.jp/",
      region: "市",
    },
    {
      name: "志布志市",
      slug: "shibushi",
      topUrl: "https://www.city.shibushi.lg.jp/",
      region: "市",
    },
    {
      name: "いちき串木野市",
      slug: "ichikikushikino",
      topUrl: "https://www.city.ichikikushikino.lg.jp/",
      region: "市",
    },
    {
      name: "南九州市",
      slug: "minamikyushu",
      topUrl: "https://www.city.minamikyushu.lg.jp/",
      region: "市",
    },
    { name: "伊佐市", slug: "isa", topUrl: "https://www.city.isa.lg.jp/", region: "市" },
    { name: "垂水市", slug: "tarumizu", topUrl: "https://www.city.tarumizu.lg.jp/", region: "市" },
    {
      name: "枕崎市",
      slug: "makurazaki",
      topUrl: "https://www.city.makurazaki.lg.jp/",
      region: "市",
    },
    { name: "阿久根市", slug: "akune", topUrl: "https://www.city.akune.lg.jp/", region: "市" },
    {
      name: "西之表市",
      slug: "nishinoomote",
      topUrl: "https://www.city.nishinoomote.lg.jp/",
      region: "市",
    },
    // ── 鹿児島郡 ──
    {
      name: "三島村",
      slug: "mishima-ka",
      topUrl: "https://www.mishimamura.jp/",
      region: "鹿児島郡",
    },
    { name: "十島村", slug: "toshima-ka", topUrl: "https://www.tokara.jp/", region: "鹿児島郡" },
    // ── 薩摩郡 ──
    { name: "さつま町", slug: "satsuma", topUrl: "https://www.satsuma-net.jp/", region: "薩摩郡" },
    // ── 出水郡 ──
    {
      name: "長島町",
      slug: "nagashima",
      topUrl: "https://www.town.nagashima.lg.jp/",
      region: "出水郡",
    },
    // ── 姶良郡 ──
    {
      name: "湧水町",
      slug: "yusui",
      topUrl: "https://www.town.yusui.kagoshima.jp/",
      region: "姶良郡",
    },
    // ── 曽於郡 ──
    {
      name: "大崎町",
      slug: "osaki-ka",
      topUrl: "https://www.town.kagoshima-osaki.lg.jp/",
      region: "曽於郡",
    },
    // ── 肝属郡 ──
    {
      name: "東串良町",
      slug: "higashikushira",
      topUrl: "https://www.town.higashikushira.lg.jp/",
      region: "肝属郡",
    },
    { name: "錦江町", slug: "kinko", topUrl: "https://www.town.kinko.lg.jp/", region: "肝属郡" },
    {
      name: "南大隅町",
      slug: "minamiosumi",
      topUrl: "https://www.town.minamiosumi.lg.jp/",
      region: "肝属郡",
    },
    { name: "肝付町", slug: "kimotsuki", topUrl: "https://kimotsuki-town.jp/", region: "肝属郡" },
    // ── 熊毛郡 ──
    {
      name: "中種子町",
      slug: "nakatane",
      topUrl: "https://www.town.nakatane.kagoshima.jp/",
      region: "熊毛郡",
    },
    {
      name: "南種子町",
      slug: "minamitane",
      topUrl: "https://www.town.minamitane.lg.jp/",
      region: "熊毛郡",
    },
    {
      name: "屋久島町",
      slug: "yakushima",
      topUrl: "https://www.town.yakushima.kagoshima.jp/",
      region: "熊毛郡",
    },
    // ── 大島郡 ──
    {
      name: "大和村",
      slug: "yamato-ka",
      topUrl: "https://www.vill.yamato.lg.jp/",
      region: "大島郡",
    },
    {
      name: "宇検村",
      slug: "uken",
      topUrl: "https://www.vill.uken.kagoshima.jp/",
      region: "大島郡",
    },
    {
      name: "瀬戸内町",
      slug: "setouchi-ka",
      topUrl: "https://www.town.setouchi.lg.jp/",
      region: "大島郡",
    },
    {
      name: "龍郷町",
      slug: "tatsugo",
      topUrl: "https://www.town.tatsugo.lg.jp/",
      region: "大島郡",
    },
    { name: "喜界町", slug: "kikai", topUrl: "https://www.town.kikai.lg.jp/", region: "大島郡" },
    {
      name: "徳之島町",
      slug: "tokunoshima",
      topUrl: "https://www.town.tokunoshima.lg.jp/",
      region: "大島郡",
    },
    { name: "天城町", slug: "amagi", topUrl: "https://www.town.amagi.lg.jp/", region: "大島郡" },
    {
      name: "伊仙町",
      slug: "isen",
      topUrl: "https://www.town.isen.kagoshima.jp/",
      region: "大島郡",
    },
    {
      name: "和泊町",
      slug: "wadomari",
      topUrl: "https://www.town.wadomari.lg.jp/",
      region: "大島郡",
    },
    { name: "知名町", slug: "china", topUrl: "https://www.town.china.lg.jp/", region: "大島郡" },
    { name: "与論町", slug: "yoron", topUrl: "https://www.yoron.jp/", region: "大島郡" },
  ],

  // ═══════════════════════════════════════════════════════════
  // 沖縄県 (11市・11町・19村 = 41市町村)
  // ═══════════════════════════════════════════════════════════
  "jorei-okinawa": [
    // ── 市 (11) ──
    {
      name: "那覇市",
      slug: "naha",
      topUrl: "https://www.city.naha.okinawa.jp/",
      isCapital: true,
      region: "市",
    },
    {
      name: "沖縄市",
      slug: "okinawa-city",
      topUrl: "https://www.city.okinawa.okinawa.jp/",
      region: "市",
    },
    { name: "うるま市", slug: "uruma", topUrl: "https://www.city.uruma.lg.jp/", region: "市" },
    { name: "浦添市", slug: "urasoe", topUrl: "https://www.city.urasoe.lg.jp/", region: "市" },
    { name: "宜野湾市", slug: "ginowan", topUrl: "https://www.city.ginowan.lg.jp/", region: "市" },
    { name: "名護市", slug: "nago", topUrl: "https://www.city.nago.okinawa.jp/", region: "市" },
    { name: "糸満市", slug: "itoman", topUrl: "https://www.city.itoman.lg.jp/", region: "市" },
    {
      name: "豊見城市",
      slug: "tomigusuku",
      topUrl: "https://www.city.tomigusuku.lg.jp/",
      region: "市",
    },
    {
      name: "宮古島市",
      slug: "miyakojima",
      topUrl: "https://www.city.miyakojima.lg.jp/",
      region: "市",
    },
    { name: "南城市", slug: "nanjo", topUrl: "https://www.city.nanjo.okinawa.jp/", region: "市" },
    {
      name: "石垣市",
      slug: "ishigaki",
      topUrl: "https://www.city.ishigaki.okinawa.jp/",
      region: "市",
    },
    // ── 国頭郡 ──
    {
      name: "国頭村",
      slug: "kunigami",
      topUrl: "https://www.vill.kunigami.okinawa.jp/",
      region: "国頭郡",
    },
    {
      name: "大宜味村",
      slug: "ogimi",
      topUrl: "https://www.vill.ogimi.okinawa.jp/",
      region: "国頭郡",
    },
    {
      name: "東村",
      slug: "higashi-ok",
      topUrl: "https://www.vill.higashi.okinawa.jp/",
      region: "国頭郡",
    },
    {
      name: "今帰仁村",
      slug: "nakijin",
      topUrl: "https://www.vill.nakijin.okinawa.jp/",
      region: "国頭郡",
    },
    {
      name: "本部町",
      slug: "motobu",
      topUrl: "https://www.town.motobu.okinawa.jp/",
      region: "国頭郡",
    },
    { name: "恩納村", slug: "onna", topUrl: "https://www.vill.onna.okinawa.jp/", region: "国頭郡" },
    {
      name: "宜野座村",
      slug: "ginoza",
      topUrl: "https://www.vill.ginoza.okinawa.jp/",
      region: "国頭郡",
    },
    { name: "金武町", slug: "kin", topUrl: "https://www.town.kin.okinawa.jp/", region: "国頭郡" },
    { name: "伊江村", slug: "ie", topUrl: "https://www.vill.ie.okinawa.jp/", region: "国頭郡" },
    // ── 中頭郡 ──
    {
      name: "読谷村",
      slug: "yomitan",
      topUrl: "https://www.vill.yomitan.okinawa.jp/",
      region: "中頭郡",
    },
    {
      name: "嘉手納町",
      slug: "kadena",
      topUrl: "https://www.town.kadena.okinawa.jp/",
      region: "中頭郡",
    },
    { name: "北谷町", slug: "chatan", topUrl: "https://www.chatan.jp/", region: "中頭郡" },
    {
      name: "北中城村",
      slug: "kitanakagusuku",
      topUrl: "https://www.vill.kitanakagusuku.lg.jp/",
      region: "中頭郡",
    },
    {
      name: "中城村",
      slug: "nakagusuku",
      topUrl: "https://www.vill.nakagusuku.okinawa.jp/",
      region: "中頭郡",
    },
    {
      name: "西原町",
      slug: "nishihara",
      topUrl: "https://www.town.nishihara.okinawa.jp/",
      region: "中頭郡",
    },
    // ── 島尻郡 ──
    {
      name: "与那原町",
      slug: "yonabaru",
      topUrl: "https://www.town.yonabaru.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "南風原町",
      slug: "haebaru",
      topUrl: "https://www.town.haebaru.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "渡嘉敷村",
      slug: "tokashiki",
      topUrl: "https://www.vill.tokashiki.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "座間味村",
      slug: "zamami",
      topUrl: "https://www.vill.zamami.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "粟国村",
      slug: "aguni",
      topUrl: "https://www.vill.aguni.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "渡名喜村",
      slug: "tonaki",
      topUrl: "https://www.vill.tonaki.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "南大東村",
      slug: "minamidaito",
      topUrl: "https://www.vill.minamidaito.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "北大東村",
      slug: "kitadaito",
      topUrl: "https://www.vill.kitadaito.okinawa.jp/",
      region: "島尻郡",
    },
    {
      name: "久米島町",
      slug: "kumejima",
      topUrl: "https://www.town.kumejima.okinawa.jp/",
      region: "島尻郡",
    },
    { name: "八重瀬町", slug: "yaese", topUrl: "https://www.town.yaese.lg.jp/", region: "島尻郡" },
    // ── 宮古郡 ──
    {
      name: "多良間村",
      slug: "tarama",
      topUrl: "https://www.vill.tarama.okinawa.jp/",
      region: "宮古郡",
    },
    // ── 八重山郡 ──
    {
      name: "竹富町",
      slug: "taketomi",
      topUrl: "https://www.town.taketomi.lg.jp/",
      region: "八重山郡",
    },
    {
      name: "与那国町",
      slug: "yonaguni",
      topUrl: "https://www.town.yonaguni.okinawa.jp/",
      region: "八重山郡",
    },
  ],
};

// ────────────────────────────────────────────────────────────
// ヘルパー関数
// ────────────────────────────────────────────────────────────

/** 都道府県slugから市区町村一覧を取得 */
export function getMunicipalitiesByPrefecture(prefSlug: string): MunicipalityInfo[] {
  return MUNICIPALITIES[prefSlug] ?? [];
}

/** 都道府県slugから地域区分ごとにグループ化した市区町村を取得（挿入順を維持） */
export function getMunicipalitiesGrouped(prefSlug: string): [string, MunicipalityInfo[]][] {
  const munis = MUNICIPALITIES[prefSlug] ?? [];
  const map = new Map<string, MunicipalityInfo[]>();
  for (const m of munis) {
    const key = m.region ?? "その他";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries());
}

/** 都道府県slugから県庁所在地を取得 */
export function getCapital(prefSlug: string): MunicipalityInfo | undefined {
  return MUNICIPALITIES[prefSlug]?.find((m) => m.isCapital);
}

/** 都道府県slugから政令指定都市一覧を取得 */
export function getDesignatedCities(prefSlug: string): MunicipalityInfo[] {
  return (MUNICIPALITIES[prefSlug] ?? []).filter((m) => m.isDesignated);
}

/** 全政令指定都市を取得 */
export function getAllDesignatedCities(): MunicipalityInfo[] {
  return Object.values(MUNICIPALITIES)
    .flat()
    .filter((m) => m.isDesignated);
}

/** 都道府県の市区町村ラベルを返す（東京は「市区町村」、村なし県は「市町」、それ以外は「市町村」） */
export function getMuniLabel(prefSlug: string): string {
  if (prefSlug === "jorei-tokyo") return "市区町村";
  const munis = MUNICIPALITIES[prefSlug] ?? [];
  const hasVillage = munis.some((m) => m.name.endsWith("村"));
  return hasVillage ? "市町村" : "市町";
}
