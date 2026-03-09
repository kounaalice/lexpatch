import { NextRequest, NextResponse } from "next/server";
import { notifyAdminError } from "@/lib/mail";
import { validateRequest, errorReportSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const result = await validateRequest(req, errorReportSchema);
    if (!result.success) return result.error;
    const data = result.data;

    const sent = await notifyAdminError({
      path: data.url ?? "unknown",
      error: data.message,
      userAgent: data.userAgent,
    });

    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    logger.error("[error-report] API error", { error: e });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
