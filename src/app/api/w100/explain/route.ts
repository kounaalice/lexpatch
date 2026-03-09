import { NextRequest, NextResponse } from "next/server";
import {
  getAI,
  isAiAvailable,
  checkRateLimit,
  checkNeuronBudget,
  selectModel,
  streamAiChat,
  recordNeuronUsage,
  estimateTokenCount,
} from "@/lib/ai";
import { explainPrompt } from "@/lib/w100-prompts";

// POST /api/w100/explain — W100座標の AI 解説
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  if (!checkNeuronBudget()) {
    return NextResponse.json({ error: "本日のAI利用上限に達しました" }, { status: 429 });
  }

  let body: { coordinate?: string; memberId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { coordinate, memberId } = body;
  if (!coordinate || coordinate.trim().length === 0) {
    return NextResponse.json({ error: "coordinate が必要です" }, { status: 400 });
  }

  if (memberId && !checkRateLimit(memberId)) {
    return NextResponse.json({ error: "1日の利用回数上限に達しました" }, { status: 429 });
  }

  const model = selectModel("general");
  const systemPrompt = explainPrompt(coordinate);
  const stream = await streamAiChat(
    ai,
    model,
    [{ role: "user", content: `W100コード ${coordinate} を解説してください` }],
    systemPrompt,
  );

  const inputTokens = estimateTokenCount(systemPrompt) + 50;
  recordNeuronUsage(inputTokens, 400, model);

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
