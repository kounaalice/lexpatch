// 省庁リンク：カテゴリグループ → 所管省庁（静的マッピング）

export interface MinistryLink {
  name: string;
  url: string;
  lawPageUrl: string; // 法令・通知ページ直リンク
}

export const MINISTRY_BY_GROUP: Record<string, MinistryLink[]> = {
  admin: [
    { name: "総務省",     url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" },
    { name: "内閣法制局", url: "https://www.clb.go.jp/",   lawPageUrl: "https://www.clb.go.jp/contents/houan.html" },
  ],
  justice: [
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" },
  ],
  finance: [
    { name: "財務省", url: "https://www.mof.go.jp/", lawPageUrl: "https://www.mof.go.jp/about_mof/bills/index.htm" },
    { name: "金融庁",   url: "https://www.fsa.go.jp/", lawPageUrl: "https://www.fsa.go.jp/common/Diet/" },
  ],
  industry: [
    { name: "経済産業省", url: "https://www.meti.go.jp/", lawPageUrl: "https://www.meti.go.jp/policy/index.html" },
    { name: "農林水産省", url: "https://www.maff.go.jp/", lawPageUrl: "https://www.maff.go.jp/j/law/houan/" },
    { name: "観光庁（国土交通省）", url: "https://www.mlit.go.jp/kankocho/", lawPageUrl: "https://www.mlit.go.jp/kankocho/policy01/index.html" },
  ],
  traffic: [
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" },
    { name: "総務省（電気通信）", url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" },
  ],
  land: [
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" },
    { name: "環境省",     url: "https://www.env.go.jp/", lawPageUrl: "https://www.env.go.jp/policy/index.html" },
  ],
  society: [
    { name: "厚生労働省", url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" },
    { name: "文部科学省", url: "https://www.mext.go.jp/", lawPageUrl: "https://www.mext.go.jp/a_menu/houan/main5_a4.htm" },
  ],
  security: [
    { name: "防衛省",   url: "https://www.mod.go.jp/", lawPageUrl: "https://www.mod.go.jp/j/approach/agenda/houan/index.html" },
    { name: "警察庁",   url: "https://www.npa.go.jp/", lawPageUrl: "https://www.npa.go.jp/laws/index.html" },
    { name: "消防庁",   url: "https://www.fdma.go.jp/", lawPageUrl: "https://www.fdma.go.jp/laws/" },
  ],
};

// ─── 法令タイトルから所管省庁を推定 ─────────────────────────────
// 優先順位が高いものを先に記述（最初にマッチしたものを採用）
const TITLE_MINISTRY_RULES: [RegExp, MinistryLink][] = [
  // 各省庁名そのものが含まれる場合（設置法・組織令等）
  [/厚生労働省/,   { name: "厚生労働省",   url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],
  [/文部科学省/,   { name: "文部科学省",   url: "https://www.mext.go.jp/", lawPageUrl: "https://www.mext.go.jp/a_menu/houan/main5_a4.htm" }],
  [/経済産業省/,   { name: "経済産業省",   url: "https://www.meti.go.jp/", lawPageUrl: "https://www.meti.go.jp/policy/index.html" }],
  [/国土交通省/,   { name: "国土交通省",   url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/農林水産省/,   { name: "農林水産省",   url: "https://www.maff.go.jp/", lawPageUrl: "https://www.maff.go.jp/j/law/houan/" }],
  [/財務省/,       { name: "財務省",       url: "https://www.mof.go.jp/", lawPageUrl: "https://www.mof.go.jp/about_mof/bills/index.htm" }],
  [/法務省/,       { name: "法務省",       url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],
  [/外務省/,       { name: "外務省",       url: "https://www.mofa.go.jp/", lawPageUrl: "https://www.mofa.go.jp/mofaj/gaiko/treaty/index.html" }],
  [/総務省/,       { name: "総務省",       url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" }],
  [/環境省/,       { name: "環境省",       url: "https://www.env.go.jp/", lawPageUrl: "https://www.env.go.jp/policy/index.html" }],
  [/防衛省/,       { name: "防衛省",       url: "https://www.mod.go.jp/", lawPageUrl: "https://www.mod.go.jp/j/approach/agenda/houan/index.html" }],
  [/デジタル庁/,   { name: "デジタル庁",   url: "https://www.digital.go.jp/", lawPageUrl: "https://www.digital.go.jp/policies/" }],
  [/内閣府/,       { name: "内閣府",       url: "https://www.cao.go.jp/", lawPageUrl: "https://www.cao.go.jp/houan/index.html" }],
  [/金融庁/,       { name: "金融庁",       url: "https://www.fsa.go.jp/", lawPageUrl: "https://www.fsa.go.jp/common/Diet/" }],
  [/警察庁/,       { name: "警察庁",       url: "https://www.npa.go.jp/", lawPageUrl: "https://www.npa.go.jp/laws/index.html" }],
  [/消防庁/,       { name: "消防庁",       url: "https://www.fdma.go.jp/", lawPageUrl: "https://www.fdma.go.jp/laws/" }],
  [/観光庁/,       { name: "観光庁",       url: "https://www.mlit.go.jp/kankocho/", lawPageUrl: "https://www.mlit.go.jp/kankocho/policy01/index.html" }],
  [/文化庁/,       { name: "文化庁",       url: "https://www.bunka.go.jp/", lawPageUrl: "https://www.bunka.go.jp/seisaku/index.html" }],
  [/林野庁/,       { name: "林野庁",       url: "https://www.rinya.maff.go.jp/", lawPageUrl: "https://www.rinya.maff.go.jp/j/rinsei/houan.html" }],
  [/水産庁/,       { name: "水産庁",       url: "https://www.jfa.maff.go.jp/", lawPageUrl: "https://www.jfa.maff.go.jp/j/kikaku/hourei/" }],
  [/国税庁/,       { name: "国税庁",       url: "https://www.nta.go.jp/", lawPageUrl: "https://www.nta.go.jp/law/index.htm" }],

  // ── 法令内容キーワードによる推定（優先順位順） ──

  // 皇室・内閣
  [/皇室典範/,
    { name: "宮内庁", url: "https://www.kunaicho.go.jp/", lawPageUrl: "https://www.kunaicho.go.jp/" }],
  [/内閣法$/,
    { name: "内閣官房", url: "https://www.cas.go.jp/", lawPageUrl: "https://www.cas.go.jp/jp/houan/index.html" }],

  // 国会（議院自律権の法律）
  [/国会法|議院|国会職員/,
    { name: "衆議院", url: "https://www.shugiin.go.jp/", lawPageUrl: "https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/menu.htm" }],

  // 消費者庁（消費者関連は経産省より先にマッチさせる）
  [/消費者基本|消費者契約|特定商取引|公益通報|製造物責任|消費者安全/,
    { name: "消費者庁", url: "https://www.caa.go.jp/", lawPageUrl: "https://www.caa.go.jp/law/bills/" }],
  [/景品表示|不当景品/,
    { name: "消費者庁", url: "https://www.caa.go.jp/", lawPageUrl: "https://www.caa.go.jp/law/bills/" }],

  // 公正取引委員会（独占禁止法は公取委が所管）
  [/私的独占|独占禁止/,
    { name: "公正取引委員会", url: "https://www.jftc.go.jp/", lawPageUrl: "https://www.jftc.go.jp/dk/guideline/index.html" }],

  // 著作権法は文化庁（特許庁パターンより先にマッチ）
  [/著作権/,
    { name: "文部科学省（文化庁）", url: "https://www.bunka.go.jp/", lawPageUrl: "https://www.bunka.go.jp/seisaku/chosakuken/index.html" }],

  // 法務省 — 登記（不動産登記・商業登記は法務省、国交省より先）
  [/不動産登記|商業登記|登記/,
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],

  // 道路交通法は警察庁（国交省の道路パターンより先）
  [/道路交通/,
    { name: "警察庁（国家公安委員会）", url: "https://www.npa.go.jp/", lawPageUrl: "https://www.npa.go.jp/laws/index.html" }],

  // 法務省 — 民事基本法
  [/民法|商法|会社法|手形|小切手|破産|民事再生|会社更生|倒産|民事執行|民事保全|保険法$/,
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],
  [/民事訴訟|人事訴訟|非訟事件|家事事件|借地借家|供託|利息制限|法の適用に関する通則/,
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],

  // 法務省 — 刑事法・矯正
  [/刑法|刑事訴訟|少年法|売春防止|暴力団|刑事収容|被収容者|更生保護/,
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],

  // 法務省 — 司法制度
  [/裁判所法|裁判員|検察庁|弁護士|公証人|司法書士|戸籍|国籍|国家賠償|行政事件訴訟/,
    { name: "法務省", url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],

  // 法務省 — 入管
  [/出入国|外国人|難民/,
    { name: "法務省（出入国在留管理庁）", url: "https://www.moj.go.jp/isa/", lawPageUrl: "https://www.moj.go.jp/isa/laws/index.html" }],

  // 厚生労働省 — 労働法
  [/労働基準|労働安全|労働関係|労働者|労働組合|労働契約|労働審判|雇用|最低賃金|育児.休業|介護.休業|育児・介護|派遣労働/,
    { name: "厚生労働省", url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],
  [/健康保険|国民年金|厚生年金|社会保険|介護保険|医療保険/,
    { name: "厚生労働省", url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],
  [/生活保護|社会福祉|老人福祉|障害者|児童福祉|母子/,
    { name: "厚生労働省", url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],
  [/薬事|薬機|医薬品|医療機器|感染症|食品衛生|健康増進/,
    { name: "厚生労働省", url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],

  // 知的財産（特許庁）
  [/不正競争|工業所有権|特許|実用新案|意匠|商標/,
    { name: "経済産業省（特許庁）", url: "https://www.jpo.go.jp/", lawPageUrl: "https://www.jpo.go.jp/system/laws/index.html" }],

  // 農林水産省
  [/農業|農地|農協|食料|種苗|家畜|飼料/,
    { name: "農林水産省", url: "https://www.maff.go.jp/", lawPageUrl: "https://www.maff.go.jp/j/law/houan/" }],
  [/森林|林業|木材/,
    { name: "農林水産省（林野庁）", url: "https://www.rinya.maff.go.jp/", lawPageUrl: "https://www.rinya.maff.go.jp/j/rinsei/houan.html" }],
  [/漁業|水産|水産物|捕鯨/,
    { name: "農林水産省（水産庁）", url: "https://www.jfa.maff.go.jp/", lawPageUrl: "https://www.jfa.maff.go.jp/j/kikaku/hourei/" }],

  // 国土交通省
  [/道路法|高速|自動車|運転|陸運|軌道|鉄道/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/船舶|海運|港湾|海上|水先/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/航空|空港|飛行|ドローン/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/建築|住宅|宅地|マンション|不動産|建設業/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/都市計画|土地収用|区画整理|再開発/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/河川|砂防|海岸|ダム|水道/,
    { name: "国土交通省", url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
  [/観光|旅行業|ホテル|旅館/,
    { name: "観光庁（国土交通省）", url: "https://www.mlit.go.jp/kankocho/", lawPageUrl: "https://www.mlit.go.jp/kankocho/policy01/index.html" }],

  // 環境省
  [/環境|公害|廃棄物|リサイクル|温暖化|生物多様性|自然公園|鳥獣/,
    { name: "環境省", url: "https://www.env.go.jp/", lawPageUrl: "https://www.env.go.jp/policy/index.html" }],

  // 財務省・国税庁
  [/国税|所得税|法人税|消費税|相続税|贈与税|印紙税|酒税|たばこ税/,
    { name: "財務省（国税庁）", url: "https://www.nta.go.jp/", lawPageUrl: "https://www.nta.go.jp/law/index.htm" }],
  [/関税|外国為替|貿易/,
    { name: "財務省", url: "https://www.mof.go.jp/", lawPageUrl: "https://www.mof.go.jp/about_mof/bills/index.htm" }],
  [/財政|予算|公債|国有財産|地方財政/,
    { name: "財務省", url: "https://www.mof.go.jp/", lawPageUrl: "https://www.mof.go.jp/about_mof/bills/index.htm" }],

  // 金融庁
  [/銀行|保険業|金融商品|証券|信用組合|協同組合.+金融/,
    { name: "金融庁", url: "https://www.fsa.go.jp/", lawPageUrl: "https://www.fsa.go.jp/common/Diet/" }],

  // 総務省
  [/電気通信|放送|電波|無線|インターネット|郵便/,
    { name: "総務省", url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" }],
  [/地方自治|地方公務員|国家公務員|行政手続|行政不服|行政代執行|国家行政組織|個人情報|番号法|マイナ|公職選挙|地方税|情報公開/,
    { name: "総務省", url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" }],

  // 文部科学省
  [/教育|学校教育|大学|高校|小学|幼稚園|学習指導|奨学金/,
    { name: "文部科学省", url: "https://www.mext.go.jp/", lawPageUrl: "https://www.mext.go.jp/a_menu/houan/main5_a4.htm" }],
  [/文化財|スポーツ|芸術|宗教|文化/,
    { name: "文部科学省（文化庁）", url: "https://www.bunka.go.jp/", lawPageUrl: "https://www.bunka.go.jp/seisaku/index.html" }],

  // 防衛省
  [/防衛|自衛隊|在日米軍|武器輸出/,
    { name: "防衛省", url: "https://www.mod.go.jp/", lawPageUrl: "https://www.mod.go.jp/j/approach/agenda/houan/index.html" }],

  // 警察庁・消防庁
  [/警察|犯罪捜査|銃砲|刀剣/,
    { name: "警察庁", url: "https://www.npa.go.jp/", lawPageUrl: "https://www.npa.go.jp/laws/index.html" }],
  [/消防|火災|危険物/,
    { name: "消防庁", url: "https://www.fdma.go.jp/", lawPageUrl: "https://www.fdma.go.jp/laws/" }],
  [/災害対策|防災|復興|被災/,
    { name: "内閣府（防災担当）", url: "https://www.bousai.go.jp/", lawPageUrl: "https://www.bousai.go.jp/taisaku/index.html" }],
];

// 省令番号から省庁を推定（MinisterialOrdinance 型向け）
export function extractMinistryFromLawNum(lawNum: string): MinistryLink | null {
  const patterns: [RegExp, MinistryLink][] = [
    [/内閣府令/,     { name: "内閣府",       url: "https://www.cao.go.jp/", lawPageUrl: "https://www.cao.go.jp/houan/index.html" }],
    [/内閣官房令/,   { name: "内閣官房",     url: "https://www.cas.go.jp/", lawPageUrl: "https://www.cas.go.jp/jp/houan/index.html" }],
    [/公正取引委員会規則/, { name: "公正取引委員会", url: "https://www.jftc.go.jp/", lawPageUrl: "https://www.jftc.go.jp/dk/guideline/index.html" }],
    [/総務省令/,     { name: "総務省",       url: "https://www.soumu.go.jp/", lawPageUrl: "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/houki.html" }],
    [/法務省令/,     { name: "法務省",       url: "https://www.moj.go.jp/", lawPageUrl: "https://www.moj.go.jp/housei/houan/houan.html" }],
    [/外務省令/,     { name: "外務省",       url: "https://www.mofa.go.jp/", lawPageUrl: "https://www.mofa.go.jp/mofaj/gaiko/treaty/index.html" }],
    [/財務省令/,     { name: "財務省",       url: "https://www.mof.go.jp/", lawPageUrl: "https://www.mof.go.jp/about_mof/bills/index.htm" }],
    [/文部科学省令/, { name: "文部科学省",   url: "https://www.mext.go.jp/", lawPageUrl: "https://www.mext.go.jp/a_menu/houan/main5_a4.htm" }],
    [/厚生労働省令/, { name: "厚生労働省",   url: "https://www.mhlw.go.jp/", lawPageUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/000003259.html" }],
    [/農林水産省令/, { name: "農林水産省",   url: "https://www.maff.go.jp/", lawPageUrl: "https://www.maff.go.jp/j/law/houan/" }],
    [/経済産業省令/, { name: "経済産業省",   url: "https://www.meti.go.jp/", lawPageUrl: "https://www.meti.go.jp/policy/index.html" }],
    [/国土交通省令/, { name: "国土交通省",   url: "https://www.mlit.go.jp/", lawPageUrl: "https://www.mlit.go.jp/policy/index.html" }],
    [/環境省令/,     { name: "環境省",       url: "https://www.env.go.jp/", lawPageUrl: "https://www.env.go.jp/policy/index.html" }],
    [/防衛省令/,     { name: "防衛省",       url: "https://www.mod.go.jp/", lawPageUrl: "https://www.mod.go.jp/j/approach/agenda/houan/index.html" }],
    [/デジタル庁令/, { name: "デジタル庁",   url: "https://www.digital.go.jp/", lawPageUrl: "https://www.digital.go.jp/policies/" }],
    [/金融庁/,       { name: "金融庁",       url: "https://www.fsa.go.jp/", lawPageUrl: "https://www.fsa.go.jp/common/Diet/" }],
    [/警察庁/,       { name: "警察庁",       url: "https://www.npa.go.jp/", lawPageUrl: "https://www.npa.go.jp/laws/index.html" }],
    [/消防庁/,       { name: "消防庁",       url: "https://www.fdma.go.jp/", lawPageUrl: "https://www.fdma.go.jp/laws/" }],
    [/復興庁/,       { name: "復興庁",       url: "https://www.reconstruction.go.jp/", lawPageUrl: "https://www.reconstruction.go.jp/topics/main-cat1/sub-cat1-1/index.html" }],
  ];
  for (const [re, link] of patterns) {
    if (re.test(lawNum)) return link;
  }
  return null;
}

// 法令タイトルから所管省庁を推定（最大2件）
export function getMinistryByTitle(lawTitle: string): MinistryLink[] {
  const found: MinistryLink[] = [];
  const seen = new Set<string>();
  for (const [re, link] of TITLE_MINISTRY_RULES) {
    if (re.test(lawTitle) && !seen.has(link.name)) {
      found.push(link);
      seen.add(link.name);
      if (found.length >= 2) break;
    }
  }
  return found;
}

// 法令ごとに所管省庁リンクを取得（省令番号 → タイトル の順で推定）
export function getMinistryLinks(
  lawTitle: string,
  lawNum: string,
  lawType?: string,
): MinistryLink[] {
  // 省令・規則型は法令番号から確実に取れる
  if (lawType === "MinisterialOrdinance" || lawType === "Rule") {
    const fromNum = extractMinistryFromLawNum(lawNum);
    if (fromNum) return [fromNum];
  }

  // タイトルキーワードで推定（法律・政令・その他すべて）
  const fromTitle = getMinistryByTitle(lawTitle);
  if (fromTitle.length > 0) return fromTitle;

  // 最後の手段：省令番号パターンを試す
  const fromNum = extractMinistryFromLawNum(lawNum);
  if (fromNum) return [fromNum];

  return [];
}
