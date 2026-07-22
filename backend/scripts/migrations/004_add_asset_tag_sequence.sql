-- ============================================================
-- Migration 004: Auto-generate asset tags (AST-XXXXXX format)
-- ============================================================

-- Create sequence for auto-generating asset tag numbers
CREATE SEQUENCE IF NOT EXISTS asset_tag_seq START WITH 1;

-- Advance the sequence past any existing asset tags so there are no collisions
SELECT setval('asset_tag_seq', COALESCE(
  (SELECT MAX(CAST(REGEXP_REPLACE(asset_tag, '[^0-9]', '', 'g') AS INTEGER)) FROM assets),
  0
));

-- Add a default to asset_tag so new rows without an explicit tag get auto-generated
ALTER TABLE assets
ALTER COLUMN asset_tag SET DEFAULT ('AST-' || LPAD(nextval('asset_tag_seq')::TEXT, 6, '0'));
