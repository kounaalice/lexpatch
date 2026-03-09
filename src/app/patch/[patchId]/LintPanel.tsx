"use client";

import { useState } from "react";

interface LintResult {
  severity: "error" | "warn" | "info" | "pass";
  rule_name: string;
  message: string;
  target_line: string | null;
}

const SEVERITY_STYLE: Record<string, { icon: string; fg: string; bg: string }> = {
  error: { icon: "!", fg: "#DC2626", bg: "#FEF2F2" },
  warn: { icon: "?", fg: "#D97706", bg: "#FFFBEB" },
  info: { icon: "i", fg: "#0369A1", bg: "#EBF2FD" },
  pass: { icon: "✓", fg: "#059669", bg: "#ECFDF5" },
};

export function LintPanel({ patchId }: { patchId: string }) {
  const [results, setResults] = useState<LintResult[] | null>(null);
  const [running, setRunning] = useState(false);

  async function runLint() {
    setRunning(true);
    try {
      const res = await fetch("/api/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch_id: patchId }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setRunning(false);
    }
  }

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          Lint チェック
        </h3>
        <button
          onClick={() => setShowHelp((v) => !v)}
          title="Lintチェックとは？"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            fontWeight: 700,
            width: "1.2rem",
            height: "1.2rem",
            borderRadius: "50%",
            border: "1px solid var(--color-text-secondary)",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
          }}
        >
          ?
        </button>
        <button
          onClick={runLint}
          disabled={running}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "4px",
            backgroundColor: running ? "var(--color-border)" : "var(--color-accent)",
            color: "#fff",
            border: "none",
            cursor: running ? "default" : "pointer",
          }}
        >
          {running ? "検証中…" : results ? "再検証" : "検証する"}
        </button>
      </div>

      {showHelp && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
            lineHeight: 1.7,
          }}
        >
          <strong>Lint チェック</strong>
          は、改正案（パッチ）の形式が正しいかを自動検証する機能です。以下のルールでチェックします。
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            <li>
              <b>target-article</b> — 対象条文（第○条）が指定されているか
            </li>
            <li>
              <b>no-changes</b> — 追加・削除行が存在するか（変更なしの検出）
            </li>
            <li>
              <b>empty-patch</b> — パッチ内容が空でないか
            </li>
            <li>
              <b>duplicate-num</b> — 同じ項番号の追加行が重複していないか
            </li>
            <li>
              <b>para-num-gap</b> — 項番号が連番になっているか（繰り下げ漏れ検出）
            </li>
            <li>
              <b>text-too-long</b> — パッチテキストが推奨文字数以内か
            </li>
          </ul>
        </div>
      )}

      {results && (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {results.map((r, i) => {
            const s = SEVERITY_STYLE[r.severity] ?? SEVERITY_STYLE.info;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  padding: "0.55rem 1rem",
                  borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
                  backgroundColor: s.bg,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    width: "1.4rem",
                    height: "1.4rem",
                    borderRadius: "50%",
                    backgroundColor: s.fg,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "0.1rem",
                  }}
                >
                  {s.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.84rem",
                      color: "var(--color-text-primary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {r.message}
                  </div>
                  {r.target_line && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "var(--color-text-secondary)",
                        marginTop: "0.2rem",
                        backgroundColor: "var(--color-bg)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        display: "inline-block",
                      }}
                    >
                      {r.target_line}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.rule_name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
