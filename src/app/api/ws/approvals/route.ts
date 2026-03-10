import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import type { Database } from "@/types/database";

type WsApprovalRow = Database["public"]["Tables"]["ws_approvals"]["Row"];

async function auth(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const [memberId, token] = header.replace("Bearer ", "").split(":");
  if (!memberId || !token) return null;
  return (await verifySessionToken(memberId, token)) ? memberId : null;
}

/** GET /api/ws/approvals?member_id=UUID&role=requester|approver */
export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("member_id");
  const role = req.nextUrl.searchParams.get("role") ?? "requester";
  if (!memberId) return NextResponse.json({ error: "member_id required" }, { status: 400 });
  const db = createAdminClient();

  if (role === "approver") {
    // Find approvals where this member is an approver in steps
    const { data } = await db
      .from("ws_approvals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    // Filter client-side for approvals where memberId appears in steps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = (data ?? []).filter((a: any) => {
      const steps = a.steps as Array<{ approver_id: string }>;
      return steps.some((s) => s.approver_id === memberId);
    });
    return NextResponse.json({ approvals: filtered });
  }

  const { data } = await db
    .from("ws_approvals")
    .select("*")
    .eq("requester_id", memberId)
    .order("created_at", { ascending: false });
  return NextResponse.json({ approvals: data ?? [] });
}

/** POST /api/ws/approvals — create approval request */
export async function POST(req: NextRequest) {
  const memberId = await auth(req);
  if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = createAdminClient();

  // steps format: [{ approver_id, approver_name, status: "pending", comment: "", acted_at: null }]
  const steps = (body.steps || []).map((s: { approver_id: string; approver_name: string }) => ({
    approver_id: s.approver_id,
    approver_name: s.approver_name,
    status: "pending",
    comment: "",
    acted_at: null,
  }));

  const { data, error } = await db
    .from("ws_approvals")
    .insert({
      requester_id: memberId,
      title: body.title || "無題の申請",
      description: body.description || null,
      category: body.category || "general",
      status: "pending",
      steps,
      current_step: 0,
      workspace_id: body.workspace_id || null,
    })
    .select()
    .returns<WsApprovalRow[]>()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** PATCH /api/ws/approvals — approve/reject/withdraw */
export async function PATCH(req: NextRequest) {
  const memberId = await auth(req);
  if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id || !body.action)
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  const db = createAdminClient();

  const { data: approval } = await db
    .from("ws_approvals")
    .select("*")
    .eq("id", body.id)
    .returns<WsApprovalRow[]>()
    .single();
  if (!approval) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.action === "withdraw") {
    if (approval.requester_id !== memberId)
      return NextResponse.json({ error: "only requester can withdraw" }, { status: 403 });
    await db
      .from("ws_approvals")
      .update({ status: "withdrawn", updated_at: new Date().toISOString() })
      .eq("id", body.id);
    return NextResponse.json({ ok: true });
  }

  // approve or reject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps = approval.steps as any[];
  const stepIdx = steps.findIndex((s) => s.approver_id === memberId && s.status === "pending");
  if (stepIdx < 0)
    return NextResponse.json({ error: "not your turn or already acted" }, { status: 403 });

  steps[stepIdx].status = body.action === "approve" ? "approved" : "rejected";
  steps[stepIdx].comment = body.comment || "";
  steps[stepIdx].acted_at = new Date().toISOString();

  let overallStatus = approval.status;
  if (body.action === "reject") {
    overallStatus = "rejected";
  } else if (steps.every((s) => s.status === "approved")) {
    overallStatus = "approved";
  }

  const nextStep =
    body.action === "approve" ? Math.min(stepIdx + 1, steps.length - 1) : approval.current_step;

  await db
    .from("ws_approvals")
    .update({
      steps,
      current_step: nextStep,
      status: overallStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  return NextResponse.json({ ok: true, status: overallStatus });
}
