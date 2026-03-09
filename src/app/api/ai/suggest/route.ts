import { NextRequest, NextResponse } from "next/server";
import {
  getAI,
  isAiAvailable,
  checkRateLimit,
  checkNeuronBudget,
  recordNeuronUsage,
  estimateTokenCount,
  runAiChat,
  MODEL_MAIN,
} from "@/lib/ai";
import { relatedLawPrompt } from "@/lib/ai-prompts";
import { extractArticleContext } from "@/lib/ai-context";
import { getLawData } from "@/lib/egov/client";
import { verifySessionToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";

// POST /api/ai/suggest — 関連法令推薦（非ストリーミング）
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  let body: { memberId?: string; token?: string; lawId?: string; articleNum?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, lawId, articleNum } = body;

  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  if (!checkRateLimit(memberId)) {
    return NextResponse.json({ error: "本日の利用上限に達しました" }, { status: 429 });
  }

  if (!checkNeuronBudget()) {
    return NextResponse.json(
      { error: "本日のAI処理量が上限に近づいたため一時停止中です。明日（UTC 0時）に復旧します。" },
      { status: 429 },
    );
  }

  if (!lawId) {
    return NextResponse.json({ error: "lawId が必要です" }, { status: 400 });
  }

  try {
    const law = await getLawData(lawId);
    const context = articleNum
      ? extractArticleContext(law, articleNum)
      : `【${law.law_title}（${law.law_num}）】`;

    const systemPrompt = relatedLawPrompt(context);
    const userMsg = "この条文に関連する法令を教えてください。";
    const result = await runAiChat(
      ai,
      MODEL_MAIN,
      [{ role: "user", content: userMsg }],
      systemPrompt,
    );

    // Neuron 使用量を記録（モデル別レート）
    const estInput = estimateTokenCount(systemPrompt + userMsg);
    const estOutput = estimateTokenCount(result);
    recordNeuronUsage(estInput, estOutput, MODEL_MAIN);

    return NextResponse.json({ suggestions: result });
  } catch (e) {
    logger.error("[ai/suggest] エラー", { error: e });
    return NextResponse.json({ error: "関連法令の取得に失敗しました" }, { status: 500 });
  }
}
