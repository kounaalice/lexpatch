"use client";
import { uuid } from "@/lib/uuid";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectChat } from "./ProjectChat";
import { ProjectNotifications } from "./ProjectNotifications";
import { getSession } from "@/lib/session";
import FileUploader from "@/components/FileUploader";
import FileList from "@/components/FileList";
import ChecklistTemplateSelector from "@/components/ChecklistTemplateSelector";
import MeetingMinutesSection from "@/components/project/MeetingMinutesSection";
import GanttChart from "@/components/project/GanttChart";
import { addCard } from "@/lib/cards";
import type { MeetingMinutes as MeetingMinutesType } from "@/lib/meeting-minutes";

// ---------- Types ----------

type SourceTier = "一次" | "準一次" | "二次" | "三次" | "リンク";

interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
}

interface Bookmark {
  law_id: string;
  article_title: string;
  article_num?: string;
}

interface ProjectReference {
  tier: SourceTier;
  label: string;
  url: string;
}

interface TaskLink {
  label: string;
  url: string;
}

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string; // ISO date string (YYYY-MM-DD)
  dueTime?: string; // HH:mm (optional time)
  description?: string;
  links?: TaskLink[];
  start_date?: string; // ISO date string (YYYY-MM-DD)
}

interface ActivityEntry {
  action: string;
  by?: string;
  at: string;
}

interface ProjectMember {
  name: string;
  org: string;
  role: string;
}

const MEMBER_ROLES = ["リーダー", "担当者", "レビュアー", "オブザーバー"] as const;

interface ProjectInfo {
  id: string;
  title: string;
  description: string | null;
  law_ids: string[];
  bookmarks: Bookmark[];
  patch_ids?: string[];
  owner_name: string | null;
  status: string;
  references: ProjectReference[];
  tasks: ProjectTask[];
  members: ProjectMember[];
  phase_deadlines?: Record<string, string>;
  visibility?: string;
}

interface PatchSummary {
  id: string;
  title: string;
  status: string;
  target_articles: string[];
  created_at: string;
}

interface Props {
  project: ProjectInfo;
  notes: ProjectNote[];
  meetingMinutes?: MeetingMinutesType[];
  lawTitleMap: Record<string, string>;
  approvals?: Record<string, { by: string; at: string }>;
  activity_log?: ActivityEntry[];
  members?: ProjectMember[];
}

// ---------- Constants ----------

const PHASES = ["調査", "立案", "検討", "提出", "完了"] as const;
type Phase = (typeof PHASES)[number];

const PHASE_LABELS: Record<Phase, string> = {
  調査: "現行法・判例・実務の調査",
  立案: "改正案の起草・条文作成",
  検討: "内容精査・意見照会",
  提出: "最終案の確定・提出",
  完了: "完了",
};

