"use client";
import { uuid } from "@/lib/uuid";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  BUILT_IN_TEMPLATES,
  applyTemplate,
  renderDocument,
  getNumberingState,
  generateDocNumber,
  type WsDocument,
  type DocTemplate,
} from "@/lib/ws-documents";

type View = "list" | "new" | "edit";

// ── Version Management ──
interface DocVersion {
  docId: string;
  title: string;
  content: string;
  savedAt: string;
}
function loadVersions(): DocVersion[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_ws_doc_versions") || "[]");
  } catch {
    return [];
  }
}
function saveVersion(v: DocVersion) {
  const all = loadVersions();
  all.push(v);
  if (all.length > 100) all.shift();
  localStorage.setItem("lp_ws_doc_versions", JSON.stringify(all));
}
function getVersionsForDoc(docId: string): DocVersion[] {
  return loadVersions()
    .filter((v) => v.docId === docId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

// ── Custom Templates ──
interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}
function loadCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_ws_custom_templates") || "[]");
  } catch {
    return [];
  }
}
function saveCustomTemplate(name: string, content: string) {
  const all = loadCustomTemplates();
  all.push({ id: uuid(), name, content, createdAt: new Date().toISOString() });
  localStorage.setItem("lp_ws_custom_templates", JSON.stringify(all));
}
function deleteCustomTemplate(id: string) {
  const all = loadCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem("lp_ws_custom_templates", JSON.stringify(all));
}

