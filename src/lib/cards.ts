// ── 条文カードゲーム: ガチャ・収集・報酬 ──────────────────────
// 条文をTCGカードとして収集。ガチャ・購入・報酬で獲得。

import type { Article } from "./egov/types";

// ── 型定義 ──

export type CardRarity = "N" | "R" | "SR" | "SSR";

export interface CardEntry {
  count: number; // 所持枚数（ダブり含む）
  firstAt: string; // 初回入手 ISO
}

export interface PityCounter {
  draws: number; // 累計ガチャ回数
  lastSR: number; // 最後にSR以上を引いた回数
  lastSSR: number; // 最後にSSRを引いた回数
}

export interface GachaResult {
  cardId: string;
  rarity: CardRarity;
  isNew: boolean;
}

export interface CollectionStats {
  total: number; // 総枚数（ダブり含む）
  unique: number; // ユニーク種類数
  byRarity: Record<CardRarity, number>;
  lawCardCount: number;
}

export interface LawCardEntry {
  lawId: string;
  lawTitle: string;
  articleCount: number;
  unlockedAt: string;
}

// ── 定数 ──

const CARDS_KEY = "lp_cards";
const PITY_KEY = "lp_gacha_pity";
const LAW_CARDS_KEY = "lp_law_cards";
const DAILY_BONUS_KEY = "lp_daily_card_bonus";
const LAW_NAME_CACHE_KEY = "lp_law_names";

// ガチャコスト
export const GACHA_COST_SINGLE = 30;
export const GACHA_COST_TEN = 250;

// 直接購入コスト
export const BUY_COST: Record<CardRarity, number> = {
  N: 20,
  R: 50,
  SR: 150,
  SSR: 500,
};

// 排出率（累積）
const RATE_SSR = 0.03;
const RATE_SR = 0.03 + 0.12; // 0.15
const RATE_R = 0.15 + 0.3; // 0.45
// 残り = N

// 天井
const PITY_SR = 30; // 30連以内にSR確定
const PITY_SSR = 50; // 50連以内にSSR確定

// レアリティ表示
export const RARITY_STARS: Record<CardRarity, string> = {
  N: "\u2606", // ☆
  R: "\u2605", // ★
  SR: "\u2605\u2605", // ★★
  SSR: "\u2605\u2605\u2605", // ★★★
};

export const RARITY_LABEL: Record<CardRarity, string> = {
  N: "N",
  R: "R",
  SR: "SR",
  SSR: "SSR",
};

export const RARITY_COLOR: Record<CardRarity, { border: string; glow: string; bg: string }> = {
  N: { border: "var(--color-border)", glow: "none", bg: "transparent" },
  R: { border: "#38BDF8", glow: "0 0 6px rgba(56,189,248,0.3)", bg: "rgba(56,189,248,0.05)" },
  SR: { border: "#A78BFA", glow: "0 0 10px rgba(167,139,250,0.4)", bg: "rgba(167,139,250,0.08)" },
  SSR: { border: "#F59E0B", glow: "0 0 15px rgba(245,158,11,0.5)", bg: "rgba(245,158,11,0.1)" },
};

// ── SSR ハードコードテーブル（著名条文） ──

