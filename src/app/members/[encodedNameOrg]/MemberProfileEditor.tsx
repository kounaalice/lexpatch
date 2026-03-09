"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession } from "@/lib/session";
import {
  type NotificationPrefs,
  type LawAlertPref,
  type LawScope,
  type AlertFrequency,
  mergePrefs,
  CATEGORY_LABELS,
  SCOPE_LABELS,
  DAY_LABELS,
} from "@/lib/notification-prefs";

interface Props {
  name: string;
  org: string;
  currentBio: string;
  currentExperience: string;
  currentPreferredAreas: string[];
  currentOrgType: string;
  currentEmail: string;
  currentNotificationPrefs: Record<string, unknown> | null;
  currentSituationProfile?: Record<string, unknown> | null;
  authProvider: string;
  hasPassword: boolean;
  emailVerified: boolean;
}

export function MemberProfileEditor({
  name,
  org,
  currentBio,
  currentExperience,
  currentPreferredAreas,
  currentOrgType,
  currentEmail,
  currentNotificationPrefs,
  currentSituationProfile: _currentSituationProfile,
  authProvider,
  hasPassword,
  emailVerified,
}: Props) {
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // フォーム状態
  const [bio, setBio] = useState(currentBio);
  const [experience, setExperience] = useState(currentExperience);
  const [areasText, setAreasText] = useState(currentPreferredAreas.join(", "));
  const [orgType, setOrgType] = useState(currentOrgType);
  const [email, setEmail] = useState(currentEmail);
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => mergePrefs(currentNotificationPrefs));

  // パスワード変更
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // セッション確認
  useEffect(() => {
    const session = getSession();
    if (session && session.name === name && session.org === org) {
      setIsOwner(true);
    }
    const cached = sessionStorage.getItem(`lp_edit_${name}_${org}`);
    if (cached === "true") {
      setEditing(true);
    }
  }, [name, org]);

  const toggleEdit = useCallback(() => {
    setEditing((prev) => {
      const next = !prev;
      sessionStorage.setItem(`lp_edit_${name}_${org}`, String(next));
      if (!next) {
        setBio(currentBio);
        setExperience(currentExperience);
        setAreasText(currentPreferredAreas.join(", "));
        setOrgType(currentOrgType);
        setEmail(currentEmail);
        setPrefs(mergePrefs(currentNotificationPrefs));
        setError("");
        setSuccess(false);
      }
      return next;
    });
  }, [
    name,
    org,
    currentBio,
    currentExperience,
    currentPreferredAreas,
    currentOrgType,
    currentEmail,
    currentNotificationPrefs,
  ]);

  async function handleSave() {
    const session = getSession();
    if (!session) {
      setError("セッションが無効です。再ログインしてください。");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    const preferredAreas = areasText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch(
        `/api/members?name=${encodeURIComponent(name)}&org=${encodeURIComponent(org)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Member-Id": session.memberId,
            "X-Session-Token": session.token,
          },
          body: JSON.stringify({
            bio,
            experience,
            preferred_areas: preferredAreas,
            org_type: orgType,
            email: email.trim() || null,
            notification_prefs: prefs,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "更新に失敗しました" }));
        setError(data.error || "更新に失敗しました");
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem(`lp_edit_${name}_${org}`);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  // ─── パスワード変更 ──────────────────────────────────────
  async function handlePasswordChange() {
    const session = getSession();
    if (!session) {
      setPwError("セッションが無効です");
      return;
    }
    if (newPw.length < 8) {
      setPwError("新しいパスワードは8文字以上必要です");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("パスワードが一致しません");
      return;
    }

    setPwSaving(true);
    setPwError("");
    setPwSuccess(false);

    try {
      const res = await fetch(
        `/api/members?name=${encodeURIComponent(name)}&org=${encodeURIComponent(org)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Member-Id": session.memberId,
            "X-Session-Token": session.token,
          },
          body: JSON.stringify({
            change_password: {
              ...(hasPassword ? { current_password: currentPw } : {}),
              new_password: newPw,
            },
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "変更に失敗しました" }));
        setPwError(data.error || "変更に失敗しました");
        return;
      }
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      setPwError("ネットワークエラーが発生しました");
    } finally {
      setPwSaving(false);
    }
  }

  // ─── 通知設定ヘルパー ──────────────────────────────────────

  function updatePref<K extends keyof NotificationPrefs>(
    key: K,
    patch: Partial<NotificationPrefs[K]>,
  ) {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }

  function updateLawPref(
    key: "law_promulgation" | "law_enforcement",
    patch: Partial<LawAlertPref>,
  ) {
    setPrefs((prev) => {
      const current = prev[key];
      const merged = { ...current, ...patch };
      if (patch.weekly_schedule) {
        merged.weekly_schedule = { ...current.weekly_schedule, ...patch.weekly_schedule };
      }
      return { ...prev, [key]: merged };
    });
  }

  const hasEmail = email.trim().length > 0;

  if (!isOwner) return null;

  return (
    <div style={{ marginTop: "1.25rem" }}>
      {/* 編集ボタン */}
      {!editing && (
        <button
          onClick={toggleEdit}
          style={{
            padding: "0.45rem 1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-accent)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
        >
          プロフィールを編集
        </button>
      )}

      {/* 編集フォーム */}
      {editing && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "1.25rem",
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.92rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "1rem",
            }}
          >
            プロフィール編集
          </h3>

          {/* 組織種別 */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>組織種別</label>
            <select value={orgType} onChange={(e) => setOrgType(e.target.value)} style={inputStyle}>
              <option value="">選択してください</option>
              <option value="大学">大学</option>
              <option value="企業">企業</option>
              <option value="官公庁">官公庁</option>
              <option value="NPO">NPO</option>
              <option value="法律事務所">法律事務所</option>
              <option value="個人">個人</option>
            </select>
          </div>

          {/* 自己紹介 */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="自己紹介を入力..."
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "80px" }}
            />
          </div>

          {/* 経験・専門 */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>経験・専門分野</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={2}
              placeholder="経験や専門分野を入力..."
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "60px" }}
            />
          </div>

          {/* 関心分野 */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>関心分野（カンマ区切り）</label>
            <input
              type="text"
              value={areasText}
              onChange={(e) => setAreasText(e.target.value)}
              placeholder="例: 労働法, 環境法, 行政法"
              style={inputStyle}
            />
            <div style={hintStyle}>カンマ（,）で区切って複数入力できます</div>
          </div>

          {/* ━━━ アカウント情報セクション ━━━ */}
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "1.25rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span style={{ fontSize: "1rem" }}>🔐</span> アカウント情報
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={accountLabelStyle}>認証方式</span>
                <span style={accountValueStyle}>
                  {authProvider === "google"
                    ? "Google"
                    : authProvider === "azure"
                      ? "Microsoft"
                      : "メール + パスワード"}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={accountLabelStyle}>メール認証</span>
                <span
                  style={{
                    ...accountValueStyle,
                    color: emailVerified ? "var(--color-add-fg)" : "var(--color-del-fg)",
                  }}
                >
                  {emailVerified ? "認証済み" : "未認証"}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={accountLabelStyle}>パスワード</span>
                <span style={accountValueStyle}>{hasPassword ? "設定済み" : "未設定"}</span>
              </div>
            </div>

            {/* パスワード変更/設定 */}
            <div
              style={{
                marginTop: "1rem",
                borderTop: "1px solid var(--color-border)",
                paddingTop: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPwOpen(!pwOpen);
                  setPwError("");
                  setPwSuccess(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    transition: "transform 0.2s",
                    transform: pwOpen ? "rotate(90deg)" : "none",
                  }}
                >
                  ▶
                </span>
                {hasPassword ? "パスワードを変更" : "パスワードを設定"}
              </button>

              {pwOpen && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {!hasPassword && (
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "var(--color-add-bg)",
                        borderRadius: "6px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--color-add-fg)",
                        lineHeight: 1.5,
                      }}
                    >
                      パスワードを設定すると、メールアドレス +
                      パスワードでもログインできるようになります。
                    </div>
                  )}

                  {hasPassword && (
                    <div>
                      <label style={labelStyle}>現在のパスワード</label>
                      <input
                        type="password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        autoComplete="current-password"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>新しいパスワード</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      autoComplete="new-password"
                      placeholder="8文字以上"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>新しいパスワード（確認）</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      autoComplete="new-password"
                      style={inputStyle}
                    />
                  </div>

                  {pwError && (
                    <div
                      style={{
                        padding: "0.4rem 0.6rem",
                        backgroundColor: "var(--color-del-bg)",
                        color: "var(--color-del-fg)",
                        borderRadius: "6px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {pwError}
                    </div>
                  )}
                  {pwSuccess && (
                    <div
                      style={{
                        padding: "0.4rem 0.6rem",
                        backgroundColor: "var(--color-add-bg)",
                        color: "var(--color-add-fg)",
                        borderRadius: "6px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {hasPassword ? "パスワードを変更しました" : "パスワードを設定しました"}
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={pwSaving}
                      style={{
                        padding: "0.4rem 1rem",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-accent)",
                        color: "#fff",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: pwSaving ? "not-allowed" : "pointer",
                        opacity: pwSaving ? 0.7 : 1,
                      }}
                    >
                      {pwSaving
                        ? "変更中..."
                        : hasPassword
                          ? "パスワードを変更"
                          : "パスワードを設定"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ━━━ メール通知設定セクション ━━━ */}
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "1.25rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span style={{ fontSize: "1rem" }}>✉</span> メール通知設定
            </h4>

            {/* メールアドレス */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                style={inputStyle}
              />
              <div style={hintStyle}>
                他のメンバーには表示されません。通知の送信先として使用されます。
              </div>
            </div>

            {/* メール未入力時のメッセージ */}
            {!hasEmail && (
              <div
                style={{
                  padding: "0.6rem 0.75rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                メールアドレスを入力すると、以下のアラート設定が有効になります。
              </div>
            )}

            {/* アラート設定メニュー */}
            {hasEmail && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* ─── 通常アラート（プロジェクト・タスク・メッセージ） ─── */}
                {(["project_notifications", "task_alerts", "message_alerts"] as const).map(
                  (key) => (
                    <AlertRow
                      key={key}
                      label={CATEGORY_LABELS[key]}
                      enabled={prefs[key].enabled}
                      frequency={prefs[key].frequency}
                      onToggle={(v) => updatePref(key, { enabled: v })}
                      onFrequency={(f) => updatePref(key, { frequency: f })}
                      categoryEmail={prefs[key].email}
                      onCategoryEmail={(v) =>
                        updatePref(key, { email: v || undefined } as Partial<
                          NotificationPrefs[typeof key]
                        >)
                      }
                    />
                  ),
                )}

                {/* ─── 法令アラート ─── */}
                {(["law_promulgation", "law_enforcement"] as const).map((key) => {
                  const p = prefs[key];
                  return (
                    <div
                      key={key}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    >
                      {/* ヘッダー: ラベル + トグル */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: p.enabled ? "0.75rem" : 0,
                        }}
                      >
                        <span style={alertLabelStyle}>{CATEGORY_LABELS[key]}</span>
                        <ToggleSwitch
                          checked={p.enabled}
                          onChange={(v) => updateLawPref(key, { enabled: v })}
                        />
                      </div>

                      {/* 詳細設定（ON時のみ） */}
                      {p.enabled && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.6rem",
                            paddingLeft: "0.25rem",
                          }}
                        >
                          {/* スコープスライダー */}
                          <div>
                            <label style={{ ...labelStyle, marginBottom: "0.5rem" }}>
                              対象範囲
                            </label>
                            <ScopeSlider
                              value={p.scope}
                              onChange={(s) => updateLawPref(key, { scope: s })}
                            />
                          </div>

                          {/* 頻度 */}
                          <div>
                            <label style={{ ...labelStyle, marginBottom: "0.3rem" }}>頻度</label>
                            <FrequencySelect
                              value={p.frequency}
                              onChange={(f) => updateLawPref(key, { frequency: f })}
                            />
                          </div>

                          {/* 週次設定 */}
                          {p.frequency === "weekly" && (
                            <WeeklyConfig
                              schedule={p.weekly_schedule}
                              onChange={(ws) =>
                                updateLawPref(key, {
                                  weekly_schedule: { ...p.weekly_schedule, ...ws },
                                })
                              }
                            />
                          )}

                          {/* カテゴリ別通知メール */}
                          <div>
                            <label style={{ ...labelStyle, marginBottom: "0.3rem" }}>
                              通知先メール
                            </label>
                            <input
                              type="email"
                              value={p.email ?? ""}
                              onChange={(e) =>
                                updateLawPref(key, { email: e.target.value || undefined })
                              }
                              placeholder="別のメールアドレスを指定（空欄＝アカウントメール）"
                              style={{
                                ...inputStyle,
                                fontSize: "0.82rem",
                                padding: "0.45rem 0.6rem",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: "var(--color-del-bg)",
                color: "var(--color-del-fg)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: "var(--color-add-bg)",
                color: "var(--color-add-fg)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                marginBottom: "0.75rem",
              }}
            >
              保存しました。ページをリロードしています...
            </div>
          )}

          {/* アクションボタン */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              onClick={toggleEdit}
              disabled={saving}
              style={{
                padding: "0.45rem 1rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "0.45rem 1.2rem",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// サブコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 通常アラート行（トグル + 頻度 + カテゴリ別メール） */
function AlertRow({
  label,
  enabled,
  frequency,
  onToggle,
  onFrequency,
  categoryEmail,
  onCategoryEmail,
}: {
  label: string;
  enabled: boolean;
  frequency: AlertFrequency;
  onToggle: (v: boolean) => void;
  onFrequency: (f: AlertFrequency) => void;
  categoryEmail?: string;
  onCategoryEmail?: (v: string) => void;
}) {
  return (
    <div
      style={{
        padding: "0.75rem",
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: enabled ? "0.5rem" : 0,
        }}
      >
        <span style={alertLabelStyle}>{label}</span>
        <ToggleSwitch checked={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div
          style={{
            paddingLeft: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div>
            <label style={{ ...labelStyle, marginBottom: "0.3rem" }}>頻度</label>
            <FrequencySelect value={frequency} onChange={onFrequency} />
          </div>
          {onCategoryEmail && (
            <div>
              <label style={{ ...labelStyle, marginBottom: "0.3rem" }}>通知先メール</label>
              <input
                type="email"
                value={categoryEmail ?? ""}
                onChange={(e) => onCategoryEmail(e.target.value)}
                placeholder="別のメールアドレスを指定（空欄＝アカウントメール）"
                style={{ ...inputStyle, fontSize: "0.82rem", padding: "0.45rem 0.6rem" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** ON/OFF トグルスイッチ（CSS only） */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: "40px",
          height: "22px",
          borderRadius: "11px",
          border: "none",
          backgroundColor: checked ? "var(--color-accent)" : "var(--color-border)",
          position: "relative",
          cursor: "pointer",
          transition: "background-color 0.2s",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            position: "absolute",
            top: "2px",
            left: checked ? "20px" : "2px",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: checked ? "var(--color-accent)" : "var(--color-text-secondary)",
          minWidth: "2rem",
        }}
      >
        {checked ? "ON" : "OFF"}
      </span>
    </div>
  );
}

/** 頻度セレクト（即時 / 週次） */
function FrequencySelect({
  value,
  onChange,
}: {
  value: AlertFrequency;
  onChange: (f: AlertFrequency) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {(["immediate", "weekly"] as const).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          style={{
            padding: "0.3rem 0.75rem",
            border: `1px solid ${value === f ? "var(--color-accent)" : "var(--color-border)"}`,
            borderRadius: "4px",
            backgroundColor: value === f ? "var(--color-accent)" : "transparent",
            color: value === f ? "#fff" : "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {f === "immediate" ? "即時" : "週次"}
        </button>
      ))}
    </div>
  );
}

/** 法令対象スコープ — 4段スライダー */
function ScopeSlider({ value, onChange }: { value: LawScope; onChange: (s: LawScope) => void }) {
  const scopes: LawScope[] = ["bookmarked", "categories", "situations", "all"];
  const idx = Math.max(0, scopes.indexOf(value));

  return (
    <div>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={idx}
        onChange={(e) => onChange(scopes[parseInt(e.target.value)])}
        style={{
          width: "100%",
          accentColor: "var(--color-accent)",
          cursor: "pointer",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {scopes.map((s) => (
          <span
            key={s}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              color: s === value ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontWeight: s === value ? 700 : 400,
            }}
          >
            {SCOPE_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 週次スケジュール設定 */
function WeeklyConfig({
  schedule,
  onChange,
}: {
  schedule: { day: number; time: string; count: number };
  onChange: (patch: Partial<{ day: number; time: string; count: number }>) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
      {/* 曜日 */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>曜日</label>
        <select
          value={schedule.day}
          onChange={(e) => onChange({ day: parseInt(e.target.value) })}
          style={{ ...inputStyle, width: "auto", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
        >
          {DAY_LABELS.map((d, i) => (
            <option key={i} value={i}>
              {d}曜
            </option>
          ))}
        </select>
      </div>

      {/* 時間 */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>時間</label>
        <input
          type="time"
          value={schedule.time}
          onChange={(e) => onChange({ time: e.target.value })}
          style={{ ...inputStyle, width: "auto", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
        />
      </div>

      {/* 週あたり回数 */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>週あたり</label>
        <select
          value={schedule.count}
          onChange={(e) => onChange({ count: parseInt(e.target.value) })}
          style={{ ...inputStyle, width: "auto", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              {n}回
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── 共通スタイル ────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "var(--color-text-secondary)",
  marginBottom: "0.35rem",
  letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text-primary)",
  boxSizing: "border-box",
};

const hintStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  color: "var(--color-text-secondary)",
  marginTop: "0.3rem",
};

const alertLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.84rem",
  fontWeight: 600,
  color: "var(--color-text-primary)",
};

const accountLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.8rem",
  color: "var(--color-text-secondary)",
};

const accountValueStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-text-primary)",
};
