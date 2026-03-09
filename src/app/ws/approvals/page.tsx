"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";

interface ApprovalStep {
  approver_id: string;
  approver_name: string;
  status: "pending" | "approved" | "rejected";
  comment: string;
  acted_at: string | null;
}

interface Approval {
  id: string;
  requester_id: string;
  title: string;
  description: string | null;
  category: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  steps: ApprovalStep[];
  current_step: number;
  created_at: string;
  updated_at: string;
}

type Tab = "my" | "review" | "history";

function authHeader(s: Session) {
  return { Authorization: `Bearer ${s.memberId}:${s.token}` };
}

/** 電子印影 SVG 生成 */
function SealStamp({
  name,
  date,
  status,
}: {
  name: string;
  date: string;
  status: "approved" | "rejected";
}) {
  const color = status === "approved" ? "#DC2626" : "#6B7280";
  const label = status === "approved" ? "承認" : "差戻";
  const displayName = name.length > 4 ? name.slice(0, 4) : name;
  const d = new Date(date);
  const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="24" cy="24" r="19" fill="none" stroke={color} strokeWidth="0.5" />
      <line x1="5" y1="16" x2="43" y2="16" stroke={color} strokeWidth="0.5" />
      <line x1="5" y1="32" x2="43" y2="32" stroke={color} strokeWidth="0.5" />
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fill={color}
        fontSize="7"
        fontFamily="var(--font-sans)"
        fontWeight="700"
      >
        {label}
      </text>
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fill={color}
        fontSize={displayName.length > 3 ? "7" : "9"}
        fontFamily="var(--font-sans)"
        fontWeight="700"
      >
        {displayName}
      </text>
      <text
        x="24"
        y="39"
        textAnchor="middle"
        fill={color}
        fontSize="5.5"
        fontFamily="var(--font-sans)"
      >
        {dateStr}
      </text>
    </svg>
  );
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "審査中", color: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
  approved: { label: "承認済", color: "var(--color-add-fg)", bg: "var(--color-add-bg)" },
  rejected: { label: "差戻し", color: "var(--color-del-fg)", bg: "var(--color-del-bg)" },
  withdrawn: { label: "取下げ", color: "var(--color-text-secondary)", bg: "var(--color-bg)" },
};

const CATEGORIES = [
  { id: "general", label: "一般" },
  { id: "document", label: "文書" },
  { id: "expense", label: "経費" },
  { id: "leave", label: "休暇" },
  { id: "purchase", label: "購入" },
];