export const SSR_ARTICLES = new Set([
  // 憲法
  "321CONSTITUTION:9", // 戦争放棄
  "321CONSTITUTION:11", // 基本的人権
  "321CONSTITUTION:13", // 個人の尊重
  "321CONSTITUTION:14", // 法の下の平等
  "321CONSTITUTION:21", // 表現の自由
  "321CONSTITUTION:25", // 生存権
  // 民法
  "129AC0000000089:1", // 基本原則
  "129AC0000000089:90", // 公序良俗
  "129AC0000000089:415", // 債務不履行
  "129AC0000000089:709", // 不法行為
  "129AC0000000089:715", // 使用者責任
  "129AC0000000089:770", // 離婚原因
  // 刑法
  "140AC0000000045:36", // 正当防衛
  "140AC0000000045:199", // 殺人罪
  "140AC0000000045:235", // 窃盗罪
  "140AC0000000045:246", // 詐欺罪
  // 行政手続法
  "405AC0000000088:1", // 目的
  // 労働基準法
  "322AC0000000049:1", // 労働条件の原則
  "322AC0000000049:32", // 労働時間
  "322AC0000000049:39", // 年次有給休暇
  // 会社法
  "417AC0000000086:1", // 趣旨
  "417AC0000000086:362", // 取締役会の権限
  // 個人情報保護法
  "415AC0000000057:1", // 目的
  // 著作権法
  "345AC0000000048:1", // 目的
  "345AC0000000048:30", // 私的使用のための複製
]);

// ── ガチャパック定義 ──

export interface PackDef {
  id: string;
  label: string;
  emoji: string;
  lawIds: string[];
  requiredLevel: number;
}

export const PACK_DEFS: PackDef[] = [
  {
    id: "roppo",
    label: "\u516D\u6CD5", // 六法
    emoji: "\u2696\uFE0F", // ⚖️
    lawIds: [
      "321CONSTITUTION", // 憲法
      "129AC0000000089", // 民法
      "140AC0000000045", // 刑法
      "132AC0000000048", // 商法
      "408AC0000000109", // 民事訴訟法
      "323AC0000000131", // 刑事訴訟法
    ],
    requiredLevel: 1,
  },
  {
    id: "minji",
    label: "\u6C11\u4E8B", // 民事
    emoji: "\uD83D\uDCDC", // 📜
    lawIds: [
      "129AC0000000089",
      "408AC0000000109",
      "354AC0000000004",
      "402AC0000000091",
      "416AC0000000123",
      "403AC0000000090",
    ],
    requiredLevel: 2,
  },
  {
    id: "keiji",
    label: "\u5211\u4E8B", // 刑事
    emoji: "\uD83D\uDD28", // 🔨
    lawIds: ["140AC0000000045", "323AC0000000131", "322AC0000000059"],
    requiredLevel: 2,
  },
  {
    id: "gyosei",
    label: "\u884C\u653F", // 行政
    emoji: "\uD83C\uDFDB\uFE0F", // 🏛️
    lawIds: [
      "405AC0000000088",
      "337AC0000000139",
      "322AC0000000125",
      "322AC0000000120",
      "322AC0000000067",
    ],
    requiredLevel: 3,
  },
  {
    id: "rodo",
    label: "\u52B4\u50CD", // 労働
    emoji: "\uD83D\uDCBC", // 💼
    lawIds: ["322AC0000000049", "347AC0000000057", "419AC0000000128", "349AC0000000116"],
    requiredLevel: 3,
  },
  {
    id: "mixed",
    label: "\u30DF\u30C3\u30AF\u30B9", // ミックス
    emoji: "\uD83C\uDFB2", // 🎲
    lawIds: [], // 全法令対象（閲覧済み法令から抽選）
    requiredLevel: 1,
  },
];

// ── localStorage ヘルパー ──

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ── レアリティ判定（決定的） ──

/** 条文のレアリティを決定的に判定（同じ条文は常に同じレアリティ） */
export function getArticleRarity(lawId: string, articleNum: string, article?: Article): CardRarity {
  const cardId = `${lawId}:${articleNum}`;

  // SSRハードコード
  if (SSR_ARTICLES.has(cardId)) return "SSR";

  // 記事データがある場合は構造ベースで判定
  if (article) {
    const pCount = article.paragraphs.length;
    const iCount = article.paragraphs.reduce((sum, p) => sum + (p.items?.length || 0), 0);
    if (pCount >= 10 || iCount >= 15) return "SSR";
    if (pCount >= 5 || iCount >= 10) return "SR";
    if (pCount >= 2 || article.caption) return "R";
    return "N";
  }

  // 記事データがない場合はハッシュベース
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 5) - hash + cardId.charCodeAt(i)) | 0;
  }
  const r = Math.abs(hash % 1000) / 1000;
  if (r < 0.03) return "SSR";
  if (r < 0.15) return "SR";
  if (r < 0.45) return "R";
  return "N";
}

