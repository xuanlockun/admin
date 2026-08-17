import { all, first, run, slugify } from "./db.js";
import { requiredString } from "./http.js";

export async function listPages(env) {
  return all(env, "SELECT id, title, slug, status, show_in_nav, sort_order, updated_at, published_at FROM pages ORDER BY sort_order ASC, updated_at DESC");
}

export async function listPublishedPages(env) {
  return all(env, "SELECT title, slug, body_html, show_in_nav, sort_order, published_at, updated_at, seo_title, seo_description FROM pages WHERE status = 'published' ORDER BY sort_order ASC, id ASC");
}

export async function getPage(env, id) {
  const page = await first(env, "SELECT * FROM pages WHERE id = ?", id);
  if (!page) throw new Error("Page not found");
  return page;
}

export async function savePage(env, input) {
  const now = new Date().toISOString();
  const title = requiredString(input.title, "title");
  const slug = slugify(input.slug || title);
  const bodyHtml = String(input.body_html || "");
  const status = input.status === "published" ? "published" : "draft";
  const showInNav = input.show_in_nav ? 1 : 0;
  const sortOrder = Number(input.sort_order || 0);
  const seoTitle = String(input.seo_title || "");
  const seoDescription = String(input.seo_description || "");
  const publishedAt = status === "published" ? now : null;

  if (input.id) {
    const existing = await first(env, "SELECT id, published_at FROM pages WHERE id = ?", input.id);
    if (!existing) throw new Error("Page not found");
    await run(
      env,
      "UPDATE pages SET title = ?, slug = ?, body_html = ?, status = ?, show_in_nav = ?, sort_order = ?, seo_title = ?, seo_description = ?, updated_at = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE published_at END WHERE id = ?",
      title,
      slug,
      bodyHtml,
      status,
      showInNav,
      sortOrder,
      seoTitle,
      seoDescription,
      now,
      status,
      publishedAt,
      input.id
    );
    return { id: Number(input.id), slug };
  }

  const result = await run(
    env,
    "INSERT INTO pages (title, slug, body_html, status, show_in_nav, sort_order, seo_title, seo_description, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    title,
    slug,
    bodyHtml,
    status,
    showInNav,
    sortOrder,
    seoTitle,
    seoDescription,
    now,
    publishedAt
  );
  return { id: Number(result.meta.last_row_id), slug };
}

export async function deletePage(env, id) {
  await run(env, "DELETE FROM pages WHERE id = ?", id);
  return { ok: true };
}
