import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { W100_FIELDS, W100_FIELD_GROUPS } from "@/lib/w100-data";

// POST /api/w100/import — 管理者専用: W100マスターデータ投入
export async function POST(request: NextRequest) {
  let body: { memberId?: string; token?: string; topics?: TopicInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, token, topics } = body;

  // 認証
  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // 管理者チェック
  if (memberId !== "23a63a2b-c522-4a2d-97f7-bf4446708cf7") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const results: { step: string; count: number; status: string }[] = [];

  // Step 1: CC 分野マスタ投入
  const fieldRows = W100_FIELDS.map((f) => {
    const group = W100_FIELD_GROUPS.find((g) => g.id === f.groupId);
    return {
      code: f.code,
      name: f.name,
      group_id: f.groupId,
      description: f.description ?? `${group?.label ?? ""} — ${f.name}`,
      keywords: [],
    };
  });

  const { error: fieldErr } = await supabase
    .from("w100_fields" as any)
    .upsert(fieldRows as any, { onConflict: "code" });

  results.push({
    step: "fields",
    count: fieldRows.length,
    status: fieldErr ? `error: ${fieldErr.message}` : "ok",
  });

  // Step 2: TT 話題データ（リクエストボディから投入）
  if (topics && topics.length > 0) {
    // バッチ upsert（Supabase 制限: 1000行/リクエスト）
    const BATCH = 500;
    let topicCount = 0;
    let topicErr: string | null = null;

    for (let i = 0; i < topics.length; i += BATCH) {
      const batch = topics.slice(i, i + BATCH).map((t) => ({
        field_code: t.fieldCode,
        code: t.code,
        name: t.name,
        description: t.description ?? null,
        keywords: t.keywords ?? [],
      }));

      const { error } = await supabase
        .from("w100_topics" as any)
        .upsert(batch as any, { onConflict: "field_code,code" });

      if (error) {
        topicErr = error.message;
        break;
      }
      topicCount += batch.length;
    }

    results.push({
      step: "topics",
      count: topicCount,
      status: topicErr ? `error: ${topicErr}` : "ok",
    });
  }

  return NextResponse.json({
    totalFields: fieldRows.length,
    results,
  });
}

interface TopicInput {
  fieldCode: string;
  code: string;
  name: string;
  description?: string;
  keywords?: string[];
}
