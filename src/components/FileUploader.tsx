"use client";

import { useState, useRef, useCallback } from "react";
import {
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  isAllowedType,
  formatFileSize,
} from "@/lib/attachments";

interface FileUploaderProps {
  contextType: "community" | "project";
  contextId: string;
  memberId: string;
  memberName: string;
  token: string;
  onUploaded?: () => void;
}

export default function FileUploader({
  contextType,
  contextId,
  memberId,
  memberName,
  token,
  onUploaded,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError(`ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`);
        return;
      }
      if (!isAllowedType(file.type, file.name)) {
        setError("このファイル形式はサポートされていません");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context_type", contextType);
        formData.append("context_id", contextId);
        formData.append("member_id", memberId);
        formData.append("token", token);
        formData.append("member_name", memberName);

        const res = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "アップロードに失敗しました");
          return;
        }
        onUploaded?.();
      } catch {
        setError("ネットワークエラーが発生しました");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [contextType, contextId, memberId, memberName, token, onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: "8px",
          padding: "1rem",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          backgroundColor: dragOver ? "rgba(3,105,161,0.05)" : "transparent",
          transition: "all 0.15s",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          {uploading ? "アップロード中..." : "ファイルをドラッグ&ドロップ、またはクリックして選択"}
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            color: "var(--color-text-secondary)",
            margin: "0.3rem 0 0",
            opacity: 0.7,
          }}
        >
          PDF, 画像, Word, Excel, テキスト（{formatFileSize(MAX_FILE_SIZE)}まで）
        </p>
      </div>

      {error && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-del-fg)",
            margin: "0.5rem 0 0",
            padding: "0.4rem 0.6rem",
            backgroundColor: "var(--color-del-bg)",
            borderRadius: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
