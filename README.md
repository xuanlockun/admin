# CMS Admin Worker

Cloudflare Worker admin for editing posts. Drafts are stored in D1. Publishing commits generated static HTML into the client repository through the GitHub Contents API.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Import/deploy this repo as a Cloudflare Worker.

3. In the Worker dashboard, add a D1 database binding:

   - Binding name: `DB`
   - Database: create or select `cms_posts`

   The Worker creates its tables automatically on first API request.

4. Configure repository target in the Worker dashboard variables:

   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`
   - `SITE_TITLE`

5. Add Worker secrets:

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
