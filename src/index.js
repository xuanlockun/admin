const COOKIE_NAME = "cms_session";

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/health" && request.method === "GET") return await health(env);
      if (url.pathname === "/login") {
        return request.method === "POST" ? await login(request, env) : html(loginPage());
      }

      if (url.pathname === "/logout") {
        return redirect("/login", { "Set-Cookie": expiredCookie() });
      }

      if (!(await isAuthed(request, env))) {
        if (url.pathname.startsWith("/api/")) return json({ error: "Unauthorized" }, 401);
        return redirect("/login");
      }

      if (url.pathname === "/") return html(adminPage(env));
      if (url.pathname === "/api/posts" && request.method === "GET") return await listPosts(env);
      if (url.pathname === "/api/posts" && request.method === "POST") return await savePost(request, env);
      if (url.pathname.startsWith("/api/posts/") && request.method === "GET") return await getPost(url, env);
      if (url.pathname.startsWith("/api/posts/") && request.method === "DELETE") return await deletePost(url, env);
      if (url.pathname.startsWith("/api/publish/") && request.method === "POST") return await publishPost(url, env);
      if (url.pathname.startsWith("/api/pages-build/") && request.method === "GET") return await pagesBuildStatus(url, env);

      return new Response("Not found", { status: 404 });
    } catch (error) {
      const url = new URL(request.url);
      const message = error?.message || String(error);
      if (url.pathname.startsWith("/api/")) return json({ error: message }, 500);
      return html(loginPage(message), 500);
    }
  }
};

async function login(request, env) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return html(loginPage("Sai mật khẩu."), 401);
  }

  return redirect("/", {
    "Set-Cookie": `${COOKIE_NAME}=${await sessionValue(env)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  });
}

async function isAuthed(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const session = cookie.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${COOKIE_NAME}=`));
  return Boolean(env.ADMIN_PASSWORD && session === `${COOKIE_NAME}=${await sessionValue(env)}`);
}

async function sessionValue(env) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.ADMIN_PASSWORD));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function listPosts(env) {
  assertDatabase(env);
  const result = await env.DB.prepare(
    "SELECT id, title, slug, excerpt, status, created_at, updated_at, published_at FROM posts ORDER BY updated_at DESC"
  ).all();
  return json({ posts: result.results || [] });
}

async function getPost(url, env) {
  assertDatabase(env);
  const id = Number(url.pathname.split("/").pop());
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
  if (!post) return json({ error: "Post not found" }, 404);
  return json({ post });
}

async function savePost(request, env) {
  assertDatabase(env);
  const input = await request.json();
  const now = new Date().toISOString();
  const title = requiredString(input.title, "title");
  const slug = slugify(input.slug || title);
  const excerpt = String(input.excerpt || "");
  const bodyHtml = String(input.body_html || "");

  if (input.id) {
    const existing = await env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(input.id).first();
    if (!existing) return json({ error: "Post not found" }, 404);

    await env.DB.prepare(
      "UPDATE posts SET title = ?, slug = ?, excerpt = ?, body_html = ?, updated_at = ? WHERE id = ?"
    ).bind(title, slug, excerpt, bodyHtml, now, input.id).run();
    return json({ id: input.id, slug });
  }

  const result = await env.DB.prepare(
    "INSERT INTO posts (title, slug, excerpt, body_html, updated_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(title, slug, excerpt, bodyHtml, now).run();

  return json({ id: Number(result.meta.last_row_id), slug }, 201);
}

async function deletePost(url, env) {
  assertDatabase(env);
  const id = Number(url.pathname.split("/").pop());
  await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function publishPost(url, env) {
  assertDatabase(env);
  const id = Number(url.pathname.split("/").pop());
  const now = new Date().toISOString();
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
  if (!post) return json({ error: "Post not found" }, 404);

  await env.DB.prepare(
    "UPDATE posts SET status = 'published', updated_at = ?, published_at = COALESCE(published_at, ?) WHERE id = ?"
  ).bind(now, now, id).run();

  const published = await env.DB.prepare(
    "SELECT title, slug, excerpt, published_at, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC"
  ).all();
  const posts = published.results || [];

  const commit = await commitFiles(env, [
    {
      path: `posts/${post.slug}/index.html`,
      content: renderPostHtml(env, { ...post, status: "published", published_at: post.published_at || now })
    },
    {
      path: "posts.json",
      content: JSON.stringify(posts, null, 2) + "\n"
    },
    {
      path: "index.html",
      content: renderIndexHtml(env, posts)
    }
  ], `Publish ${post.slug}`);

  return json({
    ok: true,
    slug: post.slug,
    commit_sha: commit.sha,
    commit_url: commit.html_url,
    pages_url: await getPagesUrl(env),
    live_url: await getLivePostUrl(env, post.slug)
  });
}

async function commitFiles(env, files, message) {
  assertGithubEnv(env);
  const branch = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${env.GITHUB_BRANCH}`);
  const baseSha = branch.object.sha;
  const baseCommit = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits/${baseSha}`);
  const tree = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: files.map((file) => ({
        path: file.path,
        mode: "100644",
        type: "blob",
        content: file.content
      }))
    })
  });

  const commit = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [baseSha]
    })
  });

  await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/refs/heads/${env.GITHUB_BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha })
  });

  return {
    sha: commit.sha,
    html_url: `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commit/${commit.sha}`
  };
}

