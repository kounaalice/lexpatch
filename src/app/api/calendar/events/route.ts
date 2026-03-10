import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/calendar/events?member_id=UUID&from=YYYY-MM-DD&to=YYYY-MM-DD
 * GET /api/calendar/events?project_id=UUID&from=YYYY-MM-DD&to=YYYY-MM-DD
 * カレンダーイベント集約API（個人モード or プロジェクトモード）
 */
export interface CalendarEvent {
  id: string;
  type: "promulgation" | "enforcement" | "task" | "phase_deadline";
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  title: string;
  subtitle?: string; // プロジェクト名、法令番号等
  link?: string;
  color: string; // 公布=#0369A1, 施行=#DC2626, タスク=#7C3AED, フェーズ=#D97706
  done?: boolean;
}

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get("member_id");
  const projectId = request.nextUrl.searchParams.get("project_id");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from, to are required" }, { status: 400 });
  }
  if (!memberId && !projectId) {
    return NextResponse.json({ error: "member_id or project_id is required" }, { status: 400 });
  }

  try {
    const db = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let projects: any[] = [];

    if (projectId) {
      // ── プロジェクトモード: 特定プロジェクトの全タスク/フェーズ ──
      const { data: proj } = await db
        .from("projects")
        .select("id, title, tasks, phase_deadlines, members")
        .eq("id", projectId)
        .single();

      if (proj) projects = [proj];
    } else {
      // ── 個人モード: メンバーの所属プロジェクト ──
      const { data: member } = await db
        .from("member_profiles")
        .select("id, name, org")
        .eq("id", memberId!)
        .single();

      if (!member) return NextResponse.json({ events: [] });

      const { data: memberProjects } = await db
        .from("projects")
        .select("id, title, tasks, phase_deadlines, members")
        .contains("members", [{ name: member.name, org: member.org }]);

      projects = memberProjects ?? [];
    }

    const events: CalendarEvent[] = [];

    // ── 1. タスクイベント ──
    for (const proj of projects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasks = (proj.tasks ?? []) as any[];
      for (const task of tasks) {
        if (!task.due) continue;
        if (task.due < from || task.due > to) continue;
        events.push({
          id: `task-${task.id}`,
          type: "task",
          date: task.due,
          time: task.dueTime,
          title: task.title,
          subtitle: proj.title,
          link: `/projects/${proj.id}`,
          color: "#7C3AED",
          done: !!task.done,
        });
      }

      // ── 2. フェーズ期限イベント ──
      const deadlines = (proj.phase_deadlines ?? {}) as Record<string, string>;
      for (const [phase, date] of Object.entries(deadlines)) {
        if (!date || date < from || date > to) continue;
        events.push({
          id: `phase-${proj.id}-${phase}`,
          type: "phase_deadline",
          date,
          title: `${phase}期限`,
          subtitle: proj.title,
          link: `/projects/${proj.id}`,
          color: "#D97706",
        });
      }
    }

    // ── 3. 法令アラートイベント（個人モードのみ） ──
    if (!projectId) {
      const { data: lawAlerts } = await db
        .from("law_alert_log")
        .select("id, law_id, law_title, law_num, alert_type, law_date")
        .gte("law_date", from)
        .lte("law_date", to)
        .order("law_date", { ascending: true })
        .limit(200);

      for (const alert of lawAlerts ?? []) {
        events.push({
          id: `law-${alert.id}`,
          type: alert.alert_type as CalendarEvent["type"],
          date: alert.law_date,
          title: alert.law_title,
          subtitle: alert.law_num,
          link: `/laws/${encodeURIComponent(alert.law_id)}`,
          color: alert.alert_type === "promulgation" ? "#0369A1" : "#DC2626",
        });
      }
    }

    // 日付順ソート
    events.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ events });
  } catch (e) {
    logger.error("[calendar/events] エラー", { error: e });
    return NextResponse.json({ events: [] });
  }
}
