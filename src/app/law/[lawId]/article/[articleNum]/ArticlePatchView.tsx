"use client";

import { useState, useMemo } from "react";
import type { CanonLine } from "@/lib/patch/apply";
import { parsePatch } from "@/lib/patch/parser";
import { applyPatch } from "@/lib/patch/apply";
import { unifiedDiff, sideBySideDiff } from "@/lib/patch/diff";

type ViewMode = "unified" | "sidebyside" | "patch" | "new";
type SourceTier = "一次" | "準一次" | "二次" | "三次";

interface Source {
  tier: SourceTier;
  label: string;
  url: string;
  excerpt: string;
}

interface Props {
  canonLines: CanonLine[];
  initialPatchText: string;
  articleTitle: string;
  lawId?: string;
}

const TIER_COLORS: Record<SourceTier, { fg: string; bg: string }> = {
  "一次":   { fg: "var(--color-accent)",   bg: "var(--color-add-bg)" },
  "準一次": { fg: "#1B4B8A",               bg: "#EBF2FD" },
  "二次":   { fg: "var(--color-warn-fg)",  bg: "var(--color-warn-bg)" },
  "三次":   { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
};

export function ArticlePatchView({ canonLines, initialPatchText, articleTitle, lawId }: Props) {
  const [patchText, setPatchText]   = useState(initialPatchText);
  const [mode, setMode]             = useState<ViewMode>("unified");
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [sources, setSources]       = useState<Source[]>([]);
  const [saving, setSaving]         = useState(false);
  const [savedId, setSavedId]       = useState<string | null>(null);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [showSavePanel, setShowSavePanel] = useState(false);

  const { patch, newLines, unified, sideBySide } = useMemo(() => {
    const patch    = parsePatch(patchText, articleTitle);
    const newLines = applyPatch(canonLines, patch);
    const unified  = unifiedDiff(canonLines, newLines);
    const sideBySide = sideBySideDiff(canonLines, newLines);
    return { patch, newLines, unified, sideBySide };
  }, [patchText, canonLines, articleTitle]);

  const hasChanges = unified.stats.added > 0 || unified.stats.deleted > 0;

  // 根拠カード追加
  function addSource() {
    setSources((prev) => [...prev, { tier: "二次", label: "", url: "", excerpt: "" }]);
  }
  function updateSource(i: number, key: keyof Source, value: string) {
    setSources((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s));
  }
  function removeSource(i: number) {
    setSources((prev) => prev.filter((_, idx) => idx !== i));
  }

  // パッチ保存
  async function handleSave() {
    if (!title.trim()) { setSaveError("タイトルを入力してください"); return; }
    if (!hasChanges)   { setSaveError("変更がありません"); return; }
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch("/api/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          plain_text: patchText,
          description,
          target_articles: [articleTitle],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存エラー");
      setSavedId(data.id);
      setShowSavePanel(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>

      {/* 統計バッジ + 保存ボタン */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          {hasChanges ? (
            <>
              <span style={{ color: "var(--color-add-fg)", backgroundColor: "var(--color-add-bg)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>+{unified.stats.added}</span>
              <span style={{ color: "var(--color-del-fg)", backgroundColor: "var(--color-del-bg)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>-{unified.stats.deleted}</span>
              <span style={{ color: "var(--color-text-secondary)", padding: "0.15rem 0.5rem" }}>{unified.stats.unchanged} 行変更なし</span>
            </>
          ) : (
            <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>変更なし — 行頭に + または - を付けて改正案を作成</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {savedId && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-add-fg)" }}>
              ✓ 保存済み
            </span>
          )}
          <button
            onClick={() => setShowSavePanel((v) => !v)}
            disabled={!hasChanges}
            style={{
              padding: "0.45rem 1rem",
              backgroundColor: hasChanges ? "var(--color-accent)" : "var(--color-border)",
              color: hasChanges ? "#fff" : "var(--color-text-secondary)",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              cursor: hasChanges ? "pointer" : "not-allowed",
            }}
          >
            {showSavePanel ? "キャンセル" : "改正案を保存"}
          </button>
        </div>
      </div>

      {/* 保存パネル */}
      {showSavePanel && (
        <div style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1rem",
        }}>
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-primary)" }}>
            改正案を保存
          </h3>

          {/* タイトル */}
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
              タイトル <span style={{ color: "var(--color-del-fg)" }}>*</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：第一条 労働条件原則の明確化"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

          {/* 説明 */}
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
              改正理由・説明
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="なぜこの改正を提案するか、期待される効果など"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </label>

          {/* 根拠カード */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>根拠資料</span>
              <button onClick={addSource} style={{ padding: "0.2rem 0.6rem", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "4px", fontFamily: "var(--font-sans)", fontSize: "0.78rem", cursor: "pointer" }}>
                + 追加
              </button>
            </div>
            {sources.map((src, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 1fr auto",
                gap: "0.4rem",
                marginBottom: "0.4rem",
                alignItems: "start",
              }}>
                <select
                  value={src.tier}
                  onChange={(e) => updateSource(i, "tier", e.target.value)}
                  style={{ padding: "0.4rem", border: "1px solid var(--color-border)", borderRadius: "4px", fontFamily: "var(--font-sans)", fontSize: "0.78rem", backgroundColor: TIER_COLORS[src.tier].bg, color: TIER_COLORS[src.tier].fg }}
                >
                  {(["一次", "準一次", "二次", "三次"] as SourceTier[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={src.label}
                  onChange={(e) => updateSource(i, "label", e.target.value)}
                  placeholder="資料名"
                  style={{ padding: "0.4rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "4px", fontFamily: "var(--font-sans)", fontSize: "0.78rem", backgroundColor: "var(--color-bg)" }}
                />
                <input
                  type="url"
                  value={src.url}
                  onChange={(e) => updateSource(i, "url", e.target.value)}
                  placeholder="URL（任意）"
                  style={{ padding: "0.4rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "4px", fontFamily: "var(--font-sans)", fontSize: "0.78rem", backgroundColor: "var(--color-bg)" }}
                />
                <button onClick={() => removeSource(i)} style={{ padding: "0.4rem 0.5rem", backgroundColor: "var(--color-del-bg)", border: "1px solid var(--color-del-fg)", borderRadius: "4px", color: "var(--color-del-fg)", cursor: "pointer", fontSize: "0.78rem" }}>
                  削除
                </button>
              </div>
            ))}
          </div>

          {saveError && (
            <p style={{ color: "var(--color-del-fg)", fontFamily: "var(--font-sans)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>{saveError}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "保存中…" : "保存する"}
          </button>
        </div>
      )}

      {/* モード切替タブ */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)" }}>
        {(["unified", "sidebyside", "patch", "new"] as ViewMode[]).map((m) => {
          const labels: Record<ViewMode, string> = { unified: "統合表示", sidebyside: "新旧対照", patch: "パッチ記法", new: "溶け込み後" };
          return (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom: mode === m ? "2px solid var(--color-accent)" : "2px solid transparent",
              backgroundColor: "transparent",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: mode === m ? "var(--color-accent)" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontWeight: mode === m ? 700 : 400,
            }}>
              {labels[m]}
            </button>
          );
        })}
      </div>

      {/* エディタ + diff */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
            パッチ記法で編集（行頭 + で追加、- で削除）
          </div>
          <textarea
            value={patchText}
            onChange={(e) => setPatchText(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: "400px",
              padding: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "transparent", marginBottom: "0.4rem" }}>.</div>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", backgroundColor: "var(--color-surface)", minHeight: "400px", overflow: "auto" }}>
            {mode === "unified"    && <UnifiedView lines={unified.lines} />}
            {mode === "sidebyside" && <SideBySideView rows={sideBySide.rows} />}
            {mode === "patch"      && <PatchView lines={patch.lines} />}
            {mode === "new"        && <NewView lines={newLines} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Unified View ──
function UnifiedView({ lines }: { lines: import("@/lib/patch/types").DiffLine[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
      <tbody>
        {lines.map((l, i) => {
          const bg = l.op === "add" ? "var(--color-add-bg)" : l.op === "del" ? "var(--color-del-bg)" : "transparent";
          const fg = l.op === "add" ? "var(--color-add-fg)" : l.op === "del" ? "var(--color-del-fg)" : "var(--color-text-primary)";
          const prefix = l.op === "add" ? "+" : l.op === "del" ? "-" : " ";
          return (
            <tr key={i} style={{ backgroundColor: bg }}>
              <td style={{ padding: "0.15rem 0.4rem", color: fg, width: "1.5rem", textAlign: "center", userSelect: "none", opacity: 0.7 }}>{prefix}</td>
              <td style={{ padding: "0.15rem 0.5rem", color: "var(--color-text-secondary)", width: "2.5rem", userSelect: "none" }}>{l.num ?? ""}</td>
              <td style={{ padding: "0.15rem 0.5rem 0.15rem 0", color: fg, lineHeight: 1.7 }}>{l.text}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Side-by-Side View ──
function SideBySideView({ rows }: { rows: import("@/lib/patch/types").SideBySideRow[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
      <thead>
        <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
          <th style={{ padding: "0.3rem 0.5rem", fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--color-text-secondary)", textAlign: "left", width: "50%" }}>現行</th>
          <th style={{ padding: "0.3rem 0.5rem", fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--color-text-secondary)", textAlign: "left", width: "50%", borderLeft: "1px solid var(--color-border)" }}>改正案</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td style={{ padding: "0.2rem 0.5rem", backgroundColor: row.op === "del" ? "var(--color-del-bg)" : "transparent", color: row.op === "del" ? "var(--color-del-fg)" : "var(--color-text-primary)", lineHeight: 1.7, verticalAlign: "top" }}>
              {row.left ? <>{row.left.num && <span style={{ marginRight: "0.3rem", opacity: 0.6 }}>{row.left.num}</span>}{row.left.text}</> : <span style={{ color: "var(--color-border)" }}>—</span>}
            </td>
            <td style={{ padding: "0.2rem 0.5rem", backgroundColor: row.op === "add" || row.op === "del" ? "var(--color-add-bg)" : "transparent", color: row.op === "add" || row.op === "del" ? "var(--color-add-fg)" : "var(--color-text-primary)", lineHeight: 1.7, verticalAlign: "top", borderLeft: "1px solid var(--color-border)" }}>
              {row.right ? <>{row.right.num && <span style={{ marginRight: "0.3rem", opacity: 0.6 }}>{row.right.num}</span>}{row.right.text}</> : <span style={{ color: "var(--color-border)" }}>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Patch View ──
function PatchView({ lines }: { lines: import("@/lib/patch/types").PatchLine[] }) {
  return (
    <div style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.8 }}>
      {lines.map((l, i) => {
        const prefix = l.op === "add" ? "+" : l.op === "del" ? "-" : " ";
        const color = l.op === "add" ? "var(--color-add-fg)" : l.op === "del" ? "var(--color-del-fg)" : "var(--color-text-primary)";
        const bg = l.op === "add" ? "var(--color-add-bg)" : l.op === "del" ? "var(--color-del-bg)" : "transparent";
        return (
          <div key={i} style={{ backgroundColor: bg, color, paddingLeft: "0.25rem" }}>
            {prefix}{l.num ? `${l.num}　` : ""}{l.text}
          </div>
        );
      })}
    </div>
  );
}

// ── New（溶け込み後）──
function NewView({ lines }: { lines: CanonLine[] }) {
  return (
    <div style={{ padding: "0.75rem", fontFamily: "var(--font-serif)", fontSize: "0.88rem", lineHeight: 1.9, color: "var(--color-text-primary)" }}>
      {lines.map((l, i) => (
        <p key={i} style={{ margin: "0 0 0.25rem", textIndent: l.num ? "0" : "1em" }}>
          {l.num && <span style={{ fontFamily: "var(--font-mono)", marginRight: "0.5rem", color: "var(--color-text-secondary)" }}>{l.num}</span>}
          {l.text}
        </p>
      ))}
    </div>
  );
}
