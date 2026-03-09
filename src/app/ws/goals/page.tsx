"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllGoals,
  getGoal,
  addGoal,
  updateGoal,
  deleteGoal,
  addKeyResult,
  updateKeyResult,
  deleteKeyResult,
  calcGoalProgress,
  getQuarters,
  type Goal,
} from "@/lib/ws-goals";

const STATUS_LABELS: Record<string, string> = {
  active: "進行中",
  completed: "達成",
  cancelled: "中止",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#0369A1",
  completed: "#059669",
  cancelled: "#6B7280",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", period: "" });
  const [krForm, setKrForm] = useState({ title: "", target: 100, unit: "%" });
  const [showKrForm, setShowKrForm] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  function reload() {
    const all = getAllGoals();
    setGoals(periodFilter ? all.filter((g) => g.period === periodFilter) : all);
  }
  useEffect(() => {
    reload();
  }, [periodFilter]);

  function handleCreate() {
    if (!form.title.trim()) return;
    addGoal({
      title: form.title,
      description: form.description,
      period: form.period || getQuarters()[4],
    });
    setForm({ title: "", description: "", period: "" });
    setShowForm(false);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteGoal(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  function handleStatusChange(id: string, status: Goal["status"]) {
    updateGoal(id, { status });
    reload();
  }

  function handleAddKr() {
    if (!selectedId || !krForm.title.trim()) return;
    addKeyResult(selectedId, { title: krForm.title, target: krForm.target, unit: krForm.unit });
    setKrForm({ title: "", target: 100, unit: "%" });
    setShowKrForm(false);
    reload();
  }

  function handleKrValueChange(goalId: string, krId: string, value: number) {
    updateKeyResult(goalId, krId, value);
    reload();
  }

  function handleDeleteKr(goalId: string, krId: string) {
    deleteKeyResult(goalId, krId);
    reload();
  }

  const selected = selectedId ? getGoal(selectedId) : null;

  if (selected) {
    const progress = calcGoalProgress(selected);
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
            目標
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
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              {selected.period}
            </span>
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {selected.title}
          </h2>
          {selected.description && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.8rem",
              }}
            >
              {selected.description}
            </p>
          )}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <div
              style={{
                flex: 1,
                height: 8,
                backgroundColor: "var(--color-border)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "var(--color-accent)",
                  borderRadius: 4,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.8rem" }}>
            {(["active", "completed", "cancelled"] as const)
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
                  {STATUS_LABELS[s]}
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

        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.8rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>
            キーリザルト ({selected.keyResults.length})
          </h3>
          <button
            onClick={() => setShowKrForm(!showKrForm)}
            style={{
              fontSize: "0.8rem",
              padding: "0.3rem 0.8rem",
              borderRadius: 6,
              border: "none",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            追加
          </button>
        </div>

        {showKrForm && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "1rem",
              marginBottom: "0.8rem",
            }}
          >
            <input
              value={krForm.title}
              onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
              placeholder="KRタイトル *"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                marginBottom: "0.5rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                value={krForm.target}
                onChange={(e) => setKrForm({ ...krForm, target: Number(e.target.value) })}
                placeholder="目標値"
                style={{
                  width: 100,
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
              <input
                value={krForm.unit}
                onChange={(e) => setKrForm({ ...krForm, unit: e.target.value })}
                placeholder="単位"
                style={{
                  width: 80,
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
              <button
                onClick={handleAddKr}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.5rem 0.8rem",
                  cursor: "pointer",
                }}
              >
                追加
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {selected.keyResults.map((kr) => {
            const pct =
              kr.target > 0 ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
            return (
              <div
                key={kr.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
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
                  <span style={{ fontWeight: 600, flex: 1 }}>{kr.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    {kr.current} / {kr.target} {kr.unit}
                  </span>
                  <button
                    onClick={() => handleDeleteKr(selected.id, kr.id)}
                    style={{
                      fontSize: "0.7rem",
                      color: "#DC2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    削除
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="range"
                    min={0}
                    max={kr.target}
                    value={kr.current}
                    onChange={(e) =>
                      handleKrValueChange(selected.id, kr.id, Number(e.target.value))
                    }
                    style={{ flex: 1 }}
                  />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    backgroundColor: "var(--color-border)",
                    borderRadius: 2,
                    marginTop: "0.3rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: pct >= 100 ? "#059669" : "var(--color-accent)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {selected.keyResults.length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "1rem" }}
            >
              KRがありません
            </p>
          )}
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
        &gt; 目標
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>目標・OKR</h1>
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

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="">全期間</option>
          {getQuarters().map((q) => (
            <option key={q} value={q}>
              {q}
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
            目標を追加
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="目標タイトル *"
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
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
              resize: "vertical",
            }}
          />
          <select
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
          >
            <option value="">期間を選択</option>
            {getQuarters().map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
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
        {goals.map((g) => {
          const progress = calcGoalProgress(g);
          return (
            <div
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.8rem 1rem",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#fff",
                    backgroundColor: STATUS_COLORS[g.status],
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {STATUS_LABELS[g.status]}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {g.period}
                </span>
                <span style={{ fontWeight: 600, flex: 1 }}>{g.title}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: "var(--color-border)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: progress >= 100 ? "#059669" : "var(--color-accent)",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            目標がありません
          </p>
        )}
      </div>
    </div>
  );
}
