"use client";

import { useState } from "react";
import { type Session } from "@/lib/session";
import {
  SITUATION_TAGS,
  getSituationsByGroup,
  getRecommendedCategoryLabels,
  getAgencyLinks,
  type SituationTag,
  type AgencyLink,
} from "@/lib/situations";
import { toggleFollowDB, isFollowingDB } from "@/lib/follows";
import { LAW_CATEGORIES } from "@/lib/categories";
import { getRecommendedLawSlugs } from "@/lib/situations";

interface Props {
  session: Session;
}

export default function OnboardingWizard({ session }: Props) {
  const [step, setStep] = useState(0); // 0, 1, 2
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [alertOptIn, setAlertOptIn] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIds = Array.from(selected);
  const recommendedLabels = getRecommendedCategoryLabels(selectedIds);
  const agencies = getAgencyLinks(selectedIds);

  async function handleComplete() {
    setSaving(true);
    try {
      // 1. situation_profile を保存
      await fetch("/api/members", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Member-Id": session.memberId,
          "X-Session-Token": session.token,
        },
        body: JSON.stringify({
          situation_profile: {
            situations: selectedIds,
            completed_at: new Date().toISOString(),
            version: 1,
          },
        }),
      });

      // 2. 推薦法令カテゴリを自動フォロー
      const slugs = getRecommendedLawSlugs(selectedIds);
      for (const slug of slugs) {
        const cat = LAW_CATEGORIES.find((c) => c.slug === slug);
        if (!cat) continue;
        const alreadyFollowing = await isFollowingDB("law", slug);
        if (!alreadyFollowing) {
          await toggleFollowDB("law", slug, cat.label);
        }
      }

      // 3. 通知スコープを「状況に合った法令」に設定（opt-in時）
      if (alertOptIn) {
        await fetch("/api/members", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Member-Id": session.memberId,
            "X-Session-Token": session.token,
          },
          body: JSON.stringify({
            notification_prefs: {
              law_promulgation: {
                enabled: true,
                frequency: "immediate",
                scope: "situations",
                weekly_schedule: { day: 1, time: "09:00", count: 1 },
              },
              law_enforcement: {
                enabled: true,
                frequency: "immediate",
                scope: "situations",
                weekly_schedule: { day: 1, time: "09:00", count: 1 },
              },
            },
          }),
        });
      }

      window.location.href = "/dashboard"; // eslint-disable-line react-hooks/immutability
    } catch {
      setSaving(false);
    }
  }

  function handleSkip() {
    // completed_at なしで保存（スキップ扱い）
    window.location.href = "/dashboard";
  }

  // ─── 共通スタイル ──────────────────────────────

  const cardBase: React.CSSProperties = {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1.5px solid var(--color-border)",
    backgroundColor: "var(--color-surface)",
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  };

  const cardSelected: React.CSSProperties = {
    ...cardBase,
    borderColor: "var(--color-accent)",
    backgroundColor: "#EBF5FF",
  };

  // ─── Step 1: 生活状況 ─────────────────────────

  function renderStep1() {
    const tags = getSituationsByGroup("life");
    return (
      <>
        <h2 style={headingStyle}>あなたの状況を教えてください</h2>
        <p style={subStyle}>
          当てはまるものをすべて選んでください（複数選択可・後から変更できます）
        </p>
        <div style={gridStyle}>{tags.map((tag) => renderTagCard(tag))}</div>
      </>
    );
  }

  // ─── Step 2: 業種・職種 ───────────────────────

  function renderStep2() {
    const industries = getSituationsByGroup("industry");
    const occupations = getSituationsByGroup("occupation");
    return (
      <>
        <h2 style={headingStyle}>業種・職種を選んでください</h2>
        <p style={subStyle}>当てはまるものをすべて選んでください（複数選択可）</p>
        <h3 style={subHeadingStyle}>業種</h3>
        <div style={gridStyle}>{industries.map((tag) => renderTagCard(tag))}</div>
        <h3 style={{ ...subHeadingStyle, marginTop: "1.5rem" }}>職種</h3>
        <div style={gridStyle}>{occupations.map((tag) => renderTagCard(tag))}</div>
      </>
    );
  }

  // ─── Step 3: 確認 ─────────────────────────────

  function renderStep3() {
    const selectedTags = SITUATION_TAGS.filter((t) => selected.has(t.id));
    return (
      <>
        <h2 style={headingStyle}>設定を確認</h2>

        {selectedTags.length === 0 ? (
          <p style={{ ...subStyle, marginBottom: "1.5rem" }}>
            状況が選択されていません。スキップして後から設定することもできます。
          </p>
        ) : (
          <>
            {/* 選択タグ */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={subHeadingStyle}>選択した状況</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "20px",
                      backgroundColor: "#EBF5FF",
                      border: "1px solid var(--color-accent)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-accent)",
                    }}
                  >
                    {tag.icon} {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* 自動フォロー分野 */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={subHeadingStyle}>自動フォローされる法令分野</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {recommendedLabels.map((label) => (
                  <span
                    key={label}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "4px",
                      backgroundColor: "#EBF2FD",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "#1B4B8A",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* 関連行政機関 */}
            {agencies.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={subHeadingStyle}>関連する行政機関</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {agencies.map((a: AgencyLink) => (
                    <a
                      key={a.url}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        textDecoration: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "0.15rem",
                          }}
                        >
                          {a.description}
                        </div>
                      </div>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* アラート opt-in トグル */}
            <div
              style={{
                padding: "1rem",
                borderRadius: "8px",
                backgroundColor: "#F0FDF4",
                border: "1px solid #86EFAC",
                marginBottom: "1rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-primary)",
                }}
              >
                <input
                  type="checkbox"
                  checked={alertOptIn}
                  onChange={(e) => setAlertOptIn(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--color-accent)" }}
                />
                法令アラートの対象範囲を「状況に合った法令」に設定する
              </label>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  margin: "0.4rem 0 0 2rem",
                }}
              >
                選択した状況に関連する法令の公布・施行を通知します（メールアドレス登録が必要です）
              </p>
            </div>
          </>
        )}
      </>
    );
  }

  // ─── タグカード ───────────────────────────────

  function renderTagCard(tag: SituationTag) {
    const isSelected = selected.has(tag.id);
    return (
      <div
        key={tag.id}
        onClick={() => toggle(tag.id)}
        style={isSelected ? cardSelected : cardBase}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(tag.id);
          }
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}
        >
          <span style={{ fontSize: "1.2rem" }}>{tag.icon}</span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {tag.label}
          </span>
          {isSelected && (
            <span
              style={{
                marginLeft: "auto",
                color: "var(--color-accent)",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              ✓
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.4,
          }}
        >
          {tag.description}
        </div>
      </div>
    );
  }

  // ─── レイアウト ───────────────────────────────

  const steps = [renderStep1, renderStep2, renderStep3];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "1.5rem 1rem 3rem" }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* 進捗ドット */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: i <= step ? "var(--color-accent)" : "var(--color-border)",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </div>

        {/* コンテンツ */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "2rem 1.5rem",
          }}
        >
          {steps[step]()}
        </div>

        {/* ナビゲーション */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              textDecoration: "underline",
              padding: "0.5rem 0",
            }}
          >
            スキップ
          </button>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {!isFirst && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  padding: "0.6rem 1.2rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                }}
              >
                戻る
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{
                  padding: "0.6rem 1.2rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                style={{
                  padding: "0.6rem 1.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  cursor: saving ? "wait" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "保存中..." : selectedIds.length > 0 ? "完了" : "スキップして完了"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 共通スタイル定数 ────────────────────────────

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  marginBottom: "0.5rem",
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.82rem",
  color: "var(--color-text-secondary)",
  marginBottom: "1.5rem",
  lineHeight: 1.5,
};

const subHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--color-text-primary)",
  marginBottom: "0.75rem",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "0.75rem",
};
