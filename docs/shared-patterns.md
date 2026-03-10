# HIME Systems Shared Engineering Patterns

Cross-project pattern reference for LexCard, HIME AI, and tapitapitrip.
Each pattern documents the canonical implementation, env vars, and per-project status.

---

## 1. Authentication

### LexCard (canonical)

Two-layer auth: custom token system (primary) + Supabase Auth (OAuth/magic link).

**Session storage:** `localStorage` key `lp_session`

```typescript
interface Session {
  memberId: string;
  name: string;
  org: string;
  orgType: string;
  role: "member" | "moderator" | "admin";
  token: string;
  avatarUrl?: string;
  authProvider?: "local" | "google" | "microsoft";
  email?: string;
}
```

**API auth header:** `Authorization: Bearer {memberId}:{token}`

**Token formats (both accepted):**

| Format | Structure | Expiry |
|--------|-----------|--------|
| New | `{nonce}:{timestamp_base36}:{sha256_hex}` | 30 days |
| Legacy | plain SHA256 hex | None |

Hash: `SHA256(memberId:nonce:timestamp:SESSION_SECRET)`

**Password hash formats (auto-upgraded):**

| Format | Structure | Iterations |
|--------|-----------|------------|
| New (PBKDF2) | `pbkdf2:100000:{saltHex}:{derivedHex}` | 100K |
| Legacy | `{uuid_salt}:{sha256hex}` | 1 |

`needsRehash()` detects legacy format; upgrade happens on next login.

**Server-side verification pattern:**

```typescript
const auth = request.headers.get("authorization")?.replace("Bearer ", "");
const sep = auth.indexOf(":");
const memberId = auth.slice(0, sep);
const token = auth.slice(sep + 1);
const valid = await verifySessionToken(memberId, token);
```

**OAuth flow:** Supabase `exchangeCodeForSession` -> find/create `member_profiles` -> `generateSessionToken` -> short-lived cookie (`__oauth_session`, 60s) -> `/auth/establish` reads cookie into localStorage.

**Files:** `src/lib/crypto.ts`, `src/lib/session.ts`, `src/app/auth/callback/route.ts`, `src/lib/auth-rate-limit.ts`

### HIME AI

Phase 1 only: client-side UUID in `localStorage` (`hime_user_id`), sent as `x-user-id` header. No server-side verification.

### tapitapitrip

Admin-only HMAC-SHA256 cookie auth. `createAdminToken(password)` -> `timestamp:hmac_hex` (24h TTL). HttpOnly + Secure + SameSite=strict cookie `admin_session`. No public user accounts.

**File:** `src/lib/admin-auth.ts`

**Env:** `ADMIN_PASSWORD`

---

## 2. Supabase Client

### Pattern (all projects)

Two server clients, never import the browser client in server code.

```typescript
// Admin — bypasses RLS, API routes only
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// SSR user — respects RLS, reads/writes cookies
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options));
        } catch {} // Server Components are read-only
      },
    },
  });
}
```

**Env vars:**

| Variable | Scope | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | All projects |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | All projects |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | LexCard, HIME |

**Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`

---

## 3. Structured Logger

### Pattern (LexCard, HIME)

JSON logging to stdout/stderr. Cloudflare Workers captures `console.*` automatically.

```typescript
export const logger = {
  debug(message: string, context?: Record<string, unknown>) { /* suppressed in production */ },
  info(message: string, context?: Record<string, unknown>)  { console.log(formatEntry(...)); },
  warn(message: string, context?: Record<string, unknown>)  { console.warn(formatEntry(...)); },
  error(message: string, context?: Record<string, unknown>) { console.error(formatEntry(...)); },
};
```

**Output format:**

```json
{"timestamp":"2026-03-10T12:00:00.000Z","level":"info","message":"...", "context":{...}}
```

`context` omitted if empty. `debug` suppressed when `NODE_ENV=production`.

**Usage:**

```typescript
import { logger } from "@/lib/logger";
logger.info("[oauth] Exchange failed", { error: authError?.message });
```

**File:** `src/lib/logger.ts`

### tapitapitrip

Missing. Uses raw `console.log/error` with ad-hoc prefix strings. Should adopt this pattern.

---

## 4. Health Check

### Pattern (all projects)

```typescript
// GET /api/health
interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  components: Record<string, {
    status: "healthy" | "degraded" | "unhealthy";
    latencyMs?: number;
    error?: string;
  }>;
  version: string;
}
```

**HTTP status:** 200 if healthy, 503 otherwise. `Cache-Control: no-store`.

**Component checks:**

| Project | Components checked |
|---------|-------------------|
| LexCard | Supabase (`SELECT id FROM laws LIMIT 1`) |
| HIME | Supabase (similar ping query) |
| tapitapitrip | Supabase (similar, no `version` field) |

**Aggregation:** All healthy -> `"healthy"`. Any unhealthy -> `"degraded"`.

**File:** `src/app/api/health/route.ts`

---

## 5. Error Reporting (Client-Side)

### LexCard (canonical)

Client errors batched and sent to `/api/error-report`.

**Features:**
- In-memory queue with deduplication (message + url)
- Batch flush every 10 seconds
- Rate limit: max 5 reports/minute
- Offline-aware: holds queue when `!navigator.onLine`
- Stack traces truncated at 2048 chars

```typescript
// Install once:
installGlobalErrorHandlers(); // hooks window.error + unhandledrejection

