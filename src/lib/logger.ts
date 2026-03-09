/**
 * 構造化ログユーティリティ — Cloudflare Workers 互換
 *
 * JSON形式のログを console.log/warn/error に出力。
 * CF Workers ではこれらが自動的に Workers Logs に記録される。
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "production") return;
    console.log(formatEntry("debug", message, context));
  },

  info(message: string, context?: Record<string, unknown>): void {
    console.log(formatEntry("info", message, context));
  },

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(formatEntry("warn", message, context));
  },

  error(message: string, context?: Record<string, unknown>): void {
    console.error(formatEntry("error", message, context));
  },
};
