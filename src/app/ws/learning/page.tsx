"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getAllCourses,
  getCourse,
  addCourse,
  deleteCourse,
  addSlide,
  addQuizQuestion,
  getAllProgress,
  upsertProgress,
  COURSE_CATEGORIES,
  type Course,
  type CourseProgress,
} from "@/lib/ws-learning";

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [tab, setTab] = useState<"courses" | "progress">("courses");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: COURSE_CATEGORIES[0] });
  const [viewId, setViewId] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [addSlideText, setAddSlideText] = useState("");
  const [addQuiz, setAddQuiz] = useState({
    question: "",
    c0: "",
    c1: "",
    c2: "",
    c3: "",
    correct: 0,
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  function reload() {
    setCourses(getAllCourses());
    setProgress(getAllProgress());
  }

  function handleCreate() {
    if (!form.title.trim()) return;
    addCourse(form);
    setForm({ title: "", description: "", category: COURSE_CATEGORIES[0] });
    setShowForm(false);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteCourse(id);
    reload();
  }

  function openViewer(id: string) {
    setViewId(id);
    setSlideIdx(0);
    setQuizMode(false);
    setQuizSubmitted(false);
    setQuizAnswers([]);
    setEditMode(false);
  }

  function handleAddSlide() {
    if (!viewId || !addSlideText.trim()) return;
    addSlide(viewId, addSlideText);
    setAddSlideText("");
    reload();
  }

  function handleAddQuiz() {
    if (!viewId || !addQuiz.question.trim()) return;
    addQuizQuestion(viewId, {
      question: addQuiz.question,
      choices: [addQuiz.c0, addQuiz.c1, addQuiz.c2, addQuiz.c3].filter(Boolean),
      correctIndex: addQuiz.correct,
    });
    setAddQuiz({ question: "", c0: "", c1: "", c2: "", c3: "", correct: 0 });
    reload();
  }

  function submitQuiz(course: Course) {
    const session = getSession();
    const score = course.quiz.reduce(
      (acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0),
      0,
    );
    if (session) {
      upsertProgress(course.id, session.memberId, session.name, {
        quizScore: score,
        completedSlides: course.slides.length,
        completedAt: new Date().toISOString(),
      });
    }
    setQuizSubmitted(true);
    reload();
  }

  const filtered = categoryFilter ? courses.filter((c) => c.category === categoryFilter) : courses;
  const viewing = viewId ? getCourse(viewId) : null;

  if (viewing) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
        <nav
          style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
        >
          <Link href="/" style={{ color: "var(--color-accent)" }}>
            Top
          </Link>{" "}
          &gt;{" "}
          <Link href="/ws" style={{ color: "var(--color-accent)" }}>
            WS
          </Link>{" "}
          &gt;{" "}
          <span
            onClick={() => setViewId(null)}
            style={{ color: "var(--color-accent)", cursor: "pointer" }}
          >
            学習コース
          </span>{" "}
          &gt; {viewing.title}
        </nav>
        <button
          onClick={() => setViewId(null)}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.3rem 0.8rem",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          戻る
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, flex: 1 }}>{viewing.title}</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              fontSize: "0.8rem",
              padding: "0.3rem 0.8rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            {editMode ? "閉じる" : "編集"}
          </button>
        </div>

        {editMode && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              スライド追加
            </h3>
            <textarea
              value={addSlideText}
              onChange={(e) => setAddSlideText(e.target.value)}
              placeholder="Markdownで記述"
              rows={4}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                marginBottom: "0.5rem",
                resize: "vertical",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            />
            <button
              onClick={handleAddSlide}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              追加
            </button>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                marginTop: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              クイズ追加
            </h3>
            <input
              value={addQuiz.question}
              onChange={(e) => setAddQuiz({ ...addQuiz, question: e.target.value })}
              placeholder="問題文"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                marginBottom: "0.3rem",
              }}
            />
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.3rem",
                  alignItems: "center",
                  marginBottom: "0.3rem",
                }}
              >
                <input
                  type="radio"
                  name="correct"
                  checked={addQuiz.correct === i}
                  onChange={() => setAddQuiz({ ...addQuiz, correct: i })}
                />
                <input
                  value={[addQuiz.c0, addQuiz.c1, addQuiz.c2, addQuiz.c3][i]}
                  onChange={(e) => setAddQuiz({ ...addQuiz, [`c${i}`]: e.target.value })}
                  placeholder={`選択肢${i + 1}`}
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleAddQuiz}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                marginTop: "0.3rem",
              }}
            >
              追加
            </button>
          </div>
        )}

        {!quizMode ? (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "1.5rem",
            }}
          >
            {viewing.slides.length > 0 ? (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  スライド {slideIdx + 1} / {viewing.slides.length}
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    minHeight: 120,
                  }}
                >
                  {viewing.slides[slideIdx].content}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <button
                    disabled={slideIdx === 0}
                    onClick={() => setSlideIdx(slideIdx - 1)}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: 6,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      cursor: slideIdx === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    前へ
                  </button>
                  {slideIdx < viewing.slides.length - 1 ? (
                    <button
                      onClick={() => setSlideIdx(slideIdx + 1)}
                      style={{
                        padding: "0.4rem 1rem",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "var(--color-accent)",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      次へ
                    </button>
                  ) : viewing.quiz.length > 0 ? (
                    <button
                      onClick={() => {
                        setQuizMode(true);
                        setQuizAnswers(new Array(viewing.quiz.length).fill(-1));
                      }}
                      style={{
                        padding: "0.4rem 1rem",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#059669",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      クイズへ
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--color-text-secondary)", textAlign: "center" }}>
                スライドがありません。編集モードで追加してください。
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>クイズ</h3>
            {viewing.quiz.map((q, qi) => (
              <div key={q.id} style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
                  Q{qi + 1}. {q.question}
                </div>
                {q.choices.map((ch, ci) => (
                  <label
                    key={ci}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.9rem",
                      padding: "0.2rem 0",
                      cursor: "pointer",
                      color: quizSubmitted
                        ? ci === q.correctIndex
                          ? "#059669"
                          : quizAnswers[qi] === ci
                            ? "#DC2626"
                            : "inherit"
                        : "inherit",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q${qi}`}
                      disabled={quizSubmitted}
                      checked={quizAnswers[qi] === ci}
                      onChange={() => {
                        const a = [...quizAnswers];
                        a[qi] = ci;
                        setQuizAnswers(a);
                      }}
                    />
                    {ch}
                  </label>
                ))}
              </div>
            ))}
            {!quizSubmitted ? (
              <button
                onClick={() => submitQuiz(viewing)}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                採点する
              </button>
            ) : (
              <div
                style={{
                  padding: "0.8rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: 6,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                スコア:{" "}
                {viewing.quiz.reduce(
                  (acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0),
                  0,
                )}{" "}
                / {viewing.quiz.length}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; 学習コース
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>学習コース</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(["courses", "progress"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              backgroundColor: tab === t ? "var(--color-accent)" : "var(--color-surface)",
              color: tab === t ? "#fff" : "var(--color-text-primary)",
            }}
          >
            {t === "courses" ? "コース一覧" : "進捗"}
          </button>
        ))}
        {tab === "courses" && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginLeft: "auto",
            }}
          >
            <option value="">全カテゴリ</option>
            {COURSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            コースを追加
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="タイトル *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="説明"
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
              resize: "vertical",
            }}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{
              padding: "0.4rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          >
            {COURSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              onClick={handleCreate}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              作成
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {tab === "courses" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => openViewer(c.id)}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.8rem 1rem",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {c.category}
                </span>
                <span style={{ fontWeight: 600, flex: 1 }}>{c.title}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {c.slides.length}枚
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {c.quiz.length}問
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                  style={{
                    fontSize: "0.75rem",
                    color: "#DC2626",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  削除
                </button>
              </div>
              {c.description && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "0.3rem",
                  }}
                >
                  {c.description}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}
            >
              コースがありません
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)" }}>
                <th
                  style={{
                    padding: "0.6rem",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  メンバー
                </th>
                {courses.map((c) => (
                  <th
                    key={c.id}
                    style={{
                      padding: "0.6rem",
                      textAlign: "center",
                      borderBottom: "1px solid var(--color-border)",
                      minWidth: 80,
                    }}
                  >
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const members = [...new Set(progress.map((p) => p.memberName))];
                if (members.length === 0)
                  return (
                    <tr>
                      <td
                        colSpan={courses.length + 1}
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        進捗データがありません
                      </td>
                    </tr>
                  );
                return members.map((m) => (
                  <tr key={m}>
                    <td
                      style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}
                    >
                      {m}
                    </td>
                    {courses.map((c) => {
                      const p = progress.find((x) => x.memberName === m && x.courseId === c.id);
                      return (
                        <td
                          key={c.id}
                          style={{
                            padding: "0.5rem",
                            textAlign: "center",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {p?.completedAt ? (
                            <span
                              style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}
                            >
                              {p.quizScore !== null ? `${p.quizScore}/${c.quiz.length}` : "完了"}
                            </span>
                          ) : p ? (
                            <span style={{ fontSize: "0.75rem", color: "#D97706" }}>受講中</span>
                          ) : (
                            <span
                              style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}
                            >
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
