-- member_follows テーブルの拡張（follower/following → 汎用フォロー）
-- 既存の follower_id/following_id に加え、target ベースのフォローを追加
ALTER TABLE member_follows ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE;
ALTER TABLE member_follows ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT '';
ALTER TABLE member_follows ADD COLUMN IF NOT EXISTS target_id TEXT DEFAULT '';
ALTER TABLE member_follows ADD COLUMN IF NOT EXISTS target_title TEXT DEFAULT '';

-- member_id がない既存行に follower_id をコピー
UPDATE member_follows SET member_id = follower_id WHERE member_id IS NULL;

-- ユニーク制約追加（重複フォロー防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_follows_target
  ON member_follows (member_id, target_type, target_id);

-- notifications テーブルに不足カラムを追加
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_member_id UUID REFERENCES member_profiles(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'all';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_filter JSONB DEFAULT '{}';

-- notification_reads テーブル（既読管理）
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (notification_id, member_id)
);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_reads_all" ON notification_reads FOR ALL USING (true) WITH CHECK (true);
