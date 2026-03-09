-- 裁判例データ & 法令×条文→判例インデックス

CREATE TABLE IF NOT EXISTS precedents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lawsuit_id TEXT NOT NULL UNIQUE,
  trial_type TEXT NOT NULL,
  case_number TEXT NOT NULL,
  case_name TEXT NOT NULL,
  court_name TEXT NOT NULL,
  date DATE NOT NULL,
  result_type TEXT,
  result TEXT,
  article_info TEXT,
  gist TEXT,
  case_gist TEXT,
  ref_law TEXT,
  detail_url TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precedent_law_refs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  precedent_id UUID NOT NULL REFERENCES precedents(id) ON DELETE CASCADE,
  law_id TEXT NOT NULL,
  law_name TEXT NOT NULL,
  article TEXT NOT NULL,
  paragraph TEXT,
  item TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 条文ページからの検索を高速化
CREATE INDEX idx_plr_law_article ON precedent_law_refs(law_id, article);
CREATE INDEX idx_plr_law_id ON precedent_law_refs(law_id);
CREATE INDEX idx_precedents_date ON precedents(date DESC);
CREATE INDEX idx_precedents_lawsuit_id ON precedents(lawsuit_id);

-- RLS: 読み取りは全員許可
ALTER TABLE precedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE precedent_law_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all" ON precedents
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow read for all" ON precedent_law_refs
  FOR SELECT TO anon, authenticated USING (true);
