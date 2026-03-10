import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import { validateRequest, commentarySchema } from "@/lib/validation";

/** Authorization ヘッダーからセッションを検証し memberId を返す */
async function authenticateRequest(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return null;
  const [memberId, token] = auth.split(":");
  if (!memberId || !token) return null;
  const valid = await verifySessionToken(memberId, token);
  return valid ? memberId : null;
}

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// 逐条解説の取得（law_id + article_title）or 件数のみ（count=true）
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const admin = createAdminClient();

  // グローバル件数取得
  if (request.nextUrl.searchParams.get("count") === "true") {
    const { count, error } = await admin
      .from("commentaries")
      .select("id", { count: "exact", head: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: count ?? 0 });
  }

  const lawId = request.nextUrl.searchParams.get("law_id");
  const articleTitle = request.nextUrl.searchParams.get("article_title");
  if (!lawId || !articleTitle) {
    return NextResponse.json({ error: "law_id と article_title が必要です" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("commentaries")
    .select(
      "id, law_id, article_title, content, author_name, member_id, sources, created_at, updated_at",
    )
    .eq("law_id", lawId)
    .eq("article_title", articleTitle)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// 逐条解説の新規作成（要ログイン）
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = await authenticateRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // Zod でバリデーション（lawId, articleNum, content, parentId?）
  // author_name / sources はスキーマ外なのでクローンから取得
  const cloned = request.clone();
  const validation = await validateRequest(request, commentarySchema);
  if (!validation.success) return validation.error;
  const { lawId, articleNum, content } = validation.data;

  // スキーマ外の任意フィールドを取得
  const extra = (await cloned.json()) as {
    author_name?: string;
    sources?: Array<{ tier: string; label: string; url: string }>;
  };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("commentaries")
    .insert({
      law_id: lawId,
      article_title: articleNum,
      content: content,
      author_name: extra.author_name?.trim() || null,
      member_id: memberId,
      sources: extra.sources ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// 逐条解説の更新（要ログイン・本人 or admin）
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = await authenticateRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  const db = admin;

  // 所有権チェック（member_id が設定されている場合は本人 or admin/moderator のみ）
  const { data: existing } = await db
    .from("commentaries")
    .select("member_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "解説が見つかりません" }, { status: 404 });
  if (existing.member_id && existing.member_id !== memberId) {
    const { data: member } = await db
      .from("member_profiles")
      .select("role")
      .eq("id", memberId)
      .maybeSingle();
    if (member?.role !== "admin" && member?.role !== "moderator") {
      return NextResponse.json({ error: "編集権限がありません" }, { status: 403 });
    }
  }

  const body = (await request.json()) as {
    content?: string;
    author_name?: string;
    sources?: Array<{ tier: string; label: string; url: string }>;
  };

  const updates: Record<string, unknown> = {};
  if (body.content !== undefined) updates.content = body.content;
  if (body.author_name !== undefined) updates.author_name = body.author_name?.trim() || null;
  if (body.sources !== undefined) updates.sources = body.sources;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await db.from("commentaries").update(updates).eq("id", id).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? { ok: true });
}

// 逐条解説の削除（要ログイン・本人 or admin）
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = await authenticateRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  const db = admin;

  // 所有権チェック
  const { data: existing } = await db
    .from("commentaries")
    .select("member_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "解説が見つかりません" }, { status: 404 });
  if (existing.member_id && existing.member_id !== memberId) {
    const { data: member } = await db
      .from("member_profiles")
      .select("role")
      .eq("id", memberId)
      .maybeSingle();
    if (member?.role !== "admin" && member?.role !== "moderator") {
      return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
    }
  }

  const { error } = await db.from("commentaries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
