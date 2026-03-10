import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// ノート追加
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const body = (await request.json()) as {
    project_id: string;
    content: string;
    author_name?: string;
  };

  if (!body.project_id || !body.content?.trim()) {
    return NextResponse.json({ error: "project_id と content は必須です" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_notes")
    .insert({
      project_id: body.project_id,
      content: body.content,
      author_name: body.author_name?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // プロジェクトの updated_at を更新
  await admin
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", body.project_id);

  return NextResponse.json(data, { status: 201 });
}

// ノート削除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("project_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
