import { escapeHtml } from "../http.js";

export function renderPostHtml(env, post, site) {
  const title = escapeHtml(post.seo_title || post.title);
  const description = escapeHtml(post.seo_description || post.excerpt || site.default_seo_description || "");
  return pageShell({
    title,
    description,
    favicon: site.favicon_url,
    bodyClass: "post-template",
    stylesheet: "../../style.css",
    header: renderSiteHeader(site, "../../"),
    main: `<main class="content-shell">
      <article class="document">
        <header class="document-head">
          <a class="back-link" href="../../">Home</a>
          <p class="eyebrow">${escapeHtml(formatDate(post.published_at || post.updated_at))}</p>
          <h1>${escapeHtml(post.title)}</h1>
          ${post.excerpt ? `<p class="lead">${escapeHtml(post.excerpt)}</p>` : ""}
        </header>
        ${post.cover_image_url ? `<img class="feature-media" src="${escapeHtml(post.cover_image_url)}" alt="">` : ""}
        <div class="prose">${post.body_html || ""}</div>
      </article>
    </main>`,
    footer: renderSiteFooter(site, "../../")
  });
}

export function renderPageHtml(env, page, site) {
  const title = escapeHtml(page.seo_title || page.title);
  const description = escapeHtml(page.seo_description || site.default_seo_description || "");
  return pageShell({
    title,
    description,
    favicon: site.favicon_url,
    bodyClass: "page-template",
    stylesheet: "../../style.css",
    header: renderSiteHeader(site, "../../"),
    main: `<main class="content-shell">
      <article class="document">
        <header class="document-head">
          <a class="back-link" href="../../">Home</a>
          <h1>${escapeHtml(page.title)}</h1>
        </header>
        <div class="prose">${page.body_html || ""}</div>
      </article>
    </main>`,
    footer: renderSiteFooter(site, "../../")
  });
}

export function renderLandingHtml(env, posts, pages, site) {
  const title = escapeHtml(site.default_seo_title || site.site_title || env.SITE_TITLE || "Static CMS");
  const description = escapeHtml(site.default_seo_description || site.hero_subtitle || "");
  const featured = posts.slice(0, Number(site.featured_posts_count || 6));
  const visiblePages = (pages || []).filter((page) => page.show_in_nav);
  return pageShell({
    title,
    description,
    favicon: site.favicon_url,
    bodyClass: "home-template",
    stylesheet: "style.css",
    header: renderSiteHeader(site),
    main: `<main>
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">${escapeHtml(site.site_title || "Static CMS")}</p>
          <h1>${escapeHtml(site.hero_title || site.site_title || "Static CMS")}</h1>
          ${site.hero_subtitle ? `<p class="lead">${escapeHtml(site.hero_subtitle)}</p>` : ""}
          <div class="hero-actions">
            ${site.primary_cta_label && site.primary_cta_url ? `<a class="button" href="${escapeHtml(site.primary_cta_url)}">${escapeHtml(site.primary_cta_label)}</a>` : ""}
            ${site.secondary_cta_label && site.secondary_cta_url ? `<a class="button secondary" href="${escapeHtml(site.secondary_cta_url)}">${escapeHtml(site.secondary_cta_label)}</a>` : ""}
          </div>
        </div>
      </section>
      ${site.intro_html ? `<section class="content-band"><div class="prose">${site.intro_html}</div></section>` : ""}
      ${visiblePages.length ? `<section class="index-section">
        <div class="section-head">
          <p class="eyebrow">Pages</p>
          <h2>Explore</h2>
        </div>
        <div class="link-grid">${visiblePages.map((page) => `<a class="index-link" href="pages/${escapeHtml(page.slug)}/"><span>${escapeHtml(page.title)}</span></a>`).join("")}</div>
      </section>` : ""}
      <section class="index-section" id="latest">
        <div class="section-head">
          <p class="eyebrow">Latest</p>
          <h2>Articles</h2>
        </div>
        <div class="post-list">${featured.length ? featured.map(renderPostCard).join("") : `<p class="empty-state">No published posts yet.</p>`}</div>
      </section>
      ${site.custom_html ? `<section class="content-band"><div class="prose">${site.custom_html}</div></section>` : ""}
    </main>`,
    footer: renderSiteFooter(site)
  });
}

