-- 020: ゲーミフィケーション — 閲覧XP + 活動ポイント永続化
ALTER TABLE member_profiles
ADD COLUMN IF NOT EXISTS gaming_profile JSONB DEFAULT '{}';

COMMENT ON COLUMN member_profiles.gaming_profile IS
'ゲーミフィケーション状態。readingXp, activityPoints, activityLog[], dailyStats{}, syncedAt';
