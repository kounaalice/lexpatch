import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";

/** GET /api/ws/forms?member_id=UUID — list my forms */
/** POST /api/ws/forms — create a form */
/** PATCH /api/ws/forms — update a form */
/** DELETE /api/ws/forms?id=UUID — delete a form */

async function auth(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const [memberId, token] = header.replace("Bearer ", "").split(":");
  if (!memberId || !token) return null;
  return (await verifySessionToken(memberId, token)) ? memberId : null;
}

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("member_id");
  const formId = req.nextUrl.searchParams.get("id");
  const db = createAdminClient();

  if (formId) {
    const { data } = await db.from("ws_forms").select("*").eq("id", formId).single();
    if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(data);
  }

  if (!memberId) return NextResponse.json({ error: "member_id required" }, { status: 400 });
  const { data } = await db
    .from("ws_forms")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  return NextResponse.json({ forms: data ?? [] });
}

export async function POST(req: NextRequest) {
  const memberId = await auth(req);
  if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = createAdminClient();
  const { data, error } = await db
    .from("ws_forms")
    .insert({
      member_id: memberId,
      title: body.title || "無題のフォーム",
      description: body.description || null,
      fields: body.fields || [],
      settings: body.settings || {},
      status: body.status || "draft",
      workspace_id: body.workspace_id || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const memberId = await auth(req);
  if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = createAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.fields !== undefined) updates.fields = body.fields;
  if (body.settings !== undefined) updates.settings = body.settings;
  if (body.status !== undefined) updates.status = body.status;
  const { error } = await db
    .from("ws_forms")
    .update(updates)
    .eq("id", body.id)
    .eq("member_id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const memberId = await auth(req);
  if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = createAdminClient();
  const { error } = await db.from("ws_forms").delete().eq("id", id).eq("member_id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
