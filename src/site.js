import { all, first, run } from "./db.js";

export function defaultSettings(env) {
  return {
    site_title: env.SITE_TITLE || "Static CMS",
    logo_text: env.SITE_TITLE || "Static CMS",
    logo_url: "",
    favicon_url: "",
    default_seo_title: env.SITE_TITLE || "Static CMS",
    default_seo_description: "Published notes and articles.",
    hero_title: env.SITE_TITLE || "Static CMS",
    hero_subtitle: "Published notes and articles.",
    primary_cta_label: "Read latest",
    primary_cta_url: "#latest",
    secondary_cta_label: "",
    secondary_cta_url: "",
    intro_html: "<p>Welcome to the site.</p>",
    custom_html: "",
    accent_color: "#245c6f",
    custom_css: "",
    nav_cta_label: "",
    nav_cta_url: "",
    featured_posts_count: "6",
    footer_text: "",
    theme_id: "editorial"
  };
}

export async function loadSite(env) {
  const settings = await loadSettings(env);
  const [navigation, footerLinks] = await Promise.all([
    all(env, "SELECT * FROM navigation_items ORDER BY sort_order ASC, id ASC"),
    all(env, "SELECT * FROM footer_links ORDER BY sort_order ASC, id ASC")
  ]);
  return { ...settings, navigation, footer_links: footerLinks };
}

export async function loadSettings(env) {
  const defaults = defaultSettings(env);
  try {
    const rows = await all(env, "SELECT key, value FROM site_settings");
    return { ...defaults, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) };
  } catch (error) {
    return defaults;
  }
}

export async function saveSettings(env, input) {
  const settings = normalizeSettings(input, env);
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(settings)) {
    await run(
      env,
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      key,
      value,
      now
    );
  }
  return settings;
}

export async function loadNavigation(env) {
  return all(env, "SELECT * FROM navigation_items ORDER BY sort_order ASC, id ASC");
}

export async function saveNavigation(env, items) {
  await run(env, "DELETE FROM navigation_items");
  const now = new Date().toISOString();
  for (const [index, item] of items.entries()) {
    const label = String(item.label || "").trim();
    const url = String(item.url || "").trim();
    if (!label || !url) continue;
    await run(
      env,
      "INSERT INTO navigation_items (label, url, sort_order, target, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      label,
      url,
      Number(item.sort_order ?? index),
      item.target === "_blank" ? "_blank" : "_self",
      now,
      now
    );
  }
  return loadNavigation(env);
}

export async function loadFooterLinks(env) {
  return all(env, "SELECT * FROM footer_links ORDER BY sort_order ASC, id ASC");
}

export async function saveFooterLinks(env, items) {
  await run(env, "DELETE FROM footer_links");
  const now = new Date().toISOString();
  for (const [index, item] of items.entries()) {
    const label = String(item.label || "").trim();
    const url = String(item.url || "").trim();
    if (!label || !url) continue;
    await run(
      env,
      "INSERT INTO footer_links (label, url, sort_order, target, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      label,
      url,
      Number(item.sort_order ?? index),
      item.target === "_blank" ? "_blank" : "_self",
      now,
      now
    );
  }
  return loadFooterLinks(env);
}

export async function createDeployment(env, input) {
  const now = new Date().toISOString();
  const result = await run(
    env,
    "INSERT INTO deployments (type, post_id, commit_sha, commit_url, live_url, status, error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    input.type,
    input.post_id || null,
    input.commit_sha,
    input.commit_url,
    input.live_url || null,
    normalizeDeploymentStatus(input.status),
    input.error || null,
    now,
    now
  );
  return Number(result.meta.last_row_id);
}

export async function updateDeploymentByCommit(env, commitSha, patch) {
  await run(
    env,
    "UPDATE deployments SET status = ?, error = ?, updated_at = ? WHERE commit_sha = ?",
    normalizeDeploymentStatus(patch.status),
    patch.error || null,
    new Date().toISOString(),
    commitSha
  );
}

export async function listDeploymentsPage(env, page = 1, perPage = 20) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.max(5, Math.min(50, Number(perPage) || 20));
  const offset = (safePage - 1) * safePerPage;
  const [rows, totalRow] = await Promise.all([
    all(
      env,
      "SELECT deployments.*, posts.title AS post_title, posts.slug AS post_slug FROM deployments LEFT JOIN posts ON posts.id = deployments.post_id ORDER BY deployments.created_at DESC LIMIT ? OFFSET ?",
      safePerPage,
      offset
    ),
    first(env, "SELECT COUNT(*) AS count FROM deployments")
  ]);
  const total = Number(totalRow?.count || 0);
  return {
    deployments: rows.map((row) => ({ ...row, status: normalizeDeploymentStatus(row.status) })),
    page: safePage,
    per_page: safePerPage,
    total,
    total_pages: Math.max(1, Math.ceil(total / safePerPage))
  };
}

export async function listPendingDeployments(env, limit = 8) {
  return all(
    env,
    "SELECT commit_sha FROM deployments WHERE status NOT IN ('success', 'failed') ORDER BY created_at DESC LIMIT ?",
    Math.max(1, Math.min(20, Number(limit) || 8))
  );
}

export async function findPostByDeployCommit(env, commitSha) {
  return first(env, "SELECT id, deploy_live_url FROM posts WHERE deploy_commit_sha = ?", commitSha);
}

export function normalizeDeploymentStatus(status) {
  if (status === "success" || status === "built") return "success";
  if (status === "failed" || status === "errored" || status === "error") return "failed";
  return "pending";
}

function normalizeSettings(input, env) {
  const defaults = defaultSettings(env);
  const text = (key) => String(input[key] ?? defaults[key] ?? "");
  return {
    site_title: text("site_title").trim() || defaults.site_title,
    logo_text: text("logo_text").trim(),
    logo_url: text("logo_url").trim(),
    favicon_url: text("favicon_url").trim(),
    default_seo_title: text("default_seo_title").trim(),
    default_seo_description: text("default_seo_description").trim(),
    hero_title: text("hero_title").trim(),
    hero_subtitle: text("hero_subtitle"),
    primary_cta_label: text("primary_cta_label").trim(),
    primary_cta_url: text("primary_cta_url").trim(),
    secondary_cta_label: text("secondary_cta_label").trim(),
    secondary_cta_url: text("secondary_cta_url").trim(),
    intro_html: text("intro_html"),
    custom_html: text("custom_html"),
    accent_color: /^#[0-9a-fA-F]{6}$/.test(text("accent_color")) ? text("accent_color") : defaults.accent_color,
    custom_css: text("custom_css"),
    nav_cta_label: text("nav_cta_label").trim(),
    nav_cta_url: text("nav_cta_url").trim(),
    featured_posts_count: String(Math.max(1, Math.min(24, Number(input.featured_posts_count || defaults.featured_posts_count)))),
    footer_text: text("footer_text"),
    theme_id: ["editorial", "studio"].includes(text("theme_id")) ? text("theme_id") : defaults.theme_id
  };
}
