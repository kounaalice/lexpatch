// 丸数字変換（項番号表示用）
// e-Gov 法令データ提供システムでは ② ③ ④ ... で項番号を表示
const CIRCLED: string[] = [
  "",
  "\u2460",
  "\u2461",
  "\u2462",
  "\u2463",
  "\u2464",
  "\u2465",
  "\u2466",
  "\u2467",
  "\u2468",
  "\u2469",
  "\u246A",
  "\u246B",
  "\u246C",
  "\u246D",
  "\u246E",
  "\u246F",
  "\u2470",
  "\u2471",
  "\u2472",
  "\u2473",
];
// ①=\u2460 ... ⑳=\u2473

/**
 * 項番号を丸数字に変換
 * "1" or "" → ""（第1項は番号非表示）
 * "2" → "②", "3" → "③", ... "20" → "⑳"
 * 21以上はそのまま返す
 */
export function toCircledNumber(num: string): string {
  if (!num || num === "1") return "";
  // 全角→半角
  const half = num.replace(/[\uff10-\uff19]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
  const n = parseInt(half, 10);
  if (isNaN(n) || n < 1) return num;
  return CIRCLED[n] ?? num;
}
