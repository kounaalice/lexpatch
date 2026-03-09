import { NextRequest, NextResponse } from "next/server";
import {
  getAI,
  isAiAvailable,
  checkRateLimit,
  checkNeuronBudget,
  recordNeuronUsage,
  estimateTokenCount,
  streamAiChat,
  selectModel,
  type AiMessage,
} from "@/lib/ai";
import {
  articleQaPrompt,
  lawSummaryPrompt,
  guideAssistantPrompt,
  semanticSearchPrompt,
  LEGAL_EXPERT_PERSONA,
} from "@/lib/ai-prompts";
import { extractArticleContext, extractLawToc, serializeArticle } from "@/lib/ai-context";
import { getVectorize, isVectorizeAvailable, searchSimilar } from "@/lib/vectorize";
import { getLawData } from "@/lib/egov/client";
import { verifySessionToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";

// POST /api/ai/chat — ストリーミングチャット
export async function POST(request: NextRequest) {
  const ai = await getAI();
  if (!isAiAvailable(ai)) {
    return NextResponse.json({ error: "AI機能は無効です" }, { status: 503 });
  }

  let body: {
    memberId?: string;
    token?: string;
    messages?: AiMessage[];
    scope?: string;
    lawId?: string;
    articleNum?: string;
    currentPath?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, messages, scope, lawId, articleNum, currentPath } = body;

  // 認証
  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // レート制限（ユーザー単位）
  if (!checkRateLimit(memberId)) {
    return NextResponse.json(
      { error: "本日の利用上限（30回）に達しました。明日またお試しください。" },
      { status: 429 },
    );
  }

  // グローバル Neuron 予算チェック（無料枠 90% 超過で停止）
  if (!checkNeuronBudget()) {
    return NextResponse.json(
      {
        error:
          "本日のAI処理量が上限に近づいたため、AI機能を一時停止しています。明日（UTC 0時）に自動復旧します。",
      },
      { status: 429 },
    );
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "メッセージが必要です" }, { status: 400 });
  }

  // システムプロンプト構築
  let systemPrompt = LEGAL_EXPERT_PERSONA;

  try {
    if (scope === "article" && lawId && articleNum) {
      const law = await getLawData(lawId);
      const context = extractArticleContext(law, articleNum);
      if (context) {
        systemPrompt = articleQaPrompt(context);
      }
    } else if (scope === "law" && lawId) {
      const law = await getLawData(lawId);
      const toc = extractLawToc(law);
      if (toc) {
        systemPrompt = lawSummaryPrompt(toc);
      }
    } else if (scope === "guide") {
      systemPrompt = guideAssistantPrompt(currentPath || "/");
    } else if (scope === "semantic") {
      // AI検索（β）: Vectorize でセマンティック検索 → 関連条文をコンテキスト化
      const vectorize = await getVectorize();
      if (isVectorizeAvailable(vectorize)) {
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
        if (lastUserMsg) {
          const matches = await searchSimilar(vectorize, ai, lastUserMsg, 5);
          if (matches.length > 0) {
            // 検索結果の条文テキストを取得
            const lawCache = new Map<string, Awaited<ReturnType<typeof getLawData>>>();
            const searchResults: {
              lawTitle: string;
              articleTitle: string;
              caption: string;
              text: string;
            }[] = [];
            for (const m of matches) {
              try {
                let law = lawCache.get(m.metadata.lawId);
                if (!law) {
                  law = await getLawData(m.metadata.lawId);
                  lawCache.set(m.metadata.lawId, law);
                }
                const allArticles =
                  law.chapters.length > 0
                    ? law.chapters.flatMap((ch) => ch.articles)
                    : law.articles;
                const article = allArticles.find((a) => a.num === m.metadata.articleNum);
                searchResults.push({
                  lawTitle: m.metadata.lawTitle,
                  articleTitle: m.metadata.articleTitle,
                  caption: m.metadata.caption,
                  text: article ? serializeArticle(article).slice(0, 1500) : "",
                });
              } catch {
                /* skip */
              }
            }
            if (searchResults.length > 0) {
              systemPrompt = semanticSearchPrompt(searchResults);
            }
          }
        }
      }
    }
    // scope === "general" → デフォルトペルソナのまま
  } catch (e) {
    logger.error("[ai/chat] コンテキスト構築エラー", { error: e });
    // コンテキスト取得失敗時はデフォルトペルソナで続行
  }

  // scope に応じたモデルを選択（guide → 軽量1B、その他 → Qwen3-30B）
  const model = selectModel(scope || "general");

  // 入力トークン数を推定（neuron 記録用）
  const allInputText = systemPrompt + messages.map((m) => m.content).join("");
  const estInputTokens = estimateTokenCount(allInputText);

  // ストリーミング応答
  try {
    const stream = await streamAiChat(ai, model, messages, systemPrompt);

    // Neuron 使用量を記録（出力は平均 300 tokens と推定、モデル別レート）
    recordNeuronUsage(estInputTokens, 300, model);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    logger.error("[ai/chat] AI応答エラー", { error: e });
    return NextResponse.json(
      { error: "AI応答の生成に失敗しました。しばらくしてからお試しください。" },
      { status: 500 },
    );
  }
}
