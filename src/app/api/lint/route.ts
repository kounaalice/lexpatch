import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { parsePatch } from "@/lib/patch/parser";
import { runLint } from "@/lib/patch/lint";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// パッチIDを指定してLint実行 + 保存
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const body = (await request.json()) as {
    patch_id?: string;
    plain_text?: string;
  };

  let plainText = body.plain_text ?? "";
  const patchId = body.patch_id;

  // patch_id が指定されている場合はDBから取得
  if (patchId && !plainText) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("patches")
      .select("plain_text")
      .eq("id", patchId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "パッチが見つかりません" }, { status: 404 });
    }
    plainText = data.plain_text ?? "";
  }

  if (!plainText.trim()) {
    return NextResponse.json({ error: "パッチテキストが空です" }, { status: 400 });
  }

  const parsed = parsePatch(plainText);
  const results = runLint(parsed, plainText);

  // patch_id がある場合はDBに保存
  if (patchId) {
    const admin = createAdminClient();
    const db = admin;

    // 既存結果を削除
    await db.from("lint_results").delete().eq("patch_id", patchId);

    // 新しい結果を挿入
    if (results.length > 0) {
      const rows = results.map((r) => ({
        patch_id: patchId,
        severity: r.severity,
        rule_name: r.rule_name,
        message: r.message,
        target_line: r.target_line,
      }));
      await db.from("lint_results").insert(rows);
    }
  }

  return NextResponse.json({ results });
}

// パッチのLint結果を取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const patchId = request.nextUrl.searchParams.get("patch_id");
  if (!patchId) {
    return NextResponse.json({ error: "patch_id が必要です" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lint_results")
    .select("severity, rule_name, message, target_line, created_at")
    .eq("patch_id", patchId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
