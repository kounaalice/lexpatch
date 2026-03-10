import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/notifications/count?member_id=UUID
 * 軽量な未読通知数API（Headerポーリング用）
 */
export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get("member_id");
  if (!memberId) return NextResponse.json({ count: 0 });

  try {
    const db = createAdminClient();

    // メンバー情報
    const { data: member } = await db
      .from("member_profiles")
      .select("id, name, org, org_type")
      .eq("id", memberId)
      .single();

    if (!member) return NextResponse.json({ count: 0 });

    // 所属プロジェクト取得
    const { data: projects } = await db
      .from("projects")
      .select("id")
      .contains("members", [{ name: member.name, org: member.org }]);

    const projectIds = (projects ?? []).map((p: { id: string }) => p.id);
    if (projectIds.length === 0) return NextResponse.json({ count: 0 });

    // 直近90日のお知らせのみカウント（パフォーマンス向上）
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const { data: notifs } = await db
      .from("notifications")
      .select("id, target_type, target_filter, notification_reads!left(member_id)")
      .in("project_id", projectIds)
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (notifs ?? []).filter((n: any) => {
      // 対象判定
      const targetType = n.target_type ?? "all";
      if (targetType === "org_type") {
        const orgTypes = (n.target_filter as { org_types?: string[] })?.org_types ?? [];
        if (!orgTypes.includes(member.org_type ?? "")) return false;
      } else if (targetType === "individual") {
        const memberIds = (n.target_filter as { member_ids?: string[] })?.member_ids ?? [];
        if (!memberIds.includes(member.id)) return false;
      }
      // 未読判定
      const reads = n.notification_reads ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !reads.some((r: any) => r.member_id === memberId);
    }).length;

    return NextResponse.json({ count });
  } catch (e) {
    logger.error("[notifications/count] エラー", { error: e });
    return NextResponse.json({ count: 0 });
  }
}
