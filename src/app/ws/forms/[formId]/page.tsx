"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
}

interface WsForm {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  status: string;
}

export default function FormResponsePage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const [form, setForm] = useState<WsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, string | boolean>>({});
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/ws/forms?id=${formId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setForm(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [formId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Validate required fields
    if (form) {
      for (const field of form.fields) {
        if (field.required && !data[field.id]) {
          setError(`「${field.label}」は必須です`);
          return;
        }
      }
    }
    const res = await fetch(`/api/ws/forms/${formId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respondent_name: name || null, data }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      const d = await res.json();
      setError(d.error || "送信に失敗しました");
    }
  }

  if (loading)
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
          読み込み中...
        </p>
      </div>
    );

  if (!form || form.status !== "published")
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
          このフォームは現在受付していません
        </p>
        <Link
          href="/ws"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-accent)",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          ワークスペースに戻る
        </Link>
      </div>
    );

  if (submitted)
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "3rem 2rem",
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            回答を送信しました
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
            }}
          >
            ご回答ありがとうございました。
          </p>
        </div>
      </div>
    );

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {form.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 回答者名（任意） */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <label
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              お名前（任意）
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="回答者名"
              style={fieldInput}
            />
          </div>

          {form.fields.map((field) => (
            <div
              key={field.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <label
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                {field.label || "無題の項目"}
                {field.required && (
                  <span style={{ color: "#DC2626", marginLeft: "0.25rem" }}>*</span>
                )}
              </label>
              {field.type === "text" && (
                <input
                  value={String(data[field.id] ?? "")}
                  onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                  style={fieldInput}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  value={String(data[field.id] ?? "")}
                  onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                  rows={4}
                  style={{ ...fieldInput, resize: "vertical" }}
                />
              )}
              {field.type === "number" && (
                <input
                  type="number"
                  value={String(data[field.id] ?? "")}
                  onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                  style={fieldInput}
                />
              )}
              {field.type === "date" && (
                <input
                  type="date"
                  value={String(data[field.id] ?? "")}
                  onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                  style={fieldInput}
                />
              )}
              {field.type === "select" && (
                <select
                  value={String(data[field.id] ?? "")}
                  onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                  style={fieldInput}
                >
                  <option value="">選択してください</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "checkbox" && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!data[field.id]}
                    onChange={(e) => setData({ ...data, [field.id]: e.target.checked })}
                  />
                  はい
                </label>
              )}
            </div>
          ))}

          {error && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "#DC2626",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              fontWeight: 700,
              padding: "0.75rem 2rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}

const fieldInput: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.88rem",
  padding: "0.55rem 0.7rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  width: "100%",
  boxSizing: "border-box" as const,
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text-primary)",
};
