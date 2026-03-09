import { uuid } from "./uuid";
/**
 * ファイル添付 — 定数・型・ヘルパー
 * Cloudflare R2 + Supabase attachments テーブル
 */

export interface Attachment {
  id: string;
  context_type: "community" | "project";
  context_id: string;
  filename: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  r2_key: string;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/webp": "WebP",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/plain": "TXT",
  "text/csv": "CSV",
};

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".doc",
  ".docx",
  ".xlsx",
  ".txt",
  ".csv",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** R2 キー生成: community/{id}/{uuid}-{name} */
export function generateR2Key(contextType: string, contextId: string, filename: string): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._\u3000-\u9FFF\uF900-\uFAFF-]/g, "_")
    .slice(0, 100);
  const fileId = uuid();
  return `${contextType}/${contextId}/${fileId}-${sanitized}`;
}

/** ファイルサイズ表示 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** ファイル種別アイコン */
export function getFileIcon(contentType: string): string {
  if (contentType === "application/pdf") return "\uD83D\uDCC4";
  if (contentType.startsWith("image/")) return "\uD83D\uDDBC\uFE0F";
  if (contentType.includes("spreadsheet") || contentType === "text/csv") return "\uD83D\uDCCA";
  if (contentType.includes("word") || contentType.includes("document")) return "\uD83D\uDDD2\uFE0F";
  return "\uD83D\uDCCE";
}

/** ファイル種別がアップロード可能か */
export function isAllowedType(contentType: string, filename: string): boolean {
  if (ALLOWED_TYPES[contentType]) return true;
  const ext = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
}
