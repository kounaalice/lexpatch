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
import { classifyPrompt } from "@/lib/w100-prompts";

// POST /api/w100/classify — テキスト → W100座標 AI分類
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  if (!checkNeuronBudget()) {
    return NextResponse.json({ error: "本日のAI利用上限に達しました" }, { status: 429 });
  }

  let body: { text?: string; memberId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, memberId } = body;
  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "text が必要です" }, { status: 400 });
  }

  if (memberId && !checkRateLimit(memberId)) {
    return NextResponse.json({ error: "1日の利用回数上限に達しました" }, { status: 429 });
  }

  const model = selectModel("general");
  const systemPrompt = classifyPrompt(text);
  const stream = await streamAiChat(
    ai,
    model,
    [
      {
        role: "user",
        content: `以下のテキストをW100で分類してください:\n\n${text.slice(0, 2000)}`,
      },
    ],
    systemPrompt,
  );

  const inputTokens = estimateTokenCount(text.slice(0, 2000)) + estimateTokenCount(systemPrompt);
  recordNeuronUsage(inputTokens, 400, model);

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
