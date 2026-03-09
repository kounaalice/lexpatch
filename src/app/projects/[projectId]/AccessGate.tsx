"use client";

import { useState, useEffect, type ReactNode } from "react";
import { getSession } from "@/lib/session";
import Link from "next/link";

interface AccessGateProps {
  projectId: string;
  visibility: string;
  members: Array<{ name: string; org: string; role: string }>;
  children: ReactNode;
}

export function AccessGate({ projectId, visibility, members, children }: AccessGateProps) {
  const [access, setAccess] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAccess() {
    if (visibility === "public") {
      setAccess(true);
      setChecking(false);
      return;
    }

    if (visibility === "private") {
      // sessionStorageのトークン確認
      const token = sessionStorage.getItem(`lp_access_${projectId}`);
      if (token) {
        setAccess(true);
        setChecking(false);
        return;
      }
      setAccess(false);
      setChecking(false);
      return;
    }

    if (visibility === "members_only") {
      const session = getSession();
      if (!session) {
        setAccess(false);
        setChecking(false);
        return;
      }
      const isMember = members.some((m) => m.name === session.name);
      if (isMember) {
        setAccess(true);
        setChecking(false);
        return;
      }
      setAccess(false);
      setChecking(false);
      return;
    }

    setAccess(true);
    setChecking(false);
  }

  async function submitPassword() {
    setError(null);
    try {
      const res = await fetch("/api/projects/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, password }),
      });
      const data = await res.json();
      if (data.access) {
        sessionStorage.setItem(`lp_access_${projectId}`, data.token ?? "unlocked");
        setAccess(true);
      } else {
        setError(data.reason ?? "アクセスできません");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    }
  }

  if (checking) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
          確認中...
        </p>
      </div>
    );
  }

  if (access) return <>{children}</>;

  const boxStyle: React.CSSProperties = {
    maxWidth: "400px",
    margin: "3rem auto",
    padding: "2rem",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    textAlign: "center",
  };

  if (visibility === "private") {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>&#128274;</div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          パスワード保護
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1rem",
          }}
        >
          このプロジェクトはパスワードで保護されています。
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitPassword();
          }}
          placeholder="パスワードを入力"
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-primary)",
            boxSizing: "border-box",
            marginBottom: "0.75rem",
          }}
        />
        {error && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-del-fg)",
              marginBottom: "0.5rem",
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={submitPassword}
          style={{
            width: "100%",
            padding: "0.6rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            fontWeight: 600,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
          }}
        >
          アクセス
        </button>
      </div>
    );
  }

  if (visibility === "members_only") {
    const session = getSession();
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>&#128101;</div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          メンバー限定
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1rem",
          }}
        >
          このプロジェクトはメンバー限定です。
        </p>
        {!session ? (
          <Link
            href={`/login?return=${encodeURIComponent(window.location.pathname)}`}
            style={{
              display: "inline-block",
              padding: "0.6rem 1.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "6px",
              textDecoration: "none",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
            }}
          >
            ログインして確認
          </Link>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-del-fg)",
            }}
          >
            あなたはこのプロジェクトのメンバーではありません。
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