// Manual report:
reportError(error, { digest: "...", url: "..." });
```

**Server side:** Validates with Zod, calls `notifyAdminError()` which rate-limits to 1 email per 10 minutes per path.

**Files:** `src/lib/error-reporter.ts`, `src/app/api/error-report/route.ts`

### HIME, tapitapitrip

Missing. Should adopt this pattern.

---

## 6. API Validation (Zod)

### LexCard (canonical)

All API routes use `validateRequest()` for input validation.

```typescript
export async function validateRequest<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: Response }>
```

**Usage:**

```typescript
const result = await validateRequest(req, errorReportSchema);
if (!result.success) return result.error;  // early return (400 with details)
const data = result.data;                  // fully typed
```

**Error response shape:**

```json
{
  "error": "Validation failed",
  "details": [{ "path": "email", "message": "Invalid email" }]
}
```

**Reusable primitives:** `email`, `safeString(max)`, `uuid`

**File:** `src/lib/validation.ts`

### HIME, tapitapitrip

No Zod validation. API routes use manual type assertions. Should adopt this pattern for any route accepting user input.

---

## 7. API Response Helpers

### LexCard (canonical)

```typescript
apiSuccess<T>(data: T, status = 200)     // { ok: true, data }
apiError(message, status = 400, details?) // { ok: false, error, details? }
apiNotFound(message?)                     // 404
apiUnauthorized(message?)                 // 401
apiForbidden(message?)                    // 403
apiRateLimit(retryAfterSec = 60)          // 429 + Retry-After header
```

**File:** `src/lib/api-utils.ts`

Note: Many older routes still use `NextResponse.json()` directly. New routes should prefer these helpers.

---

## 8. Security Headers

### Pattern (all projects)

Applied in `src/middleware.ts` via `setSecurityHeaders()`.

**Standard headers (all projects):**

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**LexCard additional headers:**

```
Cross-Origin-Opener-Policy: same-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://laws.e-gov.go.jp https://*.supabase.co;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**Middleware matcher:** Excludes `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, `manifest.json`, image extensions.

**LexCard middleware also handles:**
- Domain canonicalization (301 redirects from www/legacy domains)
- CSRF cookie issuance (`__csrf` double-submit cookie)
- Public route bypass for Supabase auth (skips `getUser()` on public paths)

**tapitapitrip middleware additionally:**
- `next-intl` i18n routing (ja/en/zh/ko, `localePrefix: "as-needed"`)

---

## 9. Build & Deploy (Cloudflare Workers)

### Pattern (LexCard, HIME)

Custom `scripts/build.mjs` wraps `next build` to fix Next.js 15.5+ / Turbopack bugs.

**Deploy sequence:**

```bash
# 1. Stop dev server first (prevents .next corruption)
# 2. Clean build artifacts
rm -rf .next .open-next
# 3. Build for Cloudflare
npm run build:cf     # opennextjs-cloudflare build
# 4. Deploy
npm run deploy:cf    # opennextjs-cloudflare deploy (or wrangler deploy)
```

**NEVER:** `npm run build` alone + `npx wrangler deploy` — deploys stale assets.

**Build script fixes:**

| Problem | Fix |
|---------|-----|
| Race condition: `pages-manifest.json` ENOENT | `NEXT_PRIVATE_WORKER_THREADS=false` |
| App Router-only: missing `pages-manifest.json` | Pre-creates `{}` in `.next/server/` |
| Turbopack `_error/_app` stubs | Deletes broken `.js` stubs |
| `/_error` module resolution | Checks for `build-manifest.json` and continues |

**Critical:** Never use `export const runtime = "edge"` — `opennextjs-cloudflare` handles Workers runtime.

**Wrangler config shape:**

```jsonc
{
  "name": "project-name",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "r2_buckets": [
    { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "project-cache" }
  ]
}
```

### tapitapitrip

Uses `next build --turbopack` directly (no custom build script). Susceptible to the same race conditions. Should adopt `scripts/build.mjs`.

---

## 10. Rate Limiting

