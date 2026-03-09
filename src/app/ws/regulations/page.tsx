"use client";
import { uuid } from "@/lib/uuid";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllRegulations,
  getRegulation,
  addRegulation,
  updateRegulation,
  deleteRegulation,
  REGULATION_CATEGORIES,
  type Regulation,
} from "@/lib/ws-contracts";

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  draft: "下書き",
  archived: "アーカイブ",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  draft: "#D97706",
  archived: "#6B7280",
};

// ── Regulation Version Management ──
interface RegVersion {
  regulationId: string;
  version: string;
  content: string;
  savedAt: string;
}
function loadRegVersions(): RegVersion[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_ws_regulation_versions") || "[]");
  } catch {
    return [];
  }
}
function saveRegVersion(v: RegVersion) {
  const all = loadRegVersions();
  all.push(v);
  if (all.length > 200) all.shift();
  localStorage.setItem("lp_ws_regulation_versions", JSON.stringify(all));
}
function getRegVersions(regulationId: string): RegVersion[] {
  return loadRegVersions()
    .filter((v) => v.regulationId === regulationId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
function simpleDiff(
  oldText: string,
  newText: string,
): { type: "same" | "add" | "del"; line: string }[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: { type: "same" | "add" | "del"; line: string }[] = [];
  const _maxLen = Math.max(oldLines.length, newLines.length);
  let oi = 0,
    ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "same", line: oldLines[oi] });
      oi++;
      ni++;
    } else if (
      oi < oldLines.length &&
      (ni >= newLines.length || !newLines.includes(oldLines[oi]))
    ) {
      result.push({ type: "del", line: oldLines[oi] });
      oi++;
    } else if (ni < newLines.length) {
      result.push({ type: "add", line: newLines[ni] });
      ni++;
    } else {
      oi++;
      ni++;
    }
  }
  return result;
}

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: REGULATION_CATEGORIES[0],
    version: "1.0",
    effectiveDate: "",
    content: "",
    status: "draft" as Regulation["status"],
  });
  const [showVersions, setShowVersions] = useState(false);
  const [diffView, setDiffView] = useState<{ type: "same" | "add" | "del"; line: string }[] | null>(
    null,
  );

  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    reload();
  }, [search, categoryFilter]);

  function reload() {
    let list = getAllRegulations();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q),
      );
    }
    if (categoryFilter) list = list.filter((r) => r.category === categoryFilter);
    setRegulations(list);
  }

  function openEdit(r: Regulation) {
    setForm({
      title: r.title,
      category: r.category,
      version: r.version,
      effectiveDate: r.effectiveDate,
      content: r.content,
      status: r.status,
    });
    setEditId(r.id);
    setShowForm(true);
    setSelectedId(null);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const regId = editId || uuid();
    saveRegVersion({
      regulationId: regId,
      version: form.version,
      content: form.content,
      savedAt: new Date().toISOString(),
    });
    if (editId) updateRegulation(editId, form);
    else addRegulation(form);
    setForm({
      title: "",
      category: REGULATION_CATEGORIES[0],
      version: "1.0",
      effectiveDate: "",
      content: "",
      status: "draft",
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteRegulation(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  const selected = selectedId ? getRegulation(selectedId) : null;

  if (selected) {
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
          &gt;{" "}
          <span
            onClick={() => setSelectedId(null)}
            style={{ color: "var(--color-accent)", cursor: "pointer" }}
          >
            社内規程
          </span>{" "}
          &gt; {selected.title}
        </nav>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.3rem 0.8rem",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          戻る
        </button>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1.2rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
              }}
            >
              {selected.category}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#fff",
                backgroundColor: STATUS_COLORS[selected.status],
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
              }}
            >
              {STATUS_LABELS[selected.status]}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                marginLeft: "auto",
              }}
            >
              v{selected.version}
            </span>
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {selected.title}
          </h2>
          {selected.effectiveDate && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
              }}
            >
              施行日: {selected.effectiveDate}
            </p>
          )}
          <div
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1rem",
            }}
          >
            {selected.content}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              onClick={() => openEdit(selected)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              編集
            </button>
            <button
              onClick={() => {
                setShowVersions(!showVersions);
                setDiffView(null);
              }}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: showVersions ? "var(--color-accent)" : "var(--color-surface)",
                color: showVersions ? "#fff" : "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              版履歴
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #DC2626",
                color: "#DC2626",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              削除
            </button>
          </div>
        </div>

        {/* 版履歴パネル */}
        {showVersions &&
          (() => {
            const versions = getRegVersions(selected.id);
            return (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "1rem",
                  marginTop: "1rem",
                }}
              >
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                  版履歴
                </h3>
                {versions.length === 0 ? (
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                    版履歴がありません
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    {versions.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.4rem 0.6rem",
                          backgroundColor: "var(--color-bg)",
                          borderRadius: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                            minWidth: 140,
                          }}
                        >
                          {new Date(v.savedAt).toLocaleString("ja-JP")}
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>v{v.version}</span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-text-secondary)",
                            flex: 1,
                          }}
                        >
                          {v.content.length}文字
                        </span>
                        <button
                          onClick={() => setDiffView(simpleDiff(v.content, selected.content))}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: 4,
                            backgroundColor: "var(--color-surface)",
                            cursor: "pointer",
                          }}
                        >
                          差分
                        </button>
                        <button
                          onClick={() => {
                            updateRegulation(selected.id, {
                              content: v.content,
                              version: v.version,
                            });
                            setSelectedId(null);
                            reload();
                          }}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid var(--color-accent)",
                            borderRadius: 4,
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-accent)",
                            cursor: "pointer",
                          }}
                        >
                          復元
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {diffView && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      overflow: "hidden",
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "var(--color-bg)",
                        borderBottom: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, flex: 1 }}>差分表示</span>
                      <button
                        onClick={() => setDiffView(null)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        閉じる
                      </button>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {diffView.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "0.1rem 0.75rem",
                            backgroundColor:
                              d.type === "add"
                                ? "var(--color-add-bg)"
                                : d.type === "del"
                                  ? "var(--color-del-bg)"
                                  : "transparent",
                            color:
                              d.type === "add"
                                ? "var(--color-add-fg)"
                                : d.type === "del"
                                  ? "var(--color-del-fg)"
                                  : "var(--color-text-primary)",
                          }}
                        >
                          {d.type === "add" ? "+ " : d.type === "del" ? "- " : "  "}
                          {d.line || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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
        &gt; 社内規程
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>社内規程管理</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              title: "",
              category: REGULATION_CATEGORIES[0],
              version: "1.0",
              effectiveDate: "",
              content: "",
              status: "draft",
            });
            setShowForm(!showForm);
          }}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タイトル・内容で検索"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="">全カテゴリ</option>
          {REGULATION_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            {editId ? "規程を編集" : "規程を追加"}
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="規程名 *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {REGULATION_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="バージョン"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="date"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Regulation["status"] })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="規程本文"
            rows={10}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {regulations.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.8rem 1rem",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.65rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {r.category}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "#fff",
                  backgroundColor: STATUS_COLORS[r.status],
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {STATUS_LABELS[r.status]}
              </span>
              <span style={{ fontWeight: 600, flex: 1 }}>{r.title}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                v{r.version}
              </span>
              {r.effectiveDate && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {r.effectiveDate}
                </span>
              )}
            </div>
          </div>
        ))}
        {regulations.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            規程がありません
          </p>
        )}
      </div>
    </div>
  );
}
