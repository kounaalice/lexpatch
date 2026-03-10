/**
 * 法令アラートシステム — Cron法令巡回のコアロジック
 *
 * discoverNewLaws()    — e-Gov APIで新規公布/施行法令を検出し law_alert_log に記録
 * sendImmediateAlerts() — frequency="immediate" のメンバーに即時送信
 * sendWeeklyDigests()   — frequency="weekly" で該当スケジュールのメンバーにダイジェスト送信
 */

import { getRecentLaws, getRecentlyEnforcedLaws } from "./egov/client";
import { LAW_CATEGORIES } from "./categories";
import {
  mergePrefs,
  getNotificationEmail,
  SCOPE_LABELS,
  type LawAlertPref,
  type LawScope,
  type WeeklySchedule,
} from "./notification-prefs";
import { mergeSituationProfile, getRecommendedKeywords } from "./situations";
import { sendLawAlertEmail, sendLawDigestEmail, type LawAlertItem } from "./mail";
import { createAdminClient } from "./supabase/server";
import { logger } from "./logger";

// ─── 型定義 ─────────────────────────────────────────────────

export interface AlertLogEntry {
  id: string;
  law_id: string;
  law_title: string;
  law_num: string;
  alert_type: "promulgation" | "enforcement";
  law_date: string;
  discovered_at: string;
}

interface MemberRow {
  id: string;
  name: string;
  email: string;
  notification_prefs: Record<string, unknown> | null;
  preferred_areas: string[] | null;
  situation_profile: Record<string, unknown> | null;
}

// ─── 1. 新規法令検出 ───────────────────────────────────────

export async function discoverNewLaws(): Promise<{
  newPromulgations: AlertLogEntry[];
  newEnforcements: AlertLogEntry[];
}> {
  const db = createAdminClient();

  // e-Gov API — 直近30日の公布法令 + 施行法令
  const [promRes, enfRes] = await Promise.allSettled([
    getRecentLaws(30, 50),
    getRecentlyEnforcedLaws(30, 50),
  ]);

  const promLaws = promRes.status === "fulfilled" ? promRes.value.laws : [];
  const enfLaws = enfRes.status === "fulfilled" ? enfRes.value.laws : [];

  if (promRes.status === "rejected")
    logger.error("[law-alerts] 公布法令取得失敗", { error: String(promRes.reason) });
  if (enfRes.status === "rejected")
    logger.error("[law-alerts] 施行法令取得失敗", { error: String(enfRes.reason) });

  const newPromulgations: AlertLogEntry[] = [];
  const newEnforcements: AlertLogEntry[] = [];

  // 公布法令を upsert
  for (const law of promLaws) {
    if (!law.law_id || !law.promulgation_date) continue;
    const { data } = await db
      .from("law_alert_log")
      .upsert(
        {
          law_id: law.law_id,
          law_title: law.law_title,
          law_num: law.law_num,
          alert_type: "promulgation",
          law_date: law.promulgation_date,
        },
        { onConflict: "law_id,alert_type", ignoreDuplicates: true },
      )
      .select()
      .returns<AlertLogEntry[]>()
      .maybeSingle();

    if (data && isRecentlyDiscovered(data.discovered_at)) {
      newPromulgations.push(data);
    }
  }

  // 施行法令を upsert
  for (const law of enfLaws) {
    if (!law.law_id || !law.amendment_enforcement_date) continue;
    const { data } = await db
      .from("law_alert_log")
      .upsert(
        {
          law_id: law.law_id,
          law_title: law.law_title,
          law_num: law.law_num,
          alert_type: "enforcement",
          law_date: law.amendment_enforcement_date,
        },
        { onConflict: "law_id,alert_type", ignoreDuplicates: true },
      )
      .select()
      .returns<AlertLogEntry[]>()
      .maybeSingle();

    if (data && isRecentlyDiscovered(data.discovered_at)) {
      newEnforcements.push(data);
    }
  }

  logger.info(
    `[law-alerts] 検出: 公布 ${newPromulgations.length}件, 施行 ${newEnforcements.length}件`,
  );
  return { newPromulgations, newEnforcements };
}

// ─── 2. 即時アラート送信 ─────────────────────────────────────