async function pagesBuildStatus(url, env) {
  assertGithubEnv(env);
  const commitSha = url.pathname.split("/").pop();
  const [pages, latestBuild] = await Promise.all([
    getPages(env),
    getLatestPagesBuild(env)
  ]);
  const buildCommitSha = latestBuild ? pagesBuildCommitSha(latestBuild) : null;

  return json({
    ok: true,
    commit_sha: commitSha,
    pages_url: pages?.html_url || null,
    latest_build: latestBuild ? {
      status: latestBuild.status,
      error: latestBuild.error || null,
      commit_sha: buildCommitSha,
      commit_url: buildCommitSha ? `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commit/${buildCommitSha}` : null,
      matches_commit: buildCommitSha === commitSha,
      updated_at: latestBuild.updated_at,
      url: latestBuild.url
    } : null
  });
}

function pagesBuildCommitSha(build) {
  if (!build?.commit) return null;
  if (typeof build.commit === "string") return build.commit;
  return build.commit.sha || build.commit.id || null;
}

async function getPages(env) {
  try {
    return await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/pages`);
  } catch (error) {
    return null;
  }
}

async function getPagesUrl(env) {
  const pages = await getPages(env);
  return pages?.html_url || null;
}

async function getLivePostUrl(env, slug) {
  const pagesUrl = await getPagesUrl(env);
  return pagesUrl ? `${pagesUrl.replace(/\/$/, "")}/posts/${slug}/` : null;
}

async function getLatestPagesBuild(env) {
  try {
    return await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/pages/builds/latest`);
  } catch (error) {
    return null;
  }
}