// ── コレクション操作 ──

export function getCollection(): Record<string, CardEntry> {
  return readJSON<Record<string, CardEntry>>(CARDS_KEY, {});
}

export function addCard(cardId: string): { isNew: boolean; rarity: CardRarity } {
  if (typeof window === "undefined") return { isNew: false, rarity: "N" };

  const [lawId, articleNum] = cardId.split(":");
  const rarity = getArticleRarity(lawId, articleNum);
  const collection = getCollection();
  const isNew = !collection[cardId];

  collection[cardId] = {
    count: (collection[cardId]?.count || 0) + 1,
    firstAt: collection[cardId]?.firstAt || new Date().toISOString(),
  };
  localStorage.setItem(CARDS_KEY, JSON.stringify(collection));

  // カード獲得イベント
  window.dispatchEvent(
    new CustomEvent("lexcard:card-reward", {
      detail: { cardId, rarity, isNew },
    }),
  );

  return { isNew, rarity };
}

export function hasCard(cardId: string): boolean {
  return !!getCollection()[cardId];
}

export function getCollectionStats(): CollectionStats {
  const collection = getCollection();
  const entries = Object.entries(collection);
  const byRarity: Record<CardRarity, number> = { N: 0, R: 0, SR: 0, SSR: 0 };

  let total = 0;
  for (const [cardId, entry] of entries) {
    const [lawId, articleNum] = cardId.split(":");
    const rarity = getArticleRarity(lawId, articleNum);
    byRarity[rarity]++;
    total += entry.count;
  }

  return {
    total,
    unique: entries.length,
    byRarity,
    lawCardCount: getLawCards().length,
  };
}

/** 法令ごとの収集率を計算 */
export function getLawCollectionRate(
  lawId: string,
  totalArticles: number,
): { collected: number; total: number; rate: number } {
  const collection = getCollection();
  const prefix = `${lawId}:`;
  const collected = Object.keys(collection).filter((k) => k.startsWith(prefix)).length;
  return {
    collected,
    total: totalArticles,
    rate: totalArticles > 0 ? collected / totalArticles : 0,
  };
}

// ── 法令名キャッシュ（カード図鑑で法令名を表示するため永続保存） ──

/** lawId → lawTitle の永続キャッシュを取得 */
export function getLawNameCache(): Record<string, string> {
  return readJSON<Record<string, string>>(LAW_NAME_CACHE_KEY, {});
}

/** 法令名をキャッシュに保存（カード獲得時に呼ぶ） */
export function cacheLawName(lawId: string, lawTitle: string): void {
  if (typeof window === "undefined" || !lawId || !lawTitle) return;
  const cache = getLawNameCache();
  if (cache[lawId] === lawTitle) return; // 変更なし
  cache[lawId] = lawTitle;
  localStorage.setItem(LAW_NAME_CACHE_KEY, JSON.stringify(cache));
}

// ── 法令カード（コンプリート報酬） ──

export function getLawCards(): LawCardEntry[] {
  return readJSON<LawCardEntry[]>(LAW_CARDS_KEY, []);
}

export function hasLawCard(lawId: string): boolean {
  return getLawCards().some((c) => c.lawId === lawId);
}

