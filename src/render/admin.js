import { escapeHtml } from "../http.js";

export function renderAdminShell(env) {
  const title = escapeHtml(env.SITE_TITLE || "Static CMS");
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} Admin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0/dist/css/tabler.min.css">
  <link rel="stylesheet" href="/admin/styles.css">
  <script src="https://cdn.ckeditor.com/ckeditor5/38.1.1/classic/ckeditor.js"></script>
</head>
<body>
  <div class="cms-shell">
    <aside class="cms-sidebar">
      <div class="cms-brand">
        <div class="cms-brand-mark">CMS</div>
        <div>
          <strong>${title}</strong>
          <span>Static publishing</span>
        </div>
      </div>

      <nav class="nav cms-nav" id="nav">
        <button data-view="dashboard" class="active" type="button"><span class="nav-main">Dashboard</span><span>Overview</span></button>
        <button data-view="posts" type="button"><span class="nav-main">Posts</span><span>Content</span></button>
        <button data-view="pages" type="button"><span class="nav-main">Pages</span><span>Static</span></button>
        <button data-view="landing" type="button"><span class="nav-main">Landing</span><span>Home</span></button>
        <button data-view="theme" type="button"><span class="nav-main">Theme</span><span>Design</span></button>
        <button data-view="navigation" type="button"><span class="nav-main">Navigation</span><span>Header</span></button>
        <button data-view="footer" type="button"><span class="nav-main">Footer</span><span>Links</span></button>
        <button data-view="deployments" type="button"><span class="nav-main">Deployments</span><span>Status</span></button>
        <button data-view="settings" type="button"><span class="nav-main">Settings</span><span>Site</span></button>
      </nav>

      <a class="cms-logout" href="/logout">Logout</a>
    </aside>

    <main class="cms-main">
      <header class="cms-topbar">
        <div>
          <div class="cms-breadcrumb">Admin / <span id="viewCrumb">Dashboard</span></div>
          <h1 id="viewTitle">Dashboard</h1>
          <p id="viewSubtitle">Site activity and publish state.</p>
        </div>
        <div class="cms-actions">
          <button class="btn btn-outline-secondary" id="refreshAll" type="button">Refresh</button>
          <button class="btn btn-outline-secondary" id="themeToggle" type="button">Dark</button>
          <button class="btn btn-primary" id="publishSite" type="button">Publish site</button>
        </div>
      </header>

      <div class="cms-content">
        <section class="view active" id="dashboardView">
          <div class="stat-grid">
            <div class="cms-card stat-card">
              <span>Total posts</span>
              <strong id="dashPosts">Loading...</strong>
            </div>
            <div class="cms-card stat-card">
              <span>Published</span>
              <strong id="dashPublished">-</strong>
            </div>
            <div class="cms-card stat-card">
              <span>Drafts</span>
              <strong id="dashDrafts">-</strong>
            </div>
            <div class="cms-card stat-card">
              <span>Pages</span>
              <strong id="dashPages">-</strong>
            </div>
            <div class="cms-card stat-card">
              <span>Latest deploy</span>
              <strong id="dashDeploy">Loading...</strong>
            </div>
          </div>
          <div class="cms-grid two-col">
            <div class="cms-card">
              <div class="card-head">
                <div>
                  <h2>Recent deployments</h2>
                </div>
                <button class="btn btn-outline-secondary btn-sm" type="button" data-jump="deployments">View all</button>
              </div>
              <div class="table-responsive">
                <table class="table cms-table">
                  <thead><tr><th>Type</th><th>Status</th><th>Updated</th></tr></thead>
                  <tbody id="dashboardDeployments"></tbody>
                </table>
              </div>
            </div>
            <div class="cms-card">
              <div class="card-head">
                <div>
                  <h2>Quick actions</h2>
                </div>
              </div>
              <div class="quick-actions">
                <button class="btn btn-primary" id="dashNewPost" type="button">New post</button>
                <button class="btn btn-outline-secondary" type="button" data-jump="pages">Edit pages</button>
                <button class="btn btn-outline-secondary" type="button" data-jump="theme">Edit theme</button>
                <button class="btn btn-outline-secondary" type="button" data-jump="navigation">Edit navigation</button>
              </div>
            </div>
          </div>
        </section>

        <section class="view" id="postsView">
          <div class="cms-card">
            <div class="card-head">
              <div>
                <h2>Posts</h2>
              </div>
              <button class="btn btn-primary" id="newPost" type="button">New post</button>
            </div>
            <div class="table-toolbar">
              <input class="form-control" id="postSearch" placeholder="Search title or slug">
              <select class="form-select" id="statusFilter">
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div class="table-responsive">
              <table class="table cms-table">
                <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th>Deploy</th></tr></thead>
                <tbody id="postsTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="view" id="pagesView">
          <div class="cms-card">
            <div class="card-head">
              <div><h2>Pages</h2></div>
              <button class="btn btn-primary" id="newPage" type="button">New page</button>
            </div>
            <div class="table-responsive">
              <table class="table cms-table">
                <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Nav</th><th>Updated</th></tr></thead>
                <tbody id="pagesTable"></tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="view" id="pageEditorView">
          <form id="pageForm" class="editor-layout">
            <div class="cms-card editor-main">
              <div class="card-head">
                <div><h2 id="pageEditorHeading">New page</h2></div>
                <button class="btn btn-outline-secondary btn-sm" type="button" data-jump="pages">Back to pages</button>
              </div>
              <input type="hidden" id="page_id">
              <label class="form-label">Title <input class="form-control" id="page_title" required></label>
              <label class="form-label">Body HTML <textarea class="form-control code-area" id="page_body_html"></textarea></label>
            </div>
            <aside class="editor-side">
              <div class="cms-card publish-card">
                <h2>Publish</h2>
                <div class="btn-list">
                  <button class="btn btn-primary" type="submit">Save</button>
                  <button class="btn btn-success" type="button" id="publishPage">Publish</button>
                  <button class="btn btn-danger" type="button" id="deletePage">Delete</button>
                </div>
                <p class="cms-toast" id="pageMessage"></p>
              </div>
              <div class="cms-card">
                <h2>Settings</h2>
                <label class="form-label">Slug <input class="form-control" id="page_slug" placeholder="about"></label>
                <label class="form-label">Sort order <input class="form-control" id="page_sort_order" type="number" value="0"></label>
                <label class="check-row"><input id="page_show_in_nav" type="checkbox" checked> Show in navigation</label>
                <label class="form-label">SEO title <input class="form-control" id="page_seo_title"></label>
                <label class="form-label">SEO description <textarea class="form-control" id="page_seo_description"></textarea></label>
              </div>
            </aside>
          </form>
        </section>

        <section class="view" id="postEditorView">
          <form id="postForm" class="editor-layout">
            <div class="cms-card editor-main">
              <div class="card-head">
                <div>
                  <h2 id="editorHeading">New post</h2>
                </div>
                <button class="btn btn-outline-secondary btn-sm" type="button" data-jump="posts">Back to posts</button>
              </div>
              <input type="hidden" id="post_id">
              <label class="form-label">Title <input class="form-control" id="title" required></label>
              <label class="form-label">Excerpt <textarea class="form-control" id="excerpt"></textarea></label>
              <label class="form-label">Body</label>
              <textarea id="body_html"></textarea>
            </div>
            <aside class="editor-side">
              <div class="cms-card publish-card">
                <h2>Publish</h2>
                <div class="btn-list">
                  <button class="btn btn-primary" type="submit">Save draft</button>
                  <button class="btn btn-outline-secondary" type="button" id="previewPost">Preview</button>
                  <button class="btn btn-outline-secondary" type="button" id="insertImage">Insert image</button>
                  <button class="btn btn-success" type="button" id="publishPost">Publish</button>
                  <button class="btn btn-danger" type="button" id="deletePost">Delete</button>
                </div>
                <p class="cms-toast" id="postMessage"></p>
              </div>
              <div class="cms-card">
                <h2>Metadata</h2>
                <label class="form-label">Slug <input class="form-control" id="slug" placeholder="auto-generated-from-title"></label>
                <label class="form-label">Cover image URL <input class="form-control" id="cover_image_url" placeholder="https://..."></label>
                <label class="form-label">SEO title <input class="form-control" id="seo_title"></label>
                <label class="form-label">SEO description <textarea class="form-control" id="seo_description"></textarea></label>
              </div>
              <div class="cms-card deploy-card" id="postDeploy">
                <h2>Latest deploy</h2>
                <div class="deploy-line"><span>Commit</span><strong id="deployCommit">Idle</strong></div>
                <div class="deploy-line"><span>Pages</span><strong id="deployPages">Idle</strong></div>
                <div class="deploy-line"><span>Live</span><strong id="deployLive">Idle</strong></div>
              </div>
            </aside>
          </form>
        </section>

        <section class="view" id="landingView">
          <form id="landingForm" class="cms-grid two-col">
            <div class="cms-card">
              <h2>Hero and content</h2>
              <label class="form-label">Hero title <input class="form-control" id="hero_title"></label>
              <label class="form-label">Hero subtitle <textarea class="form-control" id="hero_subtitle"></textarea></label>
              <div class="cms-grid two-col compact">
                <label class="form-label">Primary CTA label <input class="form-control" id="primary_cta_label"></label>
                <label class="form-label">Primary CTA URL <input class="form-control" id="primary_cta_url"></label>
                <label class="form-label">Secondary CTA label <input class="form-control" id="secondary_cta_label"></label>
                <label class="form-label">Secondary CTA URL <input class="form-control" id="secondary_cta_url"></label>
              </div>
              <label class="form-label">Intro HTML <textarea class="form-control" id="intro_html"></textarea></label>
              <label class="form-label">Custom HTML section <textarea class="form-control" id="custom_html"></textarea></label>
            </div>
            <div class="cms-card">
              <h2>Landing display</h2>
              <label class="form-label">Featured posts count <input class="form-control" id="featured_posts_count" type="number" min="1" max="24"></label>
              <div class="btn-list">
                <button class="btn btn-primary" type="submit">Save landing</button>
                <button class="btn btn-success" type="button" id="publishLanding">Publish landing</button>
              </div>
              <p class="cms-toast" id="landingMessage"></p>
            </div>
          </form>
        </section>

        <section class="view" id="themeView">
          <div class="cms-card">
            <div class="card-head">
              <div>
                <h2>Client themes</h2>
              </div>
              <button class="btn btn-primary" id="saveTheme" type="button">Save theme</button>
            </div>
            <div class="theme-grid">
              <label class="theme-card" data-theme-card="editorial">
                <input type="radio" name="theme_id" value="editorial">
                <div class="theme-preview editorial-preview">
                  <div class="theme-shot"></div>
                  <strong>Editorial</strong>
                  <span>Magazine typography, article-first rhythm, clean reading pages.</span>
                </div>
              </label>
              <label class="theme-card" data-theme-card="studio">
                <input type="radio" name="theme_id" value="studio">
                <div class="theme-preview studio-preview">
                  <div class="theme-shot"></div>
                  <strong>Studio</strong>
                  <span>Polished landing hero, rounded cards, CTA-focused presentation.</span>
                </div>
              </label>
            </div>
            <p class="cms-toast" id="themeMessage"></p>
          </div>
        </section>

        <section class="view" id="navigationView">
          <div class="cms-card">
            <div class="card-head">
              <div><h2>Header navigation</h2></div>
              <button class="btn btn-primary" id="addNavItem" type="button">Add link</button>
            </div>
            <div class="link-list" id="navItems"></div>
            <div class="cms-grid two-col compact">
              <label class="form-label">CTA label <input class="form-control" id="nav_cta_label"></label>
              <label class="form-label">CTA URL <input class="form-control" id="nav_cta_url"></label>
            </div>
            <button class="btn btn-primary" id="saveNavigation" type="button">Save navigation</button>
            <p class="cms-toast" id="navMessage"></p>
          </div>
        </section>

        <section class="view" id="footerView">
          <div class="cms-card">
            <h2>Footer</h2>
            <label class="form-label">Footer text <textarea class="form-control" id="footer_text"></textarea></label>
            <div class="card-head">
              <div><h2>Footer links</h2></div>
              <button class="btn btn-primary" id="addFooterItem" type="button">Add link</button>
            </div>
            <div class="link-list" id="footerItems"></div>
            <button class="btn btn-primary" id="saveFooter" type="button">Save footer</button>
            <p class="cms-toast" id="footerMessage"></p>
          </div>
        </section>

        <section class="view" id="deploymentsView">
          <div class="cms-card">
            <div class="card-head">
              <div><h2>Deployments</h2></div>
              <button class="btn btn-outline-secondary" type="button" id="refreshDeployments">Refresh</button>
            </div>
            <div class="table-responsive">
              <table class="table cms-table">
                <thead><tr><th>Type</th><th>Status</th><th>Updated</th></tr></thead>
                <tbody id="deploymentsTable"></tbody>
              </table>
            </div>
            <div class="pager">
              <button class="btn btn-outline-secondary btn-sm" type="button" id="deployPrev">Previous</button>
              <span id="deployPageInfo">Page 1 / 1</span>
              <button class="btn btn-outline-secondary btn-sm" type="button" id="deployNext">Next</button>
            </div>
          </div>
        </section>

        <section class="view" id="settingsView">
          <form id="settingsForm" class="cms-grid two-col">
            <div class="cms-card">
              <h2>Identity</h2>
              <label class="form-label">Site name <input class="form-control" id="site_title"></label>
              <label class="form-label">Logo text <input class="form-control" id="logo_text"></label>
              <label class="form-label">Logo URL <input class="form-control" id="logo_url"></label>
              <label class="form-label">Favicon URL <input class="form-control" id="favicon_url"></label>
              <label class="form-label">Accent color <input class="form-control form-control-color" id="accent_color" type="color"></label>
            </div>
            <div class="cms-card">
              <h2>SEO and CSS</h2>
              <label class="form-label">Default SEO title <input class="form-control" id="default_seo_title"></label>
              <label class="form-label">Default SEO description <textarea class="form-control" id="default_seo_description"></textarea></label>
              <label class="form-label">Custom CSS <textarea class="form-control" id="custom_css"></textarea></label>
              <button class="btn btn-primary" type="submit">Save settings</button>
              <p class="cms-toast" id="settingsMessage"></p>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>

  <div class="modal-backdrop hidden" id="publishModal" role="dialog" aria-modal="true">
    <div class="publish-modal">
      <div class="modal-mark" id="modalMark"></div>
      <h2 id="modalTitle">Publishing</h2>
      <p id="modalText">Preparing publish workflow.</p>
      <div class="modal-progress">
        <div class="modal-step" id="modalStepSave"><span>Save</span><strong>Waiting</strong></div>
        <div class="modal-step" id="modalStepCommit"><span>Commit</span><strong>Waiting</strong></div>
        <div class="modal-step" id="modalStepPages"><span>GitHub Pages</span><strong>Waiting</strong></div>
      </div>
      <div class="modal-actions">
        <a class="btn btn-outline-secondary hidden" id="modalLive" href="#" target="_blank" rel="noopener">Open live</a>
        <a class="btn btn-outline-secondary hidden" id="modalCommit" href="#" target="_blank" rel="noopener">View commit</a>
        <button class="btn btn-outline-secondary" id="modalClose" type="button">Close</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop hidden" id="previewModal" role="dialog" aria-modal="true">
    <div class="preview-modal">
      <div class="card-head">
        <div><h2>Post preview</h2></div>
        <button class="btn btn-outline-secondary" id="previewClose" type="button">Close</button>
      </div>
      <article class="preview-article" id="previewArticle"></article>
    </div>
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0/dist/css/tabler.min.css">
  <link rel="stylesheet" href="/admin/styles.css">
</head>
<body>
  <main class="login-shell">
    <form class="cms-card login-card" method="post">
      <div class="cms-brand login-brand">
        <div class="cms-brand-mark">CMS</div>
        <div>
          <strong>CMS Admin</strong>
          <span>Static publishing</span>
        </div>
      </div>
      <label class="form-label">Password <input class="form-control" type="password" name="password" required autofocus></label>
      <button class="btn btn-primary w-100">Login</button>
      <p class="cms-toast">${escapeHtml(error)}</p>
    </form>
  </main>
</body>
</html>`;
}
