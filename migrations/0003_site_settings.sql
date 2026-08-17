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