export function renderStyleCss(site) {
  const accent = /^#[0-9a-fA-F]{6}$/.test(site.accent_color || "") ? site.accent_color : "#2563eb";
  return `:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #15171a;
  background: #f7f7f5;
  --accent: ${accent};
  --surface: #ffffff;
  --ink: #15171a;
  --muted: #676f7a;
  --line: #dfe3e8;
  --soft: #f0f2f4;
}

* { box-sizing: border-box; }
html { background: #f7f7f5; }
body { margin: 0; background: #f7f7f5; color: var(--ink); }
a { color: inherit; }
img { max-width: 100%; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 66px;
  padding: 14px max(20px, calc((100vw - 1120px) / 2));
  background: rgba(247,247,245,.92);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(12px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--ink);
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
}
.brand img { height: 30px; max-width: 180px; object-fit: contain; }

.site-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  flex-wrap: wrap;
}
.site-nav a {
  color: var(--muted);
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}
.site-nav a:hover { color: var(--ink); }
.site-nav .nav-cta {
  color: #fff;
  background: var(--accent);
  border-radius: 8px;
  padding: 8px 12px;
}

.hero,
.index-section,
.content-band,
.content-shell {
  width: min(1120px, calc(100vw - 40px));
  margin: 0 auto;
}

.hero {
  display: grid;
  align-items: end;
  min-height: 46vh;
  padding: 78px 0 46px;
  border-bottom: 1px solid var(--line);
}
.hero-inner { max-width: 780px; }
.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  max-width: 920px;
  font-size: clamp(42px, 7vw, 78px);
  line-height: .98;
  font-weight: 850;
}
.lead {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}
.button {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 9px 14px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}
.button.secondary {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
}

.content-band {
  padding: 34px 0;
  border-bottom: 1px solid var(--line);
}
.index-section { padding: 38px 0; border-bottom: 1px solid var(--line); }
.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}
.section-head h2 { margin: 0; font-size: 28px; line-height: 1.15; }

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}
.index-link {
  display: flex;
  min-height: 78px;
  align-items: center;
  padding: 16px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  background: var(--surface);
  font-weight: 800;
  text-decoration: none;
}
.index-link:hover { background: var(--soft); }

.post-list {
  display: grid;
  gap: 0;
  border-top: 1px solid var(--line);
}
.post-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 22px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}
.post-card.without-image { grid-template-columns: minmax(0, 1fr); }
.post-card a { text-decoration: none; }
.post-card h3 {
  margin: 6px 0 8px;
  color: var(--ink);
  font-size: 25px;
  line-height: 1.16;
}
.post-card p {
  margin: 0;
  max-width: 680px;
  color: var(--muted);
  line-height: 1.6;
}
.post-card time {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}
.post-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}
.empty-state { color: var(--muted); }

.content-shell { padding: 52px 0 64px; }
.document {
  width: min(820px, 100%);
}
.document-head {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line);
}
.document-head h1 { font-size: clamp(38px, 6vw, 66px); }
.back-link {
  display: inline-flex;
  margin-bottom: 20px;
  color: var(--muted);
  font-weight: 750;
  text-decoration: none;
}
.feature-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  margin: 28px 0 0;
  border-radius: 8px;
}
.prose {
  margin-top: 28px;
  color: var(--ink);
  font-size: 18px;
  line-height: 1.78;
}
.prose :where(h2, h3) {
  margin: 1.8em 0 .55em;
  line-height: 1.2;
}
.prose p { margin: 0 0 1.1em; }
.prose a { color: var(--accent); }
.prose img {
  height: auto;
  border-radius: 8px;
}
.prose blockquote {
  margin: 1.5em 0;
  padding-left: 18px;
  border-left: 3px solid var(--accent);
  color: var(--muted);
}

.site-footer {
  padding: 28px max(20px, calc((100vw - 1120px) / 2));
  border-top: 1px solid var(--line);
  color: var(--muted);
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.footer-links {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.footer-links a {
  color: var(--muted);
  text-decoration: none;
}

@media (max-width: 760px) {
  .site-header {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .site-nav {
    justify-content: flex-start;
    gap: 12px;
  }
  .hero,
  .index-section,
  .content-band,
  .content-shell {
    width: min(100% - 28px, 1120px);
  }
  .hero { min-height: auto; padding: 46px 0 34px; }
  .lead { font-size: 18px; }
  .post-card { grid-template-columns: 1fr; }
  .post-card img { aspect-ratio: 16 / 9; }
}

${site.custom_css || ""}
`;
}

function pageShell({ title, description, favicon, bodyClass, stylesheet, header, main, footer }) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${favicon ? `<link rel="icon" href="${escapeHtml(favicon)}">` : ""}
  <link rel="stylesheet" href="${stylesheet}">
</head>
<body class="${bodyClass}">
  ${header}
  ${main}
  ${footer}
</body>
</html>`;
}

function renderPostCard(post) {
  const hasImage = Boolean(post.cover_image_url);
  return `<article class="post-card ${hasImage ? "" : "without-image"}">
  <a href="posts/${escapeHtml(post.slug)}/">
    <time>${escapeHtml(formatDate(post.published_at || post.updated_at))}</time>
    <h3>${escapeHtml(post.title)}</h3>
    ${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ""}
  </a>
  ${hasImage ? `<a href="posts/${escapeHtml(post.slug)}/"><img src="${escapeHtml(post.cover_image_url)}" alt=""></a>` : ""}
</article>`;
}

function renderSiteHeader(site, prefix = "") {
  const pageLinks = (site.pages || [])
    .filter((page) => page.show_in_nav)
    .map((page) => `<a href="${prefix}pages/${escapeHtml(page.slug)}/">${escapeHtml(page.title)}</a>`)
    .join("");
  const customLinks = (site.navigation || []).map((item) => `<a href="${escapeHtml(item.url)}" ${item.target === "_blank" ? 'target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label)}</a>`).join("");
  const cta = site.nav_cta_label && site.nav_cta_url ? `<a class="nav-cta" href="${escapeHtml(site.nav_cta_url)}">${escapeHtml(site.nav_cta_label)}</a>` : "";
  return `<header class="site-header">
    <a class="brand" href="${prefix || "./"}">${site.logo_url ? `<img src="${escapeHtml(site.logo_url)}" alt="${escapeHtml(site.logo_text || site.site_title)}">` : escapeHtml(site.logo_text || site.site_title || "Static CMS")}</a>
    <nav class="site-nav">${pageLinks}${customLinks}${cta}</nav>
  </header>`;
}

function renderSiteFooter(site, prefix = "") {
  const links = (site.footer_links || []).map((item) => `<a href="${escapeHtml(item.url)}" ${item.target === "_blank" ? 'target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label)}</a>`).join("");
  return `<footer class="site-footer">
    <div class="footer-inner">
      <div>${site.footer_text ? site.footer_text : `&copy; ${new Date().getFullYear()} ${escapeHtml(site.site_title || "Static CMS")}`}</div>
      <nav class="footer-links">${links}</nav>
    </div>
  </footer>`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "";
}
