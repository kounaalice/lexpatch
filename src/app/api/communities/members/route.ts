import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// メンバー一覧
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const communityId = request.nextUrl.searchParams.get("community_id");
  if (!communityId) return NextResponse.json({ error: "community_id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("community_members")
    .select("member_id, joined_at, member_profiles(id, name, org, org_type)")
    .eq("community_id", communityId)
    .order("joined_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members = (data ?? []).map((d: any) => ({
    member_id: d.member_id,
    name: d.member_profiles?.name ?? "",
    org: d.member_profiles?.org ?? "",
    org_type: d.member_profiles?.org_type ?? "",
    joined_at: d.joined_at,
  }));

  return NextResponse.json(members);
}

// 参加
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const memberJoinSchema = z.object({
    community_id: z.string().min(1),
    member_id: z.string().min(1),
  });
  let body: z.infer<typeof memberJoinSchema>;
  try {
    const raw = await request.json();
    const result = memberJoinSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています", details: result.error.issues },
        { status: 400 },
      );
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("community_members").upsert(
    {
      community_id: body.community_id,
      member_id: body.member_id,
    },
    { onConflict: "community_id,member_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// 退出
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const communityId = request.nextUrl.searchParams.get("community_id");
  const memberId = request.nextUrl.searchParams.get("member_id");
  if (!communityId || !memberId) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("member_id", memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
