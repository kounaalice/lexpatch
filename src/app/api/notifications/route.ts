import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/mail";
import { mergePrefs, isImmediateEnabled, getNotificationEmail } from "@/lib/notification-prefs";
import { logger } from "@/lib/logger";
import type { Database, ProjectMember } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// お知らせ取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = request.nextUrl.searchParams.get("member_id");
  const projectId = request.nextUrl.searchParams.get("project_id");

  if (!memberId) return NextResponse.json({ error: "member_id が必要です" }, { status: 400 });

  const admin = createAdminClient();

  // メンバー情報取得（org_type確認用）
  const { data: member } = await admin
    .from("member_profiles")
    .select("id, name, org, org_type")
    .eq("id", memberId)
    .single();

  if (!member) return NextResponse.json({ error: "メンバーが見つかりません" }, { status: 404 });

  // project_idなし → 全PJ横断の未読数
  if (!projectId) {
    // まずメンバーが所属するプロジェクトを取得
    const { data: projects } = await admin
      .from("projects")
      .select("id")
      .contains("members", [{ name: member.name, org: member.org }]);

    const projectIds = (projects ?? []).map((p: { id: string }) => p.id);
    if (projectIds.length === 0) {
      return NextResponse.json({ unread_count: 0, notifications: [] });
    }

    const { data: notifs } = await admin
      .from("notifications")
      .select("*, notification_reads!left(member_id)")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(50);

    // 対象フィルタリング + 未読カウント
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = (notifs ?? []).filter((n: any) => isTargeted(n, member));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unreadCount = filtered.filter((n: any) => {
      const reads = n.notification_reads ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !reads.some((r: any) => r.member_id === memberId);
    }).length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications = filtered.map((n: any) => ({
      ...n,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      is_read: (n.notification_reads ?? []).some((r: any) => r.member_id === memberId),
      notification_reads: undefined,
    }));

    // プロジェクト名マップ
    const { data: projectRows } = await admin
      .from("projects")
      .select("id, title")
      .in("id", projectIds);
    const projectMap: Record<string, string> = {};
    for (const p of projectRows ?? []) {
      projectMap[p.id] = p.title;
    }

    return NextResponse.json({ unread_count: unreadCount, notifications, projects: projectMap });
  }

  // project_idあり → そのPJのお知らせ一覧
  const { data: notifs, error } = await admin
    .from("notifications")
    .select("*, notification_reads!left(member_id)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (notifs ?? []).filter((n: any) => isTargeted(n, member));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = filtered.map((n: any) => ({
    ...n,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    is_read: (n.notification_reads ?? []).some((r: any) => r.member_id === memberId),
    notification_reads: undefined,
  }));

  return NextResponse.json(result);
}

// お知らせ送信
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const url = new URL(request.url);
  // 既読マーク
  if (url.pathname.endsWith("/read")) {
    const body = (await request.json()) as { notification_id: string; member_id: string };
    if (!body.notification_id || !body.member_id) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
    }
    const admin = createAdminClient();
    await admin.from("notification_reads").upsert(
      {
        notification_id: body.notification_id,
        member_id: body.member_id,
      },
      { onConflict: "notification_id,member_id" },
    );
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as {
    project_id: string;
    sender_member_id: string;
    title: string;
    content: string;
    target_type?: string;
    target_filter?: Record<string, unknown>;
  };

  if (!body.project_id || !body.sender_member_id || !body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      member_id: body.sender_member_id,
      project_id: body.project_id,
      sender_member_id: body.sender_member_id,
      title: body.title.trim(),
      content: body.content.trim(),
      target_type: body.target_type ?? "all",
      target_filter: (body.target_filter ?? {}) as import("@/types/database").Json,
    })
    .select()
    .returns<NotificationRow[]>()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ─── メール配信（fire-and-forget within request） ───
  try {
    // プロジェクト情報取得
    const { data: project } = await admin
      .from("projects")
      .select("id, title, members")
      .eq("id", body.project_id)
      .single();

    if (project) {
      const memberEntries = (project.members as unknown as ProjectMember[]) ?? [];
      const projectMemberSet = new Set(memberEntries.map((m) => `${m.name}___${m.org}`));

      // メール通知有効なメンバーを取得
      const { data: emailMembers } = await admin
        .from("member_profiles")
        .select("id, name, org, org_type, email, notification_prefs")
        .not("email", "is", null);

      if (emailMembers && emailMembers.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recipients = emailMembers.filter((m: any) => {
          // プロジェクトメンバーか
          if (!projectMemberSet.has(`${m.name}___${m.org}`)) return false;
          // 通知対象か
          if (!isTargeted(data, m)) return false;
          // メール通知が即時有効か
          const prefs = mergePrefs(m.notification_prefs);
          return isImmediateEnabled(prefs, "project_notifications");
        });

        if (recipients.length > 0) {
          const promises = recipients.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (m: any) => {
              const prefs = mergePrefs(m.notification_prefs);
              const toEmail = getNotificationEmail(prefs, "project_notifications", m.email);
              return sendNotificationEmail({
                to: toEmail,
                memberName: m.name,
                notificationTitle: data.title,
                notificationContent: data.content ?? "",
                projectTitle: project.title,
                projectId: body.project_id,
              });
            },
          );
          await Promise.allSettled(promises);
          logger.info(`[notifications] メール送信: ${recipients.length}件`);
        }
      }
    }
  } catch (e) {
    logger.error("[notifications] メール配信エラー", { error: e });
  }

  return NextResponse.json(data, { status: 201 });
}

// 対象判定ヘルパー
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTargeted(notification: any, member: { id: string; org_type: string | null }): boolean {
  const targetType = notification.target_type ?? "all";
  if (targetType === "all") return true;
  if (targetType === "org_type") {
    const orgTypes = (notification.target_filter as { org_types?: string[] })?.org_types ?? [];
    return orgTypes.includes(member.org_type ?? "");
  }
  if (targetType === "individual") {
    const memberIds = (notification.target_filter as { member_ids?: string[] })?.member_ids ?? [];
    return memberIds.includes(member.id);
  }
  return true;
}
