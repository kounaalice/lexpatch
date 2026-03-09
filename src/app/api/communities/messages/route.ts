import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendMessageAlertEmail } from "@/lib/mail";
import { mergePrefs, isImmediateEnabled, getNotificationEmail } from "@/lib/notification-prefs";
import { logger } from "@/lib/logger";
import { z } from "zod";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// メッセージ一覧
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const communityId = request.nextUrl.searchParams.get("community_id");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");
  if (!communityId) return NextResponse.json({ error: "community_id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("community_messages")
    .select("*, member_profiles(name, org)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = (data ?? []).map((m: any) => ({
    id: m.id,
    content: m.content,
    author_name: m.member_profiles?.name ?? "不明",
    author_org: m.member_profiles?.org ?? "",
    created_at: m.created_at,
  }));

  return NextResponse.json(messages);
}

// 投稿
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const messageSchema = z.object({
    community_id: z.string().min(1),
    author_member_id: z.string().min(1),
    content: z.string().min(1).max(10000),
  });
  let body: z.infer<typeof messageSchema>;
  try {
    const raw = await request.json();
    const result = messageSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています", details: result.error.issues },
        { status: 400 },
      );
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();

  // メンバー確認
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: membership } = await (admin as any)
    .from("community_members")
    .select("id")
    .eq("community_id", body.community_id)
    .eq("member_id", body.author_member_id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "コミュニティに参加していません" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("community_messages")
    .insert({
      community_id: body.community_id,
      member_id: body.author_member_id,
      content: body.content.trim(),
    })
    .select("*, member_profiles(name, org)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = {
    id: data.id,
    content: data.content,
    author_name: data.member_profiles?.name ?? "",
    author_org: data.member_profiles?.org ?? "",
    created_at: data.created_at,
  };

  // ─── コミュニティメッセージ通知メール ───
  try {
    // コミュニティ名とメンバー一覧を取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: community } = await (admin as any)
      .from("communities")
      .select("id, name")
      .eq("id", body.community_id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberRows } = await (admin as any)
      .from("community_members")
      .select("member_id, member_profiles(id, name, email, notification_prefs)")
      .eq("community_id", body.community_id);

    if (community && memberRows) {
      const authorName = result.author_name;
      const promises = memberRows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((row: any) => {
          const m = row.member_profiles;
          if (!m || !m.email) return false;
          if (m.id === body.author_member_id) return false; // 投稿者除外
          const prefs = mergePrefs(m.notification_prefs);
          return isImmediateEnabled(prefs, "message_alerts");
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => {
          const m = row.member_profiles;
          const prefs = mergePrefs(m.notification_prefs);
          const toEmail = getNotificationEmail(prefs, "message_alerts", m.email);
          return sendMessageAlertEmail({
            to: toEmail,
            memberName: m.name,
            authorName,
            messagePreview: body.content.trim(),
            contextTitle: community.name,
            contextUrl: `https://lexcard.jp/communities/${body.community_id}`,
            contextType: "community",
          });
        });

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        logger.info(`[community-messages] メール送信: ${promises.length}件`);
      }
    }
  } catch (e) {
    logger.error("[community-messages] メール配信エラー", { error: e });
  }

  return NextResponse.json(result, { status: 201 });
}

// 削除
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("community_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
