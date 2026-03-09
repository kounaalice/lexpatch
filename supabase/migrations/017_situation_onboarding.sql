-- 017: 状況プロフィール — オンボーディングで選択した状況タグを保存
-- notification_prefs JSONB (015) と同パターン

ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS situation_profile JSONB DEFAULT '{}';

-- situation_profile JSONB 構造:
-- {
--   "situations": ["hitorioya", "kaigo", "freelance"],
--   "completed_at": "2026-03-10T12:00:00Z",
--   "version": 1
-- }
