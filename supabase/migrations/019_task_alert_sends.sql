-- 019: タスク期限リマインダーの送信重複防止テーブル
-- 同一タスク×メンバー×アラートタイプの組み合わせで24時間以内の重複送信を防止

CREATE TABLE IF NOT EXISTS task_alert_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('due_soon', 'overdue')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, task_id, member_id, alert_type)
);

CREATE INDEX idx_task_alert_sends_recent ON task_alert_sends (sent_at DESC);

ALTER TABLE task_alert_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_alert_sends_all" ON task_alert_sends FOR ALL USING (true) WITH CHECK (true);