const TIER_COLORS: Record<SourceTier, { fg: string; bg: string }> = {
  一次: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
  準一次: { fg: "#1B4B8A", bg: "#EBF2FD" },
  二次: { fg: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
  三次: { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
  リンク: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
};

// ---------- Helpers ----------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

function isOverdue(due: string | undefined, done: boolean): boolean {
  if (!due || done) return false;
  return due < todayISO();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ja-JP");
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString("ja-JP")} ${d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

// ---------- Component ----------

export function ProjectWorkspace({
  project,
  notes: initialNotes,
  meetingMinutes: initialMeetingMinutes,
  lawTitleMap,
  approvals: initialApprovals,
  activity_log: initialActivityLog,
}: Props) {
  // State
  const [status, setStatus] = useState<string>(project.status || "調査");
  const [description, setDescription] = useState(project.description ?? "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [lawIds, setLawIds] = useState<string[]>(project.law_ids);
  const [newLawId, setNewLawId] = useState("");
  const [titles, setTitles] = useState<Record<string, string>>(lawTitleMap);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(project.bookmarks);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [newBookmarkLawId, setNewBookmarkLawId] = useState("");
  const [newBookmarkArticle, setNewBookmarkArticle] = useState("");
  const [references, setReferences] = useState<ProjectReference[]>(project.references);
  const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks);
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);
  const [patchIds, setPatchIds] = useState<string[]>(project.patch_ids ?? []);
  const [patches, setPatches] = useState<PatchSummary[]>([]);
  const [addPatchId, setAddPatchId] = useState("");
  const [patchSearchQuery, setPatchSearchQuery] = useState("");
  const [patchSearchResults, setPatchSearchResults] = useState<PatchSummary[]>([]);
  const [patchSearching, setPatchSearching] = useState(false);
  const [showPatchSearch, setShowPatchSearch] = useState(false);

  // パッチ一覧取得
  useEffect(() => {
    if (patchIds.length === 0) return;
    Promise.all(
      patchIds.map((pid) => fetch(`/api/patch?id=${pid}`).then((r) => (r.ok ? r.json() : null))),
    ).then((results) => {
      setPatches(results.filter(Boolean));
    });
  }, [patchIds]);

  async function addPatch() {
    const pid = addPatchId.trim();
    if (!pid || patchIds.includes(pid)) return;
    const updated = [...patchIds, pid];
    const ok = await patchProject({ patch_ids: updated });
    if (ok) {
      setPatchIds(updated);
      setAddPatchId("");
    }
  }

  async function removePatch(pid: string) {
    const updated = patchIds.filter((id) => id !== pid);
    const ok = await patchProject({ patch_ids: updated });
    if (ok) {
      setPatchIds(updated);
      setPatches((prev) => prev.filter((p) => p.id !== pid));
    }
  }

  async function searchPatches(q: string) {
    setPatchSearchQuery(q);
    if (!q.trim()) {
      setPatchSearchResults([]);
      return;
    }
    setPatchSearching(true);
    try {
      const params = new URLSearchParams({ search: q });
      const res = await fetch(`/api/patch?${params}`);
      if (res.ok) {
        const data: PatchSummary[] = await res.json();
        setPatchSearchResults(data.filter((p) => !patchIds.includes(p.id)));
      }
    } catch {
      /* ignore */
    } finally {
      setPatchSearching(false);
    }
  }

  async function addPatchFromSearch(patch: PatchSummary) {
    if (patchIds.includes(patch.id)) return;
    const updated = [...patchIds, patch.id];
    const ok = await patchProject({ patch_ids: updated });
    if (ok) {
      setPatchIds(updated);
      setPatches((prev) => [...prev, patch]);
      setPatchSearchResults((prev) => prev.filter((p) => p.id !== patch.id));
    }
  }

  // Phase deadlines
  const [phaseDeadlines, setPhaseDeadlines] = useState<Record<string, string>>(
    project.phase_deadlines ?? {},
  );

  // Approvals
  const [approvals, setApprovals] = useState<Record<string, { by: string; at: string }>>(
    initialApprovals ?? {},
  );

  // Activity Log
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(initialActivityLog ?? []);
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Phase approval modal
  const [phaseApprovalTarget, setPhaseApprovalTarget] = useState<string | null>(null);
  const [approverName, setApproverName] = useState("");

  // Forms
  const [noteContent, setNoteContent] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskDueTime, setNewTaskDueTime] = useState("");
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [taskDescDraft, setTaskDescDraft] = useState("");
  const [taskNewLinkLabel, setTaskNewLinkLabel] = useState("");
  const [taskNewLinkUrl, setTaskNewLinkUrl] = useState("");
  const [showRefForm, setShowRefForm] = useState(false);
  const [newRef, setNewRef] = useState<ProjectReference>({ tier: "二次", label: "", url: "" });

  const [members, setMembers] = useState<ProjectMember[]>(project.members ?? []);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMember, setNewMember] = useState<ProjectMember>({ name: "", org: "", role: "担当者" });

  // Law search
  const [lawSearchQuery, setLawSearchQuery] = useState("");
  const [lawSearchResults, setLawSearchResults] = useState<
    Array<{ law_id: string; law_title: string; law_num: string }>
  >([]);
  const [lawSearching, setLawSearching] = useState(false);

  // Project settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editOwnerName, setEditOwnerName] = useState(project.owner_name ?? "");
  const [editVisibility, setEditVisibility] = useState(project.visibility ?? "public");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // File attachments & checklist template
  const [fileRefreshKey, setFileRefreshKey] = useState(0);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showGantt, setShowGantt] = useState(false);
  const [showMeetingMinutes, setShowMeetingMinutes] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutesType[]>(
    initialMeetingMinutes ?? [],
  );
  const [session] = useState(() => getSession());

  // Sidebar links (references with tier "リンク")
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lp_project_owner");
    if (saved) {
      setNoteAuthor(saved);
      setApproverName(saved);
    }
  }, []);

  const [saveError, setSaveError] = useState<string | null>(null);

  // ---------- API helpers ----------

  async function patchProject(data: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "保存に失敗しました" }));
        setSaveError(err.error ?? "保存に失敗しました");
        setTimeout(() => setSaveError(null), 5000);
        return false;
      }
      return true;
    } catch {
      setSaveError("ネットワークエラー: 保存に失敗しました");
      setTimeout(() => setSaveError(null), 5000);
      return false;
    }
  }

  function addActivity(action: string, by?: string) {
    const entry: ActivityEntry = { action, at: nowISO(), ...(by ? { by } : {}) };
    const updated = [entry, ...activityLog];
    setActivityLog(updated);
    // Save to server (fire and forget)
    patchProject({ activity_log: updated });
  }

  async function saveDescription() {
    await patchProject({ description });
    setIsEditingDesc(false);
  }

  async function saveSettings() {
    if (!editTitle.trim()) return;
    setSettingsSaving(true);
    const ok = await patchProject({
      title: editTitle.trim(),
      owner_name: editOwnerName.trim() || null,
      visibility: editVisibility,
    });
    setSettingsSaving(false);
    if (ok) {
      setShowSettings(false);
      window.location.reload();
    }
  }

  async function updatePhaseDeadline(phase: string, date: string) {
    const updated = { ...phaseDeadlines, [phase]: date };
    if (!date) delete updated[phase];
    setPhaseDeadlines(updated);
    await patchProject({ phase_deadlines: updated });
  }

  function handlePhaseClick(phase: string) {
    if (phase === status) return;
    setPhaseApprovalTarget(phase);
  }

  async function confirmPhaseApproval() {
    if (!phaseApprovalTarget) return;
    const name = approverName.trim() || "匿名";
    const now = nowISO();

    // Update status
    setStatus(phaseApprovalTarget);
    await patchProject({ status: phaseApprovalTarget });

    // Update approvals
    const updatedApprovals = { ...approvals, [phaseApprovalTarget]: { by: name, at: now } };
    setApprovals(updatedApprovals);
    await patchProject({ approvals: updatedApprovals });

    // Activity log
    addActivity(`フェーズを「${phaseApprovalTarget}」に変更`, name);

    // Save approver name for convenience
    if (approverName.trim()) localStorage.setItem("lp_project_owner", approverName.trim());

    setPhaseApprovalTarget(null);
  }

  async function searchLawsByName() {
    const q = lawSearchQuery.trim();
    if (!q) return;
    setLawSearching(true);
    try {
      const res = await fetch(`/api/egov/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setLawSearchResults((data.laws ?? []).slice(0, 10));
      }
    } catch {
      /* ignore */
    }
    setLawSearching(false);
  }

  async function addLawById(id: string, title: string) {
    if (lawIds.includes(id)) return;
    const updated = [...lawIds, id];
    setLawIds(updated);
    setTitles((prev) => ({ ...prev, [id]: title }));
    setLawSearchQuery("");
    setLawSearchResults([]);
    await patchProject({ law_ids: updated });
  }

  async function addLaw() {
    const id = newLawId.trim();
    if (!id || lawIds.includes(id)) return;
    const updated = [...lawIds, id];
    setLawIds(updated);
    setNewLawId("");
    await patchProject({ law_ids: updated });
  }

  async function removeLaw(lawId: string) {
    const updated = lawIds.filter((l) => l !== lawId);
    setLawIds(updated);
    await patchProject({ law_ids: updated });
  }

  async function addNote() {
    if (!noteContent.trim()) return;
    setNoteSaving(true);
    try {
      const res = await fetch("/api/projects/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          content: noteContent,
          author_name: noteAuthor || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) => [data, ...prev]);
        setNoteContent("");
        if (noteAuthor.trim()) localStorage.setItem("lp_project_owner", noteAuthor.trim());
      }
    } catch {
      /* ignore */
    }
    setNoteSaving(false);
  }

  async function deleteNote(id: string) {
    if (!confirm("このノートを削除しますか？")) return;
    await fetch(`/api/projects/notes?id=${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  // Tasks
  async function addTask() {
    if (!newTaskTitle.trim()) return;
    const task: ProjectTask = {
      id: uuid(),
      title: newTaskTitle.trim(),
      done: false,
      ...(newTaskAssignee.trim() ? { assignee: newTaskAssignee.trim() } : {}),
      ...(newTaskDue ? { due: newTaskDue } : {}),
      ...(newTaskDueTime ? { dueTime: newTaskDueTime } : {}),
    };
    const updated = [...tasks, task];
    setTasks(updated);
    setNewTaskTitle("");
    setNewTaskAssignee("");
    setNewTaskDue("");
    setNewTaskDueTime("");
    setShowTaskDetails(false);
    await patchProject({ tasks: updated });
  }

  async function updateTaskDue(taskId: string, due: string, dueTime?: string) {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, due: due || undefined, dueTime: dueTime || undefined } : t,
    );
    setTasks(updated);
    await patchProject({ tasks: updated });
  }

  async function toggleTask(id: string) {
    const target = tasks.find((t) => t.id === id);
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(updated);
    await patchProject({ tasks: updated });

    // Activity log for task completion
    if (target && !target.done) {
      addActivity(`タスク「${target.title}」を完了`, target.assignee);
      // カード報酬: プロジェクト関連法令からランダム1枚
      if (lawIds.length > 0) {
        const rewardLawId = lawIds[Math.floor(Math.random() * lawIds.length)];
        const articleNum = String(Math.floor(Math.random() * 50) + 1);
        addCard(`${rewardLawId}:${articleNum}`);
      }
    }
  }

  async function removeTask(id: string) {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await patchProject({ tasks: updated });
    if (openTaskId === id) setOpenTaskId(null);
  }

  function openTaskDetail(id: string) {
    const t = tasks.find((x) => x.id === id);
    setOpenTaskId(id);
    setTaskDescDraft(t?.description ?? "");
    setTaskNewLinkLabel("");
    setTaskNewLinkUrl("");
  }

  async function saveTaskDescription(id: string) {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, description: taskDescDraft.trim() || undefined } : t,
    );
    setTasks(updated);
    await patchProject({ tasks: updated });
  }

  async function addTaskLink(id: string) {
    if (!taskNewLinkLabel.trim() || !taskNewLinkUrl.trim()) return;
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            links: [
              ...(t.links ?? []),
              { label: taskNewLinkLabel.trim(), url: taskNewLinkUrl.trim() },
            ],
          }
        : t,
    );
    setTasks(updated);
    setTaskNewLinkLabel("");
    setTaskNewLinkUrl("");
    await patchProject({ tasks: updated });
  }

  async function removeTaskLink(taskId: string, linkIndex: number) {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, links: (t.links ?? []).filter((_, i) => i !== linkIndex) } : t,
    );
    setTasks(updated);
    await patchProject({ tasks: updated });
  }

  async function applyTemplateTasks(
    newTasks: Array<{
      id: string;
      title: string;
      done: boolean;
      description?: string;
      due?: string;
    }>,
  ) {
    const merged = [...tasks, ...newTasks.map((t) => ({ ...t }) as ProjectTask)];
    setTasks(merged);
    await patchProject({ tasks: merged });
    addActivity(`テンプレートから${newTasks.length}件のタスクを追加`);
  }

  // References
  async function addReference() {
    if (!newRef.label.trim()) return;
    const updated = [
      ...references,
      { ...newRef, label: newRef.label.trim(), url: newRef.url.trim() },
    ];
    setReferences(updated);
    setNewRef({ tier: "二次", label: "", url: "" });
    setShowRefForm(false);
    await patchProject({ references: updated });
  }

  async function removeReference(index: number) {
    const updated = references.filter((_, i) => i !== index);
    setReferences(updated);
    await patchProject({ references: updated });
  }

  // Members
  async function addMember() {
    if (!newMember.name.trim()) return;
    const prevMembers = [...members];
    const memberName = newMember.name.trim();
    const updated = [
      ...members,
      { name: memberName, org: newMember.org.trim(), role: newMember.role },
    ];
    setMembers(updated);
    setNewMember({ name: "", org: "", role: "担当者" });
    setShowMemberForm(false);
    const ok = await patchProject({ members: updated });
    if (!ok) {
      setMembers(prevMembers);
      return;
    }
    addActivity(`メンバー追加: ${memberName}`, noteAuthor || undefined);
  }

  async function removeMember(index: number) {
    const removed = members[index];
    const prevMembers = [...members];
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    const ok = await patchProject({ members: updated });
    if (!ok) {
      setMembers(prevMembers);
      return;
    }
    addActivity(`メンバー削除: ${removed.name}`, noteAuthor || undefined);
  }

  // Bookmarks
  async function addBookmark() {
    const lawId = newBookmarkLawId.trim();
    const article = newBookmarkArticle.trim();
    if (!lawId || !article) return;
    const bm: Bookmark = { law_id: lawId, article_title: article, article_num: article };
    const updated = [...bookmarks, bm];
    setBookmarks(updated);
    setNewBookmarkLawId("");
    setNewBookmarkArticle("");
    setShowBookmarkForm(false);
    const ok = await patchProject({ bookmarks: updated });
    if (!ok) {
      setBookmarks(bookmarks);
    }
  }

  async function removeBookmark(index: number) {
    const prev = [...bookmarks];
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    const ok = await patchProject({ bookmarks: updated });
    if (!ok) {
      setBookmarks(prev);
    }
  }

  // Sidebar links
  const sidebarLinks = references.filter((r) => r.tier === "リンク");
  const mainReferences = references.filter((r) => r.tier !== "リンク");

  async function addLink() {
    if (!newLinkLabel.trim()) return;
    const link: ProjectReference = {
      tier: "リンク",
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
    };
    const updated = [...references, link];
    setReferences(updated);
    setNewLinkLabel("");
    setNewLinkUrl("");
    setShowLinkForm(false);
    const ok = await patchProject({ references: updated });
    if (!ok) {
      setReferences(references);
    }
  }

  async function removeLink(refIndex: number) {
    // refIndex is into the full references array for items with tier "リンク"
    const prev = [...references];
    const updated = references.filter((_, i) => i !== refIndex);
    setReferences(updated);
    const ok = await patchProject({ references: updated });
    if (!ok) {
      setReferences(prev);
    }
  }

  // ---------- Computed ----------

  const currentPhaseIdx = PHASES.indexOf(status as Phase);
  const doneCount = tasks.filter((t) => t.done).length;
  const taskProgress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  // ---------- Render ----------

  return (
    <div
      className="pw-root"
      style={{ maxWidth: "1060px", margin: "0 auto", padding: "1.5rem 2rem 3rem" }}
    >
      {/* Save error toast */}
      {saveError && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 9999,
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {saveError}
        </div>
      )}

      {/* Settings button (floating) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            padding: "0.35rem 0.75rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
          }}
        >
          設定
        </button>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "10px",
              padding: "1.5rem 2rem",
              border: "1px solid var(--color-border)",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 1.25rem",
              }}
            >
              プロジェクト設定
            </h3>

            <label style={{ display: "block", marginBottom: "0.85rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                プロジェクト名 <span style={{ color: "var(--color-del-fg)" }}>*</span>
              </span>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "0.85rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                作成者名
              </span>
              <input
                type="text"
                value={editOwnerName}
                onChange={(e) => setEditOwnerName(e.target.value)}
                placeholder="名前（任意）"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1.25rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                公開設定
              </span>
              <select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="public">公開（誰でも閲覧可）</option>
                <option value="members_only">メンバー限定</option>
                <option value="private">非公開（パスワード保護）</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: "0.45rem 1rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={saveSettings}
                disabled={settingsSaving || !editTitle.trim()}
                style={{
                  padding: "0.45rem 1rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor:
                    settingsSaving || !editTitle.trim()
                      ? "var(--color-border)"
                      : "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: settingsSaving || !editTitle.trim() ? "not-allowed" : "pointer",
                }}
              >
                {settingsSaving ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase approval modal */}
      {phaseApprovalTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPhaseApprovalTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "10px",
              padding: "1.5rem 2rem",
              border: "1px solid var(--color-border)",
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 0.75rem",
              }}
            >
              フェーズ承認
            </h3>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                margin: "0 0 1rem",
                lineHeight: 1.6,
              }}
            >
              「{phaseApprovalTarget}」に進めますか？承認者名を入力してください。
            </p>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="承認者名（任意）"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmPhaseApproval();
              }}
              style={{
                width: "100%",
                padding: "0.45rem 0.7rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "1rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setPhaseApprovalTarget(null)}
                style={{
                  padding: "0.4rem 0.85rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={confirmPhaseApproval}
                style={{
                  padding: "0.4rem 0.85rem",
                  backgroundColor: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                承認して進める
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase progress bar */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "0.5rem" }}>
          {PHASES.map((phase, i) => {
            const isActive = i === currentPhaseIdx;
            const isDone = i < currentPhaseIdx;
            const approval = approvals[phase];
            const deadline = phaseDeadlines[phase];
            const daysLeft = deadline
              ? Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
              : null;
            const deadlineOverdue = daysLeft !== null && daysLeft < 0 && !isDone;
            const deadlineSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && !isDone;
            return (
              <div
                key={phase}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < PHASES.length - 1 ? 1 : "none",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => handlePhaseClick(phase)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "5px",
                      border: isActive
                        ? "1.5px solid var(--color-accent)"
                        : "1px solid transparent",
                      backgroundColor: isActive
                        ? "var(--color-add-bg)"
                        : isDone
                          ? "#ECFDF5"
                          : "transparent",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive
                        ? "var(--color-accent)"
                        : isDone
                          ? "#059669"
                          : "var(--color-text-secondary)",
                      cursor: phase === status ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: "0.7rem" }}>
                      {isDone ? "●" : isActive ? "◉" : "○"}
                    </span>
                    {phase}
                    {approval && (
                      <span style={{ fontSize: "0.68rem", color: "#059669" }}>&#10003;</span>
                    )}
                  </button>
                  {approval && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.62rem",
                        color: "#059669",
                        marginTop: "0.15rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      承認: {approval.by} ({formatDate(approval.at)})
                    </span>
                  )}
                  <input
                    type="date"
                    value={deadline ?? ""}
                    onChange={(e) => updatePhaseDeadline(phase, e.target.value)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.6rem",
                      marginTop: "0.2rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "3px",
                      padding: "0.1rem 0.2rem",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-secondary)",
                      width: "100px",
                    }}
                  />
                  {deadline && !isDone && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.58rem",
                        marginTop: "0.1rem",
                        color: deadlineOverdue
                          ? "#DC2626"
                          : deadlineSoon
                            ? "#D97706"
                            : "var(--color-text-secondary)",
                        fontWeight: deadlineOverdue || deadlineSoon ? 600 : 400,
                      }}
                    >
                      {deadlineOverdue
                        ? `${Math.abs(daysLeft!)}日超過`
                        : daysLeft === 0
                          ? "本日期限"
                          : `残り${daysLeft}日`}
                    </span>
                  )}
                </div>
                {i < PHASES.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      minWidth: "12px",
                      backgroundColor: isDone ? "#059669" : "var(--color-border)",
                      alignSelf: "center",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          {PHASE_LABELS[status as Phase] ?? ""}
        </p>
        {/* チームカレンダーリンク */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href={`/calendar?project_id=${project.id}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-accent)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.6rem",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg)",
            }}
          >
            &#128197; チームカレンダー
          </Link>
          {session && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/api/calendar/ical?member_id=${session.memberId}&token=${session.token}&project_id=${project.id}`;
                navigator.clipboard.writeText(url).then(() => alert("iCal購読URLをコピーしました"));
              }}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                backgroundColor: "var(--color-bg)",
                padding: "0.3rem 0.6rem",
                cursor: "pointer",
              }}
            >
              iCal URL コピー
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div
        className="pw-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left: Main content */}
        <div style={{ minWidth: 0 }}>
          {/* 進捗サマリー */}
          {tasks.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  進捗: {tasks.filter((t) => t.done).length}/{tasks.length} 完了 (
                  {tasks.length > 0
                    ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
                    : 0}
                  %)
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "6px",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${tasks.length > 0 ? (tasks.filter((t) => t.done).length / tasks.length) * 100 : 0}%`,
                      height: "100%",
                      backgroundColor: "#059669",
                      borderRadius: "3px",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
              {members.length > 0 && tasks.some((t) => t.assignee) && (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}
                >
                  {members.map((m, i) => {
                    const assigned = tasks.filter((t) => t.assignee === m.name);
                    if (assigned.length === 0) return null;
                    const done = assigned.filter((t) => t.done).length;
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          padding: "0.15rem 0.4rem",
                          backgroundColor: "var(--color-bg)",
                          borderRadius: "3px",
                        }}
                      >
                        {m.name} {done}/{assigned.length}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 最近の更新 */}
          {activityLog.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 0.5rem",
                }}
              >
                最近の更新
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {activityLog.slice(0, 5).map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.5rem",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        minWidth: "3.5rem",
                      }}
                    >
                      {new Date(entry.at).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                      })}
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>{entry.action}</span>
                    {entry.by && (
                      <span style={{ color: "var(--color-text-secondary)" }}>({entry.by})</span>
                    )}
                  </div>
                ))}
              </div>
              {activityLog.length > 5 && (
                <button
                  onClick={() =>
                    document
                      .getElementById("activity-log-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-accent)",
                    marginTop: "0.35rem",
                    padding: 0,
                  }}
                >
                  すべての活動を見る →
                </button>
              )}
            </div>
          )}

          {/* 概要 */}
          <section
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                概要・改正理由
              </h2>
              {!isEditingDesc && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "0.15rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  編集
                </button>
              )}
            </div>
            {isEditingDesc ? (
              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="プロジェクトの目的・背景・改正理由を記載…"
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: "0.5rem",
                    lineHeight: 1.7,
                  }}
                />
                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setIsEditingDesc(false);
                      setDescription(project.description ?? "");
                    }}
                    style={{
                      padding: "0.3rem 0.7rem",
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
                    onClick={saveDescription}
                    style={{
                      padding: "0.3rem 0.7rem",
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: description ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {description || "プロジェクトの目的・背景・改正理由を記載…"}
              </p>
            )}
          </section>

          {/* タスク */}
          <section
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                タスク
                {tasks.length > 0 && (
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {doneCount}/{tasks.length} ({taskProgress}%)
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowTemplateSelector(true)}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  padding: "0.25rem 0.6rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-accent)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                テンプレート適用
              </button>
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div
                style={{
                  height: "4px",
                  backgroundColor: "var(--color-border)",
                  borderRadius: "2px",
                  marginBottom: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${taskProgress}%`,
                    backgroundColor: "#059669",
                    borderRadius: "2px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}

            {/* Task list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                marginBottom: "0.5rem",
              }}
            >
              {tasks.map((t, i) => {
                const overdue = isOverdue(t.due, t.done);
                const isOpen = openTaskId === t.id;
                const hasDetail = !!(t.description || (t.links && t.links.length > 0));
                return (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: isOpen ? "6px" : undefined,
                      border: isOpen ? "1px solid var(--color-border)" : undefined,
                      backgroundColor: isOpen ? "var(--color-bg)" : undefined,
                      padding: isOpen ? "0.5rem" : undefined,
                      marginBottom: isOpen ? "0.25rem" : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        padding: isOpen ? "0" : "0.3rem 0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTask(t.id)}
                        style={{
                          margin: "0.15rem 0 0 0",
                          cursor: "pointer",
                          accentColor: "var(--color-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="task-meta">
                          <button
                            onClick={() => (isOpen ? setOpenTaskId(null) : openTaskDetail(t.id))}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.85rem",
                              color: "var(--color-text-primary)",
                              textDecoration: t.done ? "line-through" : "none",
                              opacity: t.done ? 0.6 : 1,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              textAlign: "left",
                            }}
                            title="クリックして詳細を開く"
                          >
                            {hasDetail && (
                              <span
                                style={{
                                  color: "var(--color-accent)",
                                  marginRight: "0.2rem",
                                  fontSize: "0.7rem",
                                }}
                              >
                                &#9654;
                              </span>
                            )}
                            {t.title}
                          </button>
                          <select
                            value={t.assignee ?? ""}
                            onChange={(e) => {
                              const updated = tasks.map((task, j) =>
                                j === i ? { ...task, assignee: e.target.value || undefined } : task,
                              );
                              setTasks(updated);
                              patchProject({ tasks: updated });
                            }}
                            style={{
                              padding: "0.25rem 0.35rem",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.75rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "3px",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text-primary)",
                            }}
                          >
                            <option value="">未割当</option>
                            {members.map((m, mi) => (
                              <option key={mi} value={m.name}>
                                {m.name}
                                {m.org ? ` (${m.org})` : ""}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={t.due ?? ""}
                            onChange={(e) => updateTaskDue(t.id, e.target.value, t.dueTime)}
                            style={{
                              padding: "0.1rem 0.25rem",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              border: `1px solid ${overdue ? "#DC2626" : "var(--color-border)"}`,
                              borderRadius: "3px",
                              backgroundColor: "var(--color-surface)",
                              color: overdue ? "#DC2626" : "var(--color-text-secondary)",
                              fontWeight: overdue ? 600 : 400,
                              cursor: "pointer",
                            }}
                            title="期限日"
                          />
                          <input
                            type="time"
                            value={t.dueTime ?? ""}
                            onChange={(e) => updateTaskDue(t.id, t.due ?? "", e.target.value)}
                            style={{
                              padding: "0.1rem 0.25rem",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "3px",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text-secondary)",
                              cursor: "pointer",
                              width: "70px",
                            }}
                            title="期限時刻（任意）"
                          />
                          {overdue && (
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.62rem",
                                color: "#DC2626",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              期限超過
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(t.id)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.65rem",
                          color: "var(--color-text-secondary)",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.1rem 0.3rem",
                          opacity: 0.6,
                          flexShrink: 0,
                        }}
                      >
                        &#10005;
                      </button>
                    </div>

                    {/* タスク詳細パネル */}
                    {isOpen && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          paddingTop: "0.5rem",
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        {/* 説明 */}
                        <div style={{ marginBottom: "0.6rem" }}>
                          <label
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "var(--color-text-secondary)",
                              display: "block",
                              marginBottom: "0.25rem",
                            }}
                          >
                            説明
                          </label>
                          <textarea
                            value={taskDescDraft}
                            onChange={(e) => setTaskDescDraft(e.target.value)}
                            onBlur={() => saveTaskDescription(t.id)}
                            placeholder="タスクの詳細、背景、関連情報など…"
                            rows={3}
                            style={{
                              width: "100%",
                              padding: "0.4rem 0.6rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "5px",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.82rem",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text-primary)",
                              resize: "vertical",
                              outline: "none",
                              lineHeight: 1.6,
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* リンク一覧 */}
                        {(t.links ?? []).length > 0 && (
                          <div style={{ marginBottom: "0.6rem" }}>
                            <label
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "var(--color-text-secondary)",
                                display: "block",
                                marginBottom: "0.25rem",
                              }}
                            >
                              リンク
                            </label>
                            <div
                              style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
                            >
                              {(t.links ?? []).map((link, li) => (
                                <div
                                  key={li}
                                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                                >
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: "0.8rem",
                                      color: "var(--color-accent)",
                                      textDecoration: "none",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {link.label}
                                  </a>
                                  <button
                                    onClick={() => removeTaskLink(t.id, li)}
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: "0.6rem",
                                      color: "var(--color-text-secondary)",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      opacity: 0.5,
                                      flexShrink: 0,
                                    }}
                                  >
                                    &#10005;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* リンク追加 */}
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            value={taskNewLinkLabel}
                            onChange={(e) => setTaskNewLinkLabel(e.target.value)}
                            placeholder="リンク名（例：民法 第1条）"
                            style={{
                              flex: "1 1 120px",
                              padding: "0.3rem 0.5rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "4px",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text-primary)",
                              outline: "none",
                              minWidth: 0,
                            }}
                          />
                          <input
                            type="text"
                            value={taskNewLinkUrl}
                            onChange={(e) => setTaskNewLinkUrl(e.target.value)}
                            placeholder="URL"
                            style={{
                              flex: "2 1 180px",
                              padding: "0.3rem 0.5rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "4px",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text-primary)",
                              outline: "none",
                              minWidth: 0,
                            }}
                          />
                          <button
                            onClick={() => addTaskLink(t.id)}
                            disabled={!taskNewLinkLabel.trim() || !taskNewLinkUrl.trim()}
                            style={{
                              padding: "0.3rem 0.6rem",
                              backgroundColor:
                                !taskNewLinkLabel.trim() || !taskNewLinkUrl.trim()
                                  ? "var(--color-border)"
                                  : "var(--color-accent)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.72rem",
                              cursor:
                                !taskNewLinkLabel.trim() || !taskNewLinkUrl.trim()
                                  ? "not-allowed"
                                  : "pointer",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            追加
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add task */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="新しいタスクを追加…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !showTaskDetails) addTask();
                  }}
                  style={{
                    flex: 1,
                    padding: "0.35rem 0.6rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => setShowTaskDetails(!showTaskDetails)}
                  style={{
                    padding: "0.35rem 0.5rem",
                    backgroundColor: showTaskDetails ? "var(--color-add-bg)" : "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    color: showTaskDetails ? "var(--color-accent)" : "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  詳細
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTaskTitle.trim()}
                  style={{
                    padding: "0.35rem 0.65rem",
                    backgroundColor: !newTaskTitle.trim()
                      ? "var(--color-border)"
                      : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    cursor: !newTaskTitle.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  追加
                </button>
              </div>
              {showTaskDetails && (
                <div
                  className="task-add-detail"
                  style={{
                    padding: "0.4rem 0.6rem",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "5px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      minWidth: "80px",
                    }}
                  >
                    <option value="">未割当</option>
                    {members.map((m, mi) => (
                      <option key={mi} value={m.name}>
                        {m.name}
                        {m.org ? ` (${m.org})` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    style={{
                      padding: "0.3rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                  <input
                    type="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    style={{
                      padding: "0.3rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      width: "90px",
                    }}
                    placeholder="時刻"
                  />
                </div>
              )}
            </div>
          </section>

          {/* ガントチャート */}
          <section style={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowGantt(!showGantt)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.2s",
                  transform: showGantt ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "0.7rem",
                }}
              >
                &#9654;
              </span>
              ガントチャート
            </button>
            {showGantt && (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "0.75rem 1.25rem",
                  marginTop: "-1px",
                }}
              >
                <GanttChart
                  tasks={tasks}
                  phases={PHASES.map((name) => ({
                    name,
                    deadline: phaseDeadlines[name] || undefined,
                  }))}
                  compact
                />
                <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
                  <Link
                    href={`/projects/${project.id}/gantt`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                    }}
                  >
                    詳細ガントチャートを見る →
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* 参考資料 */}
          <section
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                参考資料
                {mainReferences.length > 0 && (
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    ({mainReferences.length})
                  </span>
                )}
              </h2>
              {!showRefForm && (
                <button
                  onClick={() => setShowRefForm(true)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-accent)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "0.15rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  + 追加
                </button>
              )}
            </div>

            {/* Reference list grouped by tier */}
            {mainReferences.length === 0 && !showRefForm && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                法令資料・判例・論文・通達などを追加できます。
              </p>
            )}

            {mainReferences.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  marginBottom: showRefForm ? "0.75rem" : 0,
                }}
              >
                {mainReferences.map((ref, i) => {
                  const originalIndex = references.indexOf(ref);
                  const colors = TIER_COLORS[ref.tier] ?? TIER_COLORS["三次"];
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.25rem 0",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "3px",
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          backgroundColor: colors.bg,
                          color: colors.fg,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {ref.tier}
                      </span>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.82rem",
                            color: "var(--color-accent)",
                            textDecoration: "none",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ref.label}
                        </a>
                      ) : (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.82rem",
                            color: "var(--color-text-primary)",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ref.label}
                        </span>
                      )}
                      <button
                        onClick={() => removeReference(originalIndex)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.65rem",
                          color: "var(--color-text-secondary)",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.1rem 0.3rem",
                          opacity: 0.6,
                          flexShrink: 0,
                        }}
                      >
                        &#10005;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add reference form */}
            {showRefForm && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  marginTop: mainReferences.length > 0 ? 0 : "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.35rem",
                    marginBottom: "0.35rem",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    value={newRef.tier}
                    onChange={(e) => setNewRef({ ...newRef, tier: e.target.value as SourceTier })}
                    style={{
                      padding: "0.3rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: TIER_COLORS[newRef.tier].bg,
                      color: TIER_COLORS[newRef.tier].fg,
                      width: "80px",
                    }}
                  >
                    {(["一次", "準一次", "二次", "三次"] as SourceTier[]).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newRef.label}
                    onChange={(e) => setNewRef({ ...newRef, label: e.target.value })}
                    placeholder="資料名（例：民法（明治29年法律第89号）逐条解説）"
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "0.3rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: "var(--color-surface)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  <input
                    type="url"
                    value={newRef.url}
                    onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                    placeholder="URL（任意）"
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.5rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      backgroundColor: "var(--color-surface)",
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowRefForm(false);
                      setNewRef({ tier: "二次", label: "", url: "" });
                    }}
                    style={{
                      padding: "0.3rem 0.6rem",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={addReference}
                    disabled={!newRef.label.trim()}
                    style={{
                      padding: "0.3rem 0.6rem",
                      backgroundColor: !newRef.label.trim()
                        ? "var(--color-border)"
                        : "var(--color-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      cursor: !newRef.label.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ノート */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              ノート ({notes.length})
            </h2>

            {/* ノート入力 */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "0.75rem",
              }}
            >
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                placeholder="調査メモ・議論のポイント・検討事項など…"
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "0.5rem",
                  lineHeight: 1.7,
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
              >
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="投稿者名（任意）"
                  style={{
                    padding: "0.3rem 0.6rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    backgroundColor: "var(--color-bg)",
                    width: "140px",
                  }}
                />
                <button
                  onClick={addNote}
                  disabled={noteSaving || !noteContent.trim()}
                  style={{
                    marginLeft: "auto",
                    padding: "0.35rem 0.85rem",
                    backgroundColor:
                      noteSaving || !noteContent.trim()
                        ? "var(--color-border)"
                        : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    cursor: noteSaving || !noteContent.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {noteSaving ? "投稿中…" : "ノートを追加"}
                </button>
              </div>
            </div>

            {/* ノート一覧 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      lineHeight: 1.8,
                      color: "var(--color-text-primary)",
                      margin: "0 0 0.5rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {n.content}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {n.author_name && <span>{n.author_name}</span>}
                      <span>{new Date(n.created_at).toLocaleDateString("ja-JP")}</span>
                    </div>
                    <button
                      onClick={() => deleteNote(n.id)}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-del-fg)",
                        backgroundColor: "transparent",
                        border: "1px solid var(--color-del-fg)",
                        borderRadius: "4px",
                        padding: "0.1rem 0.4rem",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                    padding: "1.5rem 0",
                  }}
                >
                  まだノートがありません。
                </p>
              )}
            </div>
          </section>

          {/* 議事録 */}
          <section style={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowMeetingMinutes(!showMeetingMinutes)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.2s",
                  transform: showMeetingMinutes ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "0.7rem",
                }}
              >
                &#9654;
              </span>
              議事録
              {meetingMinutes.length > 0 && (
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    marginLeft: "0.3rem",
                  }}
                >
                  ({meetingMinutes.length})
                </span>
              )}
            </button>
            {showMeetingMinutes && (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "0.75rem 1.25rem",
                  marginTop: "-1px",
                }}
              >
                <MeetingMinutesSection
                  minutes={meetingMinutes}
                  projectId={project.id}
                  members={members}
                  tasks={tasks}
                  onMinutesChange={setMeetingMinutes}
                />
              </div>
            )}
          </section>

          {/* 資料・ファイル */}
          <section style={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowFiles(!showFiles)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.2s",
                  transform: showFiles ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "0.7rem",
                }}
              >
                &#9654;
              </span>
              資料・ファイル
            </button>
            {showFiles && (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "0.75rem 1.25rem",
                  marginTop: "-1px",
                }}
              >
                {session && (
                  <FileUploader
                    contextType="project"
                    contextId={project.id}
                    memberId={session.memberId}
                    memberName={session.name}
                    token={localStorage.getItem("lp_session_token") ?? ""}
                    onUploaded={() => setFileRefreshKey((k) => k + 1)}
                  />
                )}
                <FileList
                  contextType="project"
                  contextId={project.id}
                  memberId={session?.memberId}
                  token={session ? (localStorage.getItem("lp_session_token") ?? "") : undefined}
                  refreshKey={fileRefreshKey}
                />
              </div>
            )}
          </section>

          {/* 活動ログ */}
          <section id="activity-log-section" style={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.2s",
                  transform: showActivityLog ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "0.7rem",
                }}
              >
                &#9654;
              </span>
              活動ログ
              {activityLog.length > 0 && (
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    marginLeft: "0.3rem",
                  }}
                >
                  ({activityLog.length})
                </span>
              )}
            </button>
            {showActivityLog && (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "0.75rem 1.25rem",
                  marginTop: "-1px",
                }}
              >
                {activityLog.length === 0 ? (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      textAlign: "center",
                      padding: "1rem 0",
                      margin: 0,
                    }}
                  >
                    まだ活動ログがありません。
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {activityLog.slice(0, 20).map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.5rem",
                          padding: "0.25rem 0",
                          borderBottom:
                            i < Math.min(activityLog.length, 20) - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {formatDateTime(entry.at)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.82rem",
                            color: "var(--color-text-primary)",
                            flex: 1,
                          }}
                        >
                          {entry.action}
                        </span>
                        {entry.by && (
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.68rem",
                              color: "#1B4B8A",
                              backgroundColor: "#EBF2FD",
                              padding: "0.05rem 0.3rem",
                              borderRadius: "3px",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {entry.by}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* お知らせ */}
          <ProjectNotifications projectId={project.id} members={members} />

          {/* チャット */}
          <ProjectChat projectId={project.id} members={members} />
        </div>

        {/* Right: Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* 対象法令 */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 0.5rem",
              }}
            >
              対象法令
            </h3>
            {lawIds.length === 0 && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 0.5rem",
                }}
              >
                法令が未登録です
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                marginBottom: "0.5rem",
              }}
            >
              {lawIds.map((lawId) => (
                <div key={lawId} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Link
                    href={`/law/${encodeURIComponent(lawId)}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {titles[lawId] ?? lawId}
                  </Link>
                  <a
                    href={`https://laws.e-gov.go.jp/law/${lawId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.62rem",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    e-Gov
                  </a>
                  <button
                    onClick={() => removeLaw(lawId)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.62rem",
                      color: "var(--color-del-fg)",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.1rem 0.2rem",
                      flexShrink: 0,
                    }}
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
            {/* 法令名で検索 */}
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <input
                type="text"
                value={lawSearchQuery}
                onChange={(e) => setLawSearchQuery(e.target.value)}
                placeholder="法令名で検索…"
                style={{
                  flex: 1,
                  padding: "0.3rem 0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  backgroundColor: "var(--color-bg)",
                  minWidth: 0,
                  color: "var(--color-text-primary)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchLawsByName();
                }}
              />
              <button
                onClick={searchLawsByName}
                disabled={lawSearching}
                style={{
                  padding: "0.3rem 0.5rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  color: "var(--color-text-primary)",
                }}
              >
                {lawSearching ? "検索中…" : "検索"}
              </button>
            </div>
            {lawSearchResults.length > 0 && (
              <div
                style={{
                  marginTop: "0.3rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-bg)",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                {lawSearchResults.map((law) => (
                  <button
                    key={law.law_id}
                    onClick={() => addLawById(law.law_id, law.law_title)}
                    disabled={lawIds.includes(law.law_id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.35rem 0.5rem",
                      border: "none",
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: lawIds.includes(law.law_id)
                        ? "var(--color-surface)"
                        : "transparent",
                      cursor: lawIds.includes(law.law_id) ? "default" : "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: lawIds.includes(law.law_id)
                        ? "var(--color-text-secondary)"
                        : "var(--color-text-primary)",
                      opacity: lawIds.includes(law.law_id) ? 0.5 : 1,
                    }}
                  >
                    <div>{law.law_title}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                      {law.law_num}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {/* ID直接入力（折りたたみ） */}
            <details style={{ marginTop: "0.3rem" }}>
              <summary
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                法令IDで直接追加
              </summary>
              <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem" }}>
                <input
                  type="text"
                  value={newLawId}
                  onChange={(e) => setNewLawId(e.target.value)}
                  placeholder="例: 405AC0000000088"
                  style={{
                    flex: 1,
                    padding: "0.3rem 0.5rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    backgroundColor: "var(--color-bg)",
                    minWidth: 0,
                    color: "var(--color-text-primary)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLaw();
                  }}
                />
                <button
                  onClick={addLaw}
                  style={{
                    padding: "0.3rem 0.5rem",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    color: "var(--color-text-primary)",
                  }}
                >
                  追加
                </button>
              </div>
            </details>
          </div>

          {/* メンバー */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                メンバー{" "}
                {members.length > 0 && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>
                    ({members.length})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowMemberForm((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                {showMemberForm ? "キャンセル" : "+ 追加"}
              </button>
            </div>

            {showMemberForm && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  marginBottom: "0.75rem",
                  padding: "0.6rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "4px",
                }}
              >
                <input
                  value={newMember.name}
                  onChange={(e) => setNewMember((m) => ({ ...m, name: e.target.value }))}
                  placeholder="氏名"
                  style={{
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <input
                  value={newMember.org}
                  onChange={(e) => setNewMember((m) => ({ ...m, org: e.target.value }))}
                  placeholder="所属（例：総務省、東京都）"
                  style={{
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember((m) => ({ ...m, role: e.target.value }))}
                  style={{
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addMember}
                  style={{
                    padding: "0.35rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  追加
                </button>
              </div>
            )}

            {members.length === 0 && !showMemberForm && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                メンバーが未登録です
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {members.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.2rem 0",
                  }}
                >
                  <Link
                    href={`/members/${encodeURIComponent(m.name + "___" + m.org)}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {m.name}
                  </Link>
                  {m.org && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-sans)",
                        padding: "0.05rem 0.35rem",
                        borderRadius: "3px",
                        backgroundColor: "#EBF2FD",
                        color: "#1B4B8A",
                      }}
                    >
                      {m.org}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-sans)",
                      padding: "0.05rem 0.35rem",
                      borderRadius: "3px",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-secondary)",
                      marginLeft: "auto",
                    }}
                  >
                    {m.role}
                  </span>
                  <button
                    onClick={() => removeMember(i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      padding: "0 0.2rem",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ブックマーク */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                ブックマーク{" "}
                {bookmarks.length > 0 && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>
                    ({bookmarks.length})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowBookmarkForm((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                {showBookmarkForm ? "キャンセル" : "+ 追加"}
              </button>
            </div>

            {showBookmarkForm && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "4px",
                }}
              >
                {lawIds.length > 0 ? (
                  <select
                    value={newBookmarkLawId}
                    onChange={(e) => setNewBookmarkLawId(e.target.value)}
                    style={{
                      padding: "0.3rem 0.5rem",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <option value="">法令を選択…</option>
                    {lawIds.map((id) => (
                      <option key={id} value={id}>
                        {titles[id] ?? id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    先に対象法令を追加してください
                  </p>
                )}
                <input
                  value={newBookmarkArticle}
                  onChange={(e) => setNewBookmarkArticle(e.target.value)}
                  placeholder="条文番号（例: 第一条、1）"
                  style={{
                    padding: "0.3rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addBookmark();
                  }}
                />
                <button
                  onClick={addBookmark}
                  disabled={!newBookmarkLawId || !newBookmarkArticle.trim()}
                  style={{
                    padding: "0.3rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    backgroundColor:
                      !newBookmarkLawId || !newBookmarkArticle.trim()
                        ? "var(--color-border)"
                        : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      !newBookmarkLawId || !newBookmarkArticle.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  追加
                </button>
              </div>
            )}

            {bookmarks.length === 0 && !showBookmarkForm && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                条文ブックマークが未登録です
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {bookmarks.map((bm, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Link
                    href={`/law/${encodeURIComponent(bm.law_id)}/article/${encodeURIComponent(bm.article_num ?? bm.article_title)}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {titles[bm.law_id] ?? bm.law_id} — {bm.article_title}
                  </Link>
                  <button
                    onClick={() => removeBookmark(i)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.62rem",
                      color: "var(--color-del-fg)",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.1rem 0.2rem",
                      flexShrink: 0,
                    }}
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 改正提案（パッチ束ね） */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                改正提案{" "}
                {patchIds.length > 0 && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>
                    ({patchIds.length})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowPatchSearch((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                {showPatchSearch ? "閉じる" : "+ 追加"}
              </button>
            </div>

            {showPatchSearch && (
              <div
                style={{
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "4px",
                }}
              >
                <input
                  value={patchSearchQuery}
                  onChange={(e) => searchPatches(e.target.value)}
                  placeholder="パッチをタイトルで検索…"
                  style={{
                    width: "100%",
                    padding: "0.3rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                    marginBottom: "0.35rem",
                  }}
                />
                {patchSearching && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    検索中...
                  </p>
                )}
                {!patchSearching && patchSearchResults.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                      maxHeight: "180px",
                      overflowY: "auto",
                    }}
                  >
                    {patchSearchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addPatchFromSearch(p)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.3rem 0.4rem",
                          textAlign: "left",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.76rem",
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {p.title}
                        </span>
                        <span
                          style={{
                            fontSize: "0.63rem",
                            padding: "0.05rem 0.25rem",
                            borderRadius: "3px",
                            backgroundColor: "var(--color-bg)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {p.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!patchSearching && patchSearchQuery.trim() && patchSearchResults.length === 0 && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    該当なし
                  </p>
                )}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    marginTop: "0.4rem",
                    paddingTop: "0.4rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      margin: "0 0 0.25rem",
                    }}
                  >
                    IDで直接追加:
                  </p>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <input
                      value={addPatchId}
                      onChange={(e) => setAddPatchId(e.target.value)}
                      placeholder="パッチID（UUID）"
                      style={{
                        flex: 1,
                        padding: "0.3rem 0.5rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addPatch();
                      }}
                    />
                    <button
                      onClick={addPatch}
                      disabled={!addPatchId.trim()}
                      style={{
                        padding: "0.3rem 0.6rem",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        backgroundColor: !addPatchId.trim()
                          ? "var(--color-border)"
                          : "var(--color-accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: !addPatchId.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}

            {patches.length === 0 && patchIds.length === 0 && !showPatchSearch && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                改正提案未登録
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {patches.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Link
                    href={`/patch/${p.id}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.title}
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.65rem",
                      padding: "0.05rem 0.3rem",
                      borderRadius: "3px",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.status}
                  </span>
                  <button
                    onClick={() => removePatch(p.id)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.62rem",
                      color: "var(--color-del-fg)",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.1rem 0.2rem",
                      flexShrink: 0,
                    }}
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 法令案 */}
          <Link
            href={`/projects/${project.id}/consolidated`}
            style={{
              display: "block",
              backgroundColor: "#FEF3C7",
              border: "1px solid #F59E0B",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#92400E",
              }}
            >
              法令案を表示
            </span>
          </Link>

          {/* リンク */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                リンク{" "}
                {sidebarLinks.length > 0 && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>
                    ({sidebarLinks.length + 3})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowLinkForm((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                {showLinkForm ? "キャンセル" : "+ 追加"}
              </button>
            </div>

            {showLinkForm && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "4px",
                }}
              >
                <input
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="リンク名"
                  style={{
                    padding: "0.3rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="URL（例: https://...）"
                  style={{
                    padding: "0.3rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLink();
                  }}
                />
                <button
                  onClick={addLink}
                  disabled={!newLinkLabel.trim()}
                  style={{
                    padding: "0.3rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    backgroundColor: !newLinkLabel.trim()
                      ? "var(--color-border)"
                      : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !newLinkLabel.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  追加
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {/* ユーザー追加リンク */}
              {sidebarLinks.map((link) => {
                const refIdx = references.indexOf(link);
                return (
                  <div
                    key={refIdx}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          color: "var(--color-accent)",
                          textDecoration: "none",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.label} →
                      </a>
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          color: "var(--color-text-primary)",
                          flex: 1,
                        }}
                      >
                        {link.label}
                      </span>
                    )}
                    <button
                      onClick={() => removeLink(refIdx)}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.62rem",
                        color: "var(--color-del-fg)",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.1rem 0.2rem",
                        flexShrink: 0,
                      }}
                    >
                      &#10005;
                    </button>
                  </div>
                );
              })}
              {/* デフォルトナビゲーション */}
              <div
                style={{
                  borderTop: sidebarLinks.length > 0 ? "1px solid var(--color-border)" : "none",
                  paddingTop: sidebarLinks.length > 0 ? "0.3rem" : 0,
                  marginTop: sidebarLinks.length > 0 ? "0.15rem" : 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                <Link
                  href="/patches"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}
                >
                  改正提案一覧 →
                </Link>
                <Link
                  href="/commentaries"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}
                >
                  逐条解説一覧 →
                </Link>
                <Link
                  href="/"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}
                >
                  法令検索 →
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* チェックリストテンプレート選択モーダル */}
      {showTemplateSelector && (
        <ChecklistTemplateSelector
          onApply={applyTemplateTasks}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          .pw-root { padding: 1rem 1rem 2rem !important; }
          .pw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
