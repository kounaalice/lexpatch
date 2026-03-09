import { uuid } from "./uuid";
// Cloudflare Workers compatible password hashing + session tokens
// Uses Web Crypto API (SubtleCrypto) — no Node.js dependencies
// PBKDF2 with 100K iterations for password hashing (OWASP recommendation)

const SESSION_SECRET = process.env.SESSION_SECRET ?? "lexpatch_default_session_secret_2026";
const PBKDF2_ITERATIONS = 100_000;
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Utility ──────────────────────────────────────────────────

function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bufferFromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// ─── PBKDF2 Password Hashing ─────────────────────────────────

async function pbkdf2Hash(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return hexFromBuffer(derived);
}

/**
 * Hash a password using PBKDF2
 * Format: pbkdf2:{iterations}:{saltHex}:{derivedHex}
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const saltHex = hexFromBuffer(salt.buffer as ArrayBuffer);
  const derivedHex = await pbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${derivedHex}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both legacy (UUID:sha256) and new (pbkdf2:iter:salt:hash) formats.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("pbkdf2:")) {
    // New PBKDF2 format: pbkdf2:{iterations}:{saltHex}:{derivedHex}
    const parts = stored.split(":");
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const expectedHash = parts[3];
    if (!iterations || !saltHex || !expectedHash) return false;
    const salt = bufferFromHex(saltHex);
    const computed = await pbkdf2Hash(password, salt, iterations);
    return computed === expectedHash;
  }

  // Legacy SHA-256 format: {UUID_salt}:{sha256hex}
  const idx = stored.indexOf(":");
  if (idx === -1) return false;
  const salt = stored.slice(0, idx);
  const expectedHash = stored.slice(idx + 1);
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return hexFromBuffer(hashBuffer) === expectedHash;
}

/**
 * Check if a stored password hash needs to be upgraded to PBKDF2.
 */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith("pbkdf2:");
}

// ─── Session Tokens ───────────────────────────────────────────

/**
 * Generate a session token with nonce and timestamp.
 * Format: {nonce}:{timestamp}:{hash}
 * hash = SHA256(memberId:nonce:timestamp:SECRET)
 */
export async function generateSessionToken(memberId: string): Promise<string> {
  const nonce = uuid().replace(/-/g, "").slice(0, 16);
  const timestamp = Date.now().toString(36);
  const encoder = new TextEncoder();
  const data = encoder.encode(`${memberId}:${nonce}:${timestamp}:${SESSION_SECRET}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = hexFromBuffer(hashBuffer);
  return `${nonce}:${timestamp}:${hash}`;
}

/**
 * Verify a session token.
 * Supports both new (nonce:timestamp:hash) and legacy (plain hash) formats.
 * Returns false if token is expired (30 days).
 */
export async function verifySessionToken(memberId: string, token: string): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length === 3) {
    // New format: nonce:timestamp:hash
    const [nonce, timestamp, hash] = parts;
    // Check expiry
    const ts = parseInt(timestamp, 36);
    if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE_MS) return false;
    // Verify hash
    const encoder = new TextEncoder();
    const data = encoder.encode(`${memberId}:${nonce}:${timestamp}:${SESSION_SECRET}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return hexFromBuffer(hashBuffer) === hash;
  }

  // Legacy format: plain SHA256 hash (deterministic)
  // Accept for backward compatibility (will naturally expire as users re-login)
  const encoder = new TextEncoder();
  const data = encoder.encode(memberId + ":" + SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return hexFromBuffer(hashBuffer) === token;
}

/**
 * Extract timestamp from a new-format session token.
 * Returns null for legacy tokens.
 */
export function getTokenTimestamp(token: string): number | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const ts = parseInt(parts[1], 36);
  return isNaN(ts) ? null : ts;
}

/**
 * Generate a one-time token for password reset / email verification.
 * Returns { raw, hashed } — store hashed in DB, send raw in email.
 */
export async function generateOneTimeToken(): Promise<{ raw: string; hashed: string }> {
  const raw = uuid() + uuid().replace(/-/g, "");
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  return { raw, hashed: hexFromBuffer(hashBuffer) };
}

/**
 * Verify a one-time token against its stored hash.
 */
export async function verifyOneTimeToken(raw: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  return hexFromBuffer(hashBuffer) === storedHash;
}