/** 法令の全条文収集をチェック → 達成時に法令カード解放 */
export function checkLawCompletion(
  lawId: string,
  lawTitle: string,
  totalArticles: number,
): LawCardEntry | null {
  if (typeof window === "undefined") return null;
  if (hasLawCard(lawId)) return null;

  const { collected } = getLawCollectionRate(lawId, totalArticles);
  if (collected < totalArticles || totalArticles === 0) return null;

  // 法令カード解放！
  const entry: LawCardEntry = {
    lawId,
    lawTitle,
    articleCount: totalArticles,
    unlockedAt: new Date().toISOString(),
  };
  const cards = getLawCards();
  cards.unshift(entry);
  localStorage.setItem(LAW_CARDS_KEY, JSON.stringify(cards));

  // 特別イベント
  window.dispatchEvent(
    new CustomEvent("lexcard:law-card-unlocked", {
      detail: entry,
    }),
  );

  return entry;
}

// ── ポイント消費 ──

/** 活動ポイントを消費（残高不足なら false） */
export function spendPoints(amount: number): boolean {
  if (typeof window === "undefined") return false;
  const current = parseInt(localStorage.getItem("lp_activity_points") || "0", 10) || 0;
  if (current < amount) return false;
  localStorage.setItem("lp_activity_points", String(current - amount));
  window.dispatchEvent(new CustomEvent("lexcard:activity-point"));
  return true;
}

export function getPoints(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("lp_activity_points") || "0", 10) || 0;
}

// ── ガチャロジック ──

function getPity(): PityCounter {
  return readJSON<PityCounter>(PITY_KEY, { draws: 0, lastSR: 0, lastSSR: 0 });
}

function savePity(pity: PityCounter): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PITY_KEY, JSON.stringify(pity));
}

function rollRarity(pity: PityCounter): CardRarity {
  const sinceSR = pity.draws - pity.lastSR;
  const sinceSSR = pity.draws - pity.lastSSR;

  // 天井チェック
  if (sinceSSR >= PITY_SSR - 1) return "SSR";
  if (sinceSR >= PITY_SR - 1) return "SR";

  // 通常排出
  const r = Math.random();
  if (r < RATE_SSR) return "SSR";
  if (r < RATE_SR) return "SR";
  if (r < RATE_R) return "R";
  return "N";
}

/** 指定法令の条文プールからランダムにカードIDを生成 */
function pickRandomCard(
  rarity: CardRarity,
  articles?: { lawId: string; num: string; rarity: CardRarity }[],
): string {
  if (!articles || articles.length === 0) {
    // フォールバック: SSRテーブルから
    const ssrArr = Array.from(SSR_ARTICLES);
    return ssrArr[Math.floor(Math.random() * ssrArr.length)];
  }

  // 指定レアリティの候補をフィルタ
  const candidates = articles.filter((a) => a.rarity === rarity);
  if (candidates.length > 0) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return `${pick.lawId}:${pick.num}`;
  }

  // レアリティが合わない場合は全候補からランダム
  const pick = articles[Math.floor(Math.random() * articles.length)];
  return `${pick.lawId}:${pick.num}`;
}

/** 単発ガチャ（事前にポイント消費は呼出し側で行う） */
export function drawGacha(
  articles?: { lawId: string; num: string; rarity: CardRarity }[],
): GachaResult {
  const pity = getPity();
  pity.draws++;

  const rarity = rollRarity(pity);
  if (rarity === "SR" || rarity === "SSR") pity.lastSR = pity.draws;
  if (rarity === "SSR") pity.lastSSR = pity.draws;
  savePity(pity);

  const cardId = pickRandomCard(rarity, articles);
  const { isNew } = addCard(cardId);

  return { cardId, rarity, isNew };
}

