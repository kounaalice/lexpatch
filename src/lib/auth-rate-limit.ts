/**
 * Login rate limiting — in-memory (same pattern as src/lib/ai.ts usageMap)
 * 5 failed attempts → 15 minute lockout
 * Resets on Worker restart (acceptable for low-traffic site)
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_THRESHOLD = 500;

interface AttemptRecord {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const attemptMap = new Map<string, AttemptRecord>();

function makeKey(identifier: string): string {
  return identifier.toLowerCase().trim();
}

/** Check if a login attempt is allowed */
export function checkLoginAllowed(identifier: string): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const key = makeKey(identifier);
  const record = attemptMap.get(key);
  if (!record) return { allowed: true };

  if (record.lockedUntil) {
    const now = Date.now();
    if (now < record.lockedUntil) {
      return {
        allowed: false,
        retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000),
      };
    }
    // Lockout expired — reset
    attemptMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

/** Record a failed login attempt */
export function recordFailedAttempt(identifier: string): void {
  const key = makeKey(identifier);
  const now = Date.now();
  const record = attemptMap.get(key) ?? { attempts: 0, lockedUntil: null, lastAttempt: 0 };

  record.attempts++;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  attemptMap.set(key, record);
  cleanupIfNeeded();
}

/** Reset attempts on successful login */
export function resetAttempts(identifier: string): void {
  attemptMap.delete(makeKey(identifier));
}

/** Periodic cleanup of stale entries */
function cleanupIfNeeded(): void {
  if (attemptMap.size <= CLEANUP_THRESHOLD) return;
  const now = Date.now();
  const staleThreshold = now - LOCKOUT_MS * 2;
  for (const [key, record] of attemptMap) {
    if (record.lastAttempt < staleThreshold) {
      attemptMap.delete(key);
    }
  }
}
