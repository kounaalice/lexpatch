import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/supabase/**",
        "src/lib/ws-*.ts",
        "src/lib/ai.ts",
        "src/lib/ai-*.ts",
        "src/lib/vectorize.ts",
        "src/lib/mail.ts",
        "src/lib/notification-prefs.ts",
      ],
      thresholds: {
        lines: 60,
        branches: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
