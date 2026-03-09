/**
 * タスク期限リマインダー — Cronベースの期限通知ロジック
 *
 * checkDeadlineReminders() — 全プロジェクトのタスクをスキャンし、
 * 期限が明日 or 期限超過のタスクについてメール + アプリ内通知を送信。
 * 24時間以内の重複送信は task_alert_sends テーブルで防止。
 */

import { createAdminClient } from "./supabase/server";
import { mergePrefs, getNotificationEmail } from "./notification-prefs";
import { sendTaskAlertEmail } from "./mail";

// ─── 型定義 ─────────────────────────────────────────────────

interface ProjectRow {
  id: string;
  title: string;
  tasks: TaskRow[] | null;
  members: MemberEntry[] | null;
}

interface TaskRow {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string;
  dueTime?: string;
  description?: string;
}

interface MemberEntry {
  name: string;
  org?: string;
  role?: string;
}

interface MemberProfile {
  id: string;
  name: string;
  org: string;
  email: string;
  notification_prefs: Record<string, unknown> | null;
}

interface ReminderResult {
  scanned_projects: number;
  due_soon_tasks: number;
  overdue_tasks: number;
  emails_sent: number;
  skipped_dedup: number;
}

// ─── メイン関数 ──────────────────────────────────────────────

export async function checkDeadlineReminders(): Promise<ReminderResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const result: ReminderResult = {
    scanned_projects: 0,
    due_soon_tasks: 0,
    overdue_tasks: 0,
    emails_sent: 0,
    skipped_dedup: 0,
  };

  // 今日の日付(JST)
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayStr = toYMD(jst);
  const tomorrowStr = toYMD(new Date(jst.getTime() + 24 * 60 * 60 * 1000));

  // 1. タスクが存在する全プロジェクトを取得
  const { data: projects } = await db
    .from("projects")
    .select("id, title, tasks, members")
    .not("tasks", "is", null);

  if (!projects || projects.length === 0) return result;
  result.scanned_projects = projects.length;

  // 2. 対象タスク（期限が明日 or 超過）を収集
  interface PendingAlert {
    project: ProjectRow;
    task: TaskRow;
    alertType: "due_soon" | "overdue";
  }

  const pendingAlerts: PendingAlert[] = [];

  for (const proj of projects as ProjectRow[]) {
    const tasks = proj.tasks ?? [];
    for (const task of tasks) {
      if (!task.due || task.done) continue;

      if (task.due === tomorrowStr) {
        pendingAlerts.push({ project: proj, task, alertType: "due_soon" });
        result.due_soon_tasks++;
      } else if (task.due < todayStr) {
        pendingAlerts.push({ project: proj, task, alertType: "overdue" });
        result.overdue_tasks++;
      }
    }
  }

  if (pendingAlerts.length === 0) return result;

  // 3. 全assignee名を収集 → member_profiles で email 解決
  const assigneeNames = [
    ...new Set(pendingAlerts.map((a) => a.task.assignee).filter((n): n is string => !!n)),
  ];

  if (assigneeNames.length === 0) return result;

  const { data: members } = await db
    .from("member_profiles")
    .select("id, name, org, email, notification_prefs")
    .in("name", assigneeNames)
    .not("email", "is", null);

  if (!members || members.length === 0) return result;

  // 名前→メンバーのマップ（同名対策: プロジェクトメンバーに含まれるか確認）
  const memberMap = new Map<string, MemberProfile[]>();
  for (const m of members as MemberProfile[]) {
    const list = memberMap.get(m.name) || [];
    list.push(m);
    memberMap.set(m.name, list);
  }

  // 4. 24時間以内の送信済み記録を取得（重複防止）
  const recentCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSends } = await db
    .from("task_alert_sends")
    .select("project_id, task_id, member_id, alert_type")
    .gte("sent_at", recentCutoff);

  const sentKeys = new Set(
    (recentSends ?? []).map(
      (s: { project_id: string; task_id: string; member_id: string; alert_type: string }) =>
        `${s.project_id}:${s.task_id}:${s.member_id}:${s.alert_type}`,
    ),
  );

  // 5. 送信実行
  for (const alert of pendingAlerts) {
    const assignee = alert.task.assignee;
    if (!assignee) continue;

    const candidates = memberMap.get(assignee) ?? [];
    // プロジェクトメンバーの中から一致するメンバーを探す
    const projMembers = alert.project.members ?? [];
    const matchedMember =
      candidates.find((m) =>
        projMembers.some((pm) => pm.name === m.name && (!pm.org || pm.org === m.org)),
      ) ?? candidates[0]; // fallback: 最初の候補

    if (!matchedMember) continue;

    // 通知設定チェック
    const prefs = mergePrefs(matchedMember.notification_prefs);
    if (!prefs.task_alerts.enabled) continue;

    // 重複チェック
    const dedupKey = `${alert.project.id}:${alert.task.id}:${matchedMember.id}:${alert.alertType}`;
    if (sentKeys.has(dedupKey)) {
      result.skipped_dedup++;
      continue;
    }

    // メール送信（カテゴリ別メール解決）
    const toEmail = getNotificationEmail(prefs, "task_alerts", matchedMember.email);
    const sent = await sendTaskAlertEmail({
      to: toEmail,
      memberName: matchedMember.name,
      taskTitle: alert.task.title,
      action: alert.alertType,
      projectTitle: alert.project.title,
      projectId: alert.project.id,
      dueDate: alert.task.due,
    });

    if (sent) {
      result.emails_sent++;
      // 送信記録
      await db.from("task_alert_sends").upsert(
        {
          project_id: alert.project.id,
          task_id: alert.task.id,
          member_id: matchedMember.id,
          alert_type: alert.alertType,
          sent_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id,task_id,member_id,alert_type",
        },
      );

      sentKeys.add(dedupKey);
    }
  }

  return result;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
