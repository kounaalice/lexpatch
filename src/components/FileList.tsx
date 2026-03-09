"use client";

import { useState, useEffect, useCallback } from "react";
import { formatFileSize, getFileIcon } from "@/lib/attachments";

interface AttachmentItem {
  id: string;
  filename: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  uploaded_by_name: string | null;
  created_at: string;
}

interface FileListProps {
  contextType: "community" | "project";
  contextId: string;
  memberId?: string;
  token?: string;
  refreshKey?: number; // increment to trigger refresh
}

export default function FileList({
  contextType,
  contextId,
  memberId,
  token,
  refreshKey,
}: FileListProps) {
  const [files, setFiles] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/attachments?context_type=${contextType}&context_id=${contextId}`,
      );
      const data = await res.json();
      setFiles(data.attachments ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [contextType, contextId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  const handleDelete = async (fileId: string) => {
    if (!memberId || !token) return;
    if (!confirm("このファイルを削除しますか？")) return;

    try {
      const res = await fetch(`/api/attachments/${fileId}?member_id=${memberId}&token=${token}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          color: "var(--color-text-secondary)",
          margin: "0.5rem 0",
        }}
      >
        読み込み中...
      </p>
    );
  }

  if (files.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          color: "var(--color-text-secondary)",
          margin: "0.5rem 0",
        }}
      >
        ファイルはまだありません
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
      {files.map((file) => (
        <div
          key={file.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.6rem",
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
          }}
        >
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
            {getFileIcon(file.content_type)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <a
              href={`/api/attachments/${file.id}`}
              download={file.original_name}
              style={{
                color: "var(--color-accent)",
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.original_name}
            </a>
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {formatFileSize(file.size_bytes)}
              {file.uploaded_by_name && ` · ${file.uploaded_by_name}`}
              {" · "}
              {new Date(file.created_at).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {memberId && token && (
            <button
              onClick={() => handleDelete(file.id)}
              title="削除"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "0.85rem",
                padding: "0.2rem",
                flexShrink: 0,
                opacity: 0.6,
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
