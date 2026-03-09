// ── Inline Annotation helpers (lp_annot_*) ──────────────────────

export interface Annotation {
  text: string;
  updatedAt: string; // ISO string
  lawTitle?: string;
}

function makeKey(lawId: string, articleTitle: string, lineIndex: number): string {
  return `lp_annot_${lawId}_${articleTitle}_${lineIndex}`;
}

/** Retrieve an annotation for a specific line. Returns null if none exists. */
export function getAnnotation(
  lawId: string,
  articleTitle: string,
  lineIndex: number,
): Annotation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(makeKey(lawId, articleTitle, lineIndex));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Annotation;
    if (!parsed.text || typeof parsed.text !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Save an annotation for a specific line. */
export function setAnnotation(
  lawId: string,
  articleTitle: string,
  lineIndex: number,
  text: string,
  lawTitle?: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const annotation: Annotation = {
      text,
      updatedAt: new Date().toISOString(),
      ...(lawTitle ? { lawTitle } : {}),
    };
    localStorage.setItem(makeKey(lawId, articleTitle, lineIndex), JSON.stringify(annotation));
  } catch {
    // localStorage may be full or disabled
  }
}

/** Remove an annotation for a specific line. */
export function removeAnnotation(lawId: string, articleTitle: string, lineIndex: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(makeKey(lawId, articleTitle, lineIndex));
  } catch {
    // ignore
  }
}

/**
 * Count how many annotations exist for a given article.
 * Scans localStorage keys matching the prefix pattern.
 */
export function getAnnotationCount(lawId: string, articleTitle: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const prefix = `lp_annot_${lawId}_${articleTitle}_`;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}
