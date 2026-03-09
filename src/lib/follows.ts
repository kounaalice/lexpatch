// ── Follow helpers (lp_follows) ──────────────────────
// Dual-mode: DB when logged in, localStorage when anonymous.

import { getSession } from "./session";
import { addActivityPoints } from "./gaming";

export interface FollowEntry {
  type: "law" | "project";
  id: string;
  title: string;
  followedAt: string;
}

const FOLLOWS_KEY = "lp_follows";

function loadLocal(): FollowEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FOLLOWS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocal(entries: FollowEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

// ---------- Public API (localStorage fallback) ----------

export function getFollows(): FollowEntry[] {
  return loadLocal();
}

export function isFollowing(type: "law" | "project", id: string): boolean {
  return loadLocal().some((e) => e.type === type && e.id === id);
}

export function toggleFollow(type: "law" | "project", id: string, title: string): boolean {
  const entries = loadLocal();
  const idx = entries.findIndex((e) => e.type === type && e.id === id);
  if (idx >= 0) {
    entries.splice(idx, 1);
    saveLocal(entries);
    return false; // unfollowed
  } else {
    entries.unshift({ type, id, title, followedAt: new Date().toISOString() });
    saveLocal(entries);
    addActivityPoints("follow", title);
    return true; // followed
  }
}

export function getFollowedIds(type: "law" | "project"): Set<string> {
  return new Set(
    loadLocal()
      .filter((e) => e.type === type)
      .map((e) => e.id),
  );
}

// ---------- DB-backed API (when logged in) ----------

export async function getFollowsDB(): Promise<FollowEntry[]> {
  const session = getSession();
  if (!session) return loadLocal();
  try {
    const res = await fetch(`/api/members/follows?member_id=${session.memberId}`);
    if (!res.ok) return loadLocal();
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((d: any) => ({
      type: d.target_type as "law" | "project",
      id: d.target_id,
      title: d.target_title ?? "",
      followedAt: d.created_at ?? new Date().toISOString(),
    }));
  } catch {
    return loadLocal();
  }
}

export async function isFollowingDB(type: "law" | "project", id: string): Promise<boolean> {
  const session = getSession();
  if (!session) return isFollowing(type, id);
  const follows = await getFollowsDB();
  return follows.some((e) => e.type === type && e.id === id);
}

export async function toggleFollowDB(
  type: "law" | "project",
  id: string,
  title: string,
): Promise<boolean> {
  const session = getSession();
  if (!session) return toggleFollow(type, id, title);

  const follows = await getFollowsDB();
  const existing = follows.find((e) => e.type === type && e.id === id);

  if (existing) {
    // Unfollow
    await fetch(
      `/api/members/follows?member_id=${session.memberId}&target_type=${type}&target_id=${id}`,
      {
        method: "DELETE",
      },
    );
    // Also remove from localStorage
    toggleFollow(type, id, title);
    return false;
  } else {
    // Follow
    await fetch("/api/members/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: session.memberId,
        target_type: type,
        target_id: id,
        target_title: title,
      }),
    });
    // Also add to localStorage
    toggleFollow(type, id, title);
    return true;
  }
}
