import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string;
  dueTime?: string;
  start_date?: string;
}

// GET /api/dashboard/tasks?member_id=UUID
// 横断プロジェクトタスク: ユーザーが属するプロジェクトの未完了タスクを集約
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = request.nextUrl.searchParams.get("member_id");
  if (!memberId) {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }

  const sb = createAdminClient();

  // メンバー情報取得
  const { data: profile } = await sb
    .from("member_profiles")
    .select("name, org")
    .eq("id", memberId)
    .single();

  if (!profile) {
    return NextResponse.json({ tasks: [] });
  }

  // メンバーが所属するプロジェクトを検索
  // members JSONB配列内に { name, org } が含まれるプロジェクトを全取得
  const { data: projects } = await sb
    .from("projects")
    .select("id, title, tasks, members")
    .not("tasks", "is", null);

  if (!projects || !Array.isArray(projects)) {
    return NextResponse.json({ tasks: [] });
  }

  // メンバー名で所属フィルタ + 未完了タスク抽出
  const result: Array<{
    taskId: string;
    title: string;
    projectId: string;
    projectTitle: string;
    assignee?: string;
    due?: string;
    dueTime?: string;
    done: boolean;
  }> = [];

  for (const proj of projects) {
    // メンバーチェック: members配列に含まれるか
    const members = Array.isArray(proj.members)
      ? (proj.members as { name: string; org?: string }[])
      : [];
    const isMember = members.some(
      (m) => m.name === profile.name && (m.org || "") === (profile.org || ""),
    );
    if (!isMember) continue;

    // タスク抽出
    const tasks: ProjectTask[] = Array.isArray(proj.tasks)
      ? (proj.tasks as unknown as ProjectTask[])
      : [];
    for (const t of tasks) {
      if (t.done) continue;
      result.push({
        taskId: t.id,
        title: t.title,
        projectId: proj.id,
        projectTitle: proj.title,
        assignee: t.assignee,
        due: t.due,
        dueTime: t.dueTime,
        done: false,
      });
    }
  }

  // due昇順ソート（nullは末尾）
  result.sort((a, b) => {
    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due.localeCompare(b.due);
  });

  return NextResponse.json({ tasks: result });
}
