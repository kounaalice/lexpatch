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
import { embedText } from "@/lib/vectorize";
import { w100SearchPrompt } from "@/lib/w100-prompts";

// W100 Vectorize バインディング取得
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getVectorizeW100(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ctx.env as any).VECTORIZE_W100 ?? null;
  } catch {
    return null;
  }
}

// POST /api/w100/search — W100 セマンティック検索 + AI回答
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  if (!checkNeuronBudget()) {
    return NextResponse.json({ error: "本日のAI利用上限に達しました" }, { status: 429 });
  }

  let body: { query?: string; memberId?: string; topK?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { query, memberId, topK = 5 } = body;
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "query が必要です" }, { status: 400 });
  }

  // レート制限
  if (memberId && !checkRateLimit(memberId)) {
    return NextResponse.json({ error: "1日の利用回数上限に達しました" }, { status: 429 });
  }

  // Vectorize 検索
  const vectorize = await getVectorizeW100();
  if (!vectorize) {
    // Vectorize なし → キーワードベースのフォールバック（AI のみで回答）
    const model = selectModel("general");
    const stream = await streamAiChat(
      ai,
      model,
      [{ role: "user", content: query }],
      w100SearchPrompt([]),
    );

    const inputTokens = estimateTokenCount(query) + 500;
    recordNeuronUsage(inputTokens, 300, model);

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  // クエリをエンベディング
  const queryVector = await embedText(ai, query);

  // Vectorize 検索
  const results = await vectorize.query(queryVector, {
    topK,
    returnMetadata: "all",
  });

  const matches = (results?.matches ?? []).map(
    (m: { id: string; score: number; metadata?: Record<string, string> }) => ({
      id: m.id,
      score: m.score,
      fieldCode: m.metadata?.fieldCode ?? "",
      fieldName: m.metadata?.fieldName ?? "",
      topicCode: m.metadata?.topicCode ?? "",
      topicName: m.metadata?.topicName ?? "",
      description: m.metadata?.description ?? "",
    }),
  );

  // AI 回答生成
  const model = selectModel("semantic");
  const searchResults = matches.map(
    (m: {
      fieldName: string;
      topicName: string;
      fieldCode: string;
      topicCode: string;
      description: string;
    }) => ({
      fieldName: m.fieldName,
      topicName: m.topicName,
      code: `${m.fieldCode}.${m.topicCode}`,
      description: m.description,
    }),
  );

  const stream = await streamAiChat(
    ai,
    model,
    [{ role: "user", content: query }],
    w100SearchPrompt(searchResults),
  );

  const inputTokens =
    estimateTokenCount(query) + estimateTokenCount(JSON.stringify(searchResults)) + 500;
  recordNeuronUsage(inputTokens, 300, model);

  // SSE にマッチ情報をプレフィックス
  const encoder = new TextEncoder();
  const _matchData = JSON.stringify({ matches });
  const prefixedStream = new ReadableStream({
    async start(controller) {
      // 最初にマッチデータを送信
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "matches", data: matches })}\n\n`),
      );

      // 次に AI ストリームを転送
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(prefixedStream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
