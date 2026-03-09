/**
 * 法令略称→正式名称マッピング
 * 裁判所の「参照法条」で使われる略称を正式名称に変換し、
 * LAW_REF_MAP で e-Gov 法令ID を引く
 */

import { LAW_REF_MAP } from "@/lib/lawrefs";

/**
 * 略称 → 正式名称（LAW_REF_MAP のキー）
 * LAW_REF_MAP にそのまま存在する法令名は不要（自動マッチ）
 * ここには LAW_REF_MAP に無い略称のみ登録
 */
export const LAW_ABBREVIATIONS: Record<string, string> = {
  // ── 訴訟法 ──
  刑訴法: "刑事訴訟法",
  民訴法: "民事訴訟法",
  行訴法: "行政事件訴訟法",
  民執法: "民事執行法",
  民保法: "民事保全法",

  // ── 憲法 ──
  憲法: "憲法", // LAW_REF_MAP 未登録対応用

  // ── 行政法 ──
  行手法: "行政手続法",
  行審法: "行政不服申立法",
  国賠法: "国家賠償法",
  国公法: "国家公務員法",
  地公法: "地方公務員法",

  // ── 商事法 ──
  会社法: "会社法",

  // ── 労働法 ──
  労基法: "労働基準法",
  労安衛法: "労働安全衛生法",
  労契法: "労働契約法",

  // ── 知財 ──
  不競法: "不正競争防止法",

  // ── その他 ──
  不登法: "不動産登記法",
  個情法: "個人情報保護法",
  独禁法: "独占禁止法",
  景表法: "景品表示法",
  金商法: "金融商品取引法",
  消契法: "消費者契約法",
  借地借家法: "借地借家法",

  // ── 一般に略称で使われる ──
  廃掃法: "廃棄物処理法",
  道交法: "道路交通法",

  // ── 裁判例でよく見る正式名称の微妙な表記揺れ ──
  私的独占の禁止及び公正取引の確保に関する法律: "独占禁止法",
  "医薬品、医療機器等の品質、有効性及び安全性の確保等に関する法律": "薬機法",
  "医薬品，医療機器等の品質，有効性及び安全性の確保等に関する法律": "薬機法",
  "児童買春、児童ポルノに係る行為等の規制及び処罰並びに児童の保護等に関する法律":
    "児童買春、児童ポルノ禁止法",
  "児童買春，児童ポルノに係る行為等の規制及び処罰並びに児童の保護等に関する法律":
    "児童買春、児童ポルノ禁止法",
};

// 憲法を LAW_REF_MAP に追加（lawrefs.ts 本体は変更せずここで補完）
const EXTRA_LAW_IDS: Record<string, string> = {
  憲法: "321CONSTITUTION",
  日本国憲法: "321CONSTITUTION",
  "児童買春、児童ポルノ禁止法": "411AC0000000052",
  覚せい剤取締法: "326AC0000000252",
  覚醒剤取締法: "326AC0000000252",
  大麻取締法: "323AC0000000124",
  銃砲刀剣類所持等取締法: "333AC0000000006",
  売春防止法: "331AC0000000118",
  保険法: "420AC0000000056",
  民法: "129AC0000000089", // 補強
  労働組合法: "324AC0000000174",
  男女雇用機会均等法: "347AC0000000113",
  労働者派遣法: "360AC0000000088",
  出入国管理及び難民認定法: "326CO0000000319",
  海難審判法: "322AC0000000135",
  国家行政組織法: "323AC0000000120",
  人事院規則: "", // 法令IDなし（規則は個別）
};

/** 統合された法令名→法令IDマップ（LAW_REF_MAP + EXTRA） */
const MERGED_LAW_MAP: Record<string, string> = { ...LAW_REF_MAP, ...EXTRA_LAW_IDS };

/**
 * 法令名（略称含む）→ e-Gov 法令ID を解決
 * @returns [正式名, lawId] or null
 */
export function resolveLawName(name: string): [string, string] | null {
  // 改正注記を除去: "法人税法（平成27年法律第9号による改正前のもの）" → "法人税法"
  const cleanName = name.replace(/（[^）]*改正前のもの）/g, "").trim();

  // 1. LAW_REF_MAP に直接ある
  if (MERGED_LAW_MAP[cleanName] !== undefined) {
    return [cleanName, MERGED_LAW_MAP[cleanName]];
  }

  // 2. 略称マッピング
  const fullName = LAW_ABBREVIATIONS[cleanName];
  if (fullName) {
    const lawId = MERGED_LAW_MAP[fullName];
    if (lawId !== undefined) {
      return [fullName, lawId];
    }
  }

  // 3. 部分一致（長い名前から試行）
  const sortedKeys = Object.keys(MERGED_LAW_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (cleanName.includes(key) && MERGED_LAW_MAP[key]) {
      return [key, MERGED_LAW_MAP[key]];
    }
  }

  return null;
}

/**
 * 略称→正式名称（法令ID不要の場合）
 */
export function expandAbbreviation(abbrev: string): string {
  return LAW_ABBREVIATIONS[abbrev] || abbrev;
}
