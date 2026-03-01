import type {
  CanonLine,
} from "./apply";
import type {
  UnifiedDiffResult,
  SideBySideDiffResult,
  DiffLine,
  SideBySideRow,
  DiffOp,
} from "./types";

// Myers diff アルゴリズム（LCS ベースの簡易実装）
function lcs<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): Array<[number, number]> {
  const m = a.length;
  const n = b.length;
  // dp[i][j] = lcs length of a[0..i-1] and b[0..j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = eq(a[i - 1], b[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  // バックトラック
  const pairs: Array<[number, number]> = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (eq(a[i - 1], b[j - 1])) {
      pairs.push([i - 1, j - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return pairs.reverse();
}

function lineEq(a: CanonLine, b: CanonLine): boolean {
  return a.num === b.num && a.text === b.text;
}

interface RawDiff {
  op: DiffOp;
  line: CanonLine;
}

function computeRawDiff(canon: CanonLine[], next: CanonLine[]): RawDiff[] {
  const common = lcs(canon, next, lineEq);
  const result: RawDiff[] = [];

  let ci = 0; // canon index
  let ni = 0; // next index
  let li = 0; // lcs index

  while (li < common.length) {
    const [ca, na] = common[li];
    // canonの残りをdel
    while (ci < ca) {
      result.push({ op: "del", line: canon[ci++] });
    }
    // nextの残りをadd
    while (ni < na) {
      result.push({ op: "add", line: next[ni++] });
    }
    // 共通行
    result.push({ op: "eq", line: canon[ci++] });
    ni++;
    li++;
  }
  // 末尾の残り
  while (ci < canon.length) result.push({ op: "del", line: canon[ci++] });
  while (ni < next.length) result.push({ op: "add", line: next[ni++] });

  return result;
}

// Unified diff
export function unifiedDiff(
  canon: CanonLine[],
  next: CanonLine[]
): UnifiedDiffResult {
  const raw = computeRawDiff(canon, next);
  let added = 0, deleted = 0, unchanged = 0;

  const lines: DiffLine[] = raw.map(({ op, line }) => {
    if (op === "add") added++;
    else if (op === "del") deleted++;
    else unchanged++;
    return { op, num: line.num, text: line.text };
  });

  return { lines, stats: { added, deleted, unchanged } };
}

// Side-by-side diff
export function sideBySideDiff(
  canon: CanonLine[],
  next: CanonLine[]
): SideBySideDiffResult {
  const raw = computeRawDiff(canon, next);
  const rows: SideBySideRow[] = [];
  let added = 0, deleted = 0, unchanged = 0;

  // del と add をペアにする（置換扱い）
  let i = 0;
  while (i < raw.length) {
    const cur = raw[i];
    if (cur.op === "del") {
      // 次が add なら置換行
      const next_ = raw[i + 1];
      if (next_ && next_.op === "add") {
        rows.push({
          op: "del",
          left: { num: cur.line.num, text: cur.line.text },
          right: { num: next_.line.num, text: next_.line.text },
        });
        deleted++; added++;
        i += 2;
        continue;
      }
      rows.push({ op: "del", left: { num: cur.line.num, text: cur.line.text }, right: null });
      deleted++;
    } else if (cur.op === "add") {
      rows.push({ op: "add", left: null, right: { num: cur.line.num, text: cur.line.text } });
      added++;
    } else {
      rows.push({
        op: "eq",
        left: { num: cur.line.num, text: cur.line.text },
        right: { num: cur.line.num, text: cur.line.text },
      });
      unchanged++;
    }
    i++;
  }

  return { rows, stats: { added, deleted, unchanged } };
}
