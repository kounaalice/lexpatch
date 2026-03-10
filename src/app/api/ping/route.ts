import { NextResponse } from "next/server";

const headers = { "Cache-Control": "no-store" };

export function HEAD() {
  return new NextResponse(null, { status: 204, headers });
}

export function GET() {
  return new NextResponse(null, { status: 204, headers });
}
