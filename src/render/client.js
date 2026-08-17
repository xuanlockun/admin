import { escapeHtml } from "../http.js";

export function renderPostHtml(env, post, site) {
  const title = escapeHtml(post.seo_title || post.title);
  const description = escapeHtml(post.seo_description || post.excerpt || site.default_seo_description || "");
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${site.favicon_url ? `<link rel="icon" href="${escapeHtml(site.favicon_url)}">` : ""}
  <link rel="stylesheet" href="../../style.css">
</head>
<body>
  ${renderSiteHeader(site, "../../")}
  <main class="article-shell">
    <article class="article">
      ${post.cover_image_url ? `<img class="article-cover" src="${escapeHtml(post.cover_image_url)}" alt="">` : ""}
      <p class="eyebrow">${escapeHtml(formatDate(post.published_at || post.updated_at))}</p>
      <h1>${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p class="article-excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      <div class="article-body">${post.body_html || ""}</div>
    </article>
  </main>
  ${renderSiteFooter(site, "../../")}
</body>
</html>`;
}

export function renderLandingHtml(env, posts, site) {
  const title = escapeHtml(site.default_seo_title || site.site_title || env.SITE_TITLE || "Static CMS");
  const description = escapeHtml(site.default_seo_description || site.hero_subtitle || "");
  const featured = posts.slice(0, Number(site.featured_posts_count || 6)).map((post) => `<article class="post-card">
  <a href="posts/${escapeHtml(post.slug)}/">
    ${post.cover_image_url ? `<img src="${escapeHtml(post.cover_image_url)}" alt="">` : ""}
    <span>${escapeHtml(formatDate(post.published_at || post.updated_at))}</span>
    <h2>${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.excerpt || "")}</p>
  </a>
</article>`).join("\n");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${site.favicon_url ? `<link rel="icon" href="${escapeHtml(site.favicon_url)}">` : ""}
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${renderSiteHeader(site)}
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(site.site_title || "Static CMS")}</p>
        <h1>${escapeHtml(site.hero_title || site.site_title || "Static CMS")}</h1>
        <p>${escapeHtml(site.hero_subtitle || "")}</p>
        <div class="hero-actions">
          ${site.primary_cta_label && site.primary_cta_url ? `<a class="button" href="${escapeHtml(site.primary_cta_url)}">${escapeHtml(site.primary_cta_label)}</a>` : ""}
          ${site.secondary_cta_label && site.secondary_cta_url ? `<a class="button secondary" href="${escapeHtml(site.secondary_cta_url)}">${escapeHtml(site.secondary_cta_label)}</a>` : ""}
        </div>
      </div>
    </section>
    <section class="intro">${site.intro_html || ""}</section>
    <section class="post-section">
      <div class="section-head">
        <p class="eyebrow">Latest</p>
        <h2>Published articles</h2>
      </div>
      <div class="post-grid">${featured || "<p>No published posts yet.</p>"}</div>
    </section>
    ${site.custom_html ? `<section class="custom-section">${site.custom_html}</section>` : ""}
  </main>
  ${renderSiteFooter(site)}
</body>
</html>`;
}

export function renderStyleCss(site) {
  const accent = /^#[0-9a-fA-F]{6}$/.test(site.accent_color || "") ? site.accent_color : "#245c6f";
  return `:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #172026;
  background: #f7f8f4;
  --accent: ${accent};
  --line: #d9ddd5;
  --muted: #5d675f;
}

* { box-sizing: border-box; }
body { margin: 0; }
a { color: inherit; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px max(24px, calc((100vw - 1100px) / 2));
  background: rgba(247, 248, 244, 0.94);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(12px);
}

.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; text-decoration: none; }
.brand img { height: 32px; max-width: 160px; object-fit: contain; }
.site-nav { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.site-nav a { color: #334039; text-decoration: none; }
.site-nav .nav-cta { color: #fff; background: var(--accent); border-radius: 6px; padding: 9px 12px; }

main { width: min(1100px, calc(100vw - 32px)); margin: 0 auto; }
.hero { display: grid; align-items: end; min-height: 54vh; padding: 72px 0 44px; border-bottom: 1px solid var(--line); }
.eyebrow { color: var(--accent); font-weight: 800; margin: 0 0 10px; }
h1 { font-size: clamp(42px, 7vw, 82px); line-height: 0.95; margin: 0 0 18px; letter-spacing: 0; max-width: 880px; }
.hero p:not(.eyebrow) { color: var(--muted); font-size: 20px; line-height: 1.6; max-width: 720px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.button { display: inline-flex; align-items: center; min-height: 42px; padding: 10px 14px; border-radius: 6px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; }
.button.secondary { background: transparent; color: #172026; border: 1px solid var(--line); }
.intro, .custom-section { padding: 32px 0; font-size: 18px; line-height: 1.75; border-bottom: 1px solid var(--line); }
.post-section { padding: 38px 0 58px; }
.section-head { margin-bottom: 18px; }
.section-head h2 { margin: 0; font-size: 32px; }
.post-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
.post-card { border: 1px solid var(--line); border-radius: 8px; background: #fff; overflow: hidden; }
.post-card a { display: grid; gap: 10px; height: 100%; padding: 16px; text-decoration: none; }
.post-card img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; }
.post-card span, .meta { color: var(--muted); font-size: 13px; }
.post-card h2 { margin: 0; font-size: 22px; }
.post-card p { margin: 0; color: var(--muted); line-height: 1.55; }

.article-shell { width: min(820px, calc(100vw - 32px)); }
.article { padding: 54px 0; }
.article-cover { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; margin-bottom: 26px; }
.article-excerpt { color: var(--muted); font-size: 20px; line-height: 1.6; }
.article-body { margin-top: 28px; font-size: 18px; line-height: 1.78; }
.article-body img { max-width: 100%; height: auto; border-radius: 8px; }

.site-footer { border-top: 1px solid var(--line); padding: 26px max(24px, calc((100vw - 1100px) / 2)); color: var(--muted); }
.footer-inner { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.footer-links { display: flex; gap: 14px; flex-wrap: wrap; }
.footer-links a { text-decoration: none; color: var(--muted); }

@media (max-width: 720px) {
  .site-header { align-items: flex-start; flex-direction: column; }
  .site-nav { gap: 12px; }
  .hero { min-height: auto; padding-top: 48px; }
}

${site.custom_css || ""}
`;
}

function renderSiteHeader(site, prefix = "") {
  const links = (site.navigation || []).map((item) => `<a href="${escapeHtml(item.url)}" ${item.target === "_blank" ? 'target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label)}</a>`).join("");
  const cta = site.nav_cta_label && site.nav_cta_url ? `<a class="nav-cta" href="${escapeHtml(site.nav_cta_url)}">${escapeHtml(site.nav_cta_label)}</a>` : "";
  return `<header class="site-header">
    <a class="brand" href="${prefix || "./"}">${site.logo_url ? `<img src="${escapeHtml(site.logo_url)}" alt="${escapeHtml(site.logo_text || site.site_title)}">` : escapeHtml(site.logo_text || site.site_title || "Static CMS")}</a>
    <nav class="site-nav">${links}${cta}</nav>
  </header>`;
}

function renderSiteFooter(site) {
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
