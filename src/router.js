import { isAuthed, login, logout } from "./auth.js";
import { css, html, js, json } from "./http.js";
import { renderAdminShell, renderLoginPage } from "./render/admin.js";
import { ADMIN_CSS } from "./admin/styles.js";
import { ADMIN_APP_JS } from "./admin/app.js";
import { listPosts, getPost, savePost, deletePost, publishPost, publishSite, pagesBuildStatus, listDeployments } from "./posts.js";
import { loadSettings, saveSettings, loadNavigation, saveNavigation, loadFooterLinks, saveFooterLinks } from "./site.js";
import { all } from "./db.js";

export async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/admin/styles.css") return css(ADMIN_CSS);
  if (url.pathname === "/admin/app.js") return js(ADMIN_APP_JS);
  if (url.pathname === "/api/health") return await health(env);

  if (url.pathname === "/login") {
    return request.method === "POST" ? await login(request, env) : html(renderLoginPage());
  }
  if (url.pathname === "/logout") return logout();

  if (!(await isAuthed(request, env))) {
    if (url.pathname.startsWith("/api/")) return json({ error: "Unauthorized" }, 401);
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  if (url.pathname === "/") return html(renderAdminShell(env));

  if (url.pathname === "/api/posts" && request.method === "GET") return json({ posts: await listPosts(env) });
  if (url.pathname === "/api/posts" && request.method === "POST") return json(await savePost(env, await request.json()), 201);
  if (url.pathname.startsWith("/api/posts/") && request.method === "GET") return json({ post: await getPost(env, Number(url.pathname.split("/").pop())) });
  if (url.pathname.startsWith("/api/posts/") && request.method === "DELETE") return json(await deletePost(env, Number(url.pathname.split("/").pop())));
  if (url.pathname.startsWith("/api/publish/") && request.method === "POST") return json(await publishPost(env, Number(url.pathname.split("/").pop())));

  if (url.pathname === "/api/settings" && request.method === "GET") return json({ settings: await loadSettings(env) });
  if (url.pathname === "/api/settings" && request.method === "POST") return json({ settings: await saveSettings(env, await request.json()) });
  if (url.pathname === "/api/navigation" && request.method === "GET") return json({ items: await loadNavigation(env) });
  if (url.pathname === "/api/navigation" && request.method === "POST") return json({ items: await saveNavigation(env, (await request.json()).items || []) });
  if (url.pathname === "/api/footer-links" && request.method === "GET") return json({ items: await loadFooterLinks(env) });
  if (url.pathname === "/api/footer-links" && request.method === "POST") return json({ items: await saveFooterLinks(env, (await request.json()).items || []) });
  if (url.pathname === "/api/publish-site" && request.method === "POST") return json(await publishSite(env));
  if (url.pathname === "/api/deployments" && request.method === "GET") return json({ deployments: await listDeployments(env) });
  if (url.pathname.startsWith("/api/pages-build/") && request.method === "GET") return json(await pagesBuildStatus(env, url.pathname.split("/").pop()));

  return new Response("Not found", { status: 404 });
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
    for (const table of ["posts", "site_settings", "navigation_items", "footer_links", "deployments"]) {
      try {
        const result = await all(env, `SELECT COUNT(*) AS count FROM ${table}`);
        checks[table] = Number(result[0]?.count || 0);
      } catch (error) {
        checks[`${table}_error`] = error.message;
      }
    }
  }

  return json({ ok: true, checks });
}
