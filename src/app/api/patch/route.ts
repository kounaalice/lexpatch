import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePatch } from "@/lib/patch/parser";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// パッチ一覧取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。.env.local を確認してください。" }, { status: 503 });
  }
  const lawId = request.nextUrl.searchParams.get("law_id");
  const articleNum = request.nextUrl.searchParams.get("article_num");

  const supabase = await createClient();

  let query = supabase
    .from("patches")
    .select("*, sources(*)")
    .order("created_at", { ascending: false });

  if (lawId) {
    query = query.contains("target_articles", [articleNum ?? ""]);
  }

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// パッチ新規作成
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。.env.local を確認してください。" }, { status: 503 });
  }
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json() as {
    title: string;
    plain_text: string;
    target_articles: string[];
    canon_id?: string;
    description?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (!body.plain_text?.trim()) {
    return NextResponse.json({ error: "パッチテキストは必須です" }, { status: 400 });
  }

  // パースして構造化データを生成
  const structured = parsePatch(body.plain_text);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from("patches").insert({
    title: body.title,
    plain_text: body.plain_text,
    structured: structured,
    target_articles: body.target_articles ?? [],
    description: body.description ?? null,
    author_id: user?.id ?? null,
    patch_type: structured.patchType,
    status: "下書き",
    ...(body.canon_id ? { canon_id: body.canon_id } : {}),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
