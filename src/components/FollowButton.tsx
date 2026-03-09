"use client";

import { useState, useEffect } from "react";
import { isFollowing, toggleFollow, isFollowingDB, toggleFollowDB } from "@/lib/follows";
import { getSession } from "@/lib/session";
import { useAuthPrompt } from "@/components/AuthPromptModal";

interface Props {
  type: "law" | "project";
  id: string;
  title: string;
}

export function FollowButton({ type, id, title }: Props) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const { requireAuth, modal } = useAuthPrompt();

  useEffect(() => {
    const session = getSession();
    if (session) {
      isFollowingDB(type, id).then(setFollowing);
    } else {
      setFollowing(isFollowing(type, id));
    }
  }, [type, id]);

  async function handleClick() {
    if (busy) return;
    if (!requireAuth("フォロー")) return;
    const session = getSession();
    if (session) {
      setBusy(true);
      const result = await toggleFollowDB(type, id, title);
      setFollowing(result);
      setBusy(false);
    } else {
      const result = toggleFollow(type, id, title);
      setFollowing(result);
    }
  }

  return (
    <>
      {modal}
      <button
        onClick={handleClick}
        disabled={busy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.2rem 0.6rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          border: following ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
          borderRadius: "4px",
          backgroundColor: following ? "rgba(2,132,199,0.1)" : "transparent",
          color: following ? "var(--color-accent)" : "var(--color-text-secondary)",
          cursor: busy ? "wait" : "pointer",
          transition: "all 0.15s",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {following ? "★ フォロー中" : "☆ フォロー"}
      </button>
    </>
  );
}
