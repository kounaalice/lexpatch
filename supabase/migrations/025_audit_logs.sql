-- 025: 監査ログテーブル (Audit Trail Persistence)
-- 全ての重要操作を永続化する監査証跡テーブル

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID,
  actor_name TEXT,
  actor_ip TEXT,
  resource_type TEXT,
  resource_id TEXT,
  detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- 90日経過したログを自動削除するポリシー（オプション）
-- ALTER TABLE audit_logs SET (autovacuum_enabled = true);

-- RLS: admin のみ読み取り可能
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM member_profiles
      WHERE member_profiles.id = auth.uid()
      AND member_profiles.role = 'admin'
    )
  );

-- 挿入は service_role のみ (API routes through server client)
CREATE POLICY "service role can insert audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
