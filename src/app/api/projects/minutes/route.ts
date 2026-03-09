import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function db() {
  return createAdminClient() as any;
}

/** GET — プロジェクトの議事録一覧 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });

  const projectId = request.nextUrl.searchParams.get("project_id");
  if (!projectId) return NextResponse.json({ error: "project_id が必要です" }, { status: 400 });

  const { data, error } = await db()
    .from("meeting_minutes")
    .select("*")
    .eq("project_id", projectId)
    .order("meeting_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST — 議事録作成 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });

  const body = await request.json();
  if (!body.project_id || !body.title?.trim() || !body.meeting_date)
    return NextResponse.json(
      { error: "project_id, title, meeting_date は必須です" },
      { status: 400 },
    );

  const { data, error } = await db()
    .from("meeting_minutes")
    .insert({
      project_id: body.project_id,
      title: body.title.trim(),
      meeting_date: body.meeting_date,
      attendees: body.attendees ?? [],
      agenda: body.agenda?.trim() || null,
      decisions: body.decisions?.trim() || null,
      action_items: body.action_items ?? [],
      author_name: body.author_name?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db()
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", body.project_id);

  return NextResponse.json(data, { status: 201 });
}

/** PATCH — 議事録更新 */
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.meeting_date !== undefined) updates.meeting_date = body.meeting_date;
  if (body.attendees !== undefined) updates.attendees = body.attendees;
  if (body.agenda !== undefined) updates.agenda = body.agenda?.trim() || null;
  if (body.decisions !== undefined) updates.decisions = body.decisions?.trim() || null;
  if (body.action_items !== undefined) updates.action_items = body.action_items;
  if (body.author_name !== undefined) updates.author_name = body.author_name?.trim() || null;

  const { data, error } = await db()
    .from("meeting_minutes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE — 議事録削除 */
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const { error } = await db().from("meeting_minutes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
