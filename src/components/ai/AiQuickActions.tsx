"use client";

interface Props {
  onSend: (message: string) => void;
  hasAmendment?: boolean;
  disabled?: boolean;
}

const ACTIONS = [
  { label: "この条文を要約", message: "この条文の内容を簡潔に要約してください。" },
  {
    label: "要件と効果を分析",
    message: "この条文の法的要件と効果（法律効果）を分析してください。",
  },
  { label: "関連条文を探す", message: "この条文に関連する他の条文や法令を教えてください。" },
];

const AMENDMENT_ACTION = {
  label: "改正の影響を解説",
  message: "この条文の改正内容と実務への影響を解説してください。",
};

export default function AiQuickActions({ onSend, hasAmendment, disabled }: Props) {
  const actions = hasAmendment ? [...ACTIONS, AMENDMENT_ACTION] : ACTIONS;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.35rem",
        padding: "0.5rem",
      }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => onSend(a.message)}
          disabled={disabled}
          style={{
            padding: "0.3rem 0.6rem",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-accent)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "background-color 0.15s, border-color 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = "var(--color-accent)";
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-surface)";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
