export function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...headers }
  });
}

export function css(body) {
  return new Response(body, {
    headers: { "Content-Type": "text/css; charset=utf-8" }
  });
}

export function js(body) {
  return new Response(body, {
    headers: { "Content-Type": "application/javascript; charset=utf-8" }
  });
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data, jsonReplacer), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

export function redirect(location, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, ...headers }
  });
}

function jsonReplacer(key, value) {
  return typeof value === "bigint" ? Number(value) : value;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

export function requiredString(value, field) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`Missing ${field}`);
  return text;
}
