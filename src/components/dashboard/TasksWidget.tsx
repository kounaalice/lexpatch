"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CrossTask {
  taskId: string;
  title: string;
  projectId: string;
  projectTitle: string;
  assignee?: string;
  due?: string;
  dueTime?: string;
  done: boolean;
}

interface Props {
  memberId: string;
  memberName: string;
}

export default function TasksWidget({ memberId, memberName }: Props) {
  const [tasks, setTasks] = useState<CrossTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOnly, setMyOnly] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/tasks?member_id=${memberId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.tasks) setTasks(d.tasks);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  const displayed = myOnly ? tasks.filter((t) => t.assignee === memberName) : tasks;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "3px",
              height: "1rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          横断タスク
          {!loading && (
            <span
              style={{ fontWeight: 400, fontSize: "0.78rem", color: "var(--color-text-secondary)" }}
            >
              ({displayed.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => setMyOnly((v) => !v)}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            padding: "0.2rem 0.6rem",
            borderRadius: "4px",
            border: "1px solid var(--color-border)",
            backgroundColor: myOnly ? "var(--color-accent)" : "var(--color-surface)",
            color: myOnly ? "#fff" : "var(--color-text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          自分のタスクのみ
        </button>
      </div>

      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            padding: "1rem 0",
          }}
        >
          読み込み中...
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            padding: "1rem 0",
          }}
        >
          {myOnly ? "自分に割り当てられた未完了タスクはありません。" : "未完了タスクはありません。"}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {displayed.slice(0, 20).map((t, i) => {
            const isOverdue = t.due && t.due < today;
            return (
              <Link
                key={`${t.projectId}-${t.taskId}`}
                href={`/projects/${t.projectId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-sans)",
                  borderBottom:
                    i < displayed.length - 1 && i < 19 ? "1px solid var(--color-border)" : "none",
                  transition: "background-color 0.1s",
                }}
              >
                {/* 期限状態 */}
                {isOverdue && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "0.05rem 0.35rem",
                      borderRadius: "3px",
                      backgroundColor: "var(--color-del-bg)",
                      color: "var(--color-del-fg)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    超過
                  </span>
                )}
                {/* タスク名 */}
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.82rem",
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title}
                </span>
                {/* プロジェクト名 */}
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--color-text-secondary)",
                    backgroundColor: "rgba(0,0,0,0.04)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "3px",
                    whiteSpace: "nowrap",
                    maxWidth: "30%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                  }}
                >
                  {t.projectTitle}
                </span>
                {/* 担当 */}
                {t.assignee && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {t.assignee}
                  </span>
                )}
                {/* 期限 */}
                {t.due && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      color: isOverdue ? "var(--color-del-fg)" : "var(--color-text-secondary)",
                      fontWeight: isOverdue ? 600 : 400,
                    }}
                  >
                    {t.due.replace(/-/g, "/")}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
