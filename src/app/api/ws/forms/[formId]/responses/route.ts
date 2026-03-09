import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** GET /api/ws/forms/[formId]/responses — list responses */
/** POST /api/ws/forms/[formId]/responses — submit a response (public, no auth) */

export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data } = await db
    .from("ws_form_responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });
  return NextResponse.json({ responses: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // Verify form exists and is published
  const { data: form } = await db.from("ws_forms").select("status").eq("id", formId).single();
  if (!form) return NextResponse.json({ error: "form not found" }, { status: 404 });
  if (form.status !== "published")
    return NextResponse.json({ error: "form not accepting responses" }, { status: 400 });

  const body = await req.json();
  const { data, error } = await db
    .from("ws_form_responses")
    .insert({
      form_id: formId,
      respondent_name: body.respondent_name || null,
      respondent_email: body.respondent_email || null,
      data: body.data || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
