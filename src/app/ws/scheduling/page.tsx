"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllPolls,
  getPoll,
  addPoll,
  votePoll,
  decidePoll,
  cancelPoll,
  deletePoll,
  STATUS_LABELS,
  STATUS_COLORS,
  ANSWER_LABELS,
  ANSWER_COLORS,
  type Poll,
} from "@/lib/ws-scheduling";

export default function SchedulingPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [candidates, setCandidates] = useState([{ date: "", time: "" }]);
  const [voter, setVoter] = useState("");
  const [answers, setAnswers] = useState<("ok" | "maybe" | "ng")[]>([]);

  useEffect(() => {
    reload();
  }, []);
  function reload() {
    setPolls(getAllPolls());
  }

  function handleCreate() {
    if (!form.title.trim() || candidates.every((c) => !c.date)) return;
    addPoll({ ...form, candidates: candidates.filter((c) => c.date) });
    setForm({ title: "", description: "" });
    setCandidates([{ date: "", time: "" }]);
    setShowForm(false);
    reload();
  }

  function handleVote(pollId: string) {
    if (!voter.trim()) return;
    votePoll(pollId, voter, answers);
    setVoter("");
    reload();
  }

  function handleDecide(pollId: string, idx: number) {
    decidePoll(pollId, idx);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deletePoll(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  const selected = selectedId ? getPoll(selectedId) : null;

  if (selected) {
    const voters = Array.from(
      new Set(selected.candidates.flatMap((c) => c.votes.map((v) => v.voter))),
    );
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
            日程調整
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
            marginBottom: "1rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, flex: 1 }}>{selected.title}</h2>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#fff",
                backgroundColor: STATUS_COLORS[selected.status],
                padding: "0.15rem 0.5rem",
                borderRadius: 4,
              }}
            >
              {STATUS_LABELS[selected.status]}
            </span>
          </div>
          {selected.description && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.8rem",
              }}
            >
              {selected.description}
            </p>
          )}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>候補日時</th>
                  {voters.map((v) => (
                    <th key={v} style={{ padding: "0.5rem", textAlign: "center" }}>
                      {v}
                    </th>
                  ))}
                  <th style={{ padding: "0.5rem", textAlign: "center" }}>OK数</th>
                  {selected.status === "open" && <th style={{ padding: "0.5rem" }} />}
                </tr>
              </thead>
              <tbody>
                {selected.candidates.map((c, ci) => {
                  const okCount = c.votes.filter((v) => v.answer === "ok").length;
                  return (
                    <tr
                      key={ci}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        backgroundColor:
                          selected.decidedIndex === ci ? "rgba(5,150,105,0.08)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "0.5rem", fontWeight: 600 }}>
                        {c.date} {c.time}
                        {selected.decidedIndex === ci ? " (確定)" : ""}
                      </td>
                      {voters.map((v) => {
                        const vote = c.votes.find((vo) => vo.voter === v);
                        return (
                          <td
                            key={v}
                            style={{
                              padding: "0.5rem",
                              textAlign: "center",
                              color: vote
                                ? ANSWER_COLORS[vote.answer]
                                : "var(--color-text-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            {vote ? ANSWER_LABELS[vote.answer] : "-"}
                          </td>
                        );
                      })}
                      <td style={{ padding: "0.5rem", textAlign: "center", fontWeight: 700 }}>
                        {okCount}
                      </td>
                      {selected.status === "open" && (
                        <td style={{ padding: "0.5rem" }}>
                          <button
                            onClick={() => handleDecide(selected.id, ci)}
                            style={{
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.5rem",
                              borderRadius: 4,
                              border: "1px solid #059669",
                              color: "#059669",
                              backgroundColor: "var(--color-surface)",
                              cursor: "pointer",
                            }}
                          >
                            確定
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selected.status === "open" && (
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
              回答する
            </h3>
            <input
              value={voter}
              onChange={(e) => setVoter(e.target.value)}
              placeholder="あなたの名前"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                marginBottom: "0.5rem",
              }}
            />
            {selected.candidates.map((c, ci) => (
              <div
                key={ci}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                <span style={{ fontSize: "0.85rem", minWidth: 130 }}>
                  {c.date} {c.time}
                </span>
                {(["ok", "maybe", "ng"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      const na = [...answers];
                      na[ci] = a;
                      setAnswers(na);
                    }}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.6rem",
                      borderRadius: 4,
                      border: `1px solid ${ANSWER_COLORS[a]}`,
                      backgroundColor:
                        answers[ci] === a ? ANSWER_COLORS[a] : "var(--color-surface)",
                      color: answers[ci] === a ? "#fff" : ANSWER_COLORS[a],
                      cursor: "pointer",
                    }}
                  >
                    {ANSWER_LABELS[a]}
                  </button>
                ))}
              </div>
            ))}
            <button
              onClick={() => handleVote(selected.id)}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              投票
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {selected.status === "open" && (
            <button
              onClick={() => {
                cancelPoll(selected.id);
                reload();
              }}
              style={{
                fontSize: "0.8rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #6B7280",
                color: "#6B7280",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              中止
            </button>
          )}
          <button
            onClick={() => handleDelete(selected.id)}
            style={{
              fontSize: "0.8rem",
              padding: "0.4rem 0.8rem",
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
        &gt; 日程調整
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>日程調整</h1>
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
          新規作成
        </button>
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
            日程調整を作成
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
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="説明"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>候補日時</p>
          {candidates.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <input
                type="date"
                value={c.date}
                onChange={(e) => {
                  const nc = [...candidates];
                  nc[i] = { ...nc[i], date: e.target.value };
                  setCandidates(nc);
                }}
                style={{
                  padding: "0.4rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
              <input
                type="time"
                value={c.time}
                onChange={(e) => {
                  const nc = [...candidates];
                  nc[i] = { ...nc[i], time: e.target.value };
                  setCandidates(nc);
                }}
                style={{
                  padding: "0.4rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
              {candidates.length > 1 && (
                <button
                  onClick={() => setCandidates(candidates.filter((_, j) => j !== i))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#DC2626",
                  }}
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setCandidates([...candidates, { date: "", time: "" }])}
            style={{
              fontSize: "0.8rem",
              color: "var(--color-accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginBottom: "0.5rem",
            }}
          >
            + 候補を追加
          </button>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              onClick={handleCreate}
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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {polls.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedId(p.id);
              setAnswers(p.candidates.map(() => "ok"));
            }}
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
                  color: "#fff",
                  backgroundColor: STATUS_COLORS[p.status],
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {STATUS_LABELS[p.status]}
              </span>
              <span style={{ fontWeight: 600, flex: 1 }}>{p.title}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {p.candidates.length}候補
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {new Date(p.updatedAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        ))}
        {polls.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            日程調整がありません
          </p>
        )}
      </div>
    </div>
  );
}
