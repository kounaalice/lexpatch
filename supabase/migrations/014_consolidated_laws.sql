-- Migration 014: consolidated_laws テーブル
-- 統合法案の全文テキストを保持（1プロジェクト1統合法）

CREATE TABLE IF NOT EXISTS consolidated_laws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  law_num TEXT,
  description TEXT,
  books JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- RLS
ALTER TABLE consolidated_laws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON consolidated_laws
  FOR SELECT USING (true);

CREATE POLICY "Allow all for anon" ON consolidated_laws
  FOR ALL USING (true) WITH CHECK (true);
