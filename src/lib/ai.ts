/**
 * Cloudflare Workers AI クライアント
 * Workers Paid プランに含まれる AI バインディングを使用
 * 無料枠: 10,000 Neurons/日 — 超過で課金発生するため予算制限あり
 * R2 バケットと同パターンで getCloudflareContext() 経由アクセス
 *
 * マルチモデルルーティング:
 *   main  — Qwen3-30B-A3B (MoE 30B/3.3B active) … 法令分析・要約・汎用チャット
 *   light — Llama 3.2-1B … ガイドアシスタント（FAQ応答、低 neuron コスト）
 */

/** Cloudflare Workers AI binding — runtime-only, no published type definitions */
export interface CfAiBinding {
  run(model: string, options: Record<string, unknown>): Promise<unknown>;
}

export async function getAI(): Promise<CfAiBinding | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return ((ctx.env as Record<string, unknown>).AI as CfAiBinding) ?? null;
  } catch {
    return null;
  }
}

export function isAiAvailable(ai: CfAiBinding | null | undefined): ai is CfAiBinding {
  return !!ai;
}

// ── モデル定義 ──

/** メインモデル: 法令分析・要約・汎用チャット（GPT-4o-mini 相当） */
export const MODEL_MAIN = "@cf/qwen/qwen3-30b-a3b-fp8";

/** 軽量モデル: ガイドFAQ（低コスト・高速） */
export const MODEL_LIGHT = "@cf/meta/llama-3.2-1b-instruct";

/** デフォルトモデル（後方互換） */
export const DEFAULT_MODEL = MODEL_MAIN;

/** scope に応じたモデルを選択 */
export function selectModel(scope: string): string {
  switch (scope) {
    case "guide":
      return MODEL_LIGHT; // ガイドFAQ → 軽量モデル (~7 neurons/req)
    case "article": // 条文Q&A → メインモデル
    case "law": // 法令要約 → メインモデル
    case "semantic": // AI検索 → メインモデル
    case "general": // 汎用チャット → メインモデル
    default:
      return MODEL_MAIN; // (~12 neurons/req)
  }
}

/** モデルごとの neuron レート（neurons / 1M tokens） — CF公式価格 2025 */
const MODEL_NEURON_RATES: Record<string, { input: number; output: number }> = {
  [MODEL_MAIN]: { input: 4_625, output: 30_475 }, // Qwen3-30B-A3B
  [MODEL_LIGHT]: { input: 2_457, output: 18_252 }, // Llama 3.2-1B
};

/** メッセージ型 */
export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

// ── レート制限（in-memory、Worker 再起動でリセット） ──

