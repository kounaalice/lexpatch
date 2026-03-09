"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { textToCanonLines, autoRenumber, diffToPlainText } from "@/lib/patch/directDiff";
import { sideBySideDiff, unifiedDiff } from "@/lib/patch/diff";
import { generateKaramebun, karamebunToText } from "@/lib/patch/karamebun";
import { SideBySideView } from "@/components/diff/SideBySideView";

interface Props {
  patchId: string;
  initialTitle: string;
  initialDescription: string;
  initialPatchText: string;
  initialStatus: string;
  initialStructured?: {
    original?: string;
    edited?: string;
    mode?: string;
    [key: string]: unknown;
  };
  articleTitle?: string;
}

const STATUSES = ["下書き", "提案中", "採択済"];

export function PatchActions({
  patchId,
  initialTitle,
  initialDescription,
  initialPatchText,
  initialStatus,
  initialStructured,
  articleTitle,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [patchText, setPatchText] = useState(initialPatchText);
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getSession());
  }, []);

  // 直接編集パッチの検出
  const isDirectEditPatch = !!(
    initialStructured?.mode === "direct" &&
    typeof initialStructured.original === "string" &&
    typeof initialStructured.edited === "string"
  );

  // 直接編集モード用 state
  const originalText = isDirectEditPatch ? (initialStructured!.original as string) : "";
  const [editedText, setEditedText] = useState(
    isDirectEditPatch ? (initialStructured!.edited as string) : "",
  );
  const [editorInitialized, setEditorInitialized] = useState(false);

  // diff + 改め文 計算（直接編集モード時）
  const { sideBySide, unified, karamebunLines, hasChanges } = useMemo(() => {
    if (!isDirectEditPatch) {
      return {
        sideBySide: { rows: [], stats: { added: 0, deleted: 0, unchanged: 0 } },
        unified: { lines: [], stats: { added: 0, deleted: 0, unchanged: 0 } },
        karamebunLines: [],
        hasChanges: false,
      };
    }
    const origLines = textToCanonLines(originalText);
    const currentText = editorInitialized ? editedText : (initialStructured!.edited as string);
    const editLines = autoRenumber(textToCanonLines(currentText));
    const u = unifiedDiff(origLines, editLines);
    const s = sideBySideDiff(origLines, editLines);
    const k = articleTitle ? generateKaramebun(articleTitle, origLines, editLines) : [];
    return {
      sideBySide: s,
      unified: u,
      karamebunLines: k,
      hasChanges: u.stats.added > 0 || u.stats.deleted > 0,
    };
  }, [
    isDirectEditPatch,
    originalText,
    editedText,
    editorInitialized,
    initialStructured,
    articleTitle,
  ]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { title, description, status };

      if (isDirectEditPatch) {
        const currentEdited = editorInitialized
          ? editedText
          : (initialStructured!.edited as string);
        const origLines = textToCanonLines(originalText);
        const editLines = autoRenumber(textToCanonLines(currentEdited));
        const u = unifiedDiff(origLines, editLines);
        const plainText = diffToPlainText(articleTitle ?? "", u.lines);
        body.plain_text = plainText;
        body.structured_override = {
          original: originalText,
          edited: currentEdited,
          mode: "direct",
        };
      } else {
        body.plain_text = patchText;
      }

      const res = await fetch(`/api/patch?id=${patchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "更新に失敗しました");
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/patch?id=${patchId}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "削除に失敗しました");
      }
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (!loggedIn) return null;

  return (
    <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
      {/* ヘッダー（逐条解説と同じパターン） */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          改正案を編集
          {isDirectEditPatch && hasChanges && (
            <span style={{ display: "inline-flex", gap: "0.3rem", marginLeft: "0.25rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-add-fg)",
                  backgroundColor: "var(--color-add-bg)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "3px",
                  fontWeight: 400,
                }}
              >
                +{unified.stats.added}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-del-fg)",
                  backgroundColor: "var(--color-del-bg)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "3px",
                  fontWeight: 400,
                }}
              >
                -{unified.stats.deleted}
              </span>
            </span>
          )}
        </h3>
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setError(null);
              setConfirmDelete(false);
            }}
            style={{
              padding: "0.3rem 0.75rem",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "5px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-accent)",
              cursor: "pointer",
            }}
          >
            + 編集する
          </button>
        )}
      </div>

      {/* エディタ本体 */}
      {open && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-accent)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
          }}
        >
          {/* タイトル */}
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
              タイトル
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
          </label>

          {/* ステータス */}
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
              ステータス
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          {/* 改正理由 */}
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
              改正理由
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </label>

          {isDirectEditPatch ? (
            /* ── 直接編集モード ── */
            <>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 0.5rem",
                  lineHeight: 1.6,
                }}
              >
                現行法テキストを直接編集してください。差分は自動的に計算されます。
              </p>

              <textarea
                value={editorInitialized ? editedText : (initialStructured!.edited as string)}
                onChange={(e) => {
                  if (!editorInitialized) setEditorInitialized(true);
                  setEditedText(e.target.value);
                }}
                onFocus={() => {
                  if (!editorInitialized) {
                    setEditorInitialized(true);
                    setEditedText(initialStructured!.edited as string);
                  }
                }}
                onBlur={() => {
                  if (editorInitialized && editedText !== originalText) {
                    const renumbered = autoRenumber(textToCanonLines(editedText));
                    const renumberedText = renumbered
                      .map((l) => (l.num ? `${l.num}　${l.text}` : l.text))
                      .join("\n");
                    if (renumberedText !== editedText) setEditedText(renumberedText);
                  }
                }}
                spellCheck={false}
                style={{
                  width: "100%",
                  minHeight: "200px",
                  padding: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {/* 新旧対照表 */}
              {hasChanges && (
                <div style={{ marginTop: "0.75rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      display: "block",
                      marginBottom: "0.3rem",
                    }}
                  >
                    新旧対照表
                  </span>
                  <div
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <SideBySideView rows={sideBySide.rows} />
                  </div>
                </div>
              )}

              {/* 改め文 */}
              {hasChanges && karamebunLines.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      改め文
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(karamebunToText(karamebunLines))}
                      style={{
                        padding: "0.15rem 0.5rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-bg)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      コピー
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.85rem",
                      lineHeight: 1.8,
                      color: "var(--color-text-primary)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {karamebunLines.map((l, i) => (
                      <div key={i} style={{ marginBottom: "0.5rem" }}>
                        <div>{l.text}</div>
                        {l.detail && (
                          <div style={{ paddingLeft: "1em", color: "var(--color-text-secondary)" }}>
                            {l.detail}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 統計 */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "0.6rem",
                }}
              >
                {hasChanges ? (
                  <>
                    <span
                      style={{
                        color: "var(--color-add-fg)",
                        backgroundColor: "var(--color-add-bg)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      +{unified.stats.added}
                    </span>
                    <span
                      style={{
                        color: "var(--color-del-fg)",
                        backgroundColor: "var(--color-del-bg)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      -{unified.stats.deleted}
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {unified.stats.unchanged} 行変更なし
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                    }}
                  >
                    変更なし
                  </span>
                )}
              </div>
            </>
          ) : (
            /* ── レガシーパッチ記法エディタ ── */
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
                パッチ記法
              </span>
              <textarea
                value={patchText}
                onChange={(e) => setPatchText(e.target.value)}
                rows={8}
                spellCheck={false}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  resize: "vertical",
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
                marginBottom: "0.5rem",
              }}
            >
              {error}
            </p>
          )}

          {/* ボタン行 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.5rem",
              marginTop: "0.5rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
              {confirmDelete ? (
                <>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-del-fg)",
                    }}
                  >
                    本当に削除しますか？
                  </span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      padding: "0.2rem 0.5rem",
                      border: "none",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-del-fg)",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      cursor: deleting ? "not-allowed" : "pointer",
                      opacity: deleting ? 0.6 : 1,
                    }}
                  >
                    {deleting ? "削除中…" : "削除する"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      padding: "0.2rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    やめる
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    padding: "0.2rem 0.5rem",
                    border: "1px solid var(--color-del-fg)",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-del-fg)",
                    cursor: "pointer",
                  }}
                >
                  削除
                </button>
              )}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
              <button
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  setConfirmDelete(false);
                }}
                style={{
                  padding: "0.35rem 0.75rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "5px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.35rem 0.75rem",
                  backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
                  color: saving ? "var(--color-text-secondary)" : "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "保存中…" : "保存する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