### Login (LexCard)

In-memory `Map<string, AttemptRecord>`. Resets on Worker restart (acceptable for low-traffic).

- Key: email or `name:org` (normalized)
- Threshold: 5 failed attempts -> 15-minute lockout
- Cleanup: entries >30min old, triggered when map >500

```typescript
checkLoginAllowed(identifier): { allowed: boolean; retryAfterSec?: number }
recordFailedAttempt(identifier): void
resetAttempts(identifier): void
```

**File:** `src/lib/auth-rate-limit.ts`

### Admin error notifications (LexCard)

Same-path throttle: 1 email per 10 minutes per path. Map capped at 100 entries.

**File:** `src/lib/mail.ts` (inline)

---

## 11. Email / Notifications

### LexCard (canonical)

Transport: Resend API via `fetch`. CF Workers compatible (env vars read inside functions, not at module load).

**Env vars:**

| Variable | Default |
|----------|---------|
| `RESEND_API_KEY` | (required, mail silently skipped if unset) |
| `MAIL_FROM` | `LexCard <noreply@lexcard.jp>` |
| `ADMIN_EMAIL` | `kou551sei@gmail.com` |

**HTML template system:**

```typescript
emailHeader(title)        // Navy bar (#0C2340)
emailFooter()             // Branding + unsubscribe
emailCta(href, label)     // Blue CTA button (#0369A1)
emailContent(title, body) // Light-blue content box
escHtml(s)                // HTML-escape user strings
```

**Send functions:**

| Function | Purpose |
|----------|---------|
| `notifyAdminContact` | New inquiry to admin |
| `autoReplyContact` | Auto-reply to sender |
| `notifyAdminError` | Page error alert (rate-limited) |
| `sendPasswordResetEmail` | Reset link (1h expiry) |
| `sendEmailVerificationEmail` | Verify link (24h expiry) |
| `sendNotificationEmail` | Project announcement |
| `sendTaskAlertEmail` | Task assigned/completed/due/overdue |
| `sendMessageAlertEmail` | New project/community message |
| `sendLawAlertEmail` | Law promulgation/enforcement |
| `sendLawDigestEmail` | Weekly law digest |

**Notification preferences** (stored as JSONB in `member_profiles`):

5 categories: `project_notifications`, `task_alerts`, `message_alerts`, `law_promulgation`, `law_enforcement`.

Default: all disabled. `mergePrefs(saved)` deep-merges partial data with defaults.

**File:** `src/lib/mail.ts`, `src/lib/notification-prefs.ts`

---

## 12. CSRF Protection

### LexCard

Double-submit cookie pattern. Stateless, CF Workers compatible.

- Cookie: `__csrf` (HttpOnly=false, 24h, SameSite=strict)
- Client reads cookie, sends value in `x-csrf-token` header
- Server validates match via `validateCsrf(request)`
- Middleware issues cookie on first request if missing

**File:** `src/lib/csrf.ts`

---

## Env Vars Reference

| Variable | LexCard | HIME | tapitapitrip | Notes |
|----------|---------|------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Required | Required | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Required | Required | |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Required | - | Server-only |
| `SESSION_SECRET` | Required | - | - | Signs tokens |
| `RESEND_API_KEY` | Required | - | - | Email |
| `MAIL_FROM` | Optional | - | - | Default: `noreply@lexcard.jp` |
| `ADMIN_EMAIL` | Optional | - | - | Default: `kou551sei@gmail.com` |
| `ADMIN_PASSWORD` | - | - | Required | Admin login |

---

## Cross-Project Gap Analysis

| Pattern | LexCard | HIME | tapitapitrip | Priority |
|---------|---------|------|--------------|----------|
| Structured logger | Yes | Yes | **Missing** | P1 |
| Health check | Yes | Yes | Yes (no version) | Done |
| Error reporter | Yes | **Missing** | **Missing** | P2 |
| Zod validation | Yes | **Missing** | **Missing** | P1 |
| API response helpers | Yes | **Missing** | **Missing** | P2 |
| Custom build script | Yes | Yes | **Missing** | P0 |
| Security headers | Full (CSP+COOP) | Basic (6 headers) | Basic (6 headers) | P1 |
| CSRF protection | Yes | **Missing** | **Missing** | P2 |
| Rate limiting | Yes (login) | **Missing** | **Missing** | P2 |
| Tests | 458 tests | Partial | **None** | P0 |

**Recommended adoption order for HIME/tapitapitrip:**
1. Custom build script (`scripts/build.mjs`) — prevents intermittent build failures
2. Structured logger — enables Workers Logs filtering
3. Zod validation — prevents invalid data from reaching DB
4. CSP + security headers — production security baseline
5. Error reporter — visibility into client-side failures
