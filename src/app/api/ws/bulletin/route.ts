import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";

// ws_bulletins / ws_bulletin_reads tables are not in Database type definition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createAdminClient();
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const memberId = sp.get("member_id");
  const client = db();

  const q = client
    .from("ws_bulletins")
    .select("*, author:member_profiles!author_id(id,name)")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(100);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach read status if member_id provided
  if (memberId && data) {
    const { data: reads } = await client
      .from("ws_bulletin_reads")
      .select("bulletin_id")
      .eq("member_id", memberId);
    const readSet = new Set((reads || []).map((r: { bulletin_id: string }) => r.bulletin_id));
    const enriched = (data as { id: string }[]).map((b) => ({
      ...b,
      isRead: readSet.has(b.id),
    }));
    return NextResponse.json({ bulletins: enriched });
  }

  return NextResponse.json({ bulletins: data || [] });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").split(":");
  if (!auth || auth.length !== 2 || !(await verifySessionToken(auth[0], auth[1]))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const memberId = auth[0];
  const body = await req.json();
  const client = db();
  const { data, error } = await client
    .from("ws_bulletins")
    .insert({
      author_id: memberId,
      title: body.title,
      content: body.content || "",
      category: body.category || "general",
      pinned: body.pinned || false,
      workspace_id: body.workspace_id || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").split(":");
  if (!auth || auth.length !== 2 || !(await verifySessionToken(auth[0], auth[1]))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const memberId = auth[0];
  const body = await req.json();

  if (body.action === "read") {
    const client = db();
    await client
      .from("ws_bulletin_reads")
      .upsert({ bulletin_id: body.bulletin_id, member_id: memberId });
    return NextResponse.json({ ok: true });
  }

  // Update bulletin
  const client = db();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.category !== undefined) updates.category = body.category;
  if (body.pinned !== undefined) updates.pinned = body.pinned;
  const { error } = await client
    .from("ws_bulletins")
    .update(updates)
    .eq("id", body.id)
    .eq("author_id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").split(":");
  if (!auth || auth.length !== 2 || !(await verifySessionToken(auth[0], auth[1]))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const client = db();
  await client.from("ws_bulletins").delete().eq("id", id).eq("author_id", auth[0]);
  return NextResponse.json({ ok: true });
}
