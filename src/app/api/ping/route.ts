// Lightweight connectivity check — used by OfflineIndicator
export function GET() {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
