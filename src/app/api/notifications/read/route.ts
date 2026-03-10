import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// 既読マーク
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const body = (await request.json()) as { notification_id: string; member_id: string };
  if (!body.notification_id || !body.member_id) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("notification_reads").upsert(
    {
      notification_id: body.notification_id,
      member_id: body.member_id,
    },
    { onConflict: "notification_id,member_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
