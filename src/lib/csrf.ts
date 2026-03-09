import { uuid } from "./uuid";
/**
 * CSRF protection — Double-submit cookie pattern
 * Compatible with Cloudflare Workers (stateless)
 *
 * Flow:
 * 1. Client reads __csrf cookie (HttpOnly=false so JS can read it)
 * 2. Client sends value in X-CSRF-Token header on POST/PATCH/PUT/DELETE
 * 3. Server compares cookie value with header value
 * CSRF attacks can't read cookies from another origin → values won't match
 */

import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "__csrf";
const CSRF_HEADER = "x-csrf-token";
const CSRF_MAX_AGE = 60 * 60 * 24; // 24 hours

/** Generate a CSRF token */
export function generateCsrfToken(): string {
  return uuid();
}

/** Set CSRF cookie on a response */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // Client JS needs to read this
    secure: true,
    sameSite: "strict",
    maxAge: CSRF_MAX_AGE,
    path: "/",
  });
}

/** Validate CSRF token from request (cookie vs header) */
export function validateCsrf(request: NextRequest): boolean {
  const cookieValue = request.cookies.get(CSRF_COOKIE)?.value;
  const headerValue = request.headers.get(CSRF_HEADER);
  if (!cookieValue || !headerValue) return false;
  return cookieValue === headerValue;
}

/** Get the CSRF cookie name (for client-side reading) */
export const CSRF_COOKIE_NAME = CSRF_COOKIE;
export const CSRF_HEADER_NAME = CSRF_HEADER;
