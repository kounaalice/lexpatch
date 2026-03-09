// Client-side session management (localStorage)
// Used by all "use client" components

const SESSION_KEY = "lp_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Session {
  memberId: string;
  name: string;
  org: string;
  orgType: string;
  role: string;
  token: string;
  avatarUrl?: string;
  authProvider?: string; // 'local' | 'google' | 'microsoft'
  email?: string;
}

/**
 * Check if a new-format token (nonce:timestamp:hash) is expired.
 * Legacy tokens (plain hash) return false — they never expire client-side
 * (server-side will still accept them for backward compat period).
 */
function isTokenExpired(token: string): boolean {
  const parts = token.split(":");
  if (parts.length !== 3) return false; // Legacy format — don't expire client-side
  const ts = parseInt(parts[1], 36);
  if (isNaN(ts)) return true; // Malformed — treat as expired
  return Date.now() - ts > SESSION_MAX_AGE_MS;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.memberId && parsed?.name && parsed?.token) {
      // Auto-logout if session expired
      if (isTokenExpired(parsed.token)) {
        logout();
        return null;
      }
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function login(data: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  // Also update legacy owner name for backwards compatibility
  localStorage.setItem("lp_project_owner", data.name);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
