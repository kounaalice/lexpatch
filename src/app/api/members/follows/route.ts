import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// フォロー一覧取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const memberId = request.nextUrl.searchParams.get("member_id");
  if (!memberId) return NextResponse.json({ error: "member_id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("member_follows")
    .select("id, target_type, target_id, target_title, created_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// フォロー追加
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const body = (await request.json()) as {
    member_id: string;
    target_type: string;
    target_id: string;
    target_title: string;
  };

  if (!body.member_id || !body.target_type || !body.target_id) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("member_follows").upsert(
    {
      member_id: body.member_id,
      target_type: body.target_type,
      target_id: body.target_id,
      target_title: body.target_title ?? "",
    },
    { onConflict: "member_id,target_type,target_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// フォロー解除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const memberId = request.nextUrl.searchParams.get("member_id");
  const targetType = request.nextUrl.searchParams.get("target_type");
  const targetId = request.nextUrl.searchParams.get("target_id");

  if (!memberId || !targetType || !targetId) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("member_follows")
    .delete()
    .eq("member_id", memberId)
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
