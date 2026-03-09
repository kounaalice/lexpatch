-- 法令アラート追跡: Cron法令巡回 + 週次ダイジェスト用

-- 検出した法令のログ（重複防止）
CREATE TABLE IF NOT EXISTS law_alert_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  law_id TEXT NOT NULL,
  law_title TEXT NOT NULL,
  law_num TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('promulgation', 'enforcement')),
  law_date TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (law_id, alert_type)
);
CREATE INDEX IF NOT EXISTS idx_law_alert_log_disc ON law_alert_log (discovered_at DESC);

-- 送信記録（メンバーごとの重複防止）
CREATE TABLE IF NOT EXISTS law_alert_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_log_id UUID NOT NULL REFERENCES law_alert_log(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  send_type TEXT NOT NULL CHECK (send_type IN ('immediate', 'digest')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (alert_log_id, member_id, send_type)
);
CREATE INDEX IF NOT EXISTS idx_law_alert_sends_member ON law_alert_sends (member_id, sent_at DESC);

-- ダイジェスト送信タイミング追跡
CREATE TABLE IF NOT EXISTS law_digest_tracker (
  member_id UUID PRIMARY KEY REFERENCES member_profiles(id) ON DELETE CASCADE,
  last_digest_sent TIMESTAMPTZ DEFAULT '1970-01-01'::TIMESTAMPTZ
);

-- RLS（service_role で操作するため全許可）
ALTER TABLE law_alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "law_alert_log_all" ON law_alert_log FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE law_alert_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "law_alert_sends_all" ON law_alert_sends FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE law_digest_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "law_digest_tracker_all" ON law_digest_tracker FOR ALL USING (true) WITH CHECK (true);
