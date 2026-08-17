import { escapeHtml } from "../http.js";

export function renderAdminShell(env) {
  const title = escapeHtml(env.SITE_TITLE || "Static CMS");
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} Admin</title>
  <link rel="stylesheet" href="/admin/styles.css">
  <script src="https://cdn.ckeditor.com/ckeditor5/38.1.1/classic/ckeditor.js"></script>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <strong>${title}</strong>
        <span>Static CMS</span>
      </div>
      <nav class="nav" id="nav">
        <button data-view="dashboard" class="active">Dashboard <span>Overview</span></button>
        <button data-view="posts">Posts <span>Content</span></button>
        <button data-view="landing">Landing <span>Home</span></button>
        <button data-view="navigation">Navigation <span>Header</span></button>
        <button data-view="footer">Footer <span>Links</span></button>
        <button data-view="deployments">Deployments <span>Status</span></button>
        <button data-view="settings">Settings <span>Site</span></button>
      </nav>
      <a class="logout" href="/logout">Logout</a>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <h1 id="viewTitle">Dashboard</h1>
          <p id="viewSubtitle">Site activity and publish state.</p>
        </div>
        <div class="actions">
          <button class="secondary" id="refreshAll" type="button">Refresh</button>
          <button id="publishSite" type="button">Publish site</button>
        </div>
      </header>

      <div class="content">
        <section class="view active" id="dashboardView">
          <div class="grid three">
            <div class="panel"><h2>Posts</h2><p class="muted" id="dashPosts">Loading...</p></div>
            <div class="panel"><h2>Latest deploy</h2><p class="muted" id="dashDeploy">Loading...</p></div>
            <div class="panel"><h2>GitHub Pages</h2><p class="muted" id="dashPages">Use Deployments to track builds.</p></div>
          </div>
        </section>

        <section class="view" id="postsView">
          <div class="panel">
            <div class="actions" style="justify-content: space-between; margin-bottom: 12px;">
              <h2 style="margin:0;">Posts</h2>
              <button id="newPost" type="button">New post</button>
            </div>
            <table class="table">
              <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th>Deploy</th></tr></thead>
              <tbody id="postsTable"></tbody>
            </table>
          </div>
        </section>

        <section class="view" id="postEditorView">
          <form id="postForm" class="editor-shell">
            <div class="panel">
              <h2 id="editorHeading">New post</h2>
              <input type="hidden" id="post_id">
              <label>Title <input id="title" required></label>
              <label>Slug <input id="slug" placeholder="auto-generated-from-title"></label>
              <label>Excerpt <textarea id="excerpt"></textarea></label>
              <label>Body</label>
              <textarea id="body_html"></textarea>
            </div>
            <aside class="panel">
              <h2>Publish settings</h2>
              <label>Cover image URL <input id="cover_image_url" placeholder="https://..."></label>
              <label>SEO title <input id="seo_title"></label>
              <label>SEO description <textarea id="seo_description"></textarea></label>
              <div class="actions">
                <button type="submit">Save draft</button>
                <button type="button" id="publishPost">Publish</button>
                <button type="button" class="danger" id="deletePost">Delete</button>
              </div>
              <p class="toast" id="postMessage"></p>
              <div class="deploy-card" id="postDeploy">
                <div class="deploy-line"><span>Commit</span><strong id="deployCommit">Idle</strong></div>
                <div class="deploy-line"><span>Pages</span><strong id="deployPages">Idle</strong></div>
                <div class="deploy-line"><span>Live</span><strong id="deployLive">Idle</strong></div>
              </div>
            </aside>
          </form>
        </section>

        <section class="view" id="landingView">
          <form id="landingForm" class="grid two">
            <div class="panel">
              <h2>Landing content</h2>
              <label>Hero title <input id="hero_title"></label>
              <label>Hero subtitle <textarea id="hero_subtitle"></textarea></label>
              <label>Primary CTA label <input id="primary_cta_label"></label>
              <label>Primary CTA URL <input id="primary_cta_url"></label>
              <label>Secondary CTA label <input id="secondary_cta_label"></label>
              <label>Secondary CTA URL <input id="secondary_cta_url"></label>
              <label>Intro HTML <textarea id="intro_html"></textarea></label>
              <label>Custom HTML section <textarea id="custom_html"></textarea></label>
            </div>
            <div class="panel">
              <h2>Landing display</h2>
              <label>Featured posts count <input id="featured_posts_count" type="number" min="1" max="24"></label>
              <div class="actions">
                <button type="submit">Save landing</button>
                <button type="button" id="publishLanding">Publish landing</button>
              </div>
              <p class="toast" id="landingMessage"></p>
            </div>
          </form>
        </section>

        <section class="view" id="navigationView">
          <div class="panel">
            <div class="actions" style="justify-content: space-between; margin-bottom: 12px;">
              <h2 style="margin:0;">Header navigation</h2>
              <button id="addNavItem" type="button">Add link</button>
            </div>
            <div class="link-list" id="navItems"></div>
            <div class="grid two" style="margin-top: 16px;">
              <label>CTA label <input id="nav_cta_label"></label>
              <label>CTA URL <input id="nav_cta_url"></label>
            </div>
            <button id="saveNavigation" type="button">Save navigation</button>
            <p class="toast" id="navMessage"></p>
          </div>
        </section>

        <section class="view" id="footerView">
          <div class="panel">
            <h2>Footer</h2>
            <label>Footer text <textarea id="footer_text"></textarea></label>
            <div class="actions" style="justify-content: space-between; margin-bottom: 12px;">
              <h2 style="margin:0;">Footer links</h2>
              <button id="addFooterItem" type="button">Add link</button>
            </div>
            <div class="link-list" id="footerItems"></div>
            <button id="saveFooter" type="button">Save footer</button>
            <p class="toast" id="footerMessage"></p>
          </div>
        </section>

        <section class="view" id="deploymentsView">
          <div class="panel">
            <h2>Deployments</h2>
            <table class="table">
              <thead><tr><th>Type</th><th>Status</th><th>Commit</th><th>Live</th><th>Updated</th></tr></thead>
              <tbody id="deploymentsTable"></tbody>
            </table>
          </div>
        </section>

        <section class="view" id="settingsView">
          <form id="settingsForm" class="grid two">
            <div class="panel">
              <h2>Identity</h2>
              <label>Site name <input id="site_title"></label>
              <label>Logo text <input id="logo_text"></label>
              <label>Logo URL <input id="logo_url"></label>
              <label>Favicon URL <input id="favicon_url"></label>
              <label>Accent color <input id="accent_color" type="color"></label>
            </div>
            <div class="panel">
              <h2>SEO and CSS</h2>
              <label>Default SEO title <input id="default_seo_title"></label>
              <label>Default SEO description <textarea id="default_seo_description"></textarea></label>
              <label>Custom CSS <textarea id="custom_css"></textarea></label>
              <button type="submit">Save settings</button>
              <p class="toast" id="settingsMessage"></p>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
  <script src="/admin/app.js"></script>
</body>
</html>`;
}

export function renderLoginPage(error = "") {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMS Login</title>
  <link rel="stylesheet" href="/admin/styles.css">
</head>
<body>
  <main style="min-height: 100vh; display: grid; place-items: center;">
    <form class="panel" method="post" style="width: min(360px, calc(100vw - 32px));">
      <h1>CMS Admin</h1>
      <label>Password <input type="password" name="password" required autofocus></label>
      <button>Login</button>
      <p class="toast">${escapeHtml(error)}</p>
    </form>
  </main>
</body>
</html>`;
}
