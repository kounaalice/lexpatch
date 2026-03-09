"use client";

import { createClient } from "./client";

// 匿名サインイン（未ログイン時に自動で匿名IDを発行）
export async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;

  // 匿名サインイン
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("匿名サインイン失敗:", error.message);
    return null;
  }
  return data.user?.id ?? null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