export async function sendImmediateAlerts(
  newLaws: AlertLogEntry[],
  alertType: "promulgation" | "enforcement",
): Promise<number> {
  if (newLaws.length === 0) return 0;

  const db = createAdminClient();
  const prefKey = alertType === "promulgation" ? "law_promulgation" : "law_enforcement";

  // メール有効なメンバー取得
  const { data: members } = await db
    .from("member_profiles")
    .select("id, name, email, notification_prefs, preferred_areas, situation_profile")
    .not("email", "is", null);

  if (!members || members.length === 0) return 0;

  let sentCount = 0;

  for (const member of members as MemberRow[]) {
    try {
      const prefs = mergePrefs(member.notification_prefs);
      const lawPref = prefs[prefKey] as LawAlertPref;

      if (!lawPref.enabled || lawPref.frequency !== "immediate") continue;
      if (!member.email) continue;

      // スコープフィルタ
      const matching = await filterByScope(db, newLaws, lawPref.scope, member);
      if (matching.length === 0) continue;

      // 重複チェック
      const unsent = await filterUnsent(db, matching, member.id, "immediate");
      if (unsent.length === 0) continue;

      // メール送信（カテゴリ別メール解決）
      const items = toAlertItems(unsent);
      const toEmail = getNotificationEmail(prefs, prefKey, member.email);
      const ok = await sendLawAlertEmail({
        to: toEmail,
        memberName: member.name,
        alertType,
        laws: items,
        scopeLabel: SCOPE_LABELS[lawPref.scope],
      });

      if (ok) {
        await recordSends(db, unsent, member.id, "immediate");
        sentCount++;
      }
    } catch (e) {
      logger.error(`[law-alerts] 即時送信エラー (${member.name})`, { error: String(e) });
    }
  }

  logger.info(`[law-alerts] 即時アラート送信: ${sentCount}件 (${alertType})`);
  return sentCount;
}

// ─── 3. 週次ダイジェスト送信 ─────────────────────────────────

export async function sendWeeklyDigests(): Promise<number> {
  const db = createAdminClient();
  const now = new Date();
  const jstDay = getJSTDayOfWeek(now);
  const jstHour = getJSTHour(now);

  // メール有効なメンバー取得
  const { data: members } = await db
    .from("member_profiles")
    .select("id, name, email, notification_prefs, preferred_areas, situation_profile")
    .not("email", "is", null);

  if (!members || members.length === 0) return 0;

  let sentCount = 0;

  for (const member of members as MemberRow[]) {
    try {
      const prefs = mergePrefs(member.notification_prefs);

      // 公布・施行両方チェック
      for (const alertType of ["law_promulgation", "law_enforcement"] as const) {
        const lawPref = prefs[alertType] as LawAlertPref;
        if (!lawPref.enabled || lawPref.frequency !== "weekly") continue;
        if (!member.email) continue;

        // スケジュール一致チェック
        if (!isDigestDue(lawPref.weekly_schedule, jstDay, jstHour)) continue;

        // ダイジェストトラッカー取得/作成
        const tracker = await getOrCreateTracker(db, member.id);
        const hoursSinceLast =
          (now.getTime() - new Date(tracker.last_digest_sent).getTime()) / (3600 * 1000);
        if (hoursSinceLast < 12) continue; // 12時間以内の重複防止

        // 前回ダイジェスト以降の法令取得
        const type = alertType === "law_promulgation" ? "promulgation" : "enforcement";
        const { data: pendingLaws } = await db
          .from("law_alert_log")
          .select("*")
          .eq("alert_type", type)
          .gt("discovered_at", tracker.last_digest_sent)
          .order("discovered_at", { ascending: false })
          .returns<AlertLogEntry[]>();

        if (!pendingLaws || pendingLaws.length === 0) continue;

        // スコープフィルタ
        const matching = await filterByScope(db, pendingLaws, lawPref.scope, member);
        if (matching.length === 0) continue;

        // 重複チェック
        const unsent = await filterUnsent(db, matching, member.id, "digest");
        if (unsent.length === 0) continue;

        // ダイジェストメール送信（カテゴリ別メール解決）
        const items = toAlertItems(unsent);
        const periodLabel = `${formatDateShort(tracker.last_digest_sent)} 〜 ${formatDateShort(now.toISOString())}`;
        const toEmail = getNotificationEmail(prefs, alertType, member.email);

        const ok = await sendLawDigestEmail({
          to: toEmail,
          memberName: member.name,
          alertType: type,
          laws: items,
          scopeLabel: SCOPE_LABELS[lawPref.scope],
          periodLabel,
        });

        if (ok) {
          await recordSends(db, unsent, member.id, "digest");
          await db
            .from("law_digest_tracker")
            .upsert({ member_id: member.id, last_digest_sent: now.toISOString() });
          sentCount++;
        }
      }
    } catch (e) {
      logger.error(`[law-alerts] ダイジェスト送信エラー (${member.name})`, { error: String(e) });
    }
  }

  logger.info(`[law-alerts] 週次ダイジェスト送信: ${sentCount}件`);
  return sentCount;
}

// ─── ヘルパー ──────────────────────────────────────────────

