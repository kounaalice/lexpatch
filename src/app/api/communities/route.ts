import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import { validateRequest, communitySchema } from "@/lib/validation";
import { z } from "zod";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// コミュニティ一覧
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = request.nextUrl.searchParams.get("member_id");
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: communities, error } = await (admin as any)
    .from("communities")
    .select("*, community_members(count)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // メンバーの参加状況
  let joinedIds = new Set<string>();
  if (memberId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (admin as any)
      .from("community_members")
      .select("community_id")
      .eq("member_id", memberId);
    joinedIds = new Set((memberships ?? []).map((m: { community_id: string }) => m.community_id));
  }

  const result = (communities ?? [])
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      visibility: c.visibility,
      owner_member_id: c.owner_member_id,
      member_count: c.community_members?.[0]?.count ?? 0,
      is_joined: joinedIds.has(c.id),
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
    .filter(
      (c: { visibility: string; is_joined: boolean }) => c.visibility === "public" || c.is_joined,
    );

  return NextResponse.json(result);
}

// コミュニティ作成
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const postSchema = communitySchema.extend({
    owner_member_id: z.string().min(1),
    visibility: z.enum(["public", "private"]).optional(),
  });
  const validation = await validateRequest(request, postSchema);
  if (!validation.success) return validation.error;
  const body = validation.data;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("communities")
    .insert({
      name: body.name.trim(),
      description: body.description ?? "",
      visibility: body.visibility ?? (body.isPublic ? "public" : "private"),
      owner_member_id: body.owner_member_id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 作成者を自動メンバー追加
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("community_members")
    .insert({ community_id: data.id, member_id: body.owner_member_id });

  return NextResponse.json(data, { status: 201 });
}

// コミュニティ更新
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    visibility?: string;
  };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.visibility !== undefined) updates.visibility = body.visibility;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("communities").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// コミュニティ削除（ownerまたはadmin/moderatorのみ）
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // 権限チェック
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  const { data: community } = await db
    .from("communities")
    .select("owner_member_id")
    .eq("id", id)
    .maybeSingle();
  if (auth) {
    const sep = auth.indexOf(":");
    if (sep !== -1) {
      const memberId = auth.slice(0, sep);
      const token = auth.slice(sep + 1);
      const valid = await verifySessionToken(memberId, token);
      if (valid) {
        const { data: member } = await db
          .from("member_profiles")
          .select("role")
          .eq("id", memberId)
          .maybeSingle();
        const isOwner = memberId === community?.owner_member_id;
        const isAdminRole = member?.role === "admin" || member?.role === "moderator";
        if (!isOwner && !isAdminRole) {
          return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
        }
      }
    }
  }

  const { error } = await db.from("communities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
