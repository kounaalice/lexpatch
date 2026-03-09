-- projects テーブルに不足カラムを追加
ALTER TABLE projects ADD COLUMN IF NOT EXISTS approvals JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phase_deadlines JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS access_password_hash TEXT;
