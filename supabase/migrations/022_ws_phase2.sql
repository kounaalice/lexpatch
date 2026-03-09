-- 022: Workspace Phase 2 tables
-- ws_bulletins, ws_bulletin_reads, ws_circulars, ws_circular_confirmations

-- ── 掲示板 ──
CREATE TABLE IF NOT EXISTS ws_bulletins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES member_profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general' CHECK (category IN ('general','urgent','event','maintenance','other')),
  pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ws_bulletin_reads (
  bulletin_id UUID NOT NULL REFERENCES ws_bulletins(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (bulletin_id, member_id)
);

-- ── 回覧・確認 ──
CREATE TABLE IF NOT EXISTS ws_circulars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES member_profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  target_member_ids UUID[] NOT NULL DEFAULT '{}',
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ws_circular_confirmations (
  circular_id UUID NOT NULL REFERENCES ws_circulars(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT now(),
  comment TEXT DEFAULT '',
  PRIMARY KEY (circular_id, member_id)
);

-- ── RLS ──
ALTER TABLE ws_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_bulletin_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_circular_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_ws_bulletins" ON ws_bulletins FOR ALL USING (true);
CREATE POLICY "allow_all_ws_bulletin_reads" ON ws_bulletin_reads FOR ALL USING (true);
CREATE POLICY "allow_all_ws_circulars" ON ws_circulars FOR ALL USING (true);
CREATE POLICY "allow_all_ws_circular_confirmations" ON ws_circular_confirmations FOR ALL USING (true);

-- indexes
CREATE INDEX IF NOT EXISTS idx_ws_bulletins_workspace ON ws_bulletins(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_bulletins_author ON ws_bulletins(author_id);
CREATE INDEX IF NOT EXISTS idx_ws_bulletin_reads_member ON ws_bulletin_reads(member_id);
CREATE INDEX IF NOT EXISTS idx_ws_circulars_workspace ON ws_circulars(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_circulars_author ON ws_circulars(author_id);
CREATE INDEX IF NOT EXISTS idx_ws_circular_confirmations_member ON ws_circular_confirmations(member_id);
