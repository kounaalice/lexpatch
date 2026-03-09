import { NextResponse } from "next/server";
import { getAI, isAiAvailable, getNeuronStatus, MODEL_MAIN, MODEL_LIGHT } from "@/lib/ai";
import { getVectorize, isVectorizeAvailable } from "@/lib/vectorize";

const DAILY_LIMIT = 30;

// GET /api/ai/status — AI機能の有効状態チェック（認証不要）
export async function GET() {
  const ai = await getAI();
  const neurons = getNeuronStatus();
  const vectorize = await getVectorize();
  const vectorizeEnabled = isVectorizeAvailable(vectorize);

  return NextResponse.json({
    enabled: isAiAvailable(ai) && !neurons.suspended,
    dailyLimit: DAILY_LIMIT,
    neurons: {
      used: neurons.used,
      budget: neurons.budget,
      remaining: neurons.remaining,
      percentUsed: neurons.percentUsed,
      suspended: neurons.suspended,
    },
    vectorize: {
      enabled: vectorizeEnabled,
    },
    models: {
      main: MODEL_MAIN,
      light: MODEL_LIGHT,
    },
  });
}
