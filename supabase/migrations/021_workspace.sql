-- 021: Workspace (LexWS) foundation
-- workspaces, workspace_members, ws_forms, ws_form_responses, ws_approvals

-- ── 組織ワークスペース ──
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (workspace_id, member_id)
);

-- ── フォーム ──
CREATE TABLE IF NOT EXISTS ws_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES member_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ws_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES ws_forms(id) ON DELETE CASCADE,
  respondent_name TEXT,
  respondent_email TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ── 承認フロー ──
CREATE TABLE IF NOT EXISTS ws_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES member_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  steps JSONB NOT NULL DEFAULT '[]',
  current_step INT DEFAULT 0,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS (service_role bypass) ──
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_workspaces" ON workspaces FOR ALL USING (true);
CREATE POLICY "allow_all_workspace_members" ON workspace_members FOR ALL USING (true);
CREATE POLICY "allow_all_ws_forms" ON ws_forms FOR ALL USING (true);
CREATE POLICY "allow_all_ws_form_responses" ON ws_form_responses FOR ALL USING (true);
CREATE POLICY "allow_all_ws_approvals" ON ws_approvals FOR ALL USING (true);

-- indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_member ON workspace_members(member_id);
CREATE INDEX IF NOT EXISTS idx_ws_forms_member ON ws_forms(member_id);
CREATE INDEX IF NOT EXISTS idx_ws_form_responses_form ON ws_form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_ws_approvals_requester ON ws_approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_ws_approvals_status ON ws_approvals(status);
