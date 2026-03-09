-- 024: W100知識分類法 ポータル
-- CC分野、TT話題、活用例、分野間接続、ユーザーブックマーク

-- ── CC 分野マスタ ──
CREATE TABLE IF NOT EXISTS w100_fields (
  code TEXT PRIMARY KEY CHECK (code ~ '^\d{2}$'),
  name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── TT 話題（各CC固有） ──
CREATE TABLE IF NOT EXISTS w100_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_code TEXT NOT NULL REFERENCES w100_fields(code) ON DELETE CASCADE,
  code TEXT NOT NULL CHECK (code ~ '^\d{2}$'),
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (field_code, code)
);

CREATE INDEX IF NOT EXISTS idx_w100_topics_field ON w100_topics(field_code);

-- ── 活用例（ユースケース） ──
CREATE TABLE IF NOT EXISTS w100_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_code TEXT NOT NULL REFERENCES w100_fields(code) ON DELETE CASCADE,
  topic_code TEXT,
  question TEXT NOT NULL,
  coordinate TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_w100_use_cases_field ON w100_use_cases(field_code);

-- ── 分野間接続 ──
CREATE TABLE IF NOT EXISTS w100_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_field TEXT NOT NULL REFERENCES w100_fields(code) ON DELETE CASCADE,
  to_field TEXT NOT NULL REFERENCES w100_fields(code) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('adjacent', 'cross', 'application')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (from_field, to_field, connection_type)
);

CREATE INDEX IF NOT EXISTS idx_w100_connections_from ON w100_connections(from_field);
CREATE INDEX IF NOT EXISTS idx_w100_connections_to ON w100_connections(to_field);

-- ── ユーザーブックマーク ──
CREATE TABLE IF NOT EXISTS w100_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  coordinate JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_w100_bookmarks_member ON w100_bookmarks(member_id);
