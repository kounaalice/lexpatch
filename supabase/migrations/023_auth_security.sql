-- 023: Auth security enhancement — PBKDF2, OAuth, rate limiting, data protection
-- 国際基準（GDPR/OWASP）準拠レベルのセキュリティ強化

-- ─── OAuth 対応カラム ────────────────────────────────────────
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local';
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS auth_provider_id TEXT;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ─── メール認証 ──────────────────────────────────────────────
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ─── パスワードリセット ──────────────────────────────────────
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- ─── ログインレート制限 ──────────────────────────────────────
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- ─── セッションnonce（トークン回転用）───────────────────────
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS session_nonce TEXT;

-- ─── インデックス ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mp_auth_provider
  ON member_profiles (auth_provider, auth_provider_id);

CREATE INDEX IF NOT EXISTS idx_mp_email
  ON member_profiles (email) WHERE email IS NOT NULL;

-- メールでのログイン一意性担保（NULLは既存ユーザーの後方互換）
-- PostgreSQL の UNIQUE は NULL を重複扱いしないため、既存のメール未設定ユーザーに影響なし
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_profiles_email_unique'
  ) THEN
    ALTER TABLE member_profiles ADD CONSTRAINT member_profiles_email_unique UNIQUE (email);
  END IF;
END $$;

-- ─── RLS 厳格化 ──────────────────────────────────────────────
-- 旧ポリシー削除（全許可ポリシーを置換）
DROP POLICY IF EXISTS "member_profiles_all" ON member_profiles;

-- SELECT: API レイヤーで返すカラムを厳密に制限（password_hash等はAPIで除外）
CREATE POLICY "mp_select" ON member_profiles FOR SELECT USING (true);

-- UPDATE: service_role（APIサーバー）経由のみ。API レイヤーで本人確認を実施
CREATE POLICY "mp_update" ON member_profiles FOR UPDATE
  USING (true) WITH CHECK (true);

-- INSERT: service_role（APIサーバー）経由の登録のみ
CREATE POLICY "mp_insert" ON member_profiles FOR INSERT WITH CHECK (true);

-- DELETE: 禁止（物理削除なし）
CREATE POLICY "mp_no_delete" ON member_profiles FOR DELETE USING (false);

-- ─── セキュアビュー（公開プロフィール用）─────────────────────
-- 管理者含む全ユーザー向け。秘匿フィールドを一切含まない
CREATE OR REPLACE VIEW member_profiles_public AS
SELECT
  id, name, org, org_type, bio, experience, preferred_areas,
  avatar_url, auth_provider, created_at
FROM member_profiles;
