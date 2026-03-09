"use client";

import { useState, useCallback } from "react";
import GanttChart from "@/components/project/GanttChart";

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string;
  start_date?: string;
}

interface PhaseInfo {
  name: string;
  deadline?: string;
}

interface Props {
  projectId: string;
  initialTasks: ProjectTask[];
  phases: PhaseInfo[];
}

export default function GanttClient({ projectId, initialTasks, phases }: Props) {
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTaskUpdate = useCallback(
    async (updated: ProjectTask[]) => {
      setTasks(updated);
      setSaving(true);
      try {
        await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectId, tasks: updated }),
        });
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    },
    [projectId],
  );

  const updateTaskDates = useCallback(
    (taskId: string, field: "start_date" | "due", value: string) => {
      const updated = tasks.map((t) =>
        t.id === taskId ? { ...t, [field]: value || undefined } : t,
      );
      setTasks(updated);
    },
    [tasks],
  );

  const saveTaskDates = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, tasks }),
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
      setEditing(null);
    }
  }, [projectId, tasks]);

  return (
    <div>
      {/* Saving indicator */}
      {saving && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          保存中…
        </div>
      )}

      {/* Gantt chart */}
      <GanttChart tasks={tasks} phases={phases} onTaskUpdate={handleTaskUpdate} />

      {/* Task date editor */}
      <div
        style={{
          marginTop: "1.5rem",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          backgroundColor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.6rem 1rem",
            borderBottom: "1px solid var(--color-border)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>タスク日程編集</span>
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.6rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  タスク
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.6rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    width: "100px",
                  }}
                >
                  担当
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.6rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    width: "140px",
                  }}
                >
                  開始日
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.6rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    width: "140px",
                  }}
                >
                  期限
                </th>
                <th style={{ padding: "0.4rem 0.6rem", width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td
                    style={{
                      padding: "0.4rem 0.6rem",
                      color: "var(--color-text-primary)",
                      textDecoration: t.done ? "line-through" : "none",
                      opacity: t.done ? 0.6 : 1,
                    }}
                  >
                    {t.title}
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem", color: "var(--color-text-secondary)" }}>
                    {t.assignee || "—"}
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem" }}>
                    {editing === t.id ? (
                      <input
                        type="date"
                        value={t.start_date || ""}
                        onChange={(e) => updateTaskDates(t.id, "start_date", e.target.value)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.3rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "3px",
                          backgroundColor: "var(--color-bg)",
                          color: "var(--color-text-primary)",
                          width: "120px",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: t.start_date
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {t.start_date || "未設定"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem" }}>
                    {editing === t.id ? (
                      <input
                        type="date"
                        value={t.due || ""}
                        onChange={(e) => updateTaskDates(t.id, "due", e.target.value)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.3rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "3px",
                          backgroundColor: "var(--color-bg)",
                          color: "var(--color-text-primary)",
                          width: "120px",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: t.due
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {t.due || "未設定"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem", textAlign: "center" }}>
                    {editing === t.id ? (
                      <button
                        onClick={saveTaskDates}
                        disabled={saving}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px",
                          border: "1px solid var(--color-accent)",
                          backgroundColor: "var(--color-accent)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        保存
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditing(t.id)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        編集
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}
