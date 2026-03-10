import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { parsePatch } from "@/lib/patch/parser";
import { validateRequest, createPatchSchema } from "@/lib/validation";
import type { Database, Json } from "@/types/database";

type PatchRow = Database["public"]["Tables"]["patches"]["Row"];

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// パッチ取得（一覧 or 単件）
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  const lawId = request.nextUrl.searchParams.get("law_id");
  const articleTitle = request.nextUrl.searchParams.get("article_title");
  const search = request.nextUrl.searchParams.get("search")?.trim();

  const supabase = await createClient();

  // 単件取得
  if (id) {
    const { data, error } = await supabase
      .from("patches")
      .select("*, sources(*)")
      .eq("id", id)
      .single();
    if (error)
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    return NextResponse.json(data);
  }

  let query = supabase
    .from("patches")
    .select(
      "id, title, description, status, patch_type, target_articles, law_id, created_at, author_id",
    )
    .order("created_at", { ascending: false });

  if (lawId) query = query.eq("law_id", lawId);
  if (articleTitle) query = query.contains("target_articles", [articleTitle]);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// パッチ更新（admin クライアントで RLS バイパス）
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();

  // admin クライアントで既存パッチを取得（RLS をバイパス）
  const { data: existing, error: fetchErr } = await admin
    .from("patches")
    .select("author_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing)
    return NextResponse.json({ error: "パッチが見つかりません" }, { status: 404 });

  // ログイン中ユーザーの確認（author_id が設定されている場合のみチェック）
  if (existing.author_id !== null) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (existing.author_id !== user?.id) {
      return NextResponse.json({ error: "編集権限がありません" }, { status: 403 });
    }
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    plain_text?: string;
    status?: string;
    structured_override?: { original: string; edited: string; mode: string };
  };

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.status !== undefined) updates.status = body.status;
  if (body.structured_override) {
    // 直接編集モード: structured_override をそのまま保存
    if (body.plain_text !== undefined) updates.plain_text = body.plain_text;
    updates.structured = body.structured_override;
    updates.patch_type = "A";
  } else if (body.plain_text !== undefined) {
    updates.plain_text = body.plain_text;
    const structured = parsePatch(body.plain_text);
    updates.structured = structured;
    updates.patch_type = structured.patchType;
  }

  // admin クライアントで RLS をバイパスして更新
  const { data, error } = await admin.from("patches").update(updates).eq("id", id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? { ok: true });
}

// パッチ削除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();

  const { data: existing, error: fetchErr } = await admin
    .from("patches")
    .select("author_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing)
    return NextResponse.json({ error: "パッチが見つかりません" }, { status: 404 });

  if (existing.author_id !== null) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (existing.author_id !== user?.id) {
      return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
    }
  }
  const { error } = await admin.from("patches").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// パッチ新規作成
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase が未設定です。.env.local を確認してください。" },
      { status: 503 },
    );
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zod でバリデーション（lawId, targetArticle, description?, lines）
  // title, plain_text 等はスキーマ外なのでクローンから取得
  const cloned = request.clone();
  const validation = await validateRequest(request, createPatchSchema);
  if (!validation.success) return validation.error;
  const { lawId, targetArticle, description } = validation.data;

  // スキーマ外の任意フィールドを取得
  const extra = (await cloned.json()) as {
    title?: string;
    plain_text?: string;
    target_articles?: string[];
    law_title?: string;
    canon_id?: string;
    structured_override?: { original: string; edited: string; mode: string };
    sources?: Array<{ tier: string; label: string; url?: string; excerpt?: string }>;
  };

  if (!extra.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (!extra.plain_text?.trim()) {
    return NextResponse.json({ error: "パッチテキストは必須です" }, { status: 400 });
  }

  // 直接編集モードの場合は structured_override を使用、それ以外は従来のパース
  const structured = extra.structured_override ?? parsePatch(extra.plain_text);
  const patchType = extra.structured_override ? "A" : parsePatch(extra.plain_text).patchType;

  const { data, error } = await supabase
    .from("patches")
    .insert({
      title: extra.title,
      plain_text: extra.plain_text,
      structured: structured as unknown as Json,
      target_articles: extra.target_articles ?? [targetArticle],
      description: description ?? null,
      author_id: user?.id ?? null,
      patch_type: patchType as "A" | "C",
      status: "下書き",
      law_id: lawId ?? null,
      law_title: extra.law_title ?? null,
      canon_id: extra.canon_id ?? null,
    })
    .select()
    .returns<PatchRow[]>()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // sources（根拠資料）を保存
  if (extra.sources?.length && data?.id) {
    const sourcesData = extra.sources
      .filter((s) => s.label?.trim())
      .map((s) => ({
        patch_id: data.id,
        tier: s.tier as "一次" | "準一次" | "二次" | "三次",
        label: s.label,
        url: s.url || null,
        excerpt: s.excerpt || null,
      }));
    if (sourcesData.length > 0) {
      await supabase.from("sources").insert(sourcesData);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
