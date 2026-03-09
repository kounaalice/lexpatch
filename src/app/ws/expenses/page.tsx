"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllExpenses,
  addExpense,
  deleteExpense,
  getAllRates,
  addRate,
  deleteRate,
  getAllInvoices,
  addInvoice,
  deleteInvoice,
  calcSubtotal,
  calcTax,
  calcTotal,
  EXPENSE_CATEGORIES,
  STATUS_LABELS,
  STATUS_COLORS,
  type Expense,
  type Rate,
  type Invoice,
  type InvoiceItem,
} from "@/lib/ws-expenses";

export default function ExpensesPage() {
  const [tab, setTab] = useState<"expenses" | "rates" | "invoices">("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expForm, setExpForm] = useState({
    date: "",
    category: EXPENSE_CATEGORIES[0],
    description: "",
    amount: 0,
    status: "pending" as Expense["status"],
  });
  const [rateForm, setRateForm] = useState({ label: "", rate: 0 });
  const [calcHours, setCalcHours] = useState<Record<string, number>>({});
  const [invForm, setInvForm] = useState({
    type: "estimate" as Invoice["type"],
    title: "",
    client: "",
    taxRate: 10,
    items: [{ description: "", quantity: 1, unitPrice: 0 }] as InvoiceItem[],
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    reload();
  }, []);
  function reload() {
    setExpenses(getAllExpenses());
    setRates(getAllRates());
    setInvoices(getAllInvoices());
  }

  function handleAddExpense() {
    if (!expForm.date || !expForm.description.trim()) return;
    addExpense(expForm);
    setExpForm({
      date: "",
      category: EXPENSE_CATEGORIES[0],
      description: "",
      amount: 0,
      status: "pending",
    });
    setShowForm(false);
    reload();
  }

  function handleAddRate() {
    if (!rateForm.label.trim()) return;
    addRate(rateForm.label, rateForm.rate);
    setRateForm({ label: "", rate: 0 });
    reload();
  }

  function handleAddInvoice() {
    if (!invForm.title.trim()) return;
    addInvoice({
      ...invForm,
      status: "draft",
      items: invForm.items.filter((i) => i.description.trim()),
    });
    setInvForm({
      type: "estimate",
      title: "",
      client: "",
      taxRate: 10,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    });
    setShowForm(false);
    reload();
  }

  const filteredExpenses = expenses.filter((e) => {
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });

  const catSummary: Record<string, number> = {};
  for (const e of filteredExpenses)
    catSummary[e.category] = (catSummary[e.category] || 0) + e.amount;

  const tabs = [
    ["expenses", "経費"],
    ["rates", "単価設定"],
    ["invoices", "見積・請求"],
  ] as const;

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
        &gt; 経費・見積・請求
      </nav>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
        経費・見積・請求
      </h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {tabs.map(([k, v]) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              setShowForm(false);
            }}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: tab === k ? "var(--color-accent)" : "var(--color-surface)",
              color: tab === k ? "#fff" : "var(--color-text-primary)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {v}
          </button>
        ))}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            marginLeft: "auto",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.4rem 1rem",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          追加
        </button>
      </div>

      {/* 経費タブ */}
      {tab === "expenses" && (
        <>
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
                経費を追加
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="date"
                  value={expForm.date}
                  onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                  style={{
                    padding: "0.4rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                />
                <select
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  style={{
                    padding: "0.4rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <input
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                placeholder="内容 *"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.5rem",
                }}
              />
              <input
                type="number"
                value={expForm.amount || ""}
                onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                placeholder="金額"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.5rem",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleAddExpense}
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
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>期間:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "0.3rem",
                borderRadius: 4,
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
              }}
            />
            <span style={{ color: "var(--color-text-secondary)" }}>~</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: "0.3rem",
                borderRadius: 4,
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
              }}
            />
          </div>
          {Object.keys(catSummary).length > 0 && (
            <div
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}
            >
              {Object.entries(catSummary).map(([cat, amount]) => (
                <div
                  key={cat}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-secondary)" }}>{cat}: </span>
                  <span style={{ fontWeight: 600 }}>{amount.toLocaleString()}円</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {filteredExpenses.map((e) => (
              <div
                key={e.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.7rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", minWidth: 80 }}
                >
                  {e.date}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: STATUS_COLORS[e.status],
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {STATUS_LABELS[e.status]}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {e.category}
                </span>
                <span style={{ flex: 1, fontSize: "0.85rem" }}>{e.description}</span>
                <span style={{ fontWeight: 600 }}>{e.amount.toLocaleString()}円</span>
                <button
                  onClick={() => {
                    deleteExpense(e.id);
                    reload();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  x
                </button>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  padding: "2rem",
                }}
              >
                経費がありません
              </p>
            )}
          </div>
        </>
      )}

      {/* 単価タブ */}
      {tab === "rates" && (
        <>
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
                単価を追加
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input
                  value={rateForm.label}
                  onChange={(e) => setRateForm({ ...rateForm, label: e.target.value })}
                  placeholder="名称 *"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                />
                <input
                  type="number"
                  value={rateForm.rate || ""}
                  onChange={(e) => setRateForm({ ...rateForm, rate: Number(e.target.value) })}
                  placeholder="時間単価 (円)"
                  style={{
                    width: 120,
                    padding: "0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                />
                <button
                  onClick={handleAddRate}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {rates.map((r) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.7rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 600, flex: 1 }}>{r.label}</span>
                <span style={{ fontSize: "0.85rem" }}>{r.rate.toLocaleString()}円/h</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={calcHours[r.id] || ""}
                  onChange={(e) => setCalcHours({ ...calcHours, [r.id]: Number(e.target.value) })}
                  placeholder="時間"
                  style={{
                    width: 60,
                    padding: "0.3rem",
                    borderRadius: 4,
                    border: "1px solid var(--color-border)",
                    fontSize: "0.8rem",
                  }}
                />
                {calcHours[r.id] > 0 && (
                  <span
                    style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-accent)" }}
                  >
                    = {(r.rate * calcHours[r.id]).toLocaleString()}円
                  </span>
                )}
                <button
                  onClick={() => {
                    deleteRate(r.id);
                    reload();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  x
                </button>
              </div>
            ))}
            {rates.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  padding: "2rem",
                }}
              >
                単価が設定されていません
              </p>
            )}
          </div>
        </>
      )}

      {/* 見積・請求タブ */}
      {tab === "invoices" && (
        <>
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
                見積・請求を作成
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <select
                  value={invForm.type}
                  onChange={(e) =>
                    setInvForm({ ...invForm, type: e.target.value as Invoice["type"] })
                  }
                  style={{
                    padding: "0.4rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <option value="estimate">見積書</option>
                  <option value="invoice">請求書</option>
                </select>
                <input
                  type="number"
                  value={invForm.taxRate}
                  onChange={(e) => setInvForm({ ...invForm, taxRate: Number(e.target.value) })}
                  placeholder="税率 (%)"
                  style={{
                    padding: "0.4rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                />
              </div>
              <input
                value={invForm.title}
                onChange={(e) => setInvForm({ ...invForm, title: e.target.value })}
                placeholder="件名 *"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.5rem",
                }}
              />
              <input
                value={invForm.client}
                onChange={(e) => setInvForm({ ...invForm, client: e.target.value })}
                placeholder="宛先"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.5rem",
                }}
              />
              <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>明細</p>
              {invForm.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 60px 80px auto",
                    gap: "0.3rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  <input
                    value={item.description}
                    onChange={(e) => {
                      const ni = [...invForm.items];
                      ni[i] = { ...ni[i], description: e.target.value };
                      setInvForm({ ...invForm, items: ni });
                    }}
                    placeholder="内容"
                    style={{
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const ni = [...invForm.items];
                      ni[i] = { ...ni[i], quantity: Number(e.target.value) };
                      setInvForm({ ...invForm, items: ni });
                    }}
                    style={{
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                    }}
                  />
                  <input
                    type="number"
                    value={item.unitPrice || ""}
                    onChange={(e) => {
                      const ni = [...invForm.items];
                      ni[i] = { ...ni[i], unitPrice: Number(e.target.value) };
                      setInvForm({ ...invForm, items: ni });
                    }}
                    placeholder="単価"
                    style={{
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                    }}
                  />
                  {invForm.items.length > 1 && (
                    <button
                      onClick={() =>
                        setInvForm({ ...invForm, items: invForm.items.filter((_, j) => j !== i) })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#DC2626",
                        fontSize: "0.8rem",
                      }}
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setInvForm({
                    ...invForm,
                    items: [...invForm.items, { description: "", quantity: 1, unitPrice: 0 }],
                  })
                }
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                }}
              >
                + 明細を追加
              </button>
              <div style={{ textAlign: "right", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                <div>小計: {calcSubtotal(invForm.items).toLocaleString()}円</div>
                <div>
                  税({invForm.taxRate}%): {calcTax(invForm.items, invForm.taxRate).toLocaleString()}
                  円
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  合計: {calcTotal(invForm.items, invForm.taxRate).toLocaleString()}円
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleAddInvoice}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {invoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.7rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: inv.type === "estimate" ? "#7C3AED" : "#0369A1",
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {inv.type === "estimate" ? "見積" : "請求"}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: STATUS_COLORS[inv.status],
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {STATUS_LABELS[inv.status]}
                </span>
                <span style={{ flex: 1, fontWeight: 600 }}>{inv.title}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                  {inv.client}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {calcTotal(inv.items, inv.taxRate).toLocaleString()}円
                </span>
                <button
                  onClick={() => window.print()}
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    cursor: "pointer",
                  }}
                >
                  印刷
                </button>
                <button
                  onClick={() => {
                    deleteInvoice(inv.id);
                    reload();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  x
                </button>
              </div>
            ))}
            {invoices.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  padding: "2rem",
                }}
              >
                見積・請求書がありません
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
