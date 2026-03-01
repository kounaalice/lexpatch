-- Row Level Security ポリシー

alter table laws             enable row level security;
alter table canons           enable row level security;
alter table patches          enable row level security;
alter table sources          enable row level security;
alter table discussions      enable row level security;
alter table discussion_comments enable row level security;
alter table votes            enable row level security;
alter table lint_results     enable row level security;

-- laws: 全員読み取り可、書き込みはサービスロールのみ
create policy "laws_read"  on laws for select using (true);

-- canons: 全員読み取り可
create policy "canons_read" on canons for select using (true);

-- patches: 全員読み取り可、作成者のみ更新・削除
create policy "patches_read"   on patches for select using (true);
create policy "patches_insert" on patches for insert with check (auth.uid() = author_id or author_id is null);
create policy "patches_update" on patches for update using (auth.uid() = author_id);
create policy "patches_delete" on patches for delete using (auth.uid() = author_id);

-- sources: パッチに紐づく（パッチの作者のみ編集）
create policy "sources_read"   on sources for select using (true);
create policy "sources_insert" on sources for insert with check (
  exists (select 1 from patches p where p.id = patch_id and (p.author_id = auth.uid() or p.author_id is null))
);
create policy "sources_update" on sources for update using (
  exists (select 1 from patches p where p.id = patch_id and p.author_id = auth.uid())
);
create policy "sources_delete" on sources for delete using (
  exists (select 1 from patches p where p.id = patch_id and p.author_id = auth.uid())
);

-- discussions: 全員読み取り・ログイン済みで作成
create policy "discussions_read"   on discussions for select using (true);
create policy "discussions_insert" on discussions for insert with check (auth.uid() is not null);

-- discussion_comments: 全員読み取り・作成者のみ削除
create policy "comments_read"   on discussion_comments for select using (true);
create policy "comments_insert" on discussion_comments for insert with check (auth.uid() = author_id or author_id is null);
create policy "comments_delete" on discussion_comments for delete using (auth.uid() = author_id);

-- votes: 自分の投票のみ操作
create policy "votes_read"   on votes for select using (true);
create policy "votes_insert" on votes for insert with check (auth.uid() = user_id);
create policy "votes_delete" on votes for delete using (auth.uid() = user_id);

-- lint_results: 全員読み取り
create policy "lint_read" on lint_results for select using (true);
