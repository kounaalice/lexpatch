"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllSlots,
  getSlot,
  addSlot,
  deleteSlot,
  addReservation,
  cancelReservation,
  remaining,
  type Slot,
} from "@/lib/ws-booking";

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: 1,
  });
  const [resForm, setResForm] = useState({ name: "", email: "", note: "" });

  function reload() {
    setSlots(getAllSlots());
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function handleCreate() {
    if (!form.title.trim() || !form.date || !form.startTime || !form.endTime) return;
    addSlot({
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      capacity: form.capacity,
    });
    setForm({ title: "", date: "", startTime: "", endTime: "", capacity: 1 });
    setShowForm(false);
    reload();
  }

  function handleReserve(slotId: string) {
    if (!resForm.name.trim()) return;
    const ok = addReservation(slotId, resForm);
    if (!ok) {
      alert("満席です");
      return;
    }
    setResForm({ name: "", email: "", note: "" });
    setShowReserve(false);
    reload();
  }

  function handleCancelRes(slotId: string, resId: string) {
    if (!confirm("予約をキャンセルしますか？")) return;
    cancelReservation(slotId, resId);
    reload();
  }

  function handleDeleteSlot(id: string) {
    if (!confirm("枠を削除しますか？")) return;
    deleteSlot(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  const selected = selectedId ? getSlot(selectedId) : null;

  // Group by date
  const grouped: Record<string, Slot[]> = {};
  for (const s of slots) {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  }

  if (selected) {
    const rem = remaining(selected);
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
            予約枠
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
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {selected.title}
          </h2>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.8rem",
              flexWrap: "wrap",
            }}
          >
            <span>{selected.date}</span>
            <span>
              {selected.startTime} - {selected.endTime}
            </span>
            <span style={{ color: rem > 0 ? "#059669" : "#DC2626", fontWeight: 600 }}>
              残り {rem} / {selected.capacity} 枠
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: `${(selected.reservations.length / selected.capacity) * 100}%`,
                height: "100%",
                backgroundColor: rem > 0 ? "#059669" : "#DC2626",
                borderRadius: 4,
                transition: "width 0.3s",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {rem > 0 && (
              <button
                onClick={() => setShowReserve(!showReserve)}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                予約する
              </button>
            )}
            <button
              onClick={() => handleDeleteSlot(selected.id)}
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
              枠を削除
            </button>
          </div>

          {showReserve && (
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.6rem" }}>
                予約フォーム
              </h3>
              <input
                value={resForm.name}
                onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
                placeholder="お名前 *"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.4rem",
                }}
              />
              <input
                value={resForm.email}
                onChange={(e) => setResForm({ ...resForm, email: e.target.value })}
                placeholder="メールアドレス"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.4rem",
                }}
              />
              <input
                value={resForm.note}
                onChange={(e) => setResForm({ ...resForm, note: e.target.value })}
                placeholder="備考"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.5rem",
                }}
              />
              <button
                onClick={() => handleReserve(selected.id)}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                予約
              </button>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.8rem" }}>
          予約一覧 ({selected.reservations.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {selected.reservations.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.6rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <span style={{ fontWeight: 600, flex: 1 }}>{r.name}</span>
              {r.email && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {r.email}
                </span>
              )}
              {r.note && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {r.note}
                </span>
              )}
              <button
                onClick={() => handleCancelRes(selected.id, r.id)}
                style={{
                  fontSize: "0.75rem",
                  color: "#DC2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                取消
              </button>
            </div>
          ))}
          {selected.reservations.length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "1rem" }}
            >
              予約はありません
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
        &gt; 予約枠管理
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>予約枠管理</h1>
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
          枠を追加
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
            予約枠を作成
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 80px",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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

      {Object.entries(grouped).map(([date, dateSlots]) => (
        <div key={date} style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "0.3rem",
            }}
          >
            {date}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {dateSlots.map((s) => {
              const rem = remaining(s);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "0.8rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, flex: 1 }}>{s.title}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                      {s.startTime}-{s.endTime}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: rem > 0 ? "#059669" : "#DC2626",
                        backgroundColor: rem > 0 ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                      }}
                    >
                      残り {rem} 枠
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {slots.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
          予約枠がありません
        </p>
      )}
    </div>
  );
}
