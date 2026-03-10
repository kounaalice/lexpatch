import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/crypto";
import type { ProjectMember } from "@/types/database";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// アクセス検証
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const body = (await request.json()) as {
    project_id: string;
    password?: string;
    viewer_name?: string;
  };

  if (!body.project_id) {
    return NextResponse.json({ error: "project_id が必要です" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: project, error } = await admin
    .from("projects")
    .select("visibility, access_password_hash, members")
    .eq("id", body.project_id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });
  }

  const visibility = project.visibility ?? "public";

  if (visibility === "public") {
    return NextResponse.json({ access: true });
  }

  if (visibility === "private") {
    if (!body.password) {
      return NextResponse.json({ access: false, reason: "パスワードが必要です" });
    }
    if (!project.access_password_hash) {
      return NextResponse.json({ access: true }); // パスワード未設定の場合はアクセス許可
    }
    const valid = await verifyPassword(body.password, project.access_password_hash);
    if (!valid) {
      return NextResponse.json({ access: false, reason: "パスワードが正しくありません" });
    }
    return NextResponse.json({ access: true, token: `unlocked_${body.project_id}` });
  }

  if (visibility === "members_only") {
    if (!body.viewer_name) {
      return NextResponse.json({ access: false, reason: "ログインが必要です" });
    }
    const isMember = (project.members as unknown as ProjectMember[])?.some(
      (m) => m.name === body.viewer_name,
    );
    if (!isMember) {
      return NextResponse.json({ access: false, reason: "このプロジェクトはメンバー限定です" });
    }
    return NextResponse.json({ access: true });
  }

  return NextResponse.json({ access: true });
}
