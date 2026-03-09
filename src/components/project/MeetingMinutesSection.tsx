"use client";

import { useState } from "react";
import type { MeetingMinutes, MeetingActionItem } from "@/lib/meeting-minutes";

interface ProjectMember {
  name: string;
  org: string;
  role: string;
}
interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
}

interface Props {
  minutes: MeetingMinutes[];
  projectId: string;
  members: ProjectMember[];
  tasks: ProjectTask[];
  onMinutesChange: (minutes: MeetingMinutes[]) => void;
}

const S = {
  section: { marginTop: "1rem" } as React.CSSProperties,
  toggleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    width: "100%",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "0.75rem 1.25rem",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "var(--color-text-primary)",
    textAlign: "left" as const,
  },
  content: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    padding: "0.75rem 1.25rem",
    marginTop: "-1px",
  },
  card: {
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    padding: "0.75rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
  },
  badge: {
    display: "inline-block",
    fontSize: "0.65rem",
    padding: "0.1rem 0.35rem",
    borderRadius: "3px",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text-secondary)",
    marginRight: "0.25rem",
  },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.4rem 0.5rem",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    fontFamily: "var(--font-sans)",
    fontSize: "0.8rem",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text-primary)",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.4rem 0.5rem",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    fontFamily: "var(--font-sans)",
    fontSize: "0.8rem",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text-primary)",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  btn: {
    padding: "0.35rem 0.7rem",
    border: "none",
    borderRadius: "4px",
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  btnPrimary: {
    backgroundColor: "var(--color-accent)",
    color: "#fff",
  },
  btnCancel: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getAuthorName(): string {
  if (typeof window === "undefined") return "";
  try {
    const s = localStorage.getItem("lp_session");
    if (s) return JSON.parse(s).name ?? "";
  } catch {
    /* */
  }
  return "";
}

