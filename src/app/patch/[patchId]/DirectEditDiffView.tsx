"use client";

import { useMemo } from "react";
import { textToCanonLines, autoRenumber } from "@/lib/patch/directDiff";
import { sideBySideDiff } from "@/lib/patch/diff";
import { SideBySideView } from "@/components/diff/SideBySideView";

interface Props {
  original: string;
  edited: string;
}

export function DirectEditDiffView({ original, edited }: Props) {
  const rows = useMemo(() => {
    const origLines = textToCanonLines(original);
    const editLines = autoRenumber(textToCanonLines(edited));
    return sideBySideDiff(origLines, editLines).rows;
  }, [original, edited]);

  if (rows.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "0.5rem",
      }}
    >
      <SideBySideView rows={rows} />
    </div>
  );
}
