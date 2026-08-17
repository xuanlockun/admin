import { handleRequest } from "./router.js";
import { html, json } from "./http.js";
import { renderLoginPage } from "./render/admin.js";

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      const url = new URL(request.url);
      const message = error?.message || String(error);
      if (url.pathname.startsWith("/api/")) return json({ error: message }, 500);
      return html(renderLoginPage(message), 500);
    }
  }
};
