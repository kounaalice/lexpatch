-- Migration 011: Canon snapshot support
-- laws テーブルへの最小行挿入を可能にするため、デフォルト値を設定
-- canons.law_id が laws(law_id) をFK参照しており、スナップショット保存時にlaws行が必要

ALTER TABLE laws ALTER COLUMN raw_json SET DEFAULT '{}'::jsonb;
ALTER TABLE laws ALTER COLUMN structured SET DEFAULT '{}'::jsonb;
ALTER TABLE laws ALTER COLUMN law_type SET DEFAULT '';
