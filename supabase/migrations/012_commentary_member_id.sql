-- commentaries テーブルに member_id カラム追加（投稿者の追跡用）
ALTER TABLE commentaries ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES member_profiles(id);
CREATE INDEX IF NOT EXISTS idx_commentaries_member ON commentaries (member_id);
