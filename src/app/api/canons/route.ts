import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// GET /api/canons?law_id=xxx           → バージョン一覧（軽量）
// GET /api/canons?law_id=xxx&version=Y → 特定バージョンの全データ
// GET /api/canons?count=true           → 全体カウント
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const admin = createAdminClient();

  // 全体カウント
  if (request.nextUrl.searchParams.get("count") === "true") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (admin as any)
      .from("canons")
      .select("id", { count: "exact", head: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: count ?? 0 });
  }

  const lawId = request.nextUrl.searchParams.get("law_id");
  if (!lawId) {
    return NextResponse.json({ error: "law_id が必要です" }, { status: 400 });
  }

  const version = request.nextUrl.searchParams.get("version");

  // 特定バージョン取得（articles JSONB 含む）
  if (version) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from("canons")
      .select("id, law_id, version, articles, released_at")
      .eq("law_id", lawId)
      .eq("version", version)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "バージョンが見つかりません" }, { status: 404 });
    return NextResponse.json(data);
  }

  // バージョン一覧（articles 除外で軽量）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("canons")
    .select("id, version, released_at")
    .eq("law_id", lawId)
    .order("released_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
