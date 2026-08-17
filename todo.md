# CMS Rework Todo

## Current Problem

The current admin is a prototype. It works for drafts, publishing, D1, GitHub commit, and basic GitHub Pages tracking, but the structure and UX are not good enough for a real CMS.

Main issues:

- `src/index.js` contains routing, database access, GitHub publishing, HTML rendering, admin UI, client template rendering, and browser JS in one file.
- The admin sidebar is not a real dashboard navigation model.
- The post editor is hand-rolled instead of using a proven rich text editor.
- Landing page editing is too shallow and does not model a professional website.
- Client site generation only covers a simple home page and posts. It needs nav, footer, layout settings, SEO fields, and reasonable content blocks.
- The current dashboard implementation is functional but still visually weak compared with mature admin templates.
- Publish feedback is too quiet. The user needs an explicit modal/progress experience that survives ambiguity.
- Client theme output is still too plain. A CMS needs selectable site themes, not just settings fields.

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

Design research direction:

- Use mature dashboard references before changing UI again.
- Prefer practical admin template patterns over decorative landing-page UI.
- References to study:
  - Tabler: clean responsive admin components and layout system.
  - AdminLTE: proven admin/dashboard structure.
  - Figma dashboard templates: spacing, component hierarchy, table/card patterns.
  - Dribbble CMS dashboard search only for visual inspiration, not for copying decorative layouts.

Dashboard improvement tasks:

- Redesign admin shell around a `sidebar + topbar + content` layout with stronger hierarchy.
- Add active nav affordance, section subtitles, compact action buttons, and consistent table/card rhythm.
- Make Posts a list-first workflow:
  - Posts table as the default.
  - Editor opens as detail route/view.
  - Back to posts action.
  - Search/filter by status.
- Make Deployments a real operational view:
  - Status chips.
  - Commit links.
  - Live URL.
  - Error detail.
  - Last checked timestamp.
- Use calmer CMS palette and spacing:
  - Avoid the current rough prototype look.
  - Aim for Tabler/AdminLTE-level clarity.

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

Follow-up editor tasks:

- Improve CKEditor integration beyond basic CDN load:
  - Add image insert by URL.
  - Add heading, quote, lists, table, link, undo/redo.
  - Add word/count or saved state indicator if possible.
  - Handle CKEditor load failure with a clear fallback message.
- Split editor layout into content and metadata panels:
  - Content: title, excerpt, rich body.
  - Metadata: slug, cover image, SEO title, SEO description, status.
- Add preview action:
  - Render post preview in modal or side panel.
  - Use the same client theme CSS where possible.

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

Theme system tasks:

- Add a dedicated `Theme` admin section.
- Provide at least two polished built-in client themes:
  - `Editorial`: article-focused, magazine/blog style, strong typography, clean post cards.
  - `Studio`: professional landing/site style, stronger hero, CTA sections, more product/portfolio feel.
- Store selected theme in D1 site settings:
  - `theme_id`
  - optional `theme_variant`
- Static renderer should select templates/styles by theme:
  - `renderLandingHtml(theme, site, posts)`
  - `renderPostHtml(theme, site, post)`
  - `renderStyleCss(theme, site)`
- Theme fields should be reasonable:
  - Site identity.
  - Header nav.
  - Footer.
  - Hero.
  - CTA.
  - Featured posts.
  - Custom HTML/CSS override.
- Theme preview:
  - Show thumbnail/card for each built-in theme.
  - Show current selected theme.
  - Publish site after theme switch.
- Avoid blank/minimal placeholder output. Each built-in theme must look presentable with only title, intro, and posts.

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

Publish modal UX tasks:

- Show a modal immediately when publish starts.
- Modal states:
  - `Saving draft`
  - `Creating GitHub commit`
  - `Waiting for GitHub Pages`
  - `Live`
  - `Failed`
- Visual treatment:
  - Loading state with spinner/rotating mark and a tasteful emoji.
  - Success state with green check.
  - Failure state with red warning.
  - Clear color system, not random colors.
- Modal actions:
  - Disable close during critical commit step, allow close while waiting for Pages.
  - On success show:
    - Open live URL
    - View GitHub commit
    - Close
  - On failure show:
    - Error detail
    - Retry status check
    - Close
- Persist modal progress:
  - If user refreshes while deployment is pending, show the deployment status in Deployments and optionally reopen a non-blocking status panel.
- Do not replace the Deployments page; modal is for immediate publish feedback, Deployments is for history/tracking.

## Phase 7: Implementation Order

Recommended order:

1. Refactor modules without changing behavior. Done in `src/router.js`, `src/posts.js`, `src/site.js`, `src/github.js`, `src/render/*`, and `src/admin/*`.
2. Add dashboard routing/layout. First pass done; needs design polish from the new dashboard improvement tasks.
3. Replace textarea with CKEditor 5. First pass done; needs richer CKEditor configuration and preview.
4. Add post fields: cover image and SEO. Done in migration `0004_cms_model.sql`.
5. Add site settings/nav/footer schema. Done in migration `0004_cms_model.sql`.
6. Add admin screens for site/nav/footer. First pass done; needs UI polish.
7. Rewrite static render templates for professional site output. First pass done; needs theme system.
8. Improve deployment model into a `deployments` table. Done in migration `0004_cms_model.sql`.
9. Add full-site publish. Done via `/api/publish-site`.
10. Clean up old prototype code and dead helpers. Done by replacing the prototype `src/index.js` with modules.

Next implementation order:

1. Redesign admin dashboard using Tabler/AdminLTE-style patterns. Implemented first polish pass with cleaner sidebar/topbar/cards/tables.
2. Add publish progress modal with loading/success/error states. Done for post and site publish.
3. Add Theme section and `theme_id` setting. Done in migration `0005_theme_system.sql`.
4. Implement two built-in client themes: `Editorial` and `Studio`. Done in `src/render/client.js`.
5. Wire static renderer to selected theme. Done.
6. Add theme preview cards and publish-site action after theme changes. Done.
7. Improve CKEditor toolbar/config and add preview. Done with richer toolbar, image URL insertion, and post preview modal.

## Open Decisions

- Use CKEditor 5 CDN or bundle it with a build step?
- Keep admin as Worker-rendered HTML or move admin UI to a small Vite app served by Worker assets?
- Store site settings as key/value rows or one JSON document?
- Should publish regenerate all posts every time or only touched files plus shared files?
- Should images be URL-only first, or support upload/storage later?
- Should dashboard UI adopt an existing CSS library/template like Tabler directly, or keep custom CSS inspired by it?
- Should themes be plain CSS/template functions first, or should each theme have its own config schema?
- Should publish modal appear for site publish, post publish, or both? Current desired answer: both.

## Research Notes

- Dashboard references reviewed:
  - Tabler emphasizes production-ready responsive admin components and a clean UI system.
  - AdminLTE-style templates show the expected admin IA: sidebar, topbar, cards, tables, dense forms.
  - Dashboard design pattern articles emphasize surfacing key data with clear hierarchy and low visual noise.
  - Dribbble/Figma are useful for inspiration, but implementation should stay practical and CMS-oriented.
- Theme references reviewed:
  - CMS theme docs describe a theme as a collection of CSS/resources that define visual identity.
  - Website template catalogs reinforce that a presentable site needs typography, spacing, nav/footer, CTA, and reusable sections, not just a blank page with a title.
