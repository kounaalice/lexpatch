"use client";
import { uuid } from "@/lib/uuid";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
  searchContacts,
  getMemosForContact,
  addMemo,
  deleteMemo,
  exportContactsCsv,
  MEMO_CATEGORIES,
  type Contact,
  type ContactMemo,
} from "@/lib/ws-contacts";

// ── Case Linking ──
interface ContactLink {
  contactId: string;
  type: "project" | "law";
  refId: string;
  refTitle: string;
  linkedAt: string;
}
function loadLinks(): ContactLink[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_ws_contact_links") || "[]");
  } catch {
    return [];
  }
}
function saveLinks(links: ContactLink[]) {
  localStorage.setItem("lp_ws_contact_links", JSON.stringify(links));
}
function addLink(contactId: string, type: "project" | "law", refId: string, refTitle: string) {
  const all = loadLinks();
  all.push({ contactId, type, refId, refTitle, linkedAt: new Date().toISOString() });
  saveLinks(all);
}
function removeLink(contactId: string, refId: string) {
  saveLinks(loadLinks().filter((l) => !(l.contactId === contactId && l.refId === refId)));
}
function getLinksForContact(contactId: string): ContactLink[] {
  return loadLinks().filter((l) => l.contactId === contactId);
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [memos, setMemos] = useState<ContactMemo[]>([]);
  const [memoText, setMemoText] = useState("");
  const [memoCat, setMemoCat] = useState(MEMO_CATEGORIES[0]);
  const [memoDate, setMemoDate] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({
    name: "",
    organization: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    tags: "",
    notes: "",
  });
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);
  const [linkType, setLinkType] = useState<"project" | "law">("project");
  const [linkRefId, setLinkRefId] = useState("");
  const [linkRefTitle, setLinkRefTitle] = useState("");

  function reload() {
    setContacts(search ? searchContacts(search) : getAllContacts());
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  function openDetail(c: Contact) {
    setSelectedId(c.id);
    setMemos(getMemosForContact(c.id));
    setContactLinks(getLinksForContact(c.id));
  }

  function openEdit(c: Contact) {
    setForm({
      name: c.name,
      organization: c.organization,
      department: c.department,
      position: c.position,
      email: c.email,
      phone: c.phone,
      address: c.address,
      tags: c.tags.join(", "),
      notes: c.notes,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editId) {
      updateContact(editId, data);
    } else {
      addContact(data);
    }
    setForm({
      name: "",
      organization: "",
      department: "",
      position: "",
      email: "",
      phone: "",
      address: "",
      tags: "",
      notes: "",
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteContact(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  function handleAddMemo() {
    if (!memoText.trim() || !selectedId) return;
    addMemo({ contactId: selectedId, date: memoDate, content: memoText, category: memoCat });
    setMemoText("");
    setMemos(getMemosForContact(selectedId));
  }

  function handleDeleteMemo(id: string) {
    deleteMemo(id);
    if (selectedId) setMemos(getMemosForContact(selectedId));
  }

  function handleCsvExport() {
    const csv = exportContactsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "contacts.csv";
    a.click();
  }

  const selected = contacts.find((c) => c.id === selectedId);

  if (selected) {
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
            onClick={() => setSelectedId(null)}
            style={{ color: "var(--color-accent)", cursor: "pointer" }}
          >
            連絡先台帳
          </span>{" "}
          &gt; {selected.name}
        </nav>
        <button
          onClick={() => setSelectedId(null)}
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
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            {selected.name}
          </h2>
          {selected.organization && (
            <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
              {selected.organization}
              {selected.department ? ` / ${selected.department}` : ""}
              {selected.position ? ` / ${selected.position}` : ""}
            </p>
          )}
          {selected.email && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Email: {selected.email}
            </p>
          )}
          {selected.phone && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Tel: {selected.phone}
            </p>
          )}
          {selected.address && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              住所: {selected.address}
            </p>
          )}
          {selected.tags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.5rem" }}>
              {selected.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {selected.notes && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginTop: "0.5rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {selected.notes}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
            <button
              onClick={() => openEdit(selected)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #DC2626",
                color: "#DC2626",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              削除
            </button>
          </div>
        </div>

        {/* 紐付け */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.8rem" }}>紐付け</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as "project" | "law")}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
              }}
            >
              <option value="project">プロジェクト</option>
              <option value="law">法令</option>
            </select>
            <input
              value={linkRefId}
              onChange={(e) => setLinkRefId(e.target.value)}
              placeholder="ID"
              style={{
                width: 120,
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
              }}
            />
            <input
              value={linkRefTitle}
              onChange={(e) => setLinkRefTitle(e.target.value)}
              placeholder="名称"
              style={{
                flex: 1,
                minWidth: 120,
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
              }}
            />
            <button
              onClick={() => {
                if (!linkRefTitle.trim() || !selectedId) return;
                addLink(selectedId, linkType, linkRefId || uuid(), linkRefTitle);
                setContactLinks(getLinksForContact(selectedId));
                setLinkRefId("");
                setLinkRefTitle("");
              }}
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
          </div>
          {contactLinks.length > 0 ? (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {contactLinks.map((l) => (
                <span
                  key={l.refId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.78rem",
                    backgroundColor:
                      l.type === "project" ? "var(--color-add-bg)" : "var(--color-warn-bg)",
                    color: l.type === "project" ? "var(--color-add-fg)" : "var(--color-warn-fg)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                  }}
                >
                  {l.type === "project" ? "PJ" : "法令"}: {l.refTitle}
                  <button
                    onClick={() => {
                      if (!selectedId) return;
                      removeLink(selectedId, l.refId);
                      setContactLinks(getLinksForContact(selectedId));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      fontSize: "0.75rem",
                      padding: 0,
                      marginLeft: "0.15rem",
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
              紐付けされた案件はありません
            </p>
          )}
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.8rem" }}>対応メモ</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input
            type="date"
            value={memoDate}
            onChange={(e) => setMemoDate(e.target.value)}
            style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
          />
          <select
            value={memoCat}
            onChange={(e) => setMemoCat(e.target.value)}
            style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
          >
            {MEMO_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            placeholder="対応内容"
            style={{
              flex: 1,
              minWidth: 150,
              padding: "0.4rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={handleAddMemo}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
            }}
          >
            追加
          </button>
        </div>
        {memos.map((m) => (
          <div
            key={m.id}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "0.6rem 0.8rem",
              marginBottom: "0.4rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", flexShrink: 0 }}
            >
              {m.date}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                padding: "0.1rem 0.3rem",
                borderRadius: 4,
                flexShrink: 0,
              }}
            >
              {m.category}
            </span>
            <span style={{ fontSize: "0.85rem", flex: 1 }}>{m.content}</span>
            <button
              onClick={() => handleDeleteMemo(m.id)}
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
        ))}
        {memos.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "1rem" }}>
            メモはありません
          </p>
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
        &gt; 連絡先台帳
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>連絡先台帳</h1>
        <button
          onClick={handleCsvExport}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.5rem 0.8rem",
            cursor: "pointer",
            marginRight: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          CSV出力
        </button>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              name: "",
              organization: "",
              department: "",
              position: "",
              email: "",
              phone: "",
              address: "",
              tags: "",
              notes: "",
            });
            setShowForm(!showForm);
          }}
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
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="名前・組織・メール・タグで検索"
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: 6,
          border: "1px solid var(--color-border)",
          marginBottom: "1rem",
        }}
      />

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
            {editId ? "連絡先を編集" : "連絡先を追加"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="名前 *"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="組織"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="部署"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="役職"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="メール"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="電話"
              style={{
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="住所"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginTop: "0.5rem",
            }}
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="タグ (カンマ区切り)"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginTop: "0.5rem",
            }}
          />
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="メモ"
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginTop: "0.5rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {contacts.map((c) => (
          <div
            key={c.id}
            onClick={() => openDetail(c)}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.8rem 1rem",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
              {c.organization && (
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                  {c.organization}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                marginTop: "0.3rem",
              }}
            >
              {c.email && <span style={{ marginRight: "1rem" }}>{c.email}</span>}
              {c.phone && <span>{c.phone}</span>}
            </div>
            {c.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.4rem" }}>
                {c.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.65rem",
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      padding: "0.1rem 0.3rem",
                      borderRadius: 4,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {contacts.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            連絡先がありません
          </p>
        )}
      </div>
    </div>
  );
}
