-- member_profiles テーブル
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  org TEXT NOT NULL DEFAULT '',
  org_type TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  preferred_areas TEXT[] DEFAULT '{}',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (name, org)
);
CREATE INDEX IF NOT EXISTS idx_member_profiles_name_org ON member_profiles (name, org);

-- member_follows テーブル
CREATE TABLE IF NOT EXISTS member_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- communities テーブル
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  law_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- community_members テーブル
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (community_id, member_id)
);

-- community_messages テーブル
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_messages_community ON community_messages (community_id, created_at DESC);

-- notifications テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  link TEXT DEFAULT '',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications (member_id, is_read, created_at DESC);

-- RLS 有効化
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスポリシー（service_role key 使用のため全許可）
CREATE POLICY "member_profiles_all" ON member_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "member_follows_all" ON member_follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "communities_all" ON communities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "community_members_all" ON community_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "community_messages_all" ON community_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
