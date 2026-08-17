ALTER TABLE posts ADD COLUMN cover_image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('logo_text', 'Static CMS'),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('default_seo_title', 'Static CMS'),
  ('default_seo_description', 'Published notes and articles.'),
  ('primary_cta_label', 'Read latest'),
  ('primary_cta_url', '#latest'),
  ('secondary_cta_label', ''),
  ('secondary_cta_url', ''),
  ('custom_html', ''),
  ('nav_cta_label', ''),
  ('nav_cta_url', ''),
  ('featured_posts_count', '6'),
  ('footer_text', '');

CREATE TABLE IF NOT EXISTS navigation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target TEXT NOT NULL DEFAULT '_self',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS footer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target TEXT NOT NULL DEFAULT '_self',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  post_id INTEGER,
  commit_sha TEXT NOT NULL,
  commit_url TEXT NOT NULL,
  live_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployments_commit ON deployments(commit_sha);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);
