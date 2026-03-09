import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

interface ComponentStatus {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  components: Record<string, ComponentStatus>;
  version: string;
}

async function checkSupabase(): Promise<ComponentStatus> {
  const start = Date.now();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("laws").select("id").limit(1);
    if (error) throw error;
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (e) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function deriveOverallStatus(
  components: Record<string, ComponentStatus>,
): "healthy" | "degraded" | "unhealthy" {
  const statuses = Object.values(components).map((c) => c.status);
  if (statuses.every((s) => s === "healthy")) return "healthy";
  if (statuses.some((s) => s === "unhealthy")) return "degraded";
  return "degraded";
}

export async function GET() {
  const components: Record<string, ComponentStatus> = {};

  components.supabase = await checkSupabase();

  const response: HealthResponse = {
    status: deriveOverallStatus(components),
    timestamp: new Date().toISOString(),
    components,
    version: process.env.npm_package_version ?? "0.0.0",
  };

  logger.info("Health check", { status: response.status });

  return Response.json(response, {
    status: response.status === "healthy" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
