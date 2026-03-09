import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getAdminMember(request: NextRequest) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return null;
  const sep = auth.indexOf(":");
  if (sep === -1) return null;
  const memberId = auth.slice(0, sep);
  const token = auth.slice(sep + 1);
  const valid = await verifySessionToken(memberId, token);
  if (!valid) return null;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from("member_profiles")
    .select("id, name, role")
    .eq("id", memberId)
    .maybeSingle();
  if (!data || (data.role !== "admin" && data.role !== "moderator")) return null;
  return data;
}

// GET: 管理データ取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase未設定" }, { status: 503 });
  }
  const adminUser = await getAdminMember(request);
  if (!adminUser) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const section = request.nextUrl.searchParams.get("section") ?? "stats";
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  if (section === "stats") {
    const [members, patches, projects, communities, commentaries, contacts] = await Promise.all([
      db.from("member_profiles").select("*", { count: "exact", head: true }),
      db.from("patches").select("*", { count: "exact", head: true }),
      db.from("projects").select("*", { count: "exact", head: true }),
      db.from("communities").select("*", { count: "exact", head: true }),
      db.from("commentaries").select("*", { count: "exact", head: true }),
      db.from("contacts").select("*", { count: "exact", head: true }),
    ]);
    return NextResponse.json({
      members: members.count ?? 0,
      patches: patches.count ?? 0,
      projects: projects.count ?? 0,
      communities: communities.count ?? 0,
      commentaries: commentaries.count ?? 0,
      contacts: contacts.count ?? 0,
    });
  }

  if (section === "members") {
    const { data, error } = await db
      .from("member_profiles")
      .select("id, name, org, org_type, role, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (section === "patches") {
    const { data, error } = await db
      .from("patches")
      .select("id, title, status, law_id, target_articles, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (section === "projects") {
    const { data, error } = await db
      .from("projects")
      .select("id, title, owner_name, status, visibility, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (section === "communities") {
    const { data, error } = await db
      .from("communities")
      .select("id, name, description, visibility, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (section === "contacts") {
    const { data, error } = await db
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  return NextResponse.json({ error: "不明なセクション" }, { status: 400 });
}

// PATCH: ステータス/ロール変更
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase未設定" }, { status: 503 });
  }
  const adminUser = await getAdminMember(request);
  if (!adminUser) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const body = await request.json();
  const { table, id, updates } = body as {
    table: string;
    id: string;
    updates: Record<string, unknown>;
  };
  if (!table || !id || !updates) {
    return NextResponse.json({ error: "table, id, updates が必要です" }, { status: 400 });
  }

  const allowedTables = ["member_profiles", "patches", "projects", "communities"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "許可されていないテーブルです" }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from(table).update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE: エンティティ削除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase未設定" }, { status: 503 });
  }
  const adminUser = await getAdminMember(request);
  if (!adminUser) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { table, id } = await request.json();
  if (!table || !id) {
    return NextResponse.json({ error: "table と id が必要です" }, { status: 400 });
  }

  const allowedTables = ["member_profiles", "patches", "projects", "communities"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "許可されていないテーブルです" }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
