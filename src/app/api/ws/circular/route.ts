import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";

// ws_circulars / ws_circular_confirmations tables are not in Database type definition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createAdminClient();
}

interface CircularRow {
  id: string;
  author_id: string;
  target_member_ids?: string[];
  [key: string]: unknown;
}

interface ConfirmationRow {
  circular_id: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const memberId = sp.get("member_id");
  const role = sp.get("role") || "all"; // author | target | all
  const client = db();

  const { data, error } = await client
    .from("ws_circulars")
    .select("*, author:member_profiles!author_id(id,name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let filtered: CircularRow[] = data || [];
  if (memberId && role === "author") {
    filtered = filtered.filter((c) => c.author_id === memberId);
  } else if (memberId && role === "target") {
    filtered = filtered.filter(
      (c) => c.author_id === memberId || (c.target_member_ids || []).includes(memberId),
    );
  }

  // Attach confirmations
  if (filtered.length > 0) {
    const ids = filtered.map((c) => c.id);
    const { data: confs } = await client
      .from("ws_circular_confirmations")
      .select("*")
      .in("circular_id", ids);
    const confMap: Record<string, ConfirmationRow[]> = {};
    for (const c of (confs || []) as ConfirmationRow[]) {
      if (!confMap[c.circular_id]) confMap[c.circular_id] = [];
      confMap[c.circular_id].push(c);
    }
    filtered = filtered.map((c) => ({
      ...c,
      confirmations: confMap[c.id] || [],
    }));
  }

  return NextResponse.json({ circulars: filtered });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").split(":");
  if (!auth || auth.length !== 2 || !(await verifySessionToken(auth[0], auth[1]))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const client = db();
  const { data, error } = await client
    .from("ws_circulars")
    .insert({
      author_id: auth[0],
      title: body.title,
      content: body.content || "",
      target_member_ids: body.target_member_ids || [],
      deadline: body.deadline || null,
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
  const client = db();

  if (body.action === "confirm") {
    await client.from("ws_circular_confirmations").upsert({
      circular_id: body.circular_id,
      member_id: memberId,
      comment: body.comment || "",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "close") {
    await client
      .from("ws_circulars")
      .update({ status: "closed" })
      .eq("id", body.id)
      .eq("author_id", memberId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").split(":");
  if (!auth || auth.length !== 2 || !(await verifySessionToken(auth[0], auth[1]))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const client = db();
  await client.from("ws_circulars").delete().eq("id", id).eq("author_id", auth[0]);
  return NextResponse.json({ ok: true });
}