async function githubJson(env, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      ...githubHeaders(env),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API failed ${path}: ${detail}`);
  }

  return response.json();
}

async function commitFilesLegacy(env, files, message) {
  assertGithubEnv(env);
  for (const file of files) {
    const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${file.path}`;
    const current = await fetch(`${url}?ref=${env.GITHUB_BRANCH}`, {
      headers: githubHeaders(env)
    });
    const currentJson = current.ok ? await current.json() : null;

    const response = await fetch(url, {
      method: "PUT",
      headers: githubHeaders(env),
      body: JSON.stringify({
        message,
        branch: env.GITHUB_BRANCH,
        content: base64Encode(file.content),
        sha: currentJson?.sha
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`GitHub commit failed for ${file.path}: ${detail}`);
    }
  }
}

function githubHeaders(env) {
  return {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "cms-admin-worker",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function assertGithubEnv(env) {
  for (const key of ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_BRANCH"]) {
    if (!env[key]) throw new Error(`Missing env ${key}`);
  }
}

function assertDatabase(env) {
  if (!env.DB) throw new Error("Missing D1 binding DB. Add a D1 database binding named DB in the Worker settings.");
}

async function health(env) {
  const checks = {
    db_binding: Boolean(env.DB),
    admin_password: Boolean(env.ADMIN_PASSWORD),
    github_token: Boolean(env.GITHUB_TOKEN),
    github_owner: Boolean(env.GITHUB_OWNER),
    github_repo: Boolean(env.GITHUB_REPO),
    github_branch: Boolean(env.GITHUB_BRANCH)
  };

  if (env.DB) {
    try {
      const result = await env.DB.prepare("SELECT COUNT(*) AS count FROM posts").first();
      checks.posts_table = Number(result?.count || 0);
    } catch (error) {
      checks.posts_table_error = error?.message || String(error);
    }
  }

  return json({ ok: true, checks });
}

function adminPage(env) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(env.SITE_TITLE || "CMS")} Admin</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172026; background: #f6f7f4; }
    body { margin: 0; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid #d9ddd5; background: #fff; }
    main { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100vh - 70px); }
    aside { border-right: 1px solid #d9ddd5; background: #fff; padding: 16px; overflow: auto; }
    section { padding: 24px; }
    button, input, textarea { font: inherit; }
    button { border: 1px solid #172026; background: #172026; color: #fff; padding: 9px 12px; border-radius: 6px; cursor: pointer; }
    button.secondary { background: #fff; color: #172026; border-color: #b8c0b2; }
    button.danger { background: #8b1e1e; border-color: #8b1e1e; }
    label { display: grid; gap: 6px; margin-bottom: 14px; font-weight: 650; }
    input, textarea { border: 1px solid #b8c0b2; border-radius: 6px; padding: 10px; background: #fff; color: #172026; }
    textarea { min-height: 320px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .post { width: 100%; text-align: left; background: #fff; color: #172026; border: 1px solid #d9ddd5; margin-bottom: 8px; }
    .post strong, .post small { display: block; }
    .post small { color: #59635a; margin-top: 3px; }
    .status { border: 1px solid #b8c0b2; border-radius: 999px; padding: 2px 8px; font-size: 12px; }
    @media (max-width: 800px) { main { grid-template-columns: 1fr; } aside { border-right: 0; border-bottom: 1px solid #d9ddd5; } }
  </style>
</head>
<body>
  <header>
    <strong>${escapeHtml(env.SITE_TITLE || "CMS")} Admin</strong>
    <a href="/logout">Đăng xuất</a>
  </header>
  <main>
    <aside>
      <div class="row" style="justify-content: space-between; margin-bottom: 12px;">
        <strong>Bài viết</strong>
        <button class="secondary" id="newPost">Mới</button>
      </div>
      <div id="posts"></div>
    </aside>
    <section>
      <form id="editor">
        <input type="hidden" id="id">
        <label>Tiêu đề <input id="title" required></label>
        <label>Slug <input id="slug" placeholder="tu-dong-tao-tu-tieu-de"></label>
        <label>Mô tả ngắn <input id="excerpt"></label>
        <label>Nội dung HTML <textarea id="body_html" placeholder="<p>Nội dung...</p>"></textarea></label>
        <div class="row">
          <button type="submit">Lưu draft</button>
          <button type="button" id="publish">Publish</button>
          <button type="button" class="danger" id="deletePost">Xóa</button>
          <span id="message"></span>
        </div>
      </form>
    </section>
  </main>
  <script>
    const state = { posts: [] };
    const $ = (id) => document.getElementById(id);

    async function api(path, options) {
      const response = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options
      });
      const contentType = response.headers.get("Content-Type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };
      if (!response.ok) throw new Error(data.error || "Request failed");
      return data;
    }

    async function loadPosts() {
      state.posts = (await api("/api/posts")).posts;
      $("posts").innerHTML = state.posts.map((post) => '<button class="post" data-id="' + post.id + '"><strong>' + escapeText(post.title) + '</strong><small>' + escapeText(post.slug) + ' · <span class="status">' + escapeText(post.status) + '</span></small></button>').join("");
      document.querySelectorAll(".post").forEach((button) => button.onclick = () => loadPost(button.dataset.id));
    }

    async function loadPost(id) {
      const { post } = await api("/api/posts/" + id);
      $("id").value = post.id;
      $("title").value = post.title;
      $("slug").value = post.slug;
      $("excerpt").value = post.excerpt || "";
      $("body_html").value = post.body_html || "";
      message("Đã mở bài viết.");
    }

    async function save() {
      const payload = {
        id: $("id").value ? Number($("id").value) : undefined,
        title: $("title").value,
        slug: $("slug").value,
        excerpt: $("excerpt").value,
        body_html: $("body_html").value
      };
      const result = await api("/api/posts", { method: "POST", body: JSON.stringify(payload) });
      $("id").value = result.id;
      $("slug").value = result.slug;
      await loadPosts();
      message("Đã lưu draft.");
      return result.id;
    }

    $("editor").onsubmit = async (event) => {
      event.preventDefault();
      try { await save(); } catch (error) { message(error.message); }
    };

    $("publish").onclick = async () => {
      try {
        const id = $("id").value || await save();
        const publish = await api("/api/publish/" + id, { method: "POST" });
        await loadPosts();
        message("Committed " + shortSha(publish.commit_sha) + ". Waiting for GitHub Pages...");
        if (publish.commit_sha) pollPagesBuild(publish);
      } catch (error) { message(error.message); }
    };

    $("deletePost").onclick = async () => {
      if (!$("id").value || !confirm("Xóa bài viết này khỏi D1?")) return;
      try {
        await api("/api/posts/" + $("id").value, { method: "DELETE" });
        clearForm();
        await loadPosts();
        message("Đã xóa khỏi D1.");
      } catch (error) { message(error.message); }
    };

    $("newPost").onclick = clearForm;

    function clearForm() {
      $("id").value = "";
      $("title").value = "";
      $("slug").value = "";
      $("excerpt").value = "";
      $("body_html").value = "";
      message("Tạo bài mới.");
    }

    function message(text) { $("message").textContent = text; }
    function shortSha(value) { return value ? String(value).slice(0, 7) : ""; }
    async function pollPagesBuild(publish) {
      const maxAttempts = 20;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          const status = await api("/api/pages-build/" + publish.commit_sha);
          const build = status.latest_build;
          if (!build) {
            message("Committed " + shortSha(publish.commit_sha) + ". No GitHub Pages build yet.");
            continue;
          }

          const match = build.matches_commit ? "" : " Latest build is for another commit.";
          message("GitHub Pages: " + build.status + "." + match);

          if (build.matches_commit && build.status === "built") {
            message("Live: " + (publish.live_url || status.pages_url || "GitHub Pages built."));
            return;
          }

          if (build.matches_commit && build.status === "errored") {
            message("GitHub Pages build failed: " + (build.error?.message || "unknown error"));
            return;
          }
        } catch (error) {
          message("Could not read GitHub Pages status: " + error.message);
          return;
        }
      }
      message("Committed " + shortSha(publish.commit_sha) + ". GitHub Pages still not done after 60s.");
    }
    function escapeText(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
    loadPosts();
  </script>
</body>
</html>`;
}

function loginPage(error = "") {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Đăng nhập CMS</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f6f7f4; color: #172026; }
    form { width: min(360px, calc(100vw - 32px)); display: grid; gap: 12px; }
    input, button { font: inherit; padding: 10px; border-radius: 6px; }
    input { border: 1px solid #b8c0b2; }
    button { border: 1px solid #172026; background: #172026; color: #fff; cursor: pointer; }
    p { color: #8b1e1e; min-height: 1.3em; }
  </style>
</head>
<body>
  <form method="post">
    <h1>CMS Admin</h1>
    <input type="password" name="password" placeholder="Mật khẩu admin" required autofocus>
    <button>Đăng nhập</button>
    <p>${escapeHtml(error)}</p>
  </form>
</body>
</html>`;
}

function renderPostHtml(env, post) {
  const title = escapeHtml(post.title);
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="../../style.css">
</head>
<body>
  <main class="post-page">
    <a href="../../">← Trang chủ</a>
    <article>
      <h1>${title}</h1>
      <p class="meta">${escapeHtml(formatDate(post.published_at || post.updated_at))}</p>
      ${post.body_html}
    </article>
  </main>
</body>
</html>`;
}

function renderIndexHtml(env, posts) {
  const siteTitle = escapeHtml(env.SITE_TITLE || "Static CMS");
  const list = posts.map((post) => `<article class="post-card">
  <h2><a href="posts/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h2>
  <p>${escapeHtml(post.excerpt || "")}</p>
  <small>${escapeHtml(formatDate(post.published_at || post.updated_at))}</small>
</article>`).join("\n");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${siteTitle}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="home">
    <header>
      <h1>${siteTitle}</h1>
      <p>Các bài viết đã publish.</p>
    </header>
    <section class="post-list">
      ${list || "<p>Chưa có bài viết.</p>"}
    </section>
  </main>
</body>
</html>`;
}

function requiredString(value, field) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`Missing ${field}`);
  return text;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `post-${Date.now()}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function base64Encode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...headers }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, jsonReplacer), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function jsonReplacer(key, value) {
  return typeof value === "bigint" ? Number(value) : value;
}

function redirect(location, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, ...headers }
  });
}

function expiredCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
