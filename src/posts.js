import { all, first, run, slugify } from "./db.js";
import { requiredString } from "./http.js";
import { commitFiles, getPagesBuildStatus, getPagesUrl } from "./github.js";
import { createDeployment, findPostByDeployCommit, listDeploymentsPage, listPendingDeployments, loadSite, normalizeDeploymentStatus, updateDeploymentByCommit } from "./site.js";
import { listPublishedPages } from "./pages.js";
import { renderLandingHtml, renderPageHtml, renderPostHtml, renderStyleCss } from "./render/client.js";

export async function listPosts(env) {
  const posts = await all(env, "SELECT id, title, slug, excerpt, status, updated_at, published_at, deploy_commit_sha, deploy_status, deploy_updated_at FROM posts ORDER BY updated_at DESC");
  return posts.map((post) => ({ ...post, deploy_status: post.deploy_status ? normalizeDeploymentStatus(post.deploy_status) : null }));
}

export async function getPost(env, id) {
  const post = await first(env, "SELECT * FROM posts WHERE id = ?", id);
  if (!post) throw new Error("Post not found");
  return { ...post, deploy_status: post.deploy_status ? normalizeDeploymentStatus(post.deploy_status) : null };
}

export async function savePost(env, input) {
  const now = new Date().toISOString();
  const title = requiredString(input.title, "title");
  const slug = slugify(input.slug || title);
  const excerpt = String(input.excerpt || "");
  const bodyHtml = String(input.body_html || "");
  const coverImageUrl = String(input.cover_image_url || "");
  const seoTitle = String(input.seo_title || "");
  const seoDescription = String(input.seo_description || "");

  if (input.id) {
    const existing = await first(env, "SELECT id FROM posts WHERE id = ?", input.id);
    if (!existing) throw new Error("Post not found");
    await run(
      env,
      "UPDATE posts SET title = ?, slug = ?, excerpt = ?, body_html = ?, cover_image_url = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?",
      title,
      slug,
      excerpt,
      bodyHtml,
      coverImageUrl,
      seoTitle,
      seoDescription,
      now,
      input.id
    );
    return { id: input.id, slug };
  }

  const result = await run(
    env,
    "INSERT INTO posts (title, slug, excerpt, body_html, cover_image_url, seo_title, seo_description, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    title,
    slug,
    excerpt,
    bodyHtml,
    coverImageUrl,
    seoTitle,
    seoDescription,
    now
  );
  return { id: Number(result.meta.last_row_id), slug };
}

export async function deletePost(env, id) {
  await run(env, "DELETE FROM posts WHERE id = ?", id);
  return { ok: true };
}

export async function listPublishedPosts(env) {
  return all(env, "SELECT title, slug, excerpt, cover_image_url, published_at, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC");
}

export async function publishPost(env, id) {
  const now = new Date().toISOString();
  const post = await getPost(env, id);
  await run(env, "UPDATE posts SET status = 'published', updated_at = ?, published_at = COALESCE(published_at, ?) WHERE id = ?", now, now, id);

  const [site, posts, pages] = await Promise.all([loadSite(env), listPublishedPosts(env), listPublishedPages(env)]);
  const siteWithPages = { ...site, pages };
  const commit = await commitFiles(env, [
    { path: `posts/${post.slug}/index.html`, content: renderPostHtml(env, { ...post, status: "published", published_at: post.published_at || now }, siteWithPages) },
    { path: "index.html", content: renderLandingHtml(env, posts, pages, siteWithPages) },
    { path: "style.css", content: renderStyleCss(site) },
    { path: "posts.json", content: JSON.stringify(posts, null, 2) + "\n" },
    ...pages.map((page) => ({ path: `pages/${page.slug}/index.html`, content: renderPageHtml(env, page, siteWithPages) }))
  ], `Publish ${post.slug}`);

  const pagesUrl = await getPagesUrl(env);
  const liveUrl = pagesUrl ? `${pagesUrl.replace(/\/$/, "")}/posts/${post.slug}/` : null;
  await run(
    env,
    "UPDATE posts SET deploy_commit_sha = ?, deploy_commit_url = ?, deploy_pages_url = ?, deploy_live_url = ?, deploy_status = ?, deploy_error = NULL, deploy_updated_at = ? WHERE id = ?",
    commit.sha,
    commit.html_url,
    pagesUrl,
    liveUrl,
    "pending",
    new Date().toISOString(),
    id
  );
  await createDeployment(env, { type: "post", post_id: id, commit_sha: commit.sha, commit_url: commit.html_url, live_url: liveUrl, status: "pending" });

  return { ok: true, post_id: id, slug: post.slug, commit_sha: commit.sha, commit_url: commit.html_url, pages_url: pagesUrl, live_url: liveUrl, deploy_status: "pending" };
}

export async function publishSite(env) {
  const [site, posts, pages] = await Promise.all([loadSite(env), listPublishedPosts(env), listPublishedPages(env)]);
  const siteWithPages = { ...site, pages };
  const commit = await commitFiles(env, [
    { path: "index.html", content: renderLandingHtml(env, posts, pages, siteWithPages) },
    { path: "style.css", content: renderStyleCss(site) },
    { path: "posts.json", content: JSON.stringify(posts, null, 2) + "\n" },
    ...pages.map((page) => ({ path: `pages/${page.slug}/index.html`, content: renderPageHtml(env, page, siteWithPages) }))
  ], "Publish site");
  const pagesUrl = await getPagesUrl(env);
  await createDeployment(env, { type: "site", commit_sha: commit.sha, commit_url: commit.html_url, live_url: pagesUrl, status: "pending" });
  return { ok: true, commit_sha: commit.sha, commit_url: commit.html_url, pages_url: pagesUrl, live_url: pagesUrl, deploy_status: "pending" };
}

export async function pagesBuildStatus(env, commitSha) {
  const status = await getPagesBuildStatus(env, commitSha);
  const post = await findPostByDeployCommit(env, commitSha);
  if (post) {
    await run(
      env,
      "UPDATE posts SET deploy_status = ?, deploy_error = ?, deploy_pages_url = COALESCE(?, deploy_pages_url), deploy_updated_at = ? WHERE id = ?",
      status.deploy_status,
      status.deploy_error,
      status.pages_url,
      new Date().toISOString(),
      post.id
    );
  }
  await updateDeploymentByCommit(env, commitSha, { status: status.deploy_status, error: status.deploy_error });
  return { ok: true, commit_sha: commitSha, live_url: post?.deploy_live_url || status.pages_url, ...status };
}

export async function listDeployments(env, options = {}) {
  const pending = await listPendingDeployments(env);
  await Promise.all(pending.map((deployment) => pagesBuildStatus(env, deployment.commit_sha).catch(() => null)));
  return listDeploymentsPage(env, options.page, options.perPage);
}
