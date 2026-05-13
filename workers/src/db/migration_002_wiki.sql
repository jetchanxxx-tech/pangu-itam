-- Migration 0002: Wiki articles + Asset archive support

CREATE TABLE IF NOT EXISTS wiki_articles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki_articles(category);

-- Add archived column to assets (SQLite doesn't support ADD COLUMN IF NOT EXISTS)
-- We use a workaround: if the column doesn't exist, add it
-- This is safe to run multiple times
ALTER TABLE assets ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
