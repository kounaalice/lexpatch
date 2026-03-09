"use client";
import { uuid } from "@/lib/uuid";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";

interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[]; // for select
}

interface WsForm {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  status: "draft" | "published" | "closed";
  created_at: string;
  updated_at: string;
}

type View = "list" | "builder" | "responses";

function authHeader(s: Session) {
  return { Authorization: `Bearer ${s.memberId}:${s.token}` };
}

export default function WsFormsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>("list");
  const [forms, setForms] = useState<WsForm[]>([]);
  const [loading, setLoading] = useState(true);
  // Builder state
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("無題のフォーム");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  // Responses state
  const [responseFormId, setResponseFormId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responses, setResponses] = useState<any[]>([]);
  // Approval integration
  const [autoApproval, setAutoApproval] = useState(false);
  const [approvalCreated, setApprovalCreated] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s) fetchForms(s);
    else setLoading(false);
  }, []);

  async function fetchForms(s: Session) {
    setLoading(true);
    const res = await fetch(`/api/ws/forms?member_id=${s.memberId}`);
    if (res.ok) {
      const d = await res.json();
      setForms(d.forms || []);
    }
    setLoading(false);
  }

  function startNew() {
    setEditId(null);
    setTitle("無題のフォーム");
    setDescription("");
    setFields([]);
    setView("builder");
  }

  function startEdit(form: WsForm) {
    setEditId(form.id);
    setTitle(form.title);
    setDescription(form.description || "");
    setFields(form.fields || []);
    setView("builder");
  }

  function addField(type: FormField["type"]) {
    setFields([...fields, { id: uuid(), type, label: "", required: false }]);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  async function saveForm(status: "draft" | "published") {
    if (!session) return;
    const body = { title, description, fields, status, id: editId };
    if (editId) {
      await fetch(`/api/ws/forms`, {
        method: "PATCH",
        headers: { ...authHeader(session), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/ws/forms`, {
        method: "POST",
        headers: { ...authHeader(session), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    // Auto-approval integration
    if (status === "published" && autoApproval) {
      try {
        const existing: {
          id: string;
          title: string;
          status: string;
          steps: unknown[];
          created_at: string;
        }[] = JSON.parse(localStorage.getItem("lp_ws_approvals") || "[]");
        existing.push({
          id: uuid(),
          title: `[フォーム] ${title}`,
          status: "pending",
          steps: [{ approver_name: "管理者", status: "pending", acted_at: null, comment: "" }],
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("lp_ws_approvals", JSON.stringify(existing));
        setApprovalCreated(true);
      } catch {
        /* ignore */
      }
    }
    await fetchForms(session);
    setView("list");
  }

  async function deleteForm(id: string) {
    if (!session) return;
    await fetch(`/api/ws/forms?id=${id}`, { method: "DELETE", headers: authHeader(session) });
    await fetchForms(session);
  }

  async function viewResponses(formId: string) {
    setResponseFormId(formId);
    const res = await fetch(`/api/ws/forms/${formId}/responses`);
    if (res.ok) {
      const d = await res.json();
      setResponses(d.responses || []);
    }
    setView("responses");
  }

  const FIELD_TYPES: { type: FormField["type"]; label: string }[] = [
    { type: "text", label: "テキスト" },
    { type: "textarea", label: "テキストエリア" },
    { type: "number", label: "数値" },
    { type: "date", label: "日付" },
    { type: "select", label: "選択肢" },
    { type: "checkbox", label: "チェックボックス" },
  ];

  // ── リスト ──
  if (view === "list") {
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
              <span>フォーム</span>
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
                フォーム
              </h1>
              {session && (
                <button
                  onClick={startNew}
                  style={{
                    marginLeft: "auto",
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
                  + 新規作成
                </button>
              )}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
          {loading ? (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              読み込み中...
            </p>
          ) : forms.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                フォームがありません
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                「+ 新規作成」からフォームを作成できます。
                <br />
                申請書・アンケート・問い合わせフォーム等に。
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {forms.map((form) => (
                <div
                  key={form.id}
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          padding: "0.08rem 0.4rem",
                          borderRadius: "3px",
                          backgroundColor:
                            form.status === "published"
                              ? "var(--color-add-bg)"
                              : form.status === "closed"
                                ? "var(--color-del-bg)"
                                : "var(--color-warn-bg)",
                          color:
                            form.status === "published"
                              ? "var(--color-add-fg)"
                              : form.status === "closed"
                                ? "var(--color-del-fg)"
                                : "var(--color-warn-fg)",
                        }}
                      >
                        {form.status === "published"
                          ? "公開中"
                          : form.status === "closed"
                            ? "終了"
                            : "下書き"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {form.title}
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
                      {form.fields.length}項目 |{" "}
                      {new Date(form.updated_at).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                  <button onClick={() => viewResponses(form.id)} style={smallBtn}>
                    回答
                  </button>
                  <button onClick={() => startEdit(form)} style={smallBtn}>
                    編集
                  </button>
                  {form.status === "published" && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/ws/forms/${form.id}`,
                        );
                        alert("フォームURLをコピーしました");
                      }}
                      style={smallBtn}
                    >
                      URL
                    </button>
                  )}
                  <button
                    onClick={() => deleteForm(form.id)}
                    style={{ ...smallBtn, color: "var(--color-del-fg)" }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CSV出力 ──
  function exportResponsesCsv() {
    const f = forms.find((ff) => ff.id === responseFormId);
    if (!f) return;
    const bom = "\uFEFF";
    const escapeCsv = (v: string) =>
      v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
    const header = ["日時", "回答者", ...f.fields.map((fi) => fi.label || "無題")]
      .map(escapeCsv)
      .join(",");
    const csvRows = responses.map((r) =>
      [
        new Date(r.submitted_at).toLocaleString("ja-JP"),
        r.respondent_name || "匿名",
        ...f.fields.map((fi) => String(r.data?.[fi.id] ?? "")),
      ]
        .map(escapeCsv)
        .join(","),
    );
    const csv = bom + [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${f.title}_回答.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── 集計 ──
  function getFieldAgg(field: FormField) {
    const vals = responses
      .map((r) => r.data?.[field.id])
      .filter((v: any) => v !== undefined && v !== null && v !== "");
    if (vals.length === 0) return null;
    if (field.type === "number") {
      const nums = vals.map(Number).filter((n) => !isNaN(n));
      if (nums.length === 0) return null;
      return {
        type: "number" as const,
        count: nums.length,
        sum: nums.reduce((a: number, b: number) => a + b, 0),
        avg: nums.reduce((a: number, b: number) => a + b, 0) / nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
      };
    }
    if (field.type === "select" || field.type === "checkbox") {
      const counts: Record<string, number> = {};
      for (const v of vals) {
        const k = String(v);
        counts[k] = (counts[k] || 0) + 1;
      }
      return { type: "select" as const, counts, total: vals.length };
    }
    return { type: "text" as const, count: vals.length };
  }

  // ── 回答一覧 ──
  if (view === "responses") {
    const form = forms.find((f) => f.id === responseFormId);
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            padding: "1.5rem 2rem",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <button onClick={() => setView("list")} style={smallBtn}>
              ← 戻る
            </button>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              回答一覧: {form?.title}
            </h1>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
              }}
            >
              ({responses.length}件)
            </span>
            {responses.length > 0 && (
              <button onClick={exportResponsesCsv} style={{ ...smallBtn, marginLeft: "auto" }}>
                CSV出力
              </button>
            )}
          </div>
        </div>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
          {/* 集計パネル */}
          {responses.length > 0 && form && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                集計
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {form.fields.map((f) => {
                  const agg = getFieldAgg(f);
                  if (!agg) return null;
                  return (
                    <div
                      key={f.id}
                      style={{
                        padding: "0.5rem",
                        borderRadius: 6,
                        backgroundColor: "var(--color-bg)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          marginBottom: "0.3rem",
                        }}
                      >
                        {f.label || "無題"}
                      </p>
                      {agg.type === "number" && (
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          回答: {agg.count} · 合計: {agg.sum.toLocaleString()} · 平均:{" "}
                          {agg.avg.toFixed(1)}
                          <br />
                          最小: {agg.min} · 最大: {agg.max}
                        </div>
                      )}
                      {agg.type === "select" && (
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {Object.entries(agg.counts).map(([k, v]) => (
                            <div
                              key={k}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                marginBottom: "0.15rem",
                              }}
                            >
                              <span style={{ flex: 1 }}>
                                {k === "true" ? "はい" : k === "false" ? "いいえ" : k}
                              </span>
                              <span style={{ fontWeight: 600 }}>{v}</span>
                              <span style={{ fontSize: "0.65rem" }}>
                                ({Math.round((v / agg.total) * 100)}%)
                              </span>
                              <div
                                style={{
                                  width: 60,
                                  height: 6,
                                  backgroundColor: "var(--color-border)",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${(v / agg.total) * 100}%`,
                                    height: "100%",
                                    backgroundColor: "var(--color-accent)",
                                    borderRadius: 3,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {agg.type === "text" && (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          回答: {agg.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {responses.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              まだ回答はありません
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--color-bg)" }}>
                    <th style={thStyle}>日時</th>
                    <th style={thStyle}>回答者</th>
                    {form?.fields.map((f) => (
                      <th key={f.id} style={thStyle}>
                        {f.label || "無題"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.id}>
                      <td style={tdStyle}>{new Date(r.submitted_at).toLocaleString("ja-JP")}</td>
                      <td style={tdStyle}>{r.respondent_name || "匿名"}</td>
                      {form?.fields.map((f) => (
                        <td key={f.id} style={tdStyle}>
                          {String(r.data?.[f.id] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ビルダー ──
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
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => setView("list")} style={smallBtn}>
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
          <button onClick={() => saveForm("draft")} style={smallBtn}>
            下書き保存
          </button>
          <button
            onClick={() => saveForm("published")}
            style={{
              ...smallBtn,
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
            }}
          >
            公開
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="フォームの説明（任意）"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            padding: "0.5rem 0.65rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            width: "100%",
            boxSizing: "border-box" as const,
            marginBottom: "0.75rem",
          }}
        />

        {/* 承認フロー連携 */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            padding: "0.6rem 0.8rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <label
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
              color: "var(--color-text-primary)",
            }}
          >
            <input
              type="checkbox"
              checked={autoApproval}
              onChange={(e) => setAutoApproval(e.target.checked)}
            />
            公開時に承認リクエストを自動作成
          </label>
          <Link
            href="/ws/approvals"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-accent)",
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            承認フローを確認 &rarr;
          </Link>
        </div>
        {approvalCreated && (
          <div
            style={{
              backgroundColor: "var(--color-add-bg)",
              border: "1px solid var(--color-add-fg)",
              borderRadius: "6px",
              padding: "0.5rem 0.8rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-add-fg)",
              }}
            >
              承認リクエストを作成しました
            </span>
            <Link
              href="/ws/approvals"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              承認ページへ &rarr;
            </Link>
          </div>
        )}

        {/* フィールド */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {fields.map((field, idx) => (
            <div
              key={field.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  #{idx + 1}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    padding: "0.08rem 0.35rem",
                    borderRadius: "3px",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {FIELD_TYPES.find((ft) => ft.type === field.type)?.label}
                </span>
                <label
                  style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  />
                  必須
                </label>
                <button
                  onClick={() => removeField(field.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  ✕
                </button>
              </div>
              <input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="質問文"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  padding: "0.4rem 0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  width: "100%",
                  boxSizing: "border-box" as const,
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              />
              {field.type === "select" && (
                <input
                  value={(field.options || []).join(",")}
                  onChange={(e) =>
                    updateField(field.id, {
                      options: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="選択肢（カンマ区切り）"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    padding: "0.35rem 0.5rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    width: "100%",
                    boxSizing: "border-box" as const,
                    marginTop: "0.4rem",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* フィールド追加 */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.type}
              onClick={() => addField(ft.type)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                padding: "0.4rem 0.7rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              + {ft.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.75rem",
  padding: "0.3rem 0.6rem",
  border: "1px solid var(--color-border)",
  borderRadius: "5px",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
const thStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  borderBottom: "2px solid var(--color-border)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  color: "var(--color-text-secondary)",
};
