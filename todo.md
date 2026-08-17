# CMS Rework Todo

## Current Problem

The current admin is a prototype. It works for drafts, publishing, D1, GitHub commit, and basic GitHub Pages tracking, but the structure and UX are not good enough for a real CMS.

Main issues:

- `src/index.js` contains routing, database access, GitHub publishing, HTML rendering, admin UI, client template rendering, and browser JS in one file.
- The admin sidebar is not a real dashboard navigation model.
- The post editor is hand-rolled instead of using a proven rich text editor.
- Landing page editing is too shallow and does not model a professional website.
- Client site generation only covers a simple home page and posts. It needs nav, footer, layout settings, SEO fields, and reasonable content blocks.

## Target Shape

Build a small but coherent static CMS:

- `client` remains static HTML/CSS generated into the GitHub Pages repo.
- `admin` remains a Cloudflare Worker with D1.
- Draft content stays in D1.
- Publishing commits generated static files to the client repo.
- Admin UI behaves like a real dashboard.
- Rich text editing uses a mature editor library, not custom toolbar logic.

## Phase 1: Refactor File Structure

Break `src/index.js` into focused modules:

- `src/index.js`
  - Worker entrypoint only.
  - Calls router and top-level error handling.

- `src/router.js`
  - Request routing.
  - Auth gate.
  - API route dispatch.

- `src/auth.js`
  - Login/logout/session cookie.
  - Password/session verification.

- `src/db.js`
  - D1 helpers.
  - Shared query helpers.
  - Settings/post read/write helpers.

- `src/posts.js`
  - Post CRUD.
  - Publish post workflow.
  - Deploy status persistence.

- `src/settings.js`
  - Site settings CRUD.
  - Landing/nav/footer settings model.

- `src/github.js`
  - GitHub API wrapper.
  - Commit tree creation.
  - GitHub Pages build tracking.

- `src/render/client.js`
  - Render static client files.
  - Home page, posts, CSS, feed/index JSON.

- `src/render/admin.js`
  - Render admin HTML shell only.
  - Keep admin browser JS/CSS separate if feasible.

- `src/admin/app.js`
  - Browser-side admin app logic.

- `src/admin/styles.css`
  - Admin dashboard styles.

Acceptance:

- No single file over roughly 300 lines unless it is generated/vendor code.
- Worker still deploys with Wrangler.
- Existing draft/publish flow still works.

## Phase 2: Dashboard Sidebar UX

Replace the current sidebar with a normal dashboard layout:

- Left app sidebar:
  - Dashboard
  - Posts
  - Pages / Landing
  - Navigation
  - Footer
  - Deployments
  - Settings

- Main area changes by selected section.
- Posts section:
  - Shows post list/table first.
  - Clicking a post opens editor view.
  - `New post` opens editor view.
  - List should show title, slug, status, updated date, latest deploy status.

- Deployments section:
  - Shows recent publish events.
  - Commit SHA, GitHub Pages status, live URL, errors.
  - Refresh-safe because status is persisted in D1.

Acceptance:

- Refresh keeps the same section/view where possible.
- Posts are not always visible beside every settings page.
- Progress is visible in a dedicated deployments view and on each post detail.

## Phase 3: Professional Editor Library

Use a real editor library.

Candidates:

- CKEditor 5
  - Mature.
  - Good paste handling.
  - Strong HTML editing UX.
  - CDN build can be used in Worker-rendered admin without bundling.

- TinyMCE
  - Mature and common CMS editor.
  - Good paste behavior.
  - CDN/API-key considerations need checking.

- TipTap/ProseMirror
  - More app-like and extensible.
  - Requires bundling, more setup.

Preferred first implementation:

- CKEditor 5 CDN build for quickest reliable upgrade.
- Store editor output as `body_html` in D1.
- Keep source as HTML because static client rendering expects HTML.

Editor fields:

- Title
- Slug
- Excerpt
- Cover image URL
- SEO title
- SEO description
- Rich content editor
- Status

