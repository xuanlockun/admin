ALTER TABLE posts ADD COLUMN deploy_commit_sha TEXT;
ALTER TABLE posts ADD COLUMN deploy_commit_url TEXT;
ALTER TABLE posts ADD COLUMN deploy_pages_url TEXT;
ALTER TABLE posts ADD COLUMN deploy_live_url TEXT;
ALTER TABLE posts ADD COLUMN deploy_status TEXT NOT NULL DEFAULT 'idle';
ALTER TABLE posts ADD COLUMN deploy_error TEXT;
ALTER TABLE posts ADD COLUMN deploy_updated_at TEXT;
