"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllContracts,
  addContract,
  updateContract,
  deleteContract,
  getExpiringContracts,
  CONTRACT_TYPES,
  CONTRACT_STATUS_LABELS,
  type Contract,
} from "@/lib/ws-contracts";

const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  expired: "#DC2626",
  terminated: "#6B7280",
  draft: "#D97706",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [expiring, setExpiring] = useState<Contract[]>([]);
  const [form, setForm] = useState({
    title: "",
    counterparty: "",
    type: CONTRACT_TYPES[0],
    status: "draft" as Contract["status"],
    startDate: "",
    endDate: "",
    autoRenew: false,
    amount: "",
    currency: "JPY",
    notes: "",
    tags: [] as string[],
    alertDays: 30,
  });

  function reload() {
    let list = getAllContracts();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.counterparty.toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    setContracts(list);
    setExpiring(getExpiringContracts(30));
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(c: Contract) {
    setForm({
      title: c.title,
      counterparty: c.counterparty,
      type: c.type,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate || "",
      autoRenew: c.autoRenew,
      amount: c.amount,
      currency: c.currency,
      notes: c.notes,
      tags: c.tags,
      alertDays: c.alertDays,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const data = { ...form, endDate: form.endDate || null };
    if (editId) updateContract(editId, data);
    else addContract(data);
    setForm({
      title: "",
      counterparty: "",
      type: CONTRACT_TYPES[0],
      status: "draft",
      startDate: "",
      endDate: "",
      autoRenew: false,
      amount: "",
      currency: "JPY",
      notes: "",
      tags: [],
      alertDays: 30,
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteContract(id);
    reload();
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
        &gt; 契約台帳
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>契約台帳</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              title: "",
              counterparty: "",
              type: CONTRACT_TYPES[0],
              status: "draft",
              startDate: "",
              endDate: "",
              autoRenew: false,
              amount: "",
              currency: "JPY",
              notes: "",
              tags: [],
              alertDays: 30,
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

      {expiring.length > 0 && (
        <div
          style={{
            backgroundColor: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: 8,
            padding: "0.8rem 1rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.3rem" }}>
            30日以内に期限の契約
          </div>
          {expiring.map((c) => (
            <div key={c.id} style={{ fontSize: "0.8rem" }}>
              {c.title} ({c.counterparty}) - 期限: {c.endDate}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タイトル・取引先で検索"
          style={{
            flex: 1,
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
          {Object.entries(CONTRACT_STATUS_LABELS).map(([k, v]) => (
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
            {editId ? "契約を編集" : "契約を追加"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="契約名 *"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.counterparty}
              onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
              placeholder="取引先"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {CONTRACT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Contract["status"] })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {Object.entries(CONTRACT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                開始日
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                終了日
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
            <input
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="金額"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              <option>JPY</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}
          >
            <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={form.autoRenew}
                onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })}
              />{" "}
              自動更新
            </label>
            <label
              style={{
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginLeft: "auto",
              }}
            >
              通知:
              <input
                type="number"
                value={form.alertDays}
                onChange={(e) => setForm({ ...form, alertDays: Number(e.target.value) })}
                style={{
                  width: 60,
                  padding: "0.3rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
              日前
            </label>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="備考"
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginTop: "0.5rem",
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

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>契約名</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>取引先</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>種別</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>開始</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>終了</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>状態</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>金額</th>
              <th style={{ padding: "0.5rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "0.5rem", fontWeight: 600 }}>{c.title}</td>
                <td style={{ padding: "0.5rem" }}>{c.counterparty}</td>
                <td style={{ padding: "0.5rem" }}>{c.type}</td>
                <td style={{ padding: "0.5rem" }}>{c.startDate}</td>
                <td style={{ padding: "0.5rem" }}>{c.endDate || "-"}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#fff",
                      backgroundColor: STATUS_COLORS[c.status],
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                    }}
                  >
                    {CONTRACT_STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                  {c.amount ? `${c.amount} ${c.currency}` : "-"}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <button
                    onClick={() => openEdit(c)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      cursor: "pointer",
                      marginRight: "0.3rem",
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: 4,
                      border: "1px solid #DC2626",
                      color: "#DC2626",
                      backgroundColor: "var(--color-surface)",
                      cursor: "pointer",
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            契約がありません
          </p>
        )}
      </div>
    </div>
  );
}