/** 直近5分以内に discover されたか */
function isRecentlyDiscovered(discoveredAt: string): boolean {
  return Date.now() - new Date(discoveredAt).getTime() < 5 * 60 * 1000;
}

/** スコープでフィルタ */
async function filterByScope(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  laws: AlertLogEntry[],
  scope: LawScope,
  member: MemberRow,
): Promise<AlertLogEntry[]> {
  if (scope === "all") return laws;

  if (scope === "bookmarked") {
    // member_follows で target_type='law' のものを取得
    const { data: follows } = await db
      .from("member_follows")
      .select("target_id")
      .eq("member_id", member.id)
      .eq("target_type", "law");

    if (!follows || follows.length === 0) return [];
    const followedIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (follows as { target_id: string }[]).map((f: any) => f.target_id),
    );
    return laws.filter((l) => followedIds.has(l.law_id));
  }

  if (scope === "categories") {
    const slugs = member.preferred_areas ?? [];
    if (slugs.length === 0) return [];
    const keywords = slugs
      .map((slug) => LAW_CATEGORIES.find((c) => c.slug === slug)?.searchKeyword)
      .filter(Boolean) as string[];
    if (keywords.length === 0) return [];
    return laws.filter((l) => keywords.some((kw) => l.law_title.includes(kw)));
  }

  if (scope === "situations") {
    const sp = mergeSituationProfile(member.situation_profile);
    if (sp.situations.length === 0) return [];
    const keywords = getRecommendedKeywords(sp.situations);
    if (keywords.length === 0) return [];
    return laws.filter((l) => keywords.some((kw) => l.law_title.includes(kw)));
  }

  return laws;
}

/** 未送信の法令のみ抽出 */
async function filterUnsent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  laws: AlertLogEntry[],
  memberId: string,
  sendType: "immediate" | "digest",
): Promise<AlertLogEntry[]> {
  const alertLogIds = laws.map((l) => l.id);
  const { data: existingSends } = await db
    .from("law_alert_sends")
    .select("alert_log_id")
    .eq("member_id", memberId)
    .eq("send_type", sendType)
    .in("alert_log_id", alertLogIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentIds = new Set((existingSends ?? []).map((s: any) => s.alert_log_id));
  return laws.filter((l) => !sentIds.has(l.id));
}

/** 送信記録を保存 */
async function recordSends(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  laws: AlertLogEntry[],
  memberId: string,
  sendType: "immediate" | "digest",
): Promise<void> {
  const rows = laws.map((l) => ({
    alert_log_id: l.id,
    member_id: memberId,
    send_type: sendType,
  }));
  await db.from("law_alert_sends").upsert(rows, {
    onConflict: "alert_log_id,member_id,send_type",
    ignoreDuplicates: true,
  });
}

/** ダイジェストトラッカーを取得（なければ作成） */
async function getOrCreateTracker(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  memberId: string,
): Promise<{ member_id: string; last_digest_sent: string }> {
  const { data } = await db
    .from("law_digest_tracker")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (data) return data;

  const { data: created } = await db
    .from("law_digest_tracker")
    .upsert({ member_id: memberId })
    .select()
    .single();

  return created ?? { member_id: memberId, last_digest_sent: "1970-01-01T00:00:00.000Z" };
}

/** AlertLogEntry を LawAlertItem に変換 */
function toAlertItems(laws: AlertLogEntry[]): LawAlertItem[] {
  return laws.map((l) => ({
    lawTitle: l.law_title,
    lawNumber: l.law_num,
    lawId: l.law_id,
    date: l.law_date,
  }));
}

/** ダイジェスト送信タイミング判定 */
export function isDigestDue(schedule: WeeklySchedule, jstDay: number, jstHour: number): boolean {
  const scheduleHour = parseInt(schedule.time.split(":")[0], 10);
  if (jstHour !== scheduleHour) return false;

  if (schedule.count <= 1) {
    // 週1回: 指定曜日のみ
    return jstDay === schedule.day;
  }

  // 週N回: 基準曜日から等間隔で分散
  const interval = Math.floor(7 / schedule.count);
  for (let i = 0; i < schedule.count; i++) {
    const targetDay = (schedule.day + i * interval) % 7;
    if (jstDay === targetDay) return true;
  }
  return false;
}

/** UTC → JST の曜日 (0=日) */
function getJSTDayOfWeek(date: Date): number {
  const jst = new Date(date.getTime() + 9 * 3600 * 1000);
  return jst.getUTCDay();
}

/** UTC → JST の時間 (0-23) */
function getJSTHour(date: Date): number {
  const jst = new Date(date.getTime() + 9 * 3600 * 1000);
  return jst.getUTCHours();
}

/** 日付を短い表示に */
function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;
}
