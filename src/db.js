export function assertDatabase(env) {
  if (!env.DB) throw new Error("Missing D1 binding DB. Add a D1 database binding named DB in the Worker settings.");
}

export async function all(env, sql, ...binds) {
  assertDatabase(env);
  const result = await env.DB.prepare(sql).bind(...binds).all();
  return result.results || [];
}

export async function first(env, sql, ...binds) {
  assertDatabase(env);
  return env.DB.prepare(sql).bind(...binds).first();
}

export async function run(env, sql, ...binds) {
  assertDatabase(env);
  return env.DB.prepare(sql).bind(...binds).run();
}

export function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `post-${Date.now()}`;
}
