// ── WS localStorage with memberId namespace ──
// All WS data is scoped per user to prevent data leakage between accounts.

import { getSession } from "./session";

/**
 * Get memberId-namespaced localStorage key.
 * Returns null if not logged in (all WS operations silently no-op).
 */
function nsKey(base: string): string | null {
  const session = getSession();
  if (!session?.memberId) return null;
  return `${base}_${session.memberId}`;
}

/**
 * Read JSON array/object from namespaced localStorage.
 * Automatically migrates data from old unscoped key on first access.
 */
export function wsLoad<T>(base: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const key = nsKey(base);
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    // Migration: check old unscoped key
    const old = localStorage.getItem(base);
    if (old) {
      localStorage.setItem(key, old);
      localStorage.removeItem(base);
      return JSON.parse(old);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Write JSON data to namespaced localStorage.
 * No-op if not logged in.
 */
export function wsSave(base: string, data: unknown): void {
  const key = nsKey(base);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Read raw string from namespaced localStorage (for counters etc.).
 * Migrates old key automatically.
 */
export function wsLoadRaw(base: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const key = nsKey(base);
  if (!key) return fallback;
  const raw = localStorage.getItem(key);
  if (raw !== null) return raw;
  // Migration
  const old = localStorage.getItem(base);
  if (old !== null) {
    localStorage.setItem(key, old);
    localStorage.removeItem(base);
    return old;
  }
  return fallback;
}

/**
 * Write raw string to namespaced localStorage.
 * No-op if not logged in.
 */
export function wsSaveRaw(base: string, data: string): void {
  const key = nsKey(base);
  if (!key) return;
  localStorage.setItem(key, data);
}
