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
  deploy_updated_at TEXT,
  cover_image_url TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body_html TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  show_in_nav INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_sort ON pages(sort_order, id);

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
  ('custom_css', ''),
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

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('theme_id', 'editorial');

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
