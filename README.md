# CMS Admin Worker

Cloudflare Worker admin for editing posts. Drafts are stored in D1. Publishing commits generated static HTML into the client repository through the GitHub Contents API.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a D1 database and update `wrangler.toml`:

   ```sh
   wrangler d1 create cms_posts
   ```

   Copy the returned `database_id` into `wrangler.toml`.

3. Initialize tables:

   ```sh
   npm run db:init
   npm run db:init:remote
   ```

4. Configure repository target in `wrangler.toml`:

   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`
   - `SITE_TITLE`

5. Add secrets:

   ```sh
   wrangler secret put ADMIN_PASSWORD
   wrangler secret put GITHUB_TOKEN
   ```

   `GITHUB_TOKEN` needs permission to write contents to the client repo.

6. Run locally:

   ```sh
   npm run dev
   ```

## Behavior

- Save draft: writes only to D1.
- Publish: updates D1 status, then commits:
  - `posts/<slug>/index.html`
  - `posts.json`
  - `index.html`

