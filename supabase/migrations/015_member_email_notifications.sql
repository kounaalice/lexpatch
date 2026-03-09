-- メール通知設定: メールアドレスと通知プリファレンスを member_profiles に追加
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}';
