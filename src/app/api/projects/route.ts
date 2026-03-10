import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword, verifySessionToken } from "@/lib/crypto";
import { sendTaskAlertEmail } from "@/lib/mail";
import { mergePrefs, isImmediateEnabled } from "@/lib/notification-prefs";
import { logger } from "@/lib/logger";
import type { Database, ProjectTask } from "@/types/database";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// プロジェクト一覧 or 単件取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const admin = createAdminClient();

  if (id) {
    const { data, error } = await admin
      .from("projects")
      .select("*, project_notes(*)")
      .eq("id", id)
      .single();
    if (error)
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    return NextResponse.json(data);
  }

  let query = admin
    .from("projects")
    .select(
      "id, title, description, law_ids, owner_name, visibility, status, phase_deadlines, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// プロジェクト新規作成
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const body = (await request.json()) as {
    title: string;
    description?: string;
    law_ids?: string[];
    bookmarks?: unknown;
    owner_name?: string;
    status?: string;
    references?: unknown;
    tasks?: unknown;
    approvals?: unknown;
    activity_log?: unknown;
    members?: unknown;
    phase_deadlines?: unknown;
    visibility?: string;
    access_password?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "プロジェクト名は必須です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    title: body.title,
    description: body.description ?? null,
    law_ids: body.law_ids ?? [],
    bookmarks: body.bookmarks ?? [],
    owner_name: body.owner_name?.trim() || null,
    status: body.status ?? "調査",
    references: body.references ?? [],
    tasks: body.tasks ?? [],
    approvals: body.approvals ?? {},
    activity_log: body.activity_log ?? [],
    members: body.members ?? [],
    phase_deadlines: body.phase_deadlines ?? {},
    visibility: body.visibility ?? "public",
  };

  if (body.access_password) {
    insertData.access_password_hash = await hashPassword(body.access_password);
  }

  const { data, error } = await admin.from("projects").insert(insertData).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// プロジェクト更新
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    law_ids?: string[];
    bookmarks?: unknown;
    owner_name?: string;
    status?: string;
    references?: unknown;
    tasks?: unknown;
    approvals?: unknown;
    activity_log?: unknown;
    members?: unknown;
    phase_deadlines?: unknown;
    visibility?: string;
    access_password?: string;
    patch_ids?: string[];
  };

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.patch_ids !== undefined) updates.patch_ids = body.patch_ids;
  if (body.description !== undefined) updates.description = body.description;
  if (body.law_ids !== undefined) updates.law_ids = body.law_ids;
  if (body.bookmarks !== undefined) updates.bookmarks = body.bookmarks;
  if (body.owner_name !== undefined) updates.owner_name = body.owner_name?.trim() || null;
  if (body.status !== undefined) updates.status = body.status;
  if (body.references !== undefined) updates.references = body.references;
  if (body.tasks !== undefined) updates.tasks = body.tasks;
  if (body.approvals !== undefined) updates.approvals = body.approvals;
  if (body.activity_log !== undefined) updates.activity_log = body.activity_log;
  if (body.members !== undefined) updates.members = body.members;
  if (body.phase_deadlines !== undefined) updates.phase_deadlines = body.phase_deadlines;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.access_password !== undefined) {
    updates.access_password_hash = body.access_password
      ? await hashPassword(body.access_password)
      : null;
  }
  updates.updated_at = new Date().toISOString();

  const admin = createAdminClient();

  // タスク変更検知用: 変更前のタスクを取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let oldTasks: any[] | null = null;
  if (body.tasks !== undefined) {
    const { data: existing } = await admin
      .from("projects")
      .select("tasks, title, members")
      .eq("id", id)
      .maybeSingle();
    if (existing) {
      oldTasks = (existing.tasks ?? []) as {
        id: string;
        title: string;
        assignee?: string;
        done: boolean;
      }[];
    }
  }

  const { data, error } = await admin
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .returns<ProjectRow[]>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ─── タスク変更時のメール通知 ───
  if (body.tasks !== undefined && oldTasks && data?.[0]) {
    try {
      const newTasks = (body.tasks as unknown as ProjectTask[]) ?? [];
      const project = data[0];
      const projectTitle = project.title ?? "プロジェクト";

      // 新規割当を検知（旧タスクにないID、または assignee が変わったもの）
      const oldMap = new Map((oldTasks as unknown as ProjectTask[]).map((t) => [t.id, t]));

      const alerts: {
        assignee: string;
        taskTitle: string;
        action: "assigned" | "completed";
        due?: string;
      }[] = [];

      for (const nt of newTasks) {
        const old = oldMap.get(nt.id);
        if (!old && nt.assignee) {
          // 新規タスクで担当者あり
          alerts.push({
            assignee: nt.assignee,
            taskTitle: nt.title,
            action: "assigned",
            due: nt.due,
          });
        } else if (old) {
          // 担当者が変わった
          if (nt.assignee && nt.assignee !== old.assignee) {
            alerts.push({
              assignee: nt.assignee,
              taskTitle: nt.title,
              action: "assigned",
              due: nt.due,
            });
          }
          // 完了になった
          if (nt.done && !old.done && nt.assignee) {
            alerts.push({ assignee: nt.assignee, taskTitle: nt.title, action: "completed" });
          }
        }
      }

      if (alerts.length > 0) {
        // 担当者名 → メンバー情報をDB検索
        const assigneeNames = [...new Set(alerts.map((a) => a.assignee))];
        const { data: members } = await admin
          .from("member_profiles")
          .select("id, name, email, notification_prefs")
          .in("name", assigneeNames)
          .not("email", "is", null);

        if (members) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const memberMap = new Map<string, any>(members.map((m: any) => [m.name, m]));
          const emailPromises = alerts
            .map((a) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const member: any = memberMap.get(a.assignee);
              if (!member) return null;
              const prefs = mergePrefs(member.notification_prefs);
              if (!isImmediateEnabled(prefs, "task_alerts")) return null;
              return sendTaskAlertEmail({
                to: member.email,
                memberName: member.name,
                taskTitle: a.taskTitle,
                action: a.action,
                projectTitle,
                projectId: id,
                dueDate: a.due,
              });
            })
            .filter(Boolean);

          if (emailPromises.length > 0) {
            await Promise.allSettled(emailPromises as Promise<boolean>[]);
            logger.info(`[projects] タスクメール送信: ${emailPromises.length}件`);
          }
        }
      }
    } catch (e) {
      logger.error("[projects] タスクメール配信エラー", { error: e });
    }
  }

  return NextResponse.json(data?.[0] ?? { ok: true });
}

// プロジェクト削除（ownerまたはadmin/moderatorのみ）
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
  const { data: project } = await db
    .from("projects")
    .select("owner_name")
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
          .select("name, role")
          .eq("id", memberId)
          .maybeSingle();
        const isOwner = member?.name === project?.owner_name;
        const isAdminRole = member?.role === "admin" || member?.role === "moderator";
        if (!isOwner && !isAdminRole) {
          return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
        }
      }
    }
  }

  await db.from("project_notes").delete().eq("project_id", id);
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