const usageMap = new Map<string, { count: number; date: string }>();

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function checkRateLimit(memberId: string, limit = 30): boolean {
  const today = todayStr();
  const entry = usageMap.get(memberId);
  if (!entry || entry.date !== today) {
    usageMap.set(memberId, { count: 1, date: today });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** IP ベースのレート制限（未ログインユーザー向け） */
const ipUsageMap = new Map<string, { count: number; date: string }>();

export function checkIpRateLimit(ip: string, limit = 30): boolean {
  const key = `ip:${ip}`;
  const today = todayStr();
  const entry = ipUsageMap.get(key);
  if (!entry || entry.date !== today) {
    ipUsageMap.set(key, { count: 1, date: today });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getRemainingQuota(memberId: string, limit = 30): number {
  const today = todayStr();
  const entry = usageMap.get(memberId);
  if (!entry || entry.date !== today) return limit;
  return Math.max(0, limit - entry.count);
}

// ── グローバル Neuron 予算制限 ──
// Workers AI 無料枠: 10,000 Neurons/日（00:00 UTC リセット）
// 超過で $0.011/1,000 Neurons の課金が発生するため、90% で AI 機能を停止
//
// マルチモデル neuron コスト（1リクエスト 入力~600tok + 出力~300tok）:
//   Qwen3-30B-A3B (main):  2.8 + 9.1 ≒ 12 neurons/req
//   Llama 3.2-1B  (light): 1.5 + 5.5 ≒  7 neurons/req
//   加重平均 (guide20% + 他80%): ~11 neurons/req
//   → 9,000 neuron budget ÷ 11 ≒ 818 req/日（従来 237 → 3.5倍）
//
// in-memory カウンタ — Worker 再起動でリセットされるが、安全側に倒れる
// （リセット = カウンタ 0 = AI 再有効化 → 最悪ケースでも日に数百円程度）

const DAILY_NEURON_BUDGET = 10_000;
const NEURON_THRESHOLD_PERCENT = 90;
const NEURON_THRESHOLD = Math.floor((DAILY_NEURON_BUDGET * NEURON_THRESHOLD_PERCENT) / 100); // 9,000

let globalNeuronUsage = { neurons: 0, date: "" };

/** 推定 neuron 消費量を計算（モデル別レート対応） */
export function estimateNeurons(inputTokens: number, outputTokens: number, model?: string): number {
  const rates = MODEL_NEURON_RATES[model || MODEL_MAIN] || MODEL_NEURON_RATES[MODEL_MAIN];
  return Math.ceil(
    (inputTokens * rates.input) / 1_000_000 + (outputTokens * rates.output) / 1_000_000,
  );
}

/** グローバル neuron 予算チェック — 90% 超過で false */
export function checkNeuronBudget(): boolean {
  const today = todayStr();
  if (globalNeuronUsage.date !== today) {
    globalNeuronUsage = { neurons: 0, date: today };
  }
  return globalNeuronUsage.neurons < NEURON_THRESHOLD;
}

/** リクエスト後に推定 neuron 消費を記録（モデル別レート対応） */
export function recordNeuronUsage(inputTokens: number, outputTokens: number, model?: string): void {
  const today = todayStr();
  if (globalNeuronUsage.date !== today) {
    globalNeuronUsage = { neurons: 0, date: today };
  }
  globalNeuronUsage.neurons += estimateNeurons(inputTokens, outputTokens, model);
}

/** 現在の neuron 使用状況を取得 */
export function getNeuronStatus(): {
  used: number;
  budget: number;
  threshold: number;
  remaining: number;
  percentUsed: number;
  suspended: boolean;
} {
  const today = todayStr();
  if (globalNeuronUsage.date !== today) {
    globalNeuronUsage = { neurons: 0, date: today };
  }
  const used = globalNeuronUsage.neurons;
  return {
    used,
    budget: DAILY_NEURON_BUDGET,
    threshold: NEURON_THRESHOLD,
    remaining: Math.max(0, NEURON_THRESHOLD - used),
    percentUsed: Math.round((used / DAILY_NEURON_BUDGET) * 100),
    suspended: used >= NEURON_THRESHOLD,
  };
}

/** トークン数の簡易推定（日本語: ~1.5 tokens/文字, 英語: ~0.75 tokens/word） */
export function estimateTokenCount(text: string): number {
  // 日本語文字数ベースの概算（精度より安全側に寄せる）
  const jpChars = (text.match(/[\u3000-\u9FFF\uF900-\uFAFF]/g) || []).length;
  const otherChars = text.length - jpChars;
  return Math.ceil(jpChars * 1.5 + otherChars * 0.4);
}

// ── AI 呼び出し ──

/**
 * ストリーミングチャット応答
 * Workers AI の stream: true は SSE 形式の ReadableStream を返す
 * フォーマット: data: {"response":"token"}\n\n ... data: [DONE]\n\n
 */

export async function streamAiChat(
  ai: CfAiBinding,
  model: string,
  messages: AiMessage[],
  systemPrompt: string,
): Promise<ReadableStream> {
  const resp = await ai.run(model, {
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
  });
  return resp as ReadableStream;
}

/**
 * 非ストリーミングチャット応答
 */

export async function runAiChat(
  ai: CfAiBinding,
  model: string,
  messages: AiMessage[],
  systemPrompt: string,
): Promise<string> {
  const resp = (await ai.run(model, {
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  })) as { response?: string } | null;
  return resp?.response ?? "";
}
