"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectTemplate {
  label: string;
  title: string;
  description: string;
  color: string;
}

const TEMPLATES: ProjectTemplate[] = [
  { label: "白紙から作成", title: "", description: "", color: "var(--color-text-secondary)" },
  {
    label: "規制改革型",
    title: "○○規制の見直し検討",
    description:
      "既存規制の課題を整理し、改正案を検討するプロジェクト。現行法の問題点の洗い出し、他国の制度比較、改正条文案の作成を行います。",
    color: "#1B4B8A",
  },
  {
    label: "条例整備型",
    title: "○○に関する条例の制定",
    description:
      "新たな課題に対応する条例の制定に向けたプロジェクト。先行自治体の事例調査、条文案の作成、パブリックコメントの実施を行います。",
    color: "#7C3AED",
  },
  {
    label: "調査研究型",
    title: "○○法制に関する調査研究",
    description:
      "法制度の現状分析と改善提案を行う研究プロジェクト。文献調査、ヒアリング、報告書の作成を行います。",
    color: "#0369A1",
  },
  {
    label: "法令対応型",
    title: "○○法改正への対応検討",
    description:
      "法改正に伴う実務対応を検討するプロジェクト。改正内容の確認、影響範囲の分析、対応方針の策定を行います。",
    color: "#DC2626",
  },
  {
    label: "市民提案型",
    title: "○○に関する法改正提案",
    description:
      "市民目線での法改正提案をまとめるプロジェクト。現行制度の課題収集、諸外国の比較、改正要望書の作成を行います。",
    color: "#6B7280",
  },
];

export function ProjectCreateButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "members_only">("public");
  const [accessPassword, setAccessPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) {
      setError("プロジェクト名を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          owner_name: ownerName || undefined,
          visibility,
          access_password: visibility === "private" ? accessPassword : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成エラー");
      if (ownerName.trim()) localStorage.setItem("lp_project_owner", ownerName.trim());
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
      setSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          const saved = localStorage.getItem("lp_project_owner");
          if (saved) setOwnerName(saved);
        }}
        style={{
          padding: "0.5rem 1.25rem",
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        + 新規プロジェクト
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "12px",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: "0 0 1rem",
          }}
        >
          新規プロジェクトを作成
        </h3>

        {/* テンプレート選択 */}
        <div style={{ marginBottom: "1rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: "0.4rem",
            }}
          >
            テンプレート
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setTitle(t.title);
                  setDescription(t.description);
                }}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-bg)",
                  color: t.color,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            プロジェクト名 <span style={{ color: "var(--color-del-fg)" }}>*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：労働基準法の改正検討"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            説明
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="プロジェクトの目的・概要"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            作成者名（任意）
          </span>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="名前"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            公開設定
          </span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "public" | "private" | "members_only")}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <option value="public">公開（誰でも閲覧可）</option>
            <option value="members_only">メンバー限定</option>
            <option value="private">非公開（パスワード保護）</option>
          </select>
        </label>

        {visibility === "private" && (
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              アクセスパスワード
            </span>
            <input
              type="password"
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              placeholder="閲覧用パスワード"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>
        )}

        {error && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-del-fg)",
              marginBottom: "0.75rem",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: "0.45rem 1rem",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              padding: "0.45rem 1rem",
              backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "作成中…" : "作成する"}
          </button>
        </div>
      </div>
    </div>
  );
}
