-- 020: プロジェクト議事録テーブル
-- 会議日、出席者、議題、決定事項、アクションアイテムを構造化して管理

CREATE TABLE IF NOT EXISTS meeting_minutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  attendees JSONB DEFAULT '[]',
  agenda TEXT,
  decisions TEXT,
  action_items JSONB DEFAULT '[]',
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meeting_minutes_project ON meeting_minutes (project_id, meeting_date DESC);

ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meeting_minutes_all" ON meeting_minutes FOR ALL USING (true) WITH CHECK (true);
