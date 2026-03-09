import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendMessageAlertEmail } from "@/lib/mail";
import { mergePrefs, isImmediateEnabled, getNotificationEmail } from "@/lib/notification-prefs";
import { logger } from "@/lib/logger";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// メッセージ一覧取得
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const projectId = request.nextUrl.searchParams.get("project_id");
  const visibility = request.nextUrl.searchParams.get("visibility") ?? "public";
  const viewerName = request.nextUrl.searchParams.get("viewer_name");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "100");

  if (!projectId) return NextResponse.json({ error: "project_id が必要です" }, { status: 400 });

  const admin = createAdminClient();

  // メンバー限定リクエスト時はメンバー検証
  if (visibility === "member" || visibility === "all") {
    if (viewerName) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: project } = await (admin as any)
        .from("projects")
        .select("members")
        .eq("id", projectId)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isMember = (project?.members as any[])?.some((m: any) => m.name === viewerName);
      if (!isMember && visibility === "member") {
        return NextResponse.json({ error: "メンバーのみ閲覧可能です" }, { status: 403 });
      }
      // visibility === "all" で非メンバーの場合は public のみ返す
      if (!isMember && visibility === "all") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (admin as any)
          .from("project_messages")
          .select("*")
          .eq("project_id", projectId)
          .eq("visibility", "public")
          .order("created_at", { ascending: true })
          .limit(limit);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data ?? []);
      }
    } else if (visibility === "member") {
      return NextResponse.json({ error: "viewer_name が必要です" }, { status: 400 });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from("project_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (visibility === "public") {
    query = query.eq("visibility", "public");
  } else if (visibility === "member") {
    query = query.eq("visibility", "member");
  }
  // "all" returns both

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// メッセージ投稿
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const body = (await request.json()) as {
    project_id: string;
    author_name: string;
    content: string;
    visibility?: string;
  };

  if (!body.project_id || !body.content?.trim()) {
    return NextResponse.json({ error: "project_id と content は必須です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // メンバー限定メッセージ時はメンバー検証
  if (body.visibility === "member" && body.author_name) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (admin as any)
      .from("projects")
      .select("members")
      .eq("id", body.project_id)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isMember = (project?.members as any[])?.some((m: any) => m.name === body.author_name);
    if (!isMember) {
      return NextResponse.json({ error: "メンバーのみ投稿可能です" }, { status: 403 });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("project_messages")
    .insert({
      project_id: body.project_id,
      author_name: body.author_name?.trim() || "匿名",
      content: body.content.trim(),
      visibility: body.visibility ?? "public",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ─── メッセージ通知メール ───
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (admin as any)
      .from("projects")
      .select("id, title, members")
      .eq("id", body.project_id)
      .single();

    if (project) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memberNames = ((project.members as any[]) ?? [])
        .map((m: { name?: string }) => m.name)
        .filter(Boolean);
      if (memberNames.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: members } = await (admin as any)
          .from("member_profiles")
          .select("id, name, email, notification_prefs")
          .in("name", memberNames)
          .not("email", "is", null);

        if (members) {
          const authorName = body.author_name?.trim() || "匿名";
          const promises = members
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((m: any) => {
              if (m.name === authorName) return false; // 投稿者自身は除外
              const prefs = mergePrefs(m.notification_prefs);
              return isImmediateEnabled(prefs, "message_alerts");
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((m: any) => {
              const prefs = mergePrefs(m.notification_prefs);
              const toEmail = getNotificationEmail(prefs, "message_alerts", m.email);
              return sendMessageAlertEmail({
                to: toEmail,
                memberName: m.name,
                authorName,
                messagePreview: body.content.trim(),
                contextTitle: project.title,
                contextUrl: `https://lexcard.jp/projects/${body.project_id}`,
                contextType: "project",
              });
            });

          if (promises.length > 0) {
            await Promise.allSettled(promises);
            logger.info(`[project-messages] メール送信: ${promises.length}件`);
          }
        }
      }
    }
  } catch (e) {
    logger.error("[project-messages] メール配信エラー", { error: e });
  }

  return NextResponse.json(data, { status: 201 });
}

// メッセージ削除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("project_messages").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
