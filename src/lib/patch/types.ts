// 逐条パッチ記法の型定義

export type PatchOp = "add" | "del" | "ctx";
export type PatchType = "A" | "C";

export interface PatchLine {
  op: PatchOp;
  num: string | null; // 項番号 "１", "２" など。null = 本文行
  text: string; // 記号を除いたテキスト
  scope?: boolean; // C記法: 条番号ヘッダ行か
  movedFrom?: string; // 繰下げ元の項番号（Lint推定 or ユーザ注記）
  rawLine: string; // 元の行テキスト（デバッグ・表示用）
}

export interface PatchData {
  targetArticle: string; // "第百十二条"
  patchType: PatchType;
  lines: PatchLine[];
}

// diff エンジンの出力
export type DiffOp = "add" | "del" | "eq";

export interface DiffLine {
  op: DiffOp;
  num: string | null;
  text: string;
}

export interface UnifiedDiffResult {
  lines: DiffLine[];
  stats: { added: number; deleted: number; unchanged: number };
}

export interface SideBySideDiffResult {
  rows: SideBySideRow[];
  stats: { added: number; deleted: number; unchanged: number };
}

export interface SideBySideRow {
  op: DiffOp | "moved";
  left: { num: string | null; text: string } | null; // OLD (Canon)
  right: { num: string | null; text: string } | null; // NEW (溶け込み後)
}
