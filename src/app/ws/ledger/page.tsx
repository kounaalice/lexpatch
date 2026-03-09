"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllDocuments,
  deleteDocument,
  type WsDocument,
  BUILT_IN_TEMPLATES,
} from "@/lib/ws-documents";

export default function LedgerPage() {
  const [docs, setDocs] = useState<WsDocument[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"updatedAt" | "createdAt" | "title" | "docNumber">(
    "updatedAt",
  );
  const [sortAsc, setSortAsc] = useState(false);

  function refresh() {
    setDocs(getAllDocuments());
  }

  useEffect(() => {
    refresh(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const filtered = docs
    .filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          (d.docNumber || "").toLowerCase().includes(q) ||
          (d.templateId || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let va = "",
        vb = "";
      if (sortKey === "title") {
        va = a.title;
        vb = b.title;
      } else if (sortKey === "docNumber") {
        va = a.docNumber || "";
        vb = b.docNumber || "";
      } else if (sortKey === "createdAt") {
        va = a.createdAt;
        vb = b.createdAt;
      } else {
        va = a.updatedAt;
        vb = b.updatedAt;
      }
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  function getTemplateName(id: string | null | undefined) {
    if (!id) return "ブランク";
    return BUILT_IN_TEMPLATES.find((t) => t.id === id)?.name || id;
  }

  const thStyle: React.CSSProperties = {
    padding: "0.6rem 0.5rem",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "0.8rem",
    borderBottom: "2px solid var(--color-border)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
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
        &gt; 文書台帳
      </nav>

      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>文書台帳</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タイトル・文書番号で検索"
          style={{
            flex: 1,
            minWidth: 200,
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="all">全て</option>
          <option value="draft">下書き</option>
          <option value="final">確定</option>
        </select>
        <Link
          href="/ws/docs"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          文書作成
        </Link>
      </div>

      <p
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}
      >
        {filtered.length}件
      </p>

      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--color-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface)" }}>
              <th style={thStyle} onClick={() => handleSort("docNumber")}>
                文書番号 {sortKey === "docNumber" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle} onClick={() => handleSort("title")}>
                タイトル {sortKey === "title" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>テンプレート</th>
              <th style={thStyle}>ステータス</th>
              <th style={thStyle} onClick={() => handleSort("createdAt")}>
                作成日 {sortKey === "createdAt" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle} onClick={() => handleSort("updatedAt")}>
                更新日 {sortKey === "updatedAt" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{ ...thStyle, cursor: "default" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td
                  style={{
                    padding: "0.5rem",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.8rem",
                  }}
                >
                  {d.docNumber || "—"}
                </td>
                <td style={{ padding: "0.5rem", fontWeight: 500 }}>{d.title}</td>
                <td
                  style={{
                    padding: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {getTemplateName(d.templateId)}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                      backgroundColor: d.status === "final" ? "#D1FAE5" : "#FEF3C7",
                      color: d.status === "final" ? "#065F46" : "#92400E",
                    }}
                  >
                    {d.status === "final" ? "確定" : "下書き"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {new Date(d.createdAt).toLocaleDateString("ja-JP")}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {new Date(d.updatedAt).toLocaleDateString("ja-JP")}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <Link
                    href={`/ws/docs?edit=${d.id}`}
                    style={{
                      color: "var(--color-accent)",
                      fontSize: "0.8rem",
                      marginRight: "0.5rem",
                    }}
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => {
                      deleteDocument(d.id);
                      refresh();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#DC2626",
                      fontSize: "0.8rem",
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            文書がありません
          </p>
        )}
      </div>
    </div>
  );
}
