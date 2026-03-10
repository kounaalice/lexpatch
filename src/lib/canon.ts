// ── Canon snapshot helpers ───────────────────────────────────
// 法令閲覧時にテキストのスナップショットを canons テーブルに自動保存し、
// 法令の改正履歴を追跡する。fire-and-forget でエラーは握りつぶす。

import { createAdminClient } from "@/lib/supabase/server";
import type { StructuredLaw } from "@/lib/egov/types";
import { logger } from "./logger";

/**
 * バージョン文字列を決定する。
 * 優先順位: amendment_date > promulgation_date > 今日の日付
 */
export function getVersionString(law: StructuredLaw): string {
  if (law.amendment_date && law.amendment_date !== "" && law.amendment_date !== "null") {
    return law.amendment_date;
  }
  if (law.promulgation_date && law.promulgation_date !== "" && law.promulgation_date !== "null") {
    return law.promulgation_date;
  }
  return new Date().toISOString().split("T")[0];
}

/**
 * FK満足のため laws テーブルに最小行を upsert する。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureLawRow(admin: any, law: StructuredLaw): Promise<void> {
  await admin.from("laws").upsert(
    {
      law_id: law.law_id,
      law_title: law.law_title,
      law_num: law.law_num,
      law_type: law.law_type ?? "",
      raw_json: {},
      structured: {},
    },
    { onConflict: "law_id", ignoreDuplicates: true },
  );
}

/**
 * 法令のスナップショットを canons テーブルに保存する。
 * 同一バージョンが既に存在する場合はスキップ。
 * fire-and-forget: エラーは常に null を返す。
 */
export async function saveCanonSnapshot(law: StructuredLaw): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const version = getVersionString(law);

    // 既存チェック（高速パス）
    const { data: existing } = await (
      admin as ReturnType<typeof createAdminClient> & { from: (...args: unknown[]) => unknown }
    )
      .from("canons")
      .select("id")
      .eq("law_id", law.law_id)
      .eq("version", version)
      .maybeSingle();

    if (existing) return null;

    // FK ターゲット確保
    await ensureLawRow(admin, law);

    // スナップショット挿入
    const { data, error } = await admin
      .from("canons")
      .insert({
        law_id: law.law_id,
        version,
        articles: {
          law_title: law.law_title,
          law_num: law.law_num,
          law_type: law.law_type,
          promulgation_date: law.promulgation_date,
          amendment_date: law.amendment_date,
          enforcement_date: law.enforcement_date,
          chapters: law.chapters,
          articles: law.articles,
        } as unknown as import("@/types/database").Json,
      })
      .select("id")
      .single();

    if (error) {
      // unique制約違反 (23505) はレース条件として無視
      if (error.code === "23505") return null;
      logger.error("[canon] snapshot insert failed", { error: error.message });
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    logger.error("[canon] snapshot error", { error: String(err) });
    return null;
  }
}

/**
 * 指定した法令のバージョン一覧を取得する（新しい順）。
 */
export async function getCanonVersions(
  lawId: string,
): Promise<Array<{ id: string; version: string; released_at: string }>> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("canons")
      .select("id, version, released_at")
      .eq("law_id", lawId)
      .order("released_at", { ascending: false })
      .limit(100);

    if (error) {
      logger.error("[canon] fetch versions failed", { error: error.message });
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}
