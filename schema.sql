CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  deploy_commit_sha TEXT,
  deploy_commit_url TEXT,
  deploy_pages_url TEXT,
  deploy_live_url TEXT,
  deploy_status TEXT NOT NULL DEFAULT 'idle',
  deploy_error TEXT,
  deploy_updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_title', 'Static CMS'),
  ('hero_title', 'Static CMS'),
  ('hero_subtitle', 'Published notes and articles.'),
  ('intro_html', '<p>Welcome to the site.</p>'),
  ('accent_color', '#245c6f'),
  ('custom_css', '');