export default function WsDocsPage() {
  const [_session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [view, setView] = useState<View>("list");
  const [docs, setDocs] = useState<WsDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  const [editDoc, setEditDoc] = useState<WsDocument | null>(null);
  const [vars, setVars] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState(false);
  const [_numberingPrefix, setNumberingPrefix] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  useEffect(() => {
    setSession(getSession());
    setDocs(getAllDocuments());
    setNumberingPrefix(getNumberingState().prefix);
    setCustomTemplates(loadCustomTemplates());
  }, []);

  function startFromTemplate(tpl: DocTemplate) {
    const { content: c, variables: v } = applyTemplate(tpl);
    setSelectedTemplate(tpl);
    setContent(c);
    setVars(v);
    setTitle(tpl.name);
    setView("new");
    setPreview(false);
  }

  function startBlank() {
    setSelectedTemplate(null);
    setContent("");
    setVars({});
    setTitle("無題の文書");
    setView("new");
    setPreview(false);
  }

  function openEdit(doc: WsDocument) {
    setEditDoc(doc);
    setContent(doc.content);
    setVars(doc.variables || {});
    setTitle(doc.title);
    setView("edit");
    setPreview(false);
  }

  function handleSave(status: "draft" | "final" = "draft") {
    saveVersion({ docId: editDoc?.id || "new", title, content, savedAt: new Date().toISOString() });
    if (view === "edit" && editDoc) {
      const docNumber =
        status === "final" && !editDoc.docNumber ? generateDocNumber() : editDoc.docNumber;
      updateDocument(editDoc.id, { title, content, variables: vars, status, docNumber });
    } else {
      createDocument({
        title,
        templateId: selectedTemplate?.id,
        content,
        variables: vars,
        status,
        docNumber: status === "final" ? generateDocNumber() : undefined,
      });
    }
    setDocs(getAllDocuments());
    setView("list");
  }

  function handleSaveAsTemplate() {
    const name = prompt("テンプレート名を入力してください", title);
    if (!name) return;
    saveCustomTemplate(name, content);
    setCustomTemplates(loadCustomTemplates());
    alert("テンプレートとして保存しました");
  }

  function handleDeleteCustomTemplate(id: string) {
    deleteCustomTemplate(id);
    setCustomTemplates(loadCustomTemplates());
  }

  function restoreVersion(v: DocVersion) {
    setContent(v.content);
    setTitle(v.title);
    setShowHistory(false);
  }

  function handleDelete(id: string) {
    deleteDocument(id);
    setDocs(getAllDocuments());
    if (editDoc?.id === id) setView("list");
  }

  function handlePrint() {
    const rendered = renderDocument(content, vars);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.8}h1{font-size:1.3rem}h2{font-size:1.1rem;border-bottom:1px solid #ccc;padding-bottom:0.3rem}h3{font-size:1rem}ul,ol{padding-left:1.5rem}</style></head><body>`,
    );
    // Simple markdown→HTML
    const html = rendered
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
    w.document.write(html);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  }

  const rendered = renderDocument(content, vars);

  // ── リストビュー ──
  if (view === "list") {
    const categories = [...new Set(BUILT_IN_TEMPLATES.map((t) => t.category))];
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            padding: "1.5rem 2rem",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <nav
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.5rem",
                display: "flex",
                gap: "0.4rem",
              }}
            >
              <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                トップ
              </Link>
              <span>&rsaquo;</span>
              <Link href="/ws" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                ワークスペース
              </Link>
              <span>&rsaquo;</span>
              <span>文書作成</span>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "3px",
                  height: "1.8rem",
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <h1
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                文書作成
              </h1>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                <Link
                  href="/ws/ledger"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.8rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  台帳
                </Link>
                {docs.length > 0 && (
                  <button
                    onClick={() => {
                      const finalDocs = docs.filter((d) => d.status === "final");
                      if (finalDocs.length === 0) {
                        alert("確定済みの文書がありません");
                        return;
                      }
                      const w = window.open("", "_blank");
                      if (!w) return;
                      w.document.write(
                        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>文書一括印刷</title><style>body{font-family:serif;max-width:800px;margin:0 auto;line-height:1.8}h1{font-size:1.3rem}h2{font-size:1.1rem;border-bottom:1px solid #ccc;padding-bottom:0.3rem}.doc{page-break-after:always;padding:2rem 1rem}.doc:last-child{page-break-after:auto}.doc-header{border-bottom:2px solid #333;padding-bottom:0.5rem;margin-bottom:1rem}.doc-num{font-size:0.8rem;color:#666}</style></head><body>",
                      );
                      for (const doc of finalDocs) {
                        const html = renderDocument(doc.content, doc.variables || {})
                          .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                          .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                          .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                          .replace(/^- (.+)$/gm, "<li>$1</li>")
                          .replace(/\n\n/g, "<br><br>")
                          .replace(/\n/g, "<br>");
                        w.document.write(
                          `<div class="doc"><div class="doc-header"><h1>${doc.title}</h1>${doc.docNumber ? `<p class="doc-num">${doc.docNumber}</p>` : ""}</div>${html}</div>`,
                        );
                      }
                      w.document.write("</body></html>");
                      w.document.close();
                      w.print();
                    }}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.8rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    PDF一括
                  </button>
                )}
                <button
                  onClick={startBlank}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.8rem",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  + 白紙から作成
                </button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
          {/* テンプレート */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              テンプレートから作成
            </h2>
            {categories.map((cat) => (
              <div key={cat} style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {cat}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  {BUILT_IN_TEMPLATES.filter((t) => t.category === cat).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => startFromTemplate(tpl)}
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {tpl.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {tpl.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* カスタムテンプレート */}
          {customTemplates.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                カスタムテンプレート
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {customTemplates.map((ct) => (
                  <div
                    key={ct.id}
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{ flex: 1, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedTemplate(null);
                        setContent(ct.content);
                        setVars({});
                        setTitle(ct.name);
                        setView("new");
                        setPreview(false);
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {ct.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          marginTop: "0.15rem",
                        }}
                      >
                        {new Date(ct.createdAt).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomTemplate(ct.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8rem",
                        opacity: 0.5,
                      }}
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 作成済み文書 */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              作成済み文書 ({docs.length})
            </h2>
            {docs.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                まだ文書はありません
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                      onClick={() => openEdit(doc)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            padding: "0.08rem 0.4rem",
                            borderRadius: "3px",
                            backgroundColor:
                              doc.status === "final"
                                ? "var(--color-add-bg)"
                                : "var(--color-warn-bg)",
                            color:
                              doc.status === "final"
                                ? "var(--color-add-fg)"
                                : "var(--color-warn-fg)",
                          }}
                        >
                          {doc.status === "final" ? "確定" : "下書き"}
                        </span>
                        {doc.docNumber && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.72rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {doc.docNumber}
                          </span>
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {doc.title}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          marginTop: "0.15rem",
                        }}
                      >
                        {new Date(doc.updatedAt).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8rem",
                        opacity: 0.5,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ── 編集ビュー ──
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setView("list")}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            ← 戻る
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              border: "none",
              backgroundColor: "transparent",
              color: "var(--color-text-primary)",
              flex: 1,
              minWidth: "200px",
              outline: "none",
            }}
          />
          <button
            onClick={() => setPreview(!preview)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: preview ? "var(--color-accent)" : "var(--color-surface)",
              color: preview ? "#fff" : "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {preview ? "編集" : "プレビュー"}
          </button>
          <button
            onClick={() => handleSave("draft")}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            下書き保存
          </button>
          <button
            onClick={() => handleSave("final")}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            確定保存
          </button>
          <button
            onClick={handlePrint}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            印刷/PDF
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: showHistory ? "var(--color-accent)" : "var(--color-surface)",
              color: showHistory ? "#fff" : "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            履歴
          </button>
          <button
            onClick={handleSaveAsTemplate}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            テンプレ保存
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* 版履歴パネル */}
        {showHistory &&
          (() => {
            const docId = editDoc?.id || "new";
            const versions = getVersionsForDoc(docId);
            return (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    版履歴
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    閉じる
                  </button>
                </div>
                {versions.length === 0 ? (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    保存履歴がありません
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      maxHeight: "250px",
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
                          borderRadius: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                            minWidth: "140px",
                          }}
                        >
                          {new Date(v.savedAt).toLocaleString("ja-JP")}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {v.title}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.7rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {v.content.length}文字
                        </span>
                        <button
                          onClick={() => restoreVersion(v)}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid var(--color-accent)",
                            borderRadius: "4px",
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
              </div>
            );
          })()}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: Object.keys(vars).length > 0 ? "280px 1fr" : "1fr",
            gap: "1rem",
          }}
        >
          {/* 変数パネル */}
          {Object.keys(vars).length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1rem",
                alignSelf: "start",
                position: "sticky",
                top: "1rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                差込み変数
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {Object.keys(vars).map((key) => (
                  <div key={key}>
                    <label
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      {key}
                    </label>
                    <input
                      value={vars[key]}
                      onChange={(e) => setVars({ ...vars, [key]: e.target.value })}
                      placeholder={`{{${key}}}`}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        padding: "0.4rem 0.5rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        width: "100%",
                        boxSizing: "border-box" as const,
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* エディタ / プレビュー */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {preview ? (
              <div
                style={{
                  padding: "2rem",
                  fontFamily: "serif",
                  fontSize: "0.95rem",
                  lineHeight: 2,
                  color: "var(--color-text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {rendered}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "500px",
                  padding: "1.5rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1.8,
                  border: "none",
                  resize: "vertical",
                  backgroundColor: "transparent",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box" as const,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