Editor actions:

- Save draft
- Preview
- Publish
- Delete

Acceptance:

- Copy/paste from browser/docs works better than textarea.
- Editor content saves and reloads correctly.
- Published post HTML remains valid enough for static rendering.

## Phase 4: Real Website Model

A CMS-managed website should have more than a hero and post list.

Site settings:

- Site name
- Logo text or logo URL
- Favicon URL
- Default SEO title
- Default SEO description
- Accent color
- Custom CSS

Navigation:

- Header nav items:
  - Label
  - URL
  - Sort order
  - Open in new tab

- Optional CTA:
  - Label
  - URL

Footer:

- Footer text
- Footer nav links
- Social links
- Copyright

Landing page:

- Hero:
  - Heading
  - Subheading
  - Primary CTA label/url
  - Secondary CTA label/url

- Sections:
  - Intro rich text
  - Featured posts
  - Custom HTML block

Post pages:

- Header nav
- Main article
- Related/recent posts
- Footer
- SEO meta tags

Generated static files:

- `index.html`
- `style.css`
- `posts.json`
- `posts/<slug>/index.html`
- Optional later:
  - `sitemap.xml`
  - `rss.xml`

Acceptance:

- Generated site looks like a coherent professional static site.
- Nav/footer are shared across home and post pages.
- Landing settings are stored in D1 and publish to GitHub Pages.

## Phase 5: Data Model And Migrations

Add/adjust D1 schema:

- `posts`
  - Add `cover_image_url`
  - Add `seo_title`
  - Add `seo_description`
  - Keep deploy fields.

- `site_settings`
  - Keep key/value for simple global settings or migrate to JSON sections.

- `navigation_items`
  - `id`
  - `label`
  - `url`
  - `sort_order`
  - `target`
  - `created_at`
  - `updated_at`

- `footer_links`
  - Similar to nav items.

- `deployments`
  - Better than storing only latest deploy fields on posts.
  - Track commit, type (`post`, `landing`, `site`), status, live URL, error.

Acceptance:

- Migrations are additive.
- Existing posts keep working.
- `/api/health` checks the important tables.

## Phase 6: Publish Flow

Publish types:

- Publish one post:
  - Save/update post in D1.
  - Generate post page.
  - Regenerate home page because post list may change.
  - Regenerate CSS if settings changed.
  - Commit one tree to GitHub.
  - Create deployment row.
  - Poll GitHub Pages status.

- Publish site:
  - Regenerate all pages.
  - Commit one tree.
  - Track deployment.

Acceptance:

- Admin always shows commit SHA and status.
- Refresh-safe deployment tracking.
- Errors are visible and persisted.

## Phase 7: Implementation Order

Recommended order:

1. Refactor modules without changing behavior. Done in `src/router.js`, `src/posts.js`, `src/site.js`, `src/github.js`, `src/render/*`, and `src/admin/*`.
2. Add dashboard routing/layout. Done with a left dashboard sidebar and separate views.
3. Replace textarea with CKEditor 5. Done through the CKEditor 5 CDN classic editor.
4. Add post fields: cover image and SEO. Done in migration `0004_cms_model.sql`.
5. Add site settings/nav/footer schema. Done in migration `0004_cms_model.sql`.
6. Add admin screens for site/nav/footer. Done.
7. Rewrite static render templates for professional site output. Done for home/post pages with shared header/footer.
8. Improve deployment model into a `deployments` table. Done in migration `0004_cms_model.sql`.
9. Add full-site publish. Done via `/api/publish-site`.
10. Clean up old prototype code and dead helpers. Done by replacing the prototype `src/index.js` with modules.

## Open Decisions

- Use CKEditor 5 CDN or bundle it with a build step?
- Keep admin as Worker-rendered HTML or move admin UI to a small Vite app served by Worker assets?
- Store site settings as key/value rows or one JSON document?
- Should publish regenerate all posts every time or only touched files plus shared files?
- Should images be URL-only first, or support upload/storage later?
