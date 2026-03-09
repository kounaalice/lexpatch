// ── Workspace document templates (localStorage) ──

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface WsDocument {
  id: string;
  title: string;
  templateId?: string;
  content: string; // Markdown with {{variable}} placeholders
  variables: Record<string, string>;
  docNumber?: string;
  status: "draft" | "final";
  createdAt: string;
  updatedAt: string;
}

export interface DocTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string[]; // variable names in the template
}

const STORAGE_KEY = "lp_ws_docs";
const NUMBERING_KEY = "lp_ws_doc_numbering";

// ── 組み込みテンプレート（法令関連 + 汎用） ──
export const BUILT_IN_TEMPLATES: DocTemplate[] = [
  {
    id: "届出書",
    name: "届出書",
    category: "法令",
    description: "行政機関への届出書の雛形",
    content: `# 届出書

{{提出先}}　御中

{{提出日}}

届出者
- 氏名（名称）：{{届出者名}}
- 住所：{{届出者住所}}
- 連絡先：{{連絡先}}

## 届出事項

{{関連法令}}第{{条番号}}条の規定に基づき、下記のとおり届け出ます。

### 届出の内容

{{届出内容}}

### 届出の理由

{{届出理由}}

以上`,
    variables: [
      "提出先",
      "提出日",
      "届出者名",
      "届出者住所",
      "連絡先",
      "関連法令",
      "条番号",
      "届出内容",
      "届出理由",
    ],
  },
  {
    id: "申請書",
    name: "申請書",
    category: "法令",
    description: "許認可申請書の雛形",
    content: `# {{申請種別}}申請書

{{提出先}}　御中

{{提出日}}

申請者
- 氏名（名称）：{{申請者名}}
- 住所：{{申請者住所}}
- 連絡先：{{連絡先}}

## 申請内容

{{関連法令}}の規定に基づき、下記のとおり申請いたします。

### 申請事項

{{申請事項}}

### 添付書類

{{添付書類一覧}}

以上`,
    variables: [
      "申請種別",
      "提出先",
      "提出日",
      "申請者名",
      "申請者住所",
      "連絡先",
      "関連法令",
      "申請事項",
      "添付書類一覧",
    ],
  },
  {
    id: "議事録",
    name: "議事録",
    category: "汎用",
    description: "会議議事録の雛形",
    content: `# 議事録

## 会議情報

- 会議名：{{会議名}}
- 日時：{{日時}}
- 場所：{{場所}}
- 出席者：{{出席者}}
- 議事録作成者：{{作成者}}

## 議題

{{議題}}

## 決定事項

{{決定事項}}

## アクションアイテム

{{アクションアイテム}}

## 次回予定

{{次回予定}}`,
    variables: [
      "会議名",
      "日時",
      "場所",
      "出席者",
      "作成者",
      "議題",
      "決定事項",
      "アクションアイテム",
      "次回予定",
    ],
  },
  {
    id: "報告書",
    name: "報告書",
    category: "汎用",
    description: "業務報告書の雛形",
    content: `# {{報告種別}}報告書

{{提出先}}

{{報告日}}

報告者：{{報告者}}

## 報告期間

{{報告期間}}

## 業務概要

{{業務概要}}

## 成果・進捗

{{成果}}

## 課題・所見

{{課題}}

## 今後の予定

{{今後の予定}}`,
    variables: [
      "報告種別",
      "提出先",
      "報告日",
      "報告者",
      "報告期間",
      "業務概要",
      "成果",
      "課題",
      "今後の予定",
    ],
  },
  {
    id: "契約書",
    name: "契約書（基本）",
    category: "法令",
    description: "基本的な契約書の雛形",
    content: `# {{契約種別}}契約書

{{甲の名称}}（以下「甲」という。）と{{乙の名称}}（以下「乙」という。）は、以下のとおり{{契約種別}}契約を締結する。

## 第1条（目的）

{{契約目的}}

## 第2条（契約期間）

{{契約開始日}}から{{契約終了日}}までとする。

## 第3条（対価）

{{対価条件}}

## 第4条（秘密保持）

甲及び乙は、本契約に関して知り得た相手方の秘密情報を第三者に開示してはならない。

## 第5条（解除）

{{解除条件}}

## 第6条（管轄裁判所）

本契約に関する紛争は、{{管轄裁判所}}を第一審の専属的合意管轄裁判所とする。

{{契約日}}

甲：{{甲の名称}}
乙：{{乙の名称}}`,
    variables: [
      "契約種別",
      "甲の名称",
      "乙の名称",
      "契約目的",
      "契約開始日",
      "契約終了日",
      "対価条件",
      "解除条件",
      "管轄裁判所",
      "契約日",
    ],
  },
  {
    id: "通知文",
    name: "通知文",
    category: "汎用",
    description: "社内外への通知文の雛形",
    content: `# {{通知件名}}

{{宛先}}

{{発信日}}

{{発信者}}

## 通知内容

{{通知本文}}

## 対応事項

{{対応事項}}

## 問い合わせ先

{{問い合わせ先}}`,
    variables: ["通知件名", "宛先", "発信日", "発信者", "通知本文", "対応事項", "問い合わせ先"],
  },
];

// ── CRUD ──

export function getAllDocuments(): WsDocument[] {
  return wsLoad<WsDocument[]>(STORAGE_KEY, []);
}

export function getDocument(id: string): WsDocument | null {
  return getAllDocuments().find((d) => d.id === id) ?? null;
}

export function createDocument(
  doc: Omit<WsDocument, "id" | "createdAt" | "updatedAt">,
): WsDocument {
  const all = getAllDocuments();
  const now = new Date().toISOString();
  const newDoc: WsDocument = { ...doc, id: uuid(), createdAt: now, updatedAt: now };
  if (!newDoc.docNumber && doc.status === "final") {
    newDoc.docNumber = generateDocNumber();
  }
  all.unshift(newDoc);
  wsSave(STORAGE_KEY, all);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<WsDocument>): void {
  const all = getAllDocuments();
  const idx = all.findIndex((d) => d.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    wsSave(STORAGE_KEY, all);
  }
}

export function deleteDocument(id: string): void {
  const all = getAllDocuments().filter((d) => d.id !== id);
  wsSave(STORAGE_KEY, all);
}

// ── テンプレート適用 ──

export function applyTemplate(template: DocTemplate): {
  content: string;
  variables: Record<string, string>;
} {
  const variables: Record<string, string> = {};
  for (const v of template.variables) {
    variables[v] = "";
  }
  return { content: template.content, variables };
}

export function renderDocument(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.split(`{{${key}}}`).join(value || `{{${key}}}`);
  }
  return result;
}

// ── 文書番号採番 ──

interface NumberingState {
  prefix: string;
  year: number;
  counter: number;
}

export function getNumberingState(): NumberingState {
  const fallback = { prefix: "文書", year: new Date().getFullYear(), counter: 0 };
  const state = wsLoad<NumberingState>(NUMBERING_KEY, fallback);
  // Reset counter on year change
  if (state.year !== new Date().getFullYear()) {
    state.year = new Date().getFullYear();
    state.counter = 0;
  }
  return state;
}

export function generateDocNumber(): string {
  const state = getNumberingState();
  state.counter++;
  wsSave(NUMBERING_KEY, state);
  return `${state.prefix}第${state.year}-${String(state.counter).padStart(3, "0")}号`;
}

export function updateNumberingPrefix(prefix: string): void {
  const state = getNumberingState();
  state.prefix = prefix;
  wsSave(NUMBERING_KEY, state);
}
