-- LexPatch 初期スキーマ

-- 法令キャッシュ
create table if not exists laws (
  law_id       text primary key,
  law_title    text not null,
  law_num      text not null,
  law_type     text not null,
  raw_json     jsonb not null,
  structured   jsonb not null,
  fetched_at   timestamptz not null default now()
);

-- Canon（正文バージョン）
create table if not exists canons (
  id           uuid primary key default gen_random_uuid(),
  law_id       text references laws(law_id),
  version      text not null,
  articles     jsonb not null,
  released_at  timestamptz not null default now(),
  unique (law_id, version)
);

-- パッチ（改正案）
create table if not exists patches (
  id               uuid primary key default gen_random_uuid(),
  canon_id         uuid references canons(id),
  title            text not null,
  description      text,
  author_id        uuid references auth.users(id),
  patch_type       text not null default 'A' check (patch_type in ('A', 'C')),
  status           text not null default '下書き'
                     check (status in ('下書き', '議論中', '投票中', '反映済', '却下')),
  plain_text       text not null,
  structured       jsonb not null,
  target_articles  text[] not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patches_updated_at
  before update on patches
  for each row execute function update_updated_at();

-- 根拠カード
create table if not exists sources (
  id          uuid primary key default gen_random_uuid(),
  patch_id    uuid references patches(id) on delete cascade,
  tier        text not null check (tier in ('一次', '準一次', '二次', '三次')),
  label       text not null,
  url         text,
  excerpt     text,
  sort_order  int not null default 0
);

-- 議論（パッチ行ごと）
create table if not exists discussions (
  id          uuid primary key default gen_random_uuid(),
  patch_id    uuid references patches(id) on delete cascade,
  target_line text not null,
  summary     text,
  created_at  timestamptz not null default now()
);

-- 議論コメント
create table if not exists discussion_comments (
  id              uuid primary key default gen_random_uuid(),
  discussion_id   uuid references discussions(id) on delete cascade,
  author_id       uuid references auth.users(id),
  content         text not null,
  created_at      timestamptz not null default now()
);

-- 投票
create table if not exists votes (
  id          uuid primary key default gen_random_uuid(),
  patch_id    uuid references patches(id) on delete cascade,
  user_id     uuid references auth.users(id),
  vote        text not null check (vote in ('agree', 'disagree', 'abstain')),
  created_at  timestamptz not null default now(),
  unique (patch_id, user_id)
);

-- Lint 結果
create table if not exists lint_results (
  id          uuid primary key default gen_random_uuid(),
  patch_id    uuid references patches(id) on delete cascade,
  severity    text not null check (severity in ('error', 'warn', 'info', 'pass')),
  rule_name   text not null,
  message     text not null,
  target_line text,
  created_at  timestamptz not null default now()
);
