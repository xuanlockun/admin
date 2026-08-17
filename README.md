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

4. Initialize D1 tables from the repository:

   ```sh
   npx wrangler d1 migrations apply cms_posts --remote
   ```

   Run this again after pulling CMS changes because new admin/site features add migrations.

5. Configure repository target in the Worker dashboard variables:

   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`
   - `SITE_TITLE`

6. Add Worker secrets:

   ```sh
   wrangler secret put ADMIN_PASSWORD
   wrangler secret put GITHUB_TOKEN
   ```

   `GITHUB_TOKEN` needs permission to write contents to the client repo.

7. Run locally:

   ```sh
   npm run dev
   ```

## Behavior

- Save draft: writes only to D1.
- Publish: updates D1 status, then commits:
  - `posts/<slug>/index.html`
  - `posts.json`
  - `index.html`
  - `style.css`

## Current Admin Features

- Dashboard sidebar with Posts, Landing, Navigation, Footer, Deployments, and Settings.
- CKEditor 5 rich text editor loaded from the CKEditor CDN.
- D1-backed site settings, header navigation, footer links, deployments, post SEO, and cover image fields.
- GitHub Pages build tracking through the GitHub Pages REST API.
- Publish progress modal for post/site publish.
- Built-in client themes: Editorial and Studio.
