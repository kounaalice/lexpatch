"use client";
import { uuid } from "@/lib/uuid";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: string;
  timestamp: string;
  status: "sent" | "test";
}

const HOOKS_KEY = "lp_ws_webhooks";
const LOGS_KEY = "lp_ws_webhook_logs";
const MAX_LOGS = 20;

const EVENTS = [
  { value: "ticket.created", label: "チケット作成" },
  { value: "ticket.updated", label: "チケット更新" },
  { value: "expense.approved", label: "経費承認" },
  { value: "document.finalized", label: "文書確定" },
];

function loadArr<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function saveArr<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: "", events: [] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [testPayload, setTestPayload] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);
  function reload() {
    setHooks(loadArr<Webhook>(HOOKS_KEY));
    setLogs(loadArr<WebhookLog>(LOGS_KEY).sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }

  function handleSave() {
    if (!form.url.trim() || form.events.length === 0) return;
    const all = loadArr<Webhook>(HOOKS_KEY);
    if (editId) {
      const idx = all.findIndex((h) => h.id === editId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], url: form.url, events: form.events };
      }
    } else {
      all.push({
        id: uuid(),
        url: form.url,
        events: form.events,
        createdAt: new Date().toISOString(),
      });
    }
    saveArr(HOOKS_KEY, all);
    setForm({ url: "", events: [] });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleEdit(h: Webhook) {
    setForm({ url: h.url, events: [...h.events] });
    setEditId(h.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Webhookを削除しますか？")) return;
    saveArr(
      HOOKS_KEY,
      loadArr<Webhook>(HOOKS_KEY).filter((h) => h.id !== id),
    );
    reload();
  }

  function toggleEvent(ev: string) {
    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));
  }

  function handleTest(h: Webhook) {
    const event = h.events[0] || "test";
    const payload = JSON.stringify(
      {
        event,
        timestamp: new Date().toISOString(),
        data: { id: "sample-id", type: event, message: "テスト送信" },
        webhook_url: h.url,
      },
      null,
      2,
    );
    setTestPayload(payload);

    // Log the test
    const allLogs = loadArr<WebhookLog>(LOGS_KEY);
    allLogs.push({
      id: uuid(),
      webhookId: h.id,
      event,
      payload,
      timestamp: new Date().toISOString(),
      status: "test",
    });
    if (allLogs.length > MAX_LOGS) allLogs.splice(0, allLogs.length - MAX_LOGS);
    saveArr(LOGS_KEY, allLogs);
    reload();
  }

  function clearLogs() {
    if (!confirm("ログを削除しますか？")) return;
    saveArr(LOGS_KEY, []);
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
        &gt; Webhook設定
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>Webhook設定</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ url: "", events: [] });
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
            {editId ? "Webhookを編集" : "Webhookを追加"}
          </h3>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Webhook URL * (https://...)"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
            }}
          />
          <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>イベント</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
            {EVENTS.map((ev) => (
              <button
                key={ev.value}
                onClick={() => toggleEvent(ev.value)}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 6,
                  border: `1px solid ${form.events.includes(ev.value) ? "var(--color-accent)" : "var(--color-border)"}`,
                  backgroundColor: form.events.includes(ev.value)
                    ? "var(--color-accent)"
                    : "var(--color-surface)",
                  color: form.events.includes(ev.value) ? "#fff" : "var(--color-text-primary)",
                  cursor: "pointer",
                }}
              >
                {ev.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
              {editId ? "更新" : "作成"}
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

      {/* Webhook list */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}
      >
        {hooks.map((h) => (
          <div
            key={h.id}
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
                marginBottom: "0.4rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  flex: 1,
                  wordBreak: "break-all",
                }}
              >
                {h.url}
              </span>
              <button
                onClick={() => handleTest(h)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-accent)",
                  color: "var(--color-accent)",
                  backgroundColor: "var(--color-surface)",
                  cursor: "pointer",
                }}
              >
                テスト
              </button>
              <button
                onClick={() => handleEdit(h)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  cursor: "pointer",
                }}
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(h.id)}
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
            </div>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {h.events.map((ev) => {
                const label = EVENTS.find((e) => e.value === ev)?.label || ev;
                return (
                  <span
                    key={ev}
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "rgba(3,105,161,0.08)",
                      color: "var(--color-accent)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {hooks.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            Webhookが設定されていません
          </p>
        )}
      </div>

      {/* Test payload modal */}
      {testPayload && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, flex: 1 }}>テストペイロード</h3>
            <button
              onClick={() => setTestPayload(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
            >
              x
            </button>
          </div>
          <pre
            style={{
              fontSize: "0.8rem",
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--color-bg)",
              padding: "0.8rem",
              borderRadius: 6,
              overflow: "auto",
              lineHeight: 1.5,
            }}
          >
            {testPayload}
          </pre>
        </div>
      )}

      {/* Logs */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.8rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>送信ログ (最新{MAX_LOGS}件)</h2>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            style={{
              fontSize: "0.8rem",
              padding: "0.3rem 0.7rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            ログ削除
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {logs.map((log) => {
          const hook = hooks.find((h) => h.id === log.webhookId);
          return (
            <div
              key={log.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  backgroundColor: log.status === "test" ? "#D97706" : "#059669",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {log.status === "test" ? "TEST" : "SENT"}
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {new Date(log.timestamp).toLocaleString("ja-JP")}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(3,105,161,0.08)",
                  color: "var(--color-accent)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {log.event}
              </span>
              {hook && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-secondary)",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hook.url}
                </span>
              )}
            </div>
          );
        })}
        {logs.length === 0 && (
          <p
            style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "1.5rem" }}
          >
            ログがありません
          </p>
        )}
      </div>
    </div>
  );
}
