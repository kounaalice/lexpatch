import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;

  // www.lexcard.jp → lexcard.jp / 旧ドメイン → lexcard.jp 301 リダイレクト
  if (
    hostname === "www.lexcard.jp" ||
    hostname === "lexpatch.tapitapitrip.jp" ||
    hostname === "lexpatch.kou551sei.workers.dev"
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "lexcard.jp";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // Supabase 未設定時はスキップ
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const response = NextResponse.next({ request });
    setSecurityHeaders(response);
    ensureCsrfCookie(request, response);
    return response;
  }

  // パブリックルート（認証不要）では Supabase getUser() をスキップし CPU/wall-clock を節約
  const { pathname } = request.nextUrl;
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/law/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/guide") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/en") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/prefectures") ||
    pathname.startsWith("/api/egov/") ||
    pathname.startsWith("/api/news") ||
    // Auth-related public routes
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/establish") ||
    pathname === "/reset-password" ||
    pathname.startsWith("/api/auth/");

  if (isPublicRoute) {
    const response = NextResponse.next({ request });
    setSecurityHeaders(response);
    ensureCsrfCookie(request, response);
    return response;
  }

  const response = await updateSession(request);
  setSecurityHeaders(response);
  ensureCsrfCookie(request, response);
  return response;
}

/** セキュリティヘッダーを付与（費用増なし） */
function setSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // CSP: unsafe-inline はテーマ/SW初期化スクリプトに必要（将来的にnonce化）
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://laws.e-gov.go.jp https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
}

/** CSRF cookie をまだ持っていなければ発行 (Double-submit pattern) */
function ensureCsrfCookie(request: NextRequest, response: NextResponse) {
  const existing = request.cookies.get("__csrf");
  if (!existing) {
    setCsrfCookie(response, generateCsrfToken());
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icon-.*\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
