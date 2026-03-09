"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllFeeds,
  addFeed,
  deleteFeed,
  getItemsByFeed,
  getAllItems,
  addItem,
  markRead,
  markAllRead,
  unreadCount,
  PRESET_FEEDS,
  FEED_CATEGORIES,
  type Feed,
  type FeedItem,
} from "@/lib/ws-rss";

export default function RssPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const [feedForm, setFeedForm] = useState({ title: "", url: "", category: FEED_CATEGORIES[0] });
  const [itemForm, setItemForm] = useState({ title: "", description: "", link: "", pubDate: "" });

  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    reload();
  }, [selectedFeedId]);

  function reload() {
    setFeeds(getAllFeeds());
    setItems(selectedFeedId ? getItemsByFeed(selectedFeedId) : getAllItems());
  }

  function handleAddFeed(f?: { title: string; url: string; category: string }) {
    const data = f || feedForm;
    if (!data.title.trim() || !data.url.trim()) return;
    addFeed(data);
    setFeedForm({ title: "", url: "", category: FEED_CATEGORIES[0] });
    setShowAddFeed(false);
    reload();
  }

  function handleDeleteFeed(id: string) {
    if (!confirm("フィードを削除しますか？")) return;
    deleteFeed(id);
    if (selectedFeedId === id) setSelectedFeedId(null);
    reload();
  }

  function handleAddItem() {
    if (!itemForm.title.trim() || !selectedFeedId) return;
    addItem({
      feedId: selectedFeedId,
      ...itemForm,
      pubDate: itemForm.pubDate || new Date().toISOString(),
    });
    setItemForm({ title: "", description: "", link: "", pubDate: "" });
    setShowAddItem(false);
    reload();
  }

  function handleMarkRead(id: string) {
    markRead(id);
    reload();
  }
  function handleMarkAllRead() {
    if (selectedFeedId) {
      markAllRead(selectedFeedId);
      reload();
    }
  }

  const filteredFeeds = catFilter ? feeds.filter((f) => f.category === catFilter) : feeds;

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
        &gt; RSS/外部情報
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>RSS/外部情報</h1>
        <button
          onClick={() => setShowAddFeed(!showAddFeed)}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          フィード追加
        </button>
      </div>

      {showAddFeed && (
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
            フィードを追加
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
            {PRESET_FEEDS.filter((pf) => !feeds.some((f) => f.url === pf.url)).map((pf) => (
              <button
                key={pf.url}
                onClick={() => handleAddFeed(pf)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.3rem 0.6rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-accent)",
                  color: "var(--color-accent)",
                  backgroundColor: "var(--color-surface)",
                  cursor: "pointer",
                }}
              >
                + {pf.title}
              </button>
            ))}
          </div>
          <input
            value={feedForm.title}
            onChange={(e) => setFeedForm({ ...feedForm, title: e.target.value })}
            placeholder="タイトル *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.4rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              value={feedForm.url}
              onChange={(e) => setFeedForm({ ...feedForm, url: e.target.value })}
              placeholder="URL *"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <select
              value={feedForm.category}
              onChange={(e) => setFeedForm({ ...feedForm, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {FEED_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => handleAddFeed()}
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
            <button
              onClick={() => setShowAddFeed(false)}
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

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{
            padding: "0.4rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            fontSize: "0.85rem",
          }}
        >
          <option value="">全カテゴリ</option>
          {FEED_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Feed list */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button
          onClick={() => setSelectedFeedId(null)}
          style={{
            fontSize: "0.8rem",
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: !selectedFeedId ? "var(--color-accent)" : "var(--color-surface)",
            color: !selectedFeedId ? "#fff" : "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          全て
        </button>
        {filteredFeeds.map((f) => {
          const uc = unreadCount(f.id);
          return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <button
                onClick={() => setSelectedFeedId(f.id)}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  backgroundColor:
                    selectedFeedId === f.id ? "var(--color-accent)" : "var(--color-surface)",
                  color: selectedFeedId === f.id ? "#fff" : "var(--color-text-primary)",
                  cursor: "pointer",
                }}
              >
                {f.title}
                {uc > 0 ? ` (${uc})` : ""}
              </button>
              <button
                onClick={() => handleDeleteFeed(f.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.7rem",
                }}
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {selectedFeedId && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: "0.8rem",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            全て既読
          </button>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            style={{
              fontSize: "0.8rem",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            + 手動追加
          </button>
        </div>
      )}

      {showAddItem && selectedFeedId && (
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
            記事を追加
          </h3>
          <input
            value={itemForm.title}
            onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
            placeholder="タイトル *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.4rem",
            }}
          />
          <textarea
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            placeholder="概要"
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.4rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              value={itemForm.link}
              onChange={(e) => setItemForm({ ...itemForm, link: e.target.value })}
              placeholder="リンク URL"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <input
              type="datetime-local"
              value={itemForm.pubDate}
              onChange={(e) => setItemForm({ ...itemForm, pubDate: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <button
            onClick={handleAddItem}
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
      )}

      {/* Items list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {items.map((item) => {
          const feed = feeds.find((f) => f.id === item.feedId);
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.7rem 1rem",
                opacity: item.read ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.3rem",
                }}
              >
                {!item.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  />
                )}
                {feed && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--color-accent)",
                      backgroundColor: "rgba(3,105,161,0.08)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                    }}
                  >
                    {feed.title}
                  </span>
                )}
                <span style={{ fontWeight: 600, flex: 1, fontSize: "0.9rem" }}>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                  {new Date(item.pubDate).toLocaleDateString("ja-JP")}
                </span>
                {!item.read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      cursor: "pointer",
                    }}
                  >
                    既読
                  </button>
                )}
              </div>
              {item.description && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            記事がありません
          </p>
        )}
      </div>
    </div>
  );
}
