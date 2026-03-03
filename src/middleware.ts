import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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
    return NextResponse.next({ request });
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
    pathname.startsWith("/api/news");

  if (isPublicRoute) {
    return NextResponse.next({ request });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
