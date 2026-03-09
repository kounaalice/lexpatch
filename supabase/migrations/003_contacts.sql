-- お問い合わせテーブル

create table if not exists contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table contacts enable row level security;

-- 誰でも送信可（insert）、読み取りはサービスロールのみ
create policy "contacts_insert" on contacts for insert with check (true);