/** 10連ガチャ（SR以上1枚保証） */
export function drawGacha10(
  articles?: { lawId: string; num: string; rarity: CardRarity }[],
): GachaResult[] {
  const results: GachaResult[] = [];
  let hasSRPlus = false;

  for (let i = 0; i < 10; i++) {
    const result = drawGacha(articles);
    results.push(result);
    if (result.rarity === "SR" || result.rarity === "SSR") hasSRPlus = true;
  }

  // SR以上保証: 最後の1枚をSRに差し替え
  if (!hasSRPlus && results.length > 0) {
    const pity = getPity();
    pity.lastSR = pity.draws;
    savePity(pity);

    const srCandidates = articles?.filter((a) => a.rarity === "SR" || a.rarity === "SSR");
    const cardId =
      srCandidates && srCandidates.length > 0
        ? `${srCandidates[Math.floor(Math.random() * srCandidates.length)].lawId}:${srCandidates[Math.floor(Math.random() * srCandidates.length)].num}`
        : pickRandomCard("SR", articles);

    const [lawId, articleNum] = cardId.split(":");
    const rarity = getArticleRarity(lawId, articleNum);
    const { isNew } = addCard(cardId);
    results[results.length - 1] = { cardId, rarity: rarity === "SSR" ? "SSR" : "SR", isNew };
  }

  return results;
}

/** 直接購入（ポイント消費含む） */
export function buyCard(cardId: string): boolean {
  const [lawId, articleNum] = cardId.split(":");
  const rarity = getArticleRarity(lawId, articleNum);
  const cost = BUY_COST[rarity];

  if (!spendPoints(cost)) return false;
  addCard(cardId);
  return true;
}

// ── デイリーボーナス ──

/** 今日のデイリーボーナスを受け取れるか */
export function canClaimDailyBonus(): boolean {
  if (typeof window === "undefined") return false;
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(DAILY_BONUS_KEY) !== today;
}

/** デイリーボーナス: ランダムN 1枚 */
export function claimDailyBonus(
  articles?: { lawId: string; num: string; rarity: CardRarity }[],
): GachaResult | null {
  if (!canClaimDailyBonus()) return null;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(DAILY_BONUS_KEY, today);

  const nCards = articles?.filter((a) => a.rarity === "N");
  const cardId = pickRandomCard("N", nCards && nCards.length > 0 ? nCards : articles);
  const { isNew } = addCard(cardId);
  const [lawId, articleNum] = cardId.split(":");
  return { cardId, rarity: getArticleRarity(lawId, articleNum), isNew };
}

// ── ガチャ用: 記事リストからプールを構築 ──

/** ArticleGrid の articles 配列からガチャプールを構築 */
export function buildArticlePool(
  lawId: string,
  articles: Article[],
): { lawId: string; num: string; rarity: CardRarity }[] {
  return articles.map((a) => ({
    lawId,
    num: a.num,
    rarity: getArticleRarity(lawId, a.num, a),
  }));
}

// ── DB同期ヘルパー ──

export interface CardCollectionProfile {
  cards: Record<string, CardEntry>;
  lawCards: LawCardEntry[];
  pity: PityCounter;
  dailyBonus: string;
}

export function getCardProfileForSync(): CardCollectionProfile {
  return {
    cards: getCollection(),
    lawCards: getLawCards(),
    pity: getPity(),
    dailyBonus: typeof window !== "undefined" ? localStorage.getItem(DAILY_BONUS_KEY) || "" : "",
  };
}

export function loadCardsFromDB(dbCards: CardCollectionProfile | null): void {
  if (typeof window === "undefined" || !dbCards) return;

  // カード: マージ（大きいcountを採用）
  if (dbCards.cards) {
    const local = getCollection();
    for (const [id, entry] of Object.entries(dbCards.cards)) {
      if (!local[id] || entry.count > local[id].count) {
        local[id] = entry;
      }
    }
    localStorage.setItem(CARDS_KEY, JSON.stringify(local));
  }

  // 法令カード: マージ
  if (dbCards.lawCards?.length) {
    const local = getLawCards();
    const localIds = new Set(local.map((c) => c.lawId));
    for (const entry of dbCards.lawCards) {
      if (!localIds.has(entry.lawId)) local.push(entry);
    }
    localStorage.setItem(LAW_CARDS_KEY, JSON.stringify(local));
  }

  // 天井カウンター: 大きい方を採用
  if (dbCards.pity) {
    const local = getPity();
    if (dbCards.pity.draws > local.draws) {
      savePity(dbCards.pity);
    }
  }
}
