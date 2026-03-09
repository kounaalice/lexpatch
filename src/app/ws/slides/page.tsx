"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const STORAGE_KEY = "lp_ws_slides";

const PRESETS: Record<string, string> = {
  法改正説明資料: `# 法改正説明資料
## 令和X年 改正概要

---

## 改正の背景
- 社会情勢の変化
- 関連法令との整合性
- 実務上の課題

---

## 主な改正点
1. 第X条の改正
2. 第Y条の新設
3. 附則の整備

---

## 施行スケジュール
- 公布日: YYYY/MM/DD
- 施行日: YYYY/MM/DD

---

## 実務への影響
- 対応が必要な事項
- 経過措置の確認

---

## まとめ・質疑応答`,
  業務手順書: `# 業務手順書
## 作成日: YYYY/MM/DD

---

## 目的
この手順書の目的と対象範囲

---

## 手順1: 準備
- 必要書類の確認
- システムへのログイン

---

## 手順2: 実施
- 具体的な作業手順
- 注意事項

---

## 手順3: 確認・報告
- チェックリスト
- 報告先

---

## 補足・問い合わせ先`,
};

export default function SlidesPage() {
  const [markdown, setMarkdown] = useState("");
  const [presenting, setPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMarkdown(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && markdown) {
      localStorage.setItem(STORAGE_KEY, markdown);
    }
  }, [markdown]);

  const slides = markdown
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!presenting) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((c) => Math.min(c + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentSlide((c) => Math.max(c - 1, 0));
      } else if (e.key === "Escape") {
        setPresenting(false);
      }
    },
    [presenting, slides.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handlePrint() {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const pages = slides
      .map(
        (s, _i) =>
          `<div style="page-break-after:always;padding:3rem;min-height:90vh;display:flex;align-items:center;justify-content:center;"><div style="max-width:700px;width:100%;"><pre style="white-space:pre-wrap;font-family:sans-serif;font-size:1.1rem;line-height:1.8;">${s
            .replace(/</g, "&lt;")
            .replace(
              /^# (.+)$/gm,
              '<h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;">$1</h1>',
            )
            .replace(
              /^## (.+)$/gm,
              '<h2 style="font-size:1.4rem;font-weight:700;margin-bottom:0.3rem;">$1</h2>',
            )
            .replace(/^- (.+)$/gm, '<div style="padding-left:1rem;">- $1</div>')
            .replace(
              /^(\d+\.) (.+)$/gm,
              '<div style="padding-left:1rem;">$1 $2</div>',
            )}</pre></div></div>`,
      )
      .join("");
    printWin.document.write(
      `<html><head><title>Slides</title></head><body style="margin:0;">${pages}</body></html>`,
    );
    printWin.document.close();
    printWin.print();
  }

  function renderSlideContent(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# "))
        return (
          <h1 key={i} style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {line.slice(2)}
          </h1>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            {line.slice(3)}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3 key={i} style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.2rem" }}>
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("- "))
        return (
          <div key={i} style={{ paddingLeft: "1.5rem", fontSize: "1.2rem", lineHeight: 2 }}>
            {line}
          </div>
        );
      if (/^\d+\.\s/.test(line))
        return (
          <div key={i} style={{ paddingLeft: "1.5rem", fontSize: "1.2rem", lineHeight: 2 }}>
            {line}
          </div>
        );
      if (line.trim() === "") return <div key={i} style={{ height: "0.5rem" }} />;
      return (
        <div key={i} style={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
          {line}
        </div>
      );
    });
  }

  if (presenting) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: 800, width: "100%" }}>
            {slides[currentSlide] && renderSlideContent(slides[currentSlide])}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <button
            onClick={() => setCurrentSlide((c) => Math.max(c - 1, 0))}
            disabled={currentSlide === 0}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: currentSlide === 0 ? "default" : "pointer",
              opacity: currentSlide === 0 ? 0.4 : 1,
            }}
          >
            前へ
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide((c) => Math.min(c + 1, slides.length - 1))}
            disabled={currentSlide >= slides.length - 1}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: currentSlide >= slides.length - 1 ? "default" : "pointer",
              opacity: currentSlide >= slides.length - 1 ? 0.4 : 1,
            }}
          >
            次へ
          </button>
          <button
            onClick={() => setPresenting(false)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "1px solid #DC2626",
              color: "#DC2626",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
              marginLeft: "1rem",
            }}
          >
            終了 (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; スライド生成
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>スライド生成</h1>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginRight: "0.5rem",
          }}
        >
          {slides.length}枚
        </span>
        <button
          onClick={() => {
            setCurrentSlide(0);
            setPresenting(true);
          }}
          disabled={slides.length === 0}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          プレゼン開始
        </button>
        <button
          onClick={handlePrint}
          disabled={slides.length === 0}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          印刷
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => setMarkdown(PRESETS[name])}
            style={{
              fontSize: "0.8rem",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => {
            if (confirm("内容をクリアしますか？")) {
              setMarkdown("");
              localStorage.removeItem(STORAGE_KEY);
            }
          }}
          style={{
            fontSize: "0.8rem",
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          クリア
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            Markdown (--- でスライド区切り)
          </p>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={"# タイトル\n\n内容...\n\n---\n\n# 次のスライド"}
            style={{
              width: "100%",
              minHeight: 400,
              padding: "0.75rem",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              resize: "vertical",
              backgroundColor: "var(--color-surface)",
            }}
          />
        </div>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>プレビュー</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {slides.map((s, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentSlide(i);
                  setPresenting(true);
                }}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "1rem",
                  cursor: "pointer",
                  minHeight: 80,
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.3rem",
                  }}
                >
                  Slide {i + 1}
                </div>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                  {s
                    .split("\n")
                    .slice(0, 4)
                    .map((line, li) => {
                      if (line.startsWith("# "))
                        return (
                          <div key={li} style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                            {line.slice(2)}
                          </div>
                        );
                      if (line.startsWith("## "))
                        return (
                          <div key={li} style={{ fontWeight: 700 }}>
                            {line.slice(3)}
                          </div>
                        );
                      return (
                        <div key={li} style={{ color: "var(--color-text-secondary)" }}>
                          {line}
                        </div>
                      );
                    })}
                  {s.split("\n").length > 4 && (
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem" }}>
                      ...
                    </div>
                  )}
                </div>
              </div>
            ))}
            {slides.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  padding: "2rem",
                  border: "1px dashed var(--color-border)",
                  borderRadius: 8,
                }}
              >
                左のエディタにMarkdownを入力してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
