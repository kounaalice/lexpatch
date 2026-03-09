"use client";
import { uuid } from "@/lib/uuid";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllTickets,
  getTicket,
  addTicket,
  updateTicket,
  deleteTicket,
  addComment,
  getTicketStats,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TICKET_CATEGORIES,
  type Ticket,
} from "@/lib/ws-tickets";

// ── Template Responses ──
interface TicketTemplate {
  id: string;
  title: string;
  content: string;
}
function loadTicketTemplates(): TicketTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_ws_ticket_templates") || "[]");
  } catch {
    return [];
  }
}
function saveTicketTemplates(templates: TicketTemplate[]) {
  localStorage.setItem("lp_ws_ticket_templates", JSON.stringify(templates));
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [commentText, setCommentText] = useState("");
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Ticket["priority"],
    category: TICKET_CATEGORIES[0],
    assignee: "",
    reporter: "",
    dueDate: "",
    tags: "",
  });
  const [ticketTemplates, setTicketTemplates] = useState<TicketTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  useEffect(() => {
    reload();
    setTicketTemplates(loadTicketTemplates());
  }, []);
  useEffect(() => {
    reload();
  }, [search, statusFilter, priorityFilter]);

  function reload() {
    let list = getAllTickets();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          String(t.number).includes(q),
      );
    }
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (priorityFilter) list = list.filter((t) => t.priority === priorityFilter);
    setTickets(list);
    setStats(getTicketStats());
  }

  function handleSave() {
    if (!form.title.trim()) return;
    addTicket({
      ...form,
      status: "open",
      dueDate: form.dueDate || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setForm({
      title: "",
      description: "",
      priority: "medium",
      category: TICKET_CATEGORIES[0],
      assignee: "",
      reporter: "",
      dueDate: "",
      tags: "",
    });
    setShowForm(false);
    reload();
  }

  function handleStatusChange(id: string, status: Ticket["status"]) {
    updateTicket(id, { status });
    reload();
  }

  function handleAddComment() {
    if (!commentText.trim() || !selectedId) return;
    addComment(selectedId, commentText, "自分");
    setCommentText("");
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteTicket(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  const selected = selectedId ? getTicket(selectedId) : null;

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
            チケット
          </span>{" "}
          &gt; #{selected.number}
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
            marginBottom: "1rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              #{selected.number}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#fff",
                backgroundColor: PRIORITY_COLORS[selected.priority],
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
              }}
            >
              {PRIORITY_LABELS[selected.priority]}
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
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            {selected.title}
          </h2>
          <div
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              marginBottom: "1rem",
            }}
          >
            {selected.description}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {selected.assignee && <span>担当: {selected.assignee}</span>}
            {selected.category && <span>分類: {selected.category}</span>}
            {selected.dueDate && <span>期限: {selected.dueDate}</span>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {(["open", "in_progress", "resolved", "closed"] as const)
              .filter((s) => s !== selected.status)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(selected.id, s)}
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.3rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${STATUS_COLORS[s]}`,
                    color: STATUS_COLORS[s],
                    backgroundColor: "var(--color-surface)",
                    cursor: "pointer",
                  }}
                >
                  {STATUS_LABELS[s]}に変更
                </button>
              ))}
            <button
              onClick={() => handleDelete(selected.id)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.6rem",
                borderRadius: 6,
                border: "1px solid #DC2626",
                color: "#DC2626",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              削除
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.8rem" }}>
          コメント ({selected.comments.length})
        </h3>
        <div
          style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを追加"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={handleAddComment}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 0.8rem",
              cursor: "pointer",
            }}
          >
            投稿
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                fontSize: "0.78rem",
                padding: "0.3rem 0.6rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              テンプレ
            </button>
            {showTemplates && ticketTemplates.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 4,
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  minWidth: 200,
                  zIndex: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {ticketTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCommentText(t.content);
                      setShowTemplates(false);
                    }}
                    style={{
                      padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = "var(--color-surface)";
                    }}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            )}
            {showTemplates && ticketTemplates.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 4,
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                テンプレートなし
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (!commentText.trim()) return;
              const name = prompt("テンプレート名を入力", "");
              if (!name) return;
              const updated = [
                ...ticketTemplates,
                { id: uuid(), title: name, content: commentText },
              ];
              saveTicketTemplates(updated);
              setTicketTemplates(updated);
            }}
            style={{
              fontSize: "0.78rem",
              padding: "0.3rem 0.6rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            テンプレ保存
          </button>
          <button
            onClick={() => setShowTemplateManager(!showTemplateManager)}
            style={{
              fontSize: "0.78rem",
              padding: "0.3rem 0.6rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            テンプレ管理
          </button>
        </div>
        {showTemplateManager && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              テンプレート一覧
            </h4>
            {ticketTemplates.length === 0 ? (
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                テンプレートがありません
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {ticketTemplates.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.3rem 0.5rem",
                      backgroundColor: "var(--color-bg)",
                      borderRadius: 4,
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, flex: 1 }}>{t.title}</span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--color-text-secondary)",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.content}
                    </span>
                    <button
                      onClick={() => {
                        const updated = ticketTemplates.filter((tt) => tt.id !== t.id);
                        saveTicketTemplates(updated);
                        setTicketTemplates(updated);
                      }}
                      style={{
                        fontSize: "0.75rem",
                        color: "#DC2626",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {selected.comments.map((c) => (
          <div
            key={c.id}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "0.6rem 0.8rem",
              marginBottom: "0.4rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.3rem",
              }}
            >
              {c.author} - {new Date(c.createdAt).toLocaleString("ja-JP")}
            </div>
            <div style={{ fontSize: "0.85rem" }}>{c.content}</div>
          </div>
        ))}
      </div>
    );
  }

  const statuses: Ticket["status"][] = ["open", "in_progress", "resolved", "closed"];

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
        &gt; チケット
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>チケット管理</h1>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.5rem 0.8rem",
            cursor: "pointer",
            marginRight: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {viewMode === "list" ? "カンバン" : "リスト"}
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
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

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(
          [
            ["open", stats.open],
            ["in_progress", stats.inProgress],
            ["resolved", stats.resolved],
            ["closed", stats.closed],
          ] as const
        ).map(([k, v]) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: STATUS_COLORS[k],
              }}
            />
            <span>
              {STATUS_LABELS[k]}: {v}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索"
          style={{
            flex: 1,
            minWidth: 150,
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="">全ステータス</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="">全優先度</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
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
            チケットを追加
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="タイトル *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="説明"
            rows={4}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Ticket["priority"] })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              placeholder="担当者"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="タグ (カンマ区切り)"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginTop: "0.5rem",
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
              作成
            </button>
            <button
              onClick={() => setShowForm(false)}
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

      {viewMode === "kanban" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
          {statuses.map((s) => (
            <div key={s}>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "0.4rem",
                  textAlign: "center",
                  backgroundColor: STATUS_COLORS[s],
                  color: "#fff",
                  borderRadius: "6px 6px 0 0",
                }}
              >
                {STATUS_LABELS[s]}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  padding: "0.4rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "0 0 6px 6px",
                  minHeight: 100,
                }}
              >
                {tickets
                  .filter((t) => t.status === s)
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        padding: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                        #{t.number} {t.title}
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "#fff",
                          backgroundColor: PRIORITY_COLORS[t.priority],
                          padding: "0.05rem 0.3rem",
                          borderRadius: 4,
                        }}
                      >
                        {PRIORITY_LABELS[t.priority]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.8rem 1rem",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                  #{t.number}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#fff",
                    backgroundColor: PRIORITY_COLORS[t.priority],
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {PRIORITY_LABELS[t.priority]}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#fff",
                    backgroundColor: STATUS_COLORS[t.status],
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {STATUS_LABELS[t.status]}
                </span>
                <span style={{ fontWeight: 600, flex: 1 }}>{t.title}</span>
                {t.assignee && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {t.assignee}
                  </span>
                )}
                {t.dueDate && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {t.dueDate}
                  </span>
                )}
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}
            >
              チケットがありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}
