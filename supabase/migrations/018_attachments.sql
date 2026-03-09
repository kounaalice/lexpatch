-- 018: ファイル添付 — コミュニティ/プロジェクトの資料共有
-- Cloudflare R2 にファイル本体、Supabase にメタデータ

CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  context_type TEXT NOT NULL CHECK (context_type IN ('community', 'project')),
  context_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  uploaded_by UUID REFERENCES member_profiles(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attachments_context ON attachments (context_type, context_id, created_at DESC);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_all" ON attachments FOR ALL USING (true) WITH CHECK (true);
