import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  hashPassword,
  verifyPassword,
  verifySessionToken,
  generateSessionToken,
  generateOneTimeToken,
} from "@/lib/crypto";
import { validateCsrf } from "@/lib/csrf";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { validateRequest, registerSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// ─── 秘匿フィールド定義 ──────────────────────────────────────
// API レスポンスに絶対に含めないフィールド
const SENSITIVE_FIELDS = [
  "password_hash",
  "session_nonce",
  "password_reset_token",
  "password_reset_expires",
  "login_attempts",
  "locked_until",
] as const;

// 本人のみに返すフィールド
const PRIVATE_FIELDS = [
  "email",
  "notification_prefs",
  "situation_profile",
  "gaming_profile",
  "email_verified",
] as const;

/** プロフィールから秘匿フィールドを除去 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeProfile(profile: any, isOwner: boolean): any {
  if (!profile) return profile;
  const result = { ...profile };
  // Owner向け: パスワード設定有無を算出（password_hash自体は返さない）
  if (isOwner && result.password_hash) {
    result.has_password =
      !result.password_hash.startsWith("oauth:") && result.password_hash !== "magiclink";
  }
  for (const field of SENSITIVE_FIELDS) {
    delete result[field];
  }
  if (!isOwner) {
    for (const field of PRIVATE_FIELDS) {
      delete result[field];
    }
  }
  return result;
}

// プロフィール取得（公開情報のみ — 秘匿フィールド除外）
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }
  const name = request.nextUrl.searchParams.get("name");
  const org = request.nextUrl.searchParams.get("org") ?? "";

  if (!name) return NextResponse.json({ error: "name が必要です" }, { status: 400 });

  // Check if requester is the profile owner
  const requesterId = request.headers.get("X-Member-Id");
  const sessionToken = request.headers.get("X-Session-Token");
  let isOwner = false;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("member_profiles")
    .select(
      "id, name, org, org_type, bio, experience, preferred_areas, email, email_verified, notification_prefs, situation_profile, gaming_profile, avatar_url, auth_provider, password_hash, created_at, updated_at",
    )
    .eq("name", name)
    .eq("org", org)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Verify ownership
  if (data && requesterId && sessionToken) {
    if (requesterId === data.id) {
      const valid = await verifySessionToken(requesterId, sessionToken);
      if (valid) isOwner = true;
    }
  }

  // 横断プロジェクト検索
  const { data: projects } = await admin
    .from("projects")
    .select("id, title, status, members, tasks, updated_at")
    .contains("members", [{ name, org }])
    .order("updated_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectSummaries = (projects ?? []).map((p: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberEntry = (p.members as any[])?.find((m: any) => m.name === name && m.org === org);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignedTasks = (p.tasks as any[])?.filter((t: any) => t.assignee === name) ?? [];
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      role: memberEntry?.role ?? "",
      tasksDone: assignedTasks.filter((t: { done: boolean }) => t.done).length,
      tasksTotal: assignedTasks.length,
      tasks: assignedTasks.map((t: { id: string; title: string; done: boolean; due?: string }) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        due: t.due,
      })),
    };
  });

  // コミュニティ参加情報
  let communities: { id: string; name: string; member_count: number }[] = [];
  if (data?.id) {
    const { data: memberships } = await admin
      .from("community_members")
      .select("community_id, communities(id, name)")
      .eq("member_id", data.id);
    if (memberships) {
      communities = memberships
        .map((m: { communities?: { id: string; name: string } }) => ({
          id: m.communities?.id as string,
          name: m.communities?.name as string,
          member_count: 0,
        }))
        .filter((c) => c.id);
    }
  }

  return NextResponse.json({
    profile: sanitizeProfile(data, isOwner) ?? {
      name,
      org,
      org_type: "",
      bio: "",
      experience: "",
      preferred_areas: [],
    },
    projects: projectSummaries,
    communities,
  });
}

// 新規登録（メールアドレス必須）
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  // CSRF 検証
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 403 });
  }

  const result = await validateRequest(request, registerSchema);
  if (!result.success) return result.error;
  const body = result.data;

  const admin = createAdminClient();
  const passwordHash = await hashPassword(body.password);

  const { data, error } = await admin
    .from("member_profiles")
    .insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      org: body.org?.trim() ?? "",
      org_type: body.org_type ?? "",
      bio: body.bio ?? "",
      experience: body.experience ?? "",
      preferred_areas: body.preferred_areas ?? [],
      password_hash: passwordHash,
      auth_provider: "local",
    })
    .select("id, name, org, org_type, email")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation — could be name+org or email
      if (error.message?.includes("email")) {
        return NextResponse.json(
          { error: "このメールアドレスは既に登録されています" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "この表示名と所属の組み合わせは既に登録されています" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const token = await generateSessionToken(data.id);

  // 登録完了後、メールアドレス確認メールを自動送信
  try {
    const { raw, hashed } = await generateOneTimeToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await admin
      .from("member_profiles")
      .update({
        password_reset_token: hashed,
        password_reset_expires: expires,
      })
      .eq("id", data.id);

    const origin = request.headers.get("origin") || "https://lexcard.jp";
    const verifyUrl = `${origin}/api/auth/verify-email?token=${encodeURIComponent(raw)}&id=${encodeURIComponent(data.id)}`;
    await sendEmailVerificationEmail({
      to: data.email!,
      memberName: data.name,
      verifyUrl,
    });
  } catch (e) {
    // メール送信失敗は登録自体を失敗させない
    logger.error("[members] 確認メール送信失敗", { error: e });
  }

  return NextResponse.json(
    {
      memberId: data.id,
      name: data.name,
      org: data.org,
      orgType: data.org_type,
      email: data.email,
      token,
      authProvider: "local",
    },
    { status: 201 },
  );
}

// ゲーミングプロフィール同期（sendBeacon 用 — PUT + action=sync_gaming）
export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const action = request.nextUrl.searchParams.get("action");
  if (action !== "sync_gaming") {
    return NextResponse.json({ error: "不正なアクション" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      memberId?: string;
      token?: string;
      gaming_profile?: Record<string, unknown>;
    };

    if (!body.memberId || !body.token || !body.gaming_profile) {
      return NextResponse.json({ error: "パラメータ不足" }, { status: 400 });
    }

    const valid = await verifySessionToken(body.memberId, body.token);
    if (!valid) {
      return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("member_profiles")
      .update({
        gaming_profile: body.gaming_profile as import("@/types/database").Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "パースエラー" }, { status: 400 });
  }
}

// プロフィール更新（本人のみ）
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const memberId = request.headers.get("X-Member-Id");
  const sessionToken = request.headers.get("X-Session-Token");
  if (!memberId || !sessionToken) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const valid = await verifySessionToken(memberId, sessionToken);
  if (!valid) {
    return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
  }

  const body = (await request.json()) as {
    bio?: string;
    experience?: string;
    preferred_areas?: string[];
    org_type?: string;
    email?: string | null;
    notification_prefs?: Record<string, unknown>;
    situation_profile?: Record<string, unknown>;
    gaming_profile?: Record<string, unknown>;
    change_password?: {
      current_password?: string;
      new_password: string;
    };
  };

  // email バリデーション
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (!emailRe.test(body.email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が正しくありません" },
        { status: 400 },
      );
    }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  // ─── パスワード変更 ──────────────────────────────────────────
  if (body.change_password) {
    const { current_password, new_password } = body.change_password;
    if (!new_password || new_password.length < 8) {
      return NextResponse.json({ error: "新しいパスワードは8文字以上必要です" }, { status: 400 });
    }
    const adminPw = createAdminClient();
    const { data: pwData } = await adminPw
      .from("member_profiles")
      .select("password_hash")
      .eq("id", memberId)
      .single();
    if (!pwData) {
      return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
    }
    const isOAuthOnly =
      pwData.password_hash?.startsWith("oauth:") || pwData.password_hash === "magiclink";
    if (!isOAuthOnly) {
      if (!current_password) {
        return NextResponse.json({ error: "現在のパスワードを入力してください" }, { status: 400 });
      }
      const pwValid = await verifyPassword(current_password, pwData.password_hash);
      if (!pwValid) {
        return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 401 });
      }
    }
    updates.password_hash = await hashPassword(new_password);
  }

  // ─── 通知prefs内カテゴリ別メールバリデーション ────────────────
  if (body.notification_prefs) {
    for (const key of [
      "project_notifications",
      "task_alerts",
      "message_alerts",
      "law_promulgation",
      "law_enforcement",
    ]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catPref = (body.notification_prefs as Record<string, any>)?.[key];
      if (catPref && typeof catPref.email === "string" && catPref.email.trim() !== "") {
        if (!emailRe.test(catPref.email.trim())) {
          return NextResponse.json(
            { error: `${key} の通知メールアドレスの形式が正しくありません` },
            { status: 400 },
          );
        }
      }
    }
  }
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.experience !== undefined) updates.experience = body.experience;
  if (body.preferred_areas !== undefined) updates.preferred_areas = body.preferred_areas;
  if (body.org_type !== undefined) updates.org_type = body.org_type;
  if (body.email !== undefined) {
    updates.email = body.email ? body.email.toLowerCase() : null;
    // Email change requires re-verification
    if (body.email) updates.email_verified = false;
  }
  if (body.notification_prefs !== undefined) {
    // 既存の prefs とマージして保存
    const admin2 = createAdminClient();
    const { data: current } = await admin2
      .from("member_profiles")
      .select("notification_prefs")
      .eq("id", memberId)
      .maybeSingle();
    const existing = (current?.notification_prefs as Record<string, unknown>) ?? {};
    updates.notification_prefs = { ...existing, ...body.notification_prefs };
  }
  if (body.situation_profile !== undefined) {
    updates.situation_profile = body.situation_profile;
  }
  if (body.gaming_profile !== undefined) {
    updates.gaming_profile = body.gaming_profile;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("member_profiles").update(updates).eq("id", memberId);

  if (error) {
    if (error.code === "23505" && error.message?.includes("email")) {
      return NextResponse.json(
        { error: "このメールアドレスは既に他のアカウントで使用されています" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
