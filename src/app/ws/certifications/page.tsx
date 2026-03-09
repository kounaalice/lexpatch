"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  getExpiringCertifications,
  getExpiredCertifications,
  CERT_CATEGORIES,
  type Certification,
} from "@/lib/ws-certifications";

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  expired: "期限切れ",
  pending: "申請中",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  expired: "#DC2626",
  pending: "#D97706",
};

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [expiring, setExpiring] = useState<Certification[]>([]);
  const [expired, setExpired] = useState<Certification[]>([]);
  const [form, setForm] = useState({
    name: "",
    holder: "",
    issuer: "",
    category: CERT_CATEGORIES[0],
    acquiredDate: "",
    expiryDate: "",
    status: "active" as Certification["status"],
    certNumber: "",
    notes: "",
    alertDays: 60,
  });

  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    reload();
  }, [search, statusFilter]);

  function reload() {
    let list = getAllCertifications();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.holder.toLowerCase().includes(q) ||
          c.issuer.toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter((c) => computeStatus(c) === statusFilter);
    setCertifications(list);
    setExpiring(getExpiringCertifications(60));
    setExpired(getExpiredCertifications());
  }

  function computeStatus(c: Certification): string {
    if (!c.expiryDate) return c.status;
    const today = new Date().toISOString().slice(0, 10);
    if (c.expiryDate < today) return "expired";
    return c.status;
  }

  function openEdit(c: Certification) {
    setForm({
      name: c.name,
      holder: c.holder,
      issuer: c.issuer,
      category: c.category,
      acquiredDate: c.acquiredDate,
      expiryDate: c.expiryDate || "",
      status: c.status,
      certNumber: c.certNumber,
      notes: c.notes,
      alertDays: c.alertDays,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.holder.trim()) return;
    const data = { ...form, expiryDate: form.expiryDate || null };
    if (editId) updateCertification(editId, data);
    else addCertification(data);
    setForm({
      name: "",
      holder: "",
      issuer: "",
      category: CERT_CATEGORIES[0],
      acquiredDate: "",
      expiryDate: "",
      status: "active",
      certNumber: "",
      notes: "",
      alertDays: 60,
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteCertification(id);
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
        &gt; 資格・期限
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>資格・期限管理</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              name: "",
              holder: "",
              issuer: "",
              category: CERT_CATEGORIES[0],
              acquiredDate: "",
              expiryDate: "",
              status: "active",
              certNumber: "",
              notes: "",
              alertDays: 60,
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

      {expired.length > 0 && (
        <div
          style={{
            backgroundColor: "#FEE2E2",
            border: "1px solid #EF4444",
            borderRadius: 8,
            padding: "0.8rem 1rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#DC2626",
              marginBottom: "0.3rem",
            }}
          >
            期限切れ
          </div>
          {expired.map((c) => (
            <div key={c.id} style={{ fontSize: "0.8rem" }}>
              {c.name} ({c.holder}) - 期限: {c.expiryDate}
            </div>
          ))}
        </div>
      )}
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
            60日以内に期限
          </div>
          {expiring.map((c) => (
            <div key={c.id} style={{ fontSize: "0.8rem" }}>
              {c.name} ({c.holder}) - 期限: {c.expiryDate}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="資格名・保有者・発行者で検索"
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
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
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
            {editId ? "資格を編集" : "資格を追加"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="資格名 *"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.holder}
              onChange={(e) => setForm({ ...form, holder: e.target.value })}
              placeholder="保有者 *"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              placeholder="発行者"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {CERT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                取得日
              </label>
              <input
                type="date"
                value={form.acquiredDate}
                onChange={(e) => setForm({ ...form, acquiredDate: e.target.value })}
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
                有効期限
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
            <input
              value={form.certNumber}
              onChange={(e) => setForm({ ...form, certNumber: e.target.value })}
              placeholder="証明書番号"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Certification["status"] })
              }
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}
          >
            <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
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
              <th style={{ textAlign: "left", padding: "0.5rem" }}>資格名</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>保有者</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>発行者</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>分類</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>取得日</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>期限</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>状態</th>
              <th style={{ padding: "0.5rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((c) => {
              const st = computeStatus(c);
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "0.5rem" }}>{c.holder}</td>
                  <td style={{ padding: "0.5rem" }}>{c.issuer}</td>
                  <td style={{ padding: "0.5rem" }}>{c.category}</td>
                  <td style={{ padding: "0.5rem" }}>{c.acquiredDate}</td>
                  <td style={{ padding: "0.5rem" }}>{c.expiryDate || "-"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#fff",
                        backgroundColor: STATUS_COLORS[st] || "#6B7280",
                        padding: "0.1rem 0.4rem",
                        borderRadius: 4,
                      }}
                    >
                      {STATUS_LABELS[st] || st}
                    </span>
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
              );
            })}
          </tbody>
        </table>
        {certifications.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            資格がありません
          </p>
        )}
      </div>
    </div>
  );
}
