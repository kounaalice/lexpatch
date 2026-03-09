-- Migration 010: Admin role + project-patch link

-- member_profiles に role カラム追加
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
-- role: 'member' | 'admin' | 'moderator'

-- projects に patch_ids カラム追加（束ね機能用）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS patch_ids UUID[] DEFAULT '{}';