export default function MeetingMinutesSection({
  minutes,
  projectId,
  members,
  tasks,
  onMinutesChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(todayISO());
  const [attendees, setAttendees] = useState<string[]>([]);
  const [agenda, setAgenda] = useState("");
  const [decisions, setDecisions] = useState("");
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);

  function resetForm() {
    setEditId(null);
    setTitle("");
    setMeetingDate(todayISO());
    setAttendees([]);
    setAgenda("");
    setDecisions("");
    setActionItems([]);
    setShowForm(false);
  }

  function startEdit(m: MeetingMinutes) {
    setEditId(m.id);
    setTitle(m.title);
    setMeetingDate(m.meeting_date);
    setAttendees(m.attendees ?? []);
    setAgenda(m.agenda ?? "");
    setDecisions(m.decisions ?? "");
    setActionItems(m.action_items ?? []);
    setShowForm(true);
  }

  async function saveMinutes() {
    if (!title.trim() || !meetingDate) return;
    setSaving(true);
    try {
      const payload = {
        project_id: projectId,
        title: title.trim(),
        meeting_date: meetingDate,
        attendees,
        agenda: agenda.trim() || null,
        decisions: decisions.trim() || null,
        action_items: actionItems.filter((a) => a.description.trim()),
        author_name: getAuthorName() || null,
      };

      if (editId) {
        const res = await fetch(`/api/projects/minutes?id=${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        if (res.ok) {
          onMinutesChange(minutes.map((m) => (m.id === editId ? updated : m)));
        }
      } else {
        const res = await fetch("/api/projects/minutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        if (res.ok) {
          onMinutesChange([created, ...minutes]);
        }
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function deleteMinutes(id: string) {
    if (!confirm("この議事録を削除しますか？")) return;
    const res = await fetch(`/api/projects/minutes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onMinutesChange(minutes.filter((m) => m.id !== id));
    }
  }

  function toggleAttendee(name: string) {
    setAttendees((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function addActionItem() {
    setActionItems([...actionItems, { description: "", assignee: undefined, taskId: undefined }]);
  }

  function updateActionItem(idx: number, updates: Partial<MeetingActionItem>) {
    setActionItems(actionItems.map((a, i) => (i === idx ? { ...a, ...updates } : a)));
  }

  function removeActionItem(idx: number) {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  }

  return (
    <section style={S.section}>
      <button onClick={() => setOpen(!open)} style={S.toggleBtn}>
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: "0.7rem",
          }}
        >
          &#9654;
        </span>
        議事録
        {minutes.length > 0 && (
          <span
            style={{
              fontWeight: 400,
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginLeft: "0.3rem",
            }}
          >
            ({minutes.length})
          </span>
        )}
      </button>

      {open && (
        <div style={S.content}>
          {/* 新規ボタン */}
          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{ ...S.btn, ...S.btnPrimary, marginBottom: "0.75rem" }}
            >
              + 議事録を追加
            </button>
          )}

          {/* フォーム */}
          {showForm && (
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={S.label}>タイトル *</div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="第1回 検討会議"
                  style={S.input}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <div style={S.label}>会議日 *</div>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  style={{ ...S.input, width: "auto" }}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <div style={S.label}>出席者</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {members.map((m) => (
                    <label
                      key={m.name + m.org}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-sans)",
                        color: "var(--color-text-primary)",
                        cursor: "pointer",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        backgroundColor: attendees.includes(m.name)
                          ? "var(--color-add-bg)"
                          : "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={attendees.includes(m.name)}
                        onChange={() => toggleAttendee(m.name)}
                        style={{ margin: 0 }}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <div style={S.label}>議題・討議内容</div>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={3}
                  placeholder="議題や討議のポイント…"
                  style={S.textarea}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <div style={S.label}>決定事項</div>
                <textarea
                  value={decisions}
                  onChange={(e) => setDecisions(e.target.value)}
                  rows={2}
                  placeholder="合意された内容…"
                  style={S.textarea}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ ...S.label, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  アクションアイテム
                  <button
                    onClick={addActionItem}
                    style={{
                      ...S.btn,
                      fontSize: "0.65rem",
                      padding: "0.15rem 0.4rem",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    + 追加
                  </button>
                </div>
                {actionItems.map((ai, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "0.3rem",
                      alignItems: "flex-start",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <input
                      type="text"
                      value={ai.description}
                      onChange={(e) => updateActionItem(idx, { description: e.target.value })}
                      placeholder="アクション内容"
                      style={{ ...S.input, flex: 1 }}
                    />
                    <select
                      value={ai.assignee ?? ""}
                      onChange={(e) =>
                        updateActionItem(idx, { assignee: e.target.value || undefined })
                      }
                      style={{ ...S.input, width: "auto", minWidth: "80px" }}
                    >
                      <option value="">担当</option>
                      {members.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ai.taskId ?? ""}
                      onChange={(e) =>
                        updateActionItem(idx, { taskId: e.target.value || undefined })
                      }
                      style={{ ...S.input, width: "auto", minWidth: "80px" }}
                    >
                      <option value="">タスク紐付</option>
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title.length > 15 ? t.title.slice(0, 15) + "…" : t.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeActionItem(idx)}
                      style={{
                        ...S.btn,
                        fontSize: "0.7rem",
                        padding: "0.25rem 0.4rem",
                        backgroundColor: "var(--color-del-bg)",
                        color: "var(--color-del-fg)",
                      }}
                    >
                      &#10005;
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                <button
                  onClick={saveMinutes}
                  disabled={!title.trim() || !meetingDate || saving}
                  style={{
                    ...S.btn,
                    ...S.btnPrimary,
                    opacity: !title.trim() || !meetingDate || saving ? 0.5 : 1,
                    cursor: !title.trim() || !meetingDate || saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "保存中…" : editId ? "更新" : "保存"}
                </button>
                <button onClick={resetForm} style={{ ...S.btn, ...S.btnCancel }}>
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 一覧 */}
          {minutes.length === 0 && !showForm && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
              }}
            >
              まだ議事録がありません。
            </p>
          )}

          {minutes.map((m) => {
            const isExpanded = expandedId === m.id;
            return (
              <div key={m.id} style={S.card}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      minWidth: "70px",
                    }}
                  >
                    {m.meeting_date}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      flex: 1,
                    }}
                  >
                    {m.title}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      fontSize: "0.6rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    &#9654;
                  </span>
                </div>

                {/* 出席者バッジ */}
                {m.attendees.length > 0 && (
                  <div style={{ marginTop: "0.3rem" }}>
                    {m.attendees.map((a) => (
                      <span key={a} style={S.badge}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {isExpanded && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {m.agenda && (
                      <div style={{ marginBottom: "0.4rem" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--color-text-secondary)",
                            fontSize: "0.72rem",
                            marginBottom: "0.15rem",
                          }}
                        >
                          議題・討議内容
                        </div>
                        <div style={{ whiteSpace: "pre-wrap", color: "var(--color-text-primary)" }}>
                          {m.agenda}
                        </div>
                      </div>
                    )}
                    {m.decisions && (
                      <div style={{ marginBottom: "0.4rem" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--color-text-secondary)",
                            fontSize: "0.72rem",
                            marginBottom: "0.15rem",
                          }}
                        >
                          決定事項
                        </div>
                        <div style={{ whiteSpace: "pre-wrap", color: "var(--color-text-primary)" }}>
                          {m.decisions}
                        </div>
                      </div>
                    )}
                    {m.action_items.length > 0 && (
                      <div style={{ marginBottom: "0.4rem" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--color-text-secondary)",
                            fontSize: "0.72rem",
                            marginBottom: "0.15rem",
                          }}
                        >
                          アクションアイテム
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          {m.action_items.map((ai: MeetingActionItem, i: number) => (
                            <li
                              key={i}
                              style={{
                                color: "var(--color-text-primary)",
                                marginBottom: "0.15rem",
                              }}
                            >
                              {ai.description}
                              {ai.assignee && (
                                <span style={{ ...S.badge, marginLeft: "0.3rem" }}>
                                  {ai.assignee}
                                </span>
                              )}
                              {ai.taskId && (
                                <span
                                  style={{
                                    ...S.badge,
                                    marginLeft: "0.2rem",
                                    backgroundColor: "#EBF2FD",
                                    color: "#1B4B8A",
                                  }}
                                >
                                  タスク紐付
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.author_name && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                          marginTop: "0.3rem",
                        }}
                      >
                        記録: {m.author_name} / {new Date(m.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.4rem" }}>
                      <button
                        onClick={() => startEdit(m)}
                        style={{
                          ...S.btn,
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.5rem",
                          backgroundColor: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteMinutes(m.id)}
                        style={{
                          ...S.btn,
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.5rem",
                          backgroundColor: "var(--color-del-bg)",
                          color: "var(--color-del-fg)",
                          border: "none",
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
