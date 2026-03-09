-- commentaries テーブル
CREATE TABLE IF NOT EXISTS commentaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  law_id TEXT NOT NULL,
  article_title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commentaries_law_article ON commentaries (law_id, article_title);

-- projects テーブル
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  law_ids TEXT[] DEFAULT '{}',
  bookmarks JSONB DEFAULT '[]',
  owner_name TEXT,
  status TEXT DEFAULT '調査',
  "references" JSONB DEFAULT '[]',
  tasks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- project_notes テーブル
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_notes_project ON project_notes (project_id);

-- RLS を無効化（パブリックアクセス）
ALTER TABLE commentaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りポリシー
CREATE POLICY IF NOT EXISTS "commentaries_public_read" ON commentaries FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "commentaries_public_insert" ON commentaries FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "commentaries_public_update" ON commentaries FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "commentaries_public_delete" ON commentaries FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "projects_public_read" ON projects FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "projects_public_insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "projects_public_update" ON projects FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "projects_public_delete" ON projects FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "project_notes_public_read" ON project_notes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "project_notes_public_insert" ON project_notes FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "project_notes_public_delete" ON project_notes FOR DELETE USING (true);
