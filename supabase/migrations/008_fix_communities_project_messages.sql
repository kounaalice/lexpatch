-- communities テーブルに不足カラムを追加
ALTER TABLE communities ADD COLUMN IF NOT EXISTS owner_member_id UUID REFERENCES member_profiles(id) ON DELETE SET NULL;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- project_messages テーブルを作成
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '匿名',
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_messages_project ON project_messages (project_id, created_at DESC);

-- RLS + ポリシー
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_messages_all" ON project_messages FOR ALL USING (true) WITH CHECK (true);
