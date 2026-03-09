-- patches テーブルに law_id カラムを追加
ALTER TABLE patches ADD COLUMN IF NOT EXISTS law_id text;