export default function WsApprovalsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("my");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [_approverName, setApproverName] = useState("");
  // Members for approver selection
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [actionComment, setActionComment] = useState("");
  // Multi-stage
  const [stageApprovers, setStageApprovers] = useState<{ name: string }[]>([{ name: "" }]);
  const [proxyApproval, setProxyApproval] = useState(false);

  async function fetchApprovals(s: Session, role: Tab) {
    setLoading(true);
    const r = await fetch(
      `/api/ws/approvals?member_id=${s.memberId}&role=${role === "review" ? "approver" : "requester"}`,
    );
    if (r.ok) {
      const d = await r.json();
      setApprovals(d.approvals || []);
    }
    setLoading(false);
  }

  async function fetchMembers() {
    const r = await fetch(`/api/members`);
    if (r.ok) {
      const d = await r.json();
      setMembers(
        (d.members || []).map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })),
      );
    }
  }

  useEffect(() => {
    const s = getSession();
    setSession(s); // eslint-disable-line react-hooks/set-state-in-effect
    if (s) {
      fetchApprovals(s, "my");
      fetchMembers();
    } else setLoading(false);
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    if (session) {
      // History tab: fetch all (both requester + approver combined)
      if (t === "history") {
        (async () => {
          setLoading(true);
          const [r1, r2] = await Promise.all([
            fetch(`/api/ws/approvals?member_id=${session.memberId}&role=requester`),
            fetch(`/api/ws/approvals?member_id=${session.memberId}&role=approver`),
          ]);
          const d1 = r1.ok ? await r1.json() : { approvals: [] };
          const d2 = r2.ok ? await r2.json() : { approvals: [] };
          const map = new Map<string, Approval>();
          for (const a of [...(d1.approvals || []), ...(d2.approvals || [])]) map.set(a.id, a);
          setApprovals(Array.from(map.values()));
          setLoading(false);
        })();
      } else {
        fetchApprovals(session, t);
      }
    }
  }

  async function handleCreate() {
    if (!session || !newTitle) return;
    // Build multi-stage steps
    const steps: { approver_id: string; approver_name: string }[] = [];
    for (const sa of stageApprovers) {
      if (!sa.name.trim()) continue;
      const approver = members.find((m) => m.name === sa.name);
      if (approver) {
        steps.push({ approver_id: approver.id, approver_name: approver.name });
      } else {
        // Allow non-member names for flexibility
        steps.push({ approver_id: sa.name, approver_name: sa.name });
      }
    }
    if (steps.length === 0) {
      alert("少なくとも1人の承認者を指定してください");
      return;
    }
    await fetch(`/api/ws/approvals`, {
      method: "POST",
      headers: { ...authHeader(session), "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc || null,
        category: newCategory,
        steps,
        proxy_approval: proxyApproval,
      }),
    });
    setShowNew(false);
    setNewTitle("");
    setNewDesc("");
    setApproverName("");
    setStageApprovers([{ name: "" }]);
    setProxyApproval(false);
    fetchApprovals(session, tab);
  }

  async function handleAction(id: string, action: "approve" | "reject" | "withdraw") {
    if (!session) return;
    await fetch(`/api/ws/approvals`, {
      method: "PATCH",
      headers: { ...authHeader(session), "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, comment: actionComment }),
    });
    setActionComment("");
    fetchApprovals(session, tab);
  }

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
            <span>承認</span>
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
              承認フロー
            </h1>
            {session && (
              <button
                onClick={() => setShowNew(!showNew)}
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
                + 新規申請
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* タブ */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[
            { key: "my" as Tab, label: "自分の申請" },
            { key: "review" as Tab, label: "承認待ち" },
            { key: "history" as Tab, label: "履歴ログ" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                padding: "0.5rem 1rem",
                border: tab === t.key ? "none" : "1px solid var(--color-border)",
                borderRadius: "6px",
                backgroundColor: tab === t.key ? "var(--color-accent)" : "var(--color-surface)",
                color: tab === t.key ? "#fff" : "var(--color-text-primary)",
                cursor: "pointer",
                fontWeight: tab === t.key ? 700 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 新規申請フォーム */}
        {showNew && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              新規申請
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="申請タイトル"
                  style={inputStyle}
                />
              </div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div />
              <div style={{ gridColumn: "1 / -1" }}>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="申請内容の説明"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>

            {/* Multi-stage Approvers */}
            <div style={{ marginTop: "0.75rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                承認ステップ
              </p>
              {stageApprovers.map((sa, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      minWidth: 60,
                    }}
                  >
                    ステップ{idx + 1}
                  </span>
                  <input
                    value={sa.name}
                    onChange={(e) => {
                      const updated = [...stageApprovers];
                      updated[idx] = { name: e.target.value };
                      setStageApprovers(updated);
                    }}
                    placeholder="承認者名"
                    list="approver-list"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {stageApprovers.length > 1 && (
                    <button
                      onClick={() => setStageApprovers(stageApprovers.filter((_, i) => i !== idx))}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <datalist id="approver-list">
                {members.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
              <button
                onClick={() => setStageApprovers([...stageApprovers, { name: "" }])}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "5px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  marginTop: "0.25rem",
                }}
              >
                + ステップ追加
              </button>
            </div>

            {/* Proxy approval */}
            <div style={{ marginTop: "0.75rem" }}>
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
                  checked={proxyApproval}
                  onChange={(e) => setProxyApproval(e.target.checked)}
                />
                代理承認を許可
              </label>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button
                onClick={handleCreate}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  padding: "0.45rem 1rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                申請する
              </button>
              <button
                onClick={() => setShowNew(false)}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  padding: "0.45rem 1rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 一覧 */}
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
        ) : approvals.length === 0 ? (
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
              {tab === "my" ? "申請はありません" : "承認待ちの申請はありません"}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {tab === "my"
                ? "「+ 新規申請」から承認申請を作成できます。"
                : "承認依頼があるとここに表示されます。"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {approvals.map((a) => {
              const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending;
              const currentStep = a.steps[a.current_step];
              const isCurrentApprover =
                currentStep?.approver_id === session?.memberId && currentStep?.status === "pending";
              const canApprove =
                tab === "review" &&
                a.status === "pending" &&
                (isCurrentApprover ||
                  a.steps.some(
                    (s) => s.approver_id === session?.memberId && s.status === "pending",
                  ));
              const canWithdraw =
                tab === "my" && a.status === "pending" && a.requester_id === session?.memberId;
              return (
                <div
                  key={a.id}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "1rem",
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
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        padding: "0.08rem 0.4rem",
                        borderRadius: "3px",
                        backgroundColor: st.bg,
                        color: st.color,
                      }}
                    >
                      {st.label}
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
                      {CATEGORIES.find((c) => c.id === a.category)?.label || a.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {a.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-text-secondary)",
                        marginLeft: "auto",
                      }}
                    >
                      {new Date(a.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {a.description && (
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {a.description}
                    </p>
                  )}

                  {/* Multi-stage Progress Indicator */}
                  {a.steps.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                        marginBottom: "0.5rem",
                        padding: "0.4rem 0",
                        overflowX: "auto",
                      }}
                    >
                      {a.steps.map((step, idx) => {
                        const isActive = idx === a.current_step && a.status === "pending";
                        const isDone = step.status === "approved";
                        const isRejected = step.status === "rejected";
                        const circleColor = isDone
                          ? "#059669"
                          : isRejected
                            ? "#DC2626"
                            : isActive
                              ? "var(--color-accent)"
                              : "var(--color-border)";
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center" }}>
                            {idx > 0 && (
                              <div
                                style={{
                                  width: 24,
                                  height: 2,
                                  backgroundColor: isDone ? "#059669" : "var(--color-border)",
                                }}
                              />
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                minWidth: 50,
                              }}
                            >
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: "50%",
                                  border: `2px solid ${circleColor}`,
                                  backgroundColor: isDone
                                    ? "#059669"
                                    : isRejected
                                      ? "#DC2626"
                                      : "var(--color-surface)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.6rem",
                                    color: isDone || isRejected ? "#fff" : circleColor,
                                    fontWeight: 700,
                                  }}
                                >
                                  {isDone ? "\u2713" : isRejected ? "\u2717" : idx + 1}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.6rem",
                                  color: isActive
                                    ? "var(--color-accent)"
                                    : "var(--color-text-secondary)",
                                  marginTop: 2,
                                  whiteSpace: "nowrap",
                                  fontWeight: isActive ? 700 : 400,
                                }}
                              >
                                {step.approver_name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ステップ + 電子印影 */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: canApprove || canWithdraw ? "0.75rem" : 0,
                    }}
                  >
                    {a.steps.map((step, idx) => {
                      const sColor =
                        step.status === "approved"
                          ? "#059669"
                          : step.status === "rejected"
                            ? "#DC2626"
                            : "var(--color-text-secondary)";
                      return (
                        <div
                          key={idx}
                          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          {idx > 0 && (
                            <span
                              style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem" }}
                            >
                              &rarr;
                            </span>
                          )}
                          {(step.status === "approved" || step.status === "rejected") &&
                          step.acted_at ? (
                            <SealStamp
                              name={step.approver_name}
                              date={step.acted_at}
                              status={step.status}
                            />
                          ) : (
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.75rem",
                                color: sColor,
                                fontWeight: 600,
                              }}
                            >
                              {idx === a.current_step && a.status === "pending"
                                ? "\u25CF"
                                : "\u25CB"}{" "}
                              {step.approver_name}
                            </span>
                          )}
                          {step.comment && (
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.68rem",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              &laquo;{step.comment}&raquo;
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* アクション */}
                  {(canApprove || canWithdraw) && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {canApprove && (
                        <>
                          <input
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            placeholder="コメント（任意）"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.8rem",
                              padding: "0.35rem 0.5rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "4px",
                              flex: 1,
                              maxWidth: "250px",
                              backgroundColor: "var(--color-bg)",
                              color: "var(--color-text-primary)",
                            }}
                          />
                          <button
                            onClick={() => handleAction(a.id, "approve")}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                              padding: "0.35rem 0.7rem",
                              backgroundColor: "var(--color-add-bg)",
                              color: "var(--color-add-fg)",
                              border: "1px solid var(--color-add-fg)",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleAction(a.id, "reject")}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                              padding: "0.35rem 0.7rem",
                              backgroundColor: "var(--color-del-bg)",
                              color: "var(--color-del-fg)",
                              border: "1px solid var(--color-del-fg)",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            差戻し
                          </button>
                        </>
                      )}
                      {canWithdraw && (
                        <button
                          onClick={() => handleAction(a.id, "withdraw")}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.78rem",
                            padding: "0.35rem 0.7rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "5px",
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          取り下げ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 履歴ログ */}
        {tab === "history" && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {approvals.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                承認履歴がありません
              </p>
            ) : (
              approvals
                .flatMap((a) =>
                  a.steps
                    .filter((s) => s.acted_at)
                    .map((s) => ({
                      ...s,
                      approvalTitle: a.title,
                      approvalId: a.id,
                      category: a.category,
                    })),
                )
                .sort((x, y) => (y.acted_at || "").localeCompare(x.acted_at || ""))
                .map((log, i) => {
                  const cat = CATEGORIES.find((c) => c.id === log.category);
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        padding: "0.7rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <SealStamp
                        name={log.approver_name}
                        date={log.acted_at!}
                        status={log.status as "approved" | "rejected"}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              padding: "0.05rem 0.3rem",
                              borderRadius: 3,
                              backgroundColor:
                                log.status === "approved"
                                  ? "var(--color-add-bg)"
                                  : "var(--color-del-bg)",
                              color:
                                log.status === "approved"
                                  ? "var(--color-add-fg)"
                                  : "var(--color-del-fg)",
                            }}
                          >
                            {log.status === "approved" ? "承認" : "差戻し"}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              padding: "0.05rem 0.3rem",
                              borderRadius: 3,
                              backgroundColor: "var(--color-bg)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {cat?.label}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {log.approvalTitle}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "0.15rem",
                          }}
                        >
                          {log.approver_name} · {new Date(log.acted_at!).toLocaleString("ja-JP")}
                          {log.comment && ` · 「${log.comment}」`}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.85rem",
  padding: "0.5rem 0.65rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  width: "100%",
  boxSizing: "border-box" as const,
};
