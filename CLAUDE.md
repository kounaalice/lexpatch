# LexPatch — 逐条パッチ記法による法令改正案プラットフォーム

## プロジェクト概要
現行法をe-Gov法令APIから取得し、差分（+/−）記法で改正案を提案・閲覧・議論するWebアプリケーション。 「原文は記号なし、提案は必ず+/−」の原則で、紙でも画面でも同じ見え方を実現する。

## 技術スタック
* フレームワーク: Next.js 15 (App Router)
* 言語: TypeScript (strict)
* DB: Supabase (PostgreSQL + Auth + Realtime)
* スタイル: Tailwind CSS v4
* デプロイ: Vercel
* 法令データ: e-Gov法令API v2 (https://laws.e-gov.go.jp/api/2/)

## ディレクトリ構成
```
lexpatch/
├── CLAUDE.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── law/[lawId]/
│   │   │   ├── page.tsx
│   │   │   └── article/[articleNum]/
│   │   │       └── page.tsx
│   │   ├── patch/[patchId]/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── egov/
│   │       │   ├── search/route.ts
│   │       │   └── law/[lawId]/route.ts
│   │       ├── patch/route.ts
│   │       └── lint/route.ts
│   ├── lib/
│   │   ├── egov/
│   │   │   ├── client.ts
│   │   │   ├── parser.ts
│   │   │   └── types.ts
│   │   ├── patch/
│   │   │   ├── types.ts
│   │   │   ├── parser.ts
│   │   │   ├── apply.ts
│   │   │   ├── diff.ts
│   │   │   └── serialize.ts
│   │   ├── convert/
│   │   │   ├── shinkyu.ts
│   │   │   └── aramebun.ts
│   │   ├── lint/
│   │   │   ├── runner.ts
│   │   │   └── rules/
│   │   │       ├── canon-exists.ts
│   │   │       ├── renumber-ref.ts
│   │   │       ├── balanced-ops.ts
│   │   │       ├── scope-close.ts
│   │   │       └── duplicate-loc.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   └── utils.ts
│   ├── components/
│   │   ├── diff/
│   │   │   ├── UnifiedView.tsx
│   │   │   ├── SideBySideView.tsx
│   │   │   ├── PlainPatchView.tsx
│   │   │   └── DiffStats.tsx
│   │   ├── sources/
│   │   │   └── SourceCards.tsx
│   │   ├── discussion/
│   │   │   ├── DiscussionThread.tsx
│   │   │   └── DiscussionSummary.tsx
│   │   ├── lint/
│   │   │   └── LintPanel.tsx
│   │   ├── convert/
│   │   │   └── ShinkyuTable.tsx
│   │   ├── law/
│   │   │   ├── LawSearch.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   └── ParagraphText.tsx
│   │   ├── patch/
│   │   │   ├── PatchEditor.tsx
│   │   │   ├── PatchList.tsx
│   │   │   └── PatchHeader.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── ThreeColumnLayout.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── TabBar.tsx
│   │       ├── VoteBar.tsx
│   │       └── PipelineDiagram.tsx
│   └── types/
│       └── database.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql
│       └── 002_rls.sql
└── tests/
    ├── lib/
    │   ├── patch/
    │   │   ├── parser.test.ts
    │   │   ├── apply.test.ts
    │   │   └── diff.test.ts
    │   └── lint/
    │       └── rules.test.ts
    └── e2e/
        └── patch-flow.test.ts
```

## データベース設計（Supabase）

```sql
create table laws (
  law_id text primary key,
  law_title text not null,
  law_num text not null,
  law_type text not null,
  raw_json jsonb not null,
  structured jsonb not null,
  fetched_at timestamptz not null default now()
);

create table canons (
  id uuid primary key default gen_random_uuid(),
  law_id text references laws(law_id),
  version text not null,
  articles jsonb not null,
  released_at timestamptz not null default now(),
  unique (law_id, version)
);

create table patches (
  id uuid primary key default gen_random_uuid(),
  canon_id uuid references canons(id),
  title text not null,
  description text,
  author_id uuid references auth.users(id),
  patch_type text not null default 'A' check (patch_type in ('A', 'C')),
  status text not null default '下書き'
    check (status in ('下書き', '議論中', '投票中', '反映済', '却下')),
  plain_text text not null,
  structured jsonb not null,
  target_articles text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  patch_id uuid references patches(id) on delete cascade,
  tier text not null check (tier in ('一次', '準一次', '二次', '三次')),
  label text not null,
  url text,
  excerpt text,
  sort_order int not null default 0
);

create table discussions (
  id uuid primary key default gen_random_uuid(),
  patch_id uuid references patches(id) on delete cascade,
  target_line text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid references discussions(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  patch_id uuid references patches(id) on delete cascade,
  user_id uuid references auth.users(id),
  vote text not null check (vote in ('agree', 'disagree', 'abstain')),
  created_at timestamptz not null default now(),
  unique (patch_id, user_id)
);

create table lint_results (
  id uuid primary key default gen_random_uuid(),
  patch_id uuid references patches(id) on delete cascade,
  severity text not null check (severity in ('error', 'warn', 'info', 'pass')),
  rule_name text not null,
  message text not null,
  target_line text,
  created_at timestamptz not null default now()
);
```

## コアロジック仕様

### 1. e-Gov法令APIクライアント (lib/egov/client.ts)
```
BASE_URL = "https://laws.e-gov.go.jp/api/2"

検索: GET /laws?law_title={query}&limit=20&response_format=json
本文: GET /law_data/{law_id}?response_format=json
条文: GET /articles?law_id={law_id}&article={num}&response_format=json
```
* レスポンスはlawsテーブルにキャッシュ（24時間有効）
* パース後の構造化データ: `{ chapters: [{ title, articles: [{ number, paragraphs: [{ num, sentences: [string] }] }] }] }`

### 2. パッチパーサ (lib/patch/parser.ts)

```typescript
interface PatchData {
  targetArticle: string;
  patchType: 'A' | 'C';
  lines: PatchLine[];
}

interface PatchLine {
  op: 'add' | 'del' | 'ctx';
  num: string | null;
  text: string;
  scope?: boolean;
  movedFrom?: string;
}
```

パースルール:
* 行頭が `+` → op: 'add'
* 行頭が `-` → op: 'del'
* それ以外 → op: 'ctx'
* 条番号に+/-がついていたら scope: true（C記法）

### 3. 適用エンジン (lib/patch/apply.ts)
* ctx行はCanonからそのままコピー
* del行はCanonから除去
* add行はNEWに挿入
* 項番号の自動振り直しはしない

### 4. Lintルール

| ルール名 | 重要度 | 内容 |
|----------|--------|------|
| canon-exists | error | −した条項がCanonに実在するか |
| balanced-ops | warn | +/-が対になっているか |
| renumber-ref | warn | 繰下げ発生時、参照語が古くないか |
| scope-close | error | C記法のスコープが適切に閉じているか |
| duplicate-loc | warn | 同一条項に複数パッチが競合していないか |

### 5. 新旧対照表生成 (lib/convert/shinkyu.ts)
* 変更のない行は左右同一テキスト
* 削除行は左のみ
* 追加行は右のみ
* 修正行は左右に旧/新テキスト

## e-Gov法令API利用上の注意
* レート制限に配慮: 1秒間隔でリクエスト
* API応答をDBにキャッシュ（24時間TTL）
* フッターに「e-Gov法令検索のデータを使用していること」を明示
* APIはCORSに対応していないため、Next.js API Routeでプロキシする

## 実装順序（フェーズ）

### Phase 1: 法令閲覧 + パッチ表示（MVP）
1. e-Gov APIクライアント + パーサ
2. 法令検索ページ（トップ）
3. 法令閲覧ページ（条文一覧）
4. パッチパーサ（プレーンテキスト→構造化）
5. diffエンジン（unified / side-by-side）
6. パッチ詳細ページ（4モード切替）
7. 3カラムレイアウト

### Phase 2: 編集 + 議論
1. パッチエディタ
2. Supabase Auth
3. パッチCRUD
4. 根拠カード編集
5. Discussion

### Phase 3: 品質 + 運用
1. Lintエンジン
2. 投票機能
3. 新旧対照表の自動生成・ダウンロード
4. Canon版管理

## コーディング規約
* コンポーネントはServer Components優先、Client Componentsは"use client"を明示
* データ取得はServer Components内でasync/awaitで直接fetch
* 状態管理はReact hooks（useState, useReducer）で完結
* エラーハンドリング: API Route内でtry/catch、`{ error: string }`で返却
* 日本語コメント可。変数名・関数名は英語
* テストは vitest。コアロジックは必ずテストを書く

## デザイントークン
```
背景:       #F5F3ED
サーフェス:  #FFFFFF
ボーダー:    #D1CBBC
テキスト主:  #1A1815
テキスト副:  #5A5347
アクセント:  #2D4A22（深緑）
追加:       #1B6B35 / bg #EBF5EE
削除:       #9B2C2C / bg #FDF0EF
繰下げ:     #5B3F8F / bg #F3EEFC
警告:       #A85D00 / bg #FFF8EB
ヘッダ背景:  #1A2416
ゴールド:   #8B7355
フォント本文: "Noto Sans JP"
フォント法文: "Noto Serif JP"
フォントコード: "JetBrains Mono"
```

## 環境変数
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EGOV_API_BASE=https://laws.e-gov.go.jp/api/2
```
