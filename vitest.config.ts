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
        // データ定義のみのファイル (テスト対象外)
        "src/lib/w100-data.ts",
        "src/lib/w100-topics.ts",
        "src/lib/w100-types.ts",
        "src/lib/w100-usecases.ts",
        "src/lib/w100-prompts.ts",
        "src/lib/situations.ts",
        "src/lib/law-category-map.ts",
        "src/lib/municipalities.ts",
        "src/lib/ndl-law-index.ts",
        "src/lib/prefectures.ts",
        "src/lib/checklist-templates.ts",
        "src/lib/precedent/**",
        "src/lib/egov/client.ts",
        "src/lib/egov/format.ts",
        "src/lib/egov/types.ts",
        "src/lib/ical.ts",
        "src/lib/canon.ts",
        "src/lib/law-alerts.ts",
        "src/lib/deadline-reminders.ts",
        "src/lib/attachments.ts",
        "src/lib/meeting-minutes.ts",
        // ブラウザ環境依存 (localStorage/window)
        "src/lib/annotations.ts",
        "src/lib/bookmarks.ts",
        "src/lib/follows.ts",
        "src/lib/history.ts",
        "src/lib/notes.ts",
        "src/lib/session.ts",
        "src/lib/settings.ts",
        "src/lib/csrf.ts",
        "src/lib/auth-rate-limit.ts",
        // データ定義
        "src/lib/categories.ts",
        "src/lib/ministries.ts",
        "src/lib/law-names.ts",
        "src/lib/w100-uu-samples.ts",
        // UI重いモジュール / ブラウザ環境依存
        "src/lib/gaming.ts",
        "src/lib/cards.ts",
        "src/lib/web-vitals.ts",
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
