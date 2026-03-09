"use client";

import { useState } from "react";
import {
  CHECKLIST_TEMPLATES,
  generateTasksFromTemplate,
  type ChecklistTemplate,
} from "@/lib/checklist-templates";

interface ChecklistTemplateSelectorProps {
  onApply: (
    tasks: Array<{ id: string; title: string; done: boolean; description?: string; due?: string }>,
  ) => void;
  onClose: () => void;
}

export default function ChecklistTemplateSelector({
  onApply,
  onClose,
}: ChecklistTemplateSelectorProps) {
  const [selected, setSelected] = useState<ChecklistTemplate | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const handleApply = () => {
    if (!selected) return;
    const tasks = generateTasksFromTemplate(selected, startDate);
    onApply(tasks);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "1.5rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            チェックリストテンプレート
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            ×
          </button>
        </div>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            margin: "0 0 1rem",
          }}
        >
          テンプレートを選択すると、定型タスクがプロジェクトに追加されます。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {CHECKLIST_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelected(template)}
              style={{
                display: "flex",
                gap: "0.6rem",
                alignItems: "flex-start",
                padding: "0.75rem",
                border: `2px solid ${selected?.id === template.id ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: "8px",
                backgroundColor:
                  selected?.id === template.id ? "rgba(3,105,161,0.06)" : "var(--color-bg)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{template.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {template.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.73rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "0.15rem",
                    lineHeight: 1.4,
                  }}
                >
                  {template.description}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "0.3rem",
                    opacity: 0.8,
                  }}
                >
                  {template.tasks.length}タスク
                  {template.tasks[template.tasks.length - 1]?.relativeDeadlineDays
                    ? ` · 約${template.tasks[template.tasks.length - 1].relativeDeadlineDays}日間`
                    : ""}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <label
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                開始日:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "0.3rem 0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: "0.6rem",
                maxHeight: "200px",
                overflow: "auto",
                marginBottom: "0.75rem",
              }}
            >
              {selected.tasks.map((t, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.73rem",
                    color: "var(--color-text-primary)",
                    padding: "0.25rem 0",
                    borderBottom:
                      i < selected.tasks.length - 1 ? "1px solid var(--color-border)" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {i + 1}. {t.title}
                  </span>
                  {t.relativeDeadlineDays !== undefined && (
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.68rem",
                        flexShrink: 0,
                        marginLeft: "0.5rem",
                      }}
                    >
                      +{t.relativeDeadlineDays}日
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              style={{
                width: "100%",
                padding: "0.6rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                transition: "opacity 0.15s",
              }}
            >
              {selected.tasks.length}件のタスクを追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
