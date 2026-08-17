import { html, redirect } from "./http.js";
import { renderLoginPage } from "./render/admin.js";

const COOKIE_NAME = "cms_session";

export async function login(request, env) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return html(renderLoginPage("Sai mat khau."), 401);
  }

  return redirect("/", {
    "Set-Cookie": `${COOKIE_NAME}=${await sessionValue(env)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  });
}

export async function isAuthed(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const session = cookie.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${COOKIE_NAME}=`));
  return Boolean(env.ADMIN_PASSWORD && session === `${COOKIE_NAME}=${await sessionValue(env)}`);
}

export function logout() {
  return redirect("/login", { "Set-Cookie": `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0` });
}

async function sessionValue(env) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.ADMIN_PASSWORD));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
