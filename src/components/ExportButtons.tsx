"use client";

import React from "react";

interface AnnotationEntry {
  lineIndex: number;
  text: string;
}

interface ExportButtonsProps {
  title: string;
  content: string;
  lawTitle?: string;
  lawNum?: string;
  memo?: string;
  annotations?: AnnotationEntry[];
}

export default function ExportButtons({
  title,
  content,
  lawTitle,
  lawNum,
  memo,
  annotations,
}: ExportButtonsProps) {
  const buttonBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text-secondary)",
    cursor: "pointer",
    lineHeight: 1.4,
    transition: "border-color 0.15s ease",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = "var(--color-accent)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = "var(--color-border)";
  };

  const buildMarkdown = (): string => {
    const date = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const subtitle = [lawTitle, lawNum].filter(Boolean).join(" ");
    const lines = [`# ${title}`];
    if (subtitle) lines.push(subtitle);
    lines.push("", "---", "", content);

    // メモ・注釈を追加
    if (memo?.trim()) {
      lines.push("", "---", "", "## メモ", "", memo.trim());
    }
    if (annotations && annotations.length > 0) {
      lines.push("", "---", "", "## 注釈");
      for (const a of annotations) {
        lines.push(`- **行 ${a.lineIndex + 1}**: ${a.text}`);
      }
    }

    lines.push("", "---");
    lines.push(`*LexCard (https://lexcard.jp) からエクスポート*`);
    lines.push(`*${date}*`);
    return lines.join("\n");
  };

  const handleExportMd = () => {
    const md = buildMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const date = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const subtitle = [lawTitle, lawNum].filter(Boolean).join(" ");
    const escaped = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${escaped(title)}</title>
<style>
  @page { margin: 20mm; }
  body {
    font-family: "Hiragino Mincho ProN", "BIZ UDMincho", "Yu Mincho", serif;
    font-size: 11pt;
    line-height: 1.8;
    color: #1a1a1a;
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1 {
    font-size: 16pt;
    margin-bottom: 0.2em;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.3em;
  }
  .subtitle {
    font-size: 10pt;
    color: #666;
    margin-bottom: 1.5em;
  }
  .content {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 1.5em 0;
  }
  .footer {
    font-size: 8pt;
    color: #999;
    margin-top: 2em;
    text-align: right;
  }
</style>
</head>
<body>
  <h1>${escaped(title)}</h1>
  ${subtitle ? `<div class="subtitle">${escaped(subtitle)}</div>` : ""}
  <div class="content">${escaped(content)}</div>
  ${memo?.trim() ? `<hr><h2 style="font-size:13pt;margin-bottom:0.5em">メモ</h2><div class="content">${escaped(memo.trim())}</div>` : ""}
  ${annotations && annotations.length > 0 ? `<hr><h2 style="font-size:13pt;margin-bottom:0.5em">注釈</h2><ul>${annotations.map((a) => `<li><strong>行 ${a.lineIndex + 1}:</strong> ${escaped(a.text)}</li>`).join("")}</ul>` : ""}
  <hr>
  <div class="footer">
    LexCard (https://lexcard.jp) からエクスポート<br>
    ${escaped(date)}
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    // Wait for fonts/layout to settle, then trigger print
    setTimeout(() => {
      win.print();
    }, 400);
  };

  return (
    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
      <button
        type="button"
        style={buttonBase}
        onClick={handleExportMd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Markdownでエクスポート"
      >
        MD
      </button>
      <button
        type="button"
        style={buttonBase}
        onClick={handleExportPdf}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="PDFでエクスポート"
      >
        PDF
      </button>
    </div>
  );
}
