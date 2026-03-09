import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import { buildVEvent, buildVCalendar, type VEventInput } from "@/lib/ical";
import { logger } from "@/lib/logger";

/**
 * GET /api/calendar/ical?member_id=UUID&token=TOKEN
 * GET /api/calendar/ical?project_id=UUID&token=TOKEN&member_id=UUID
 * iCalフィード — 外部カレンダーアプリ用（Authorization不可のためクエリパラム認証）
 */
export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get("member_id");
  const projectId = request.nextUrl.searchParams.get("project_id");
  const token = request.nextUrl.searchParams.get("token");

  if (!memberId || !token) {
    return new NextResponse("member_id and token required", { status: 400 });
  }

  // トークン認証
  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;

    // 範囲: 過去30日〜未来365日
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    const future = new Date(now);
    future.setDate(future.getDate() + 365);

    const from = toYMD(past);
    const to = toYMD(future);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let projects: any[] = [];
    let calendarName = "LexCard カレンダー";

    if (projectId) {
      // ── プロジェクトモード ──
      const { data: proj } = await db
        .from("projects")
        .select("id, title, tasks, phase_deadlines, members")
        .eq("id", projectId)
        .single();

      if (proj) {
        projects = [proj];
        calendarName = `LexCard: ${proj.title}`;
      }
    } else {
      // ── 個人モード ──
      const { data: member } = await db
        .from("member_profiles")
        .select("id, name, org")
        .eq("id", memberId)
        .single();

      if (!member) {
        return new NextResponse("Member not found", { status: 404 });
      }

      const { data: memberProjects } = await db
        .from("projects")
        .select("id, title, tasks, phase_deadlines, members")
        .contains("members", [{ name: member.name, org: member.org }]);

      projects = memberProjects ?? [];
    }

    const vevents: string[] = [];

    // ── タスク ──
    for (const proj of projects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasks = (proj.tasks ?? []) as any[];
      for (const task of tasks) {
        if (!task.due || task.due < from || task.due > to) continue;
        const ev: VEventInput = {
          uid: `task-${task.id}@lexcard.jp`,
          summary: `[タスク] ${task.title}`,
          description: `プロジェクト: ${proj.title}${task.assignee ? `\n担当: ${task.assignee}` : ""}${task.done ? "\n状態: 完了" : ""}`,
          date: task.due,
          time: task.dueTime,
          url: `https://lexcard.jp/projects/${proj.id}`,
          categories: ["タスク"],
        };
        vevents.push(buildVEvent(ev));
      }

      // ── フェーズ期限 ──
      const deadlines = (proj.phase_deadlines ?? {}) as Record<string, string>;
      for (const [phase, date] of Object.entries(deadlines)) {
        if (!date || date < from || date > to) continue;
        vevents.push(
          buildVEvent({
            uid: `phase-${proj.id}-${phase}@lexcard.jp`,
            summary: `[${phase}期限] ${proj.title}`,
            description: `プロジェクト「${proj.title}」の${phase}フェーズ期限`,
            date,
            url: `https://lexcard.jp/projects/${proj.id}`,
            categories: ["フェーズ期限"],
          }),
        );
      }
    }

    // ── 法令アラート（個人モードのみ） ──
    if (!projectId) {
      const { data: lawAlerts } = await db
        .from("law_alert_log")
        .select("id, law_id, law_title, law_num, alert_type, law_date")
        .gte("law_date", from)
        .lte("law_date", to)
        .order("law_date", { ascending: true })
        .limit(500);

      for (const alert of lawAlerts ?? []) {
        const typeLabel = alert.alert_type === "promulgation" ? "公布" : "施行";
        vevents.push(
          buildVEvent({
            uid: `law-${alert.id}@lexcard.jp`,
            summary: `[${typeLabel}] ${alert.law_title}`,
            description: `${alert.law_num}\n${typeLabel}日: ${alert.law_date}`,
            date: alert.law_date,
            url: `https://lexcard.jp/laws/${encodeURIComponent(alert.law_id)}`,
            categories: [typeLabel],
          }),
        );
      }
    }

    const ics = buildVCalendar(vevents, calendarName);

    const filename = projectId ? "lexcard-project-calendar.ics" : "lexcard-calendar.ics";

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (e) {
    logger.error("[calendar/ical] エラー", { error: e });
    return new NextResponse("Internal error", { status: 500 });
  }
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
