export const ADMIN_APP_JS = `
const state = {
  posts: [],
  settings: {},
  navigation: [],
  footer: [],
  deployments: [],
  deploymentsPage: 1,
  deploymentsTotalPages: 1,
  editor: null,
  activePoll: ""
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const contentType = response.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json") ? await response.json() : { error: await response.text() };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function showView(view) {
  localStorage.setItem("cms:view", view);
  document.querySelectorAll(".nav button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === view + "View"));
  const titles = {
    dashboard: ["Dashboard", "Overview"],
    posts: ["Posts", "Content"],
    postEditor: ["Post editor", "Edit"],
    landing: ["Landing page", "Home"],
    theme: ["Theme", "Design"],
    navigation: ["Navigation", "Header"],
    footer: ["Footer", "Links"],
    deployments: ["Deployments", "Build log"],
    settings: ["Settings", "Site"]
  };
  const [title, subtitle] = titles[view] || titles.dashboard;
  $("viewTitle").textContent = title;
  $("viewCrumb").textContent = title;
  $("viewSubtitle").textContent = subtitle;
}

async function refreshAll() {
  await Promise.all([loadPosts(), loadSettings(), loadNavigation(), loadFooter(), loadDeployments()]);
  renderDashboard();
}

async function loadPosts() {
  state.posts = (await api("/api/posts")).posts;
  renderPostsTable();
}

function renderPostsTable() {
  const query = ($("postSearch")?.value || "").toLowerCase();
  const status = $("statusFilter")?.value || "";
  const posts = state.posts.filter((post) => {
    const haystack = (post.title + " " + post.slug).toLowerCase();
    return (!query || haystack.includes(query)) && (!status || post.status === status);
  });
  $("postsTable").innerHTML = posts.map((post) => '<tr class="row-click" data-id="' + post.id + '"><td><strong>' + esc(post.title) + '</strong><div class="text-secondary small">' + esc(post.excerpt || "") + '</div></td><td><code>' + esc(post.slug) + '</code></td><td><span class="status">' + esc(post.status) + '</span></td><td>' + fmt(post.updated_at) + '</td><td>' + statusPill(post.deploy_status || "pending") + '</td></tr>').join("");
  document.querySelectorAll("#postsTable tr").forEach((row) => row.onclick = () => openPost(row.dataset.id));
}

async function openPost(id) {
  const { post } = await api("/api/posts/" + id);
  $("post_id").value = post.id;
  $("title").value = post.title || "";
  $("slug").value = post.slug || "";
  $("excerpt").value = post.excerpt || "";
  $("cover_image_url").value = post.cover_image_url || "";
  $("seo_title").value = post.seo_title || "";
  $("seo_description").value = post.seo_description || "";
  setEditorData(post.body_html || "");
  $("editorHeading").textContent = post.title || "Post editor";
  renderPostDeploy(post);
  showView("postEditor");
}

function newPost() {
  $("post_id").value = "";
  $("title").value = "";
  $("slug").value = "";
  $("excerpt").value = "";
  $("cover_image_url").value = "";
  $("seo_title").value = "";
  $("seo_description").value = "";
  setEditorData("");
  $("editorHeading").textContent = "New post";
  renderPostDeploy({});
  showView("postEditor");
}

async function savePost() {
  const payload = {
    id: $("post_id").value ? Number($("post_id").value) : undefined,
    title: $("title").value,
    slug: $("slug").value,
    excerpt: $("excerpt").value,
    cover_image_url: $("cover_image_url").value,
    seo_title: $("seo_title").value,
    seo_description: $("seo_description").value,
    body_html: getEditorData()
  };
  const result = await api("/api/posts", { method: "POST", body: JSON.stringify(payload) });
  $("post_id").value = result.id;
  $("slug").value = result.slug;
  $("postMessage").textContent = "Draft saved.";
  await loadPosts();
  return result.id;
}

async function publishPost() {
  $("publishPost").disabled = true;
  try {
    openPublishModal("Publishing post", "Saving draft before publish.");
    modalStep("modalStepSave", "Saving");
    const id = $("post_id").value || await savePost();
    modalStep("modalStepSave", "Saved");
    $("postMessage").textContent = "Publishing...";
    deployStep("deployCommit", "Committing...");
    deployStep("deployPages", "Waiting");
    modalStep("modalStepCommit", "Committing");
    const result = await api("/api/publish/" + id, { method: "POST" });
    modalStep("modalStepCommit", "Committed");
    modalLinks(result);
    modalStep("modalStepPages", "Waiting");
    setModalState("loading", "Waiting for GitHub Pages", "Publish is pending.");
    $("postMessage").textContent = "Committed " + shortSha(result.commit_sha) + ". Waiting for GitHub Pages.";
    deployStep("deployCommit", commitLink(result.commit_url, result.commit_sha));
    deployStep("deployLive", result.live_url ? link(result.live_url, result.live_url) : "Waiting");
    pollPages(result.commit_sha, result.live_url);
    await Promise.all([loadPosts(), loadDeployments()]);
  } catch (error) {
    $("postMessage").textContent = error.message;
    setModalState("error", "Publish failed", error.message);
  } finally {
    $("publishPost").disabled = false;
  }
}

async function deletePost() {
  if (!$("post_id").value || !confirm("Delete this post from D1?")) return;
  await api("/api/posts/" + $("post_id").value, { method: "DELETE" });
  await loadPosts();
  showView("posts");
}

function previewPost() {
  $("previewArticle").innerHTML = '<h1>' + esc($("title").value || "Untitled") + '</h1>' + ($("excerpt").value ? '<p class="muted">' + esc($("excerpt").value) + '</p>' : "") + getEditorData();
  $("previewModal").classList.remove("hidden");
}

function insertImage() {
  const url = prompt("Image URL");
  if (!url) return;
  const html = '<figure><img src="' + attr(url) + '" alt=""><figcaption></figcaption></figure>';
  setEditorData(getEditorData() + html);
}

function renderPostDeploy(post) {
  deployStep("deployCommit", post.deploy_commit_sha ? commitLink(post.deploy_commit_url, post.deploy_commit_sha) : "Idle");
  deployStep("deployPages", post.deploy_status ? statusPill(post.deploy_status) : "Idle");
  deployStep("deployLive", post.deploy_live_url ? link(post.deploy_live_url, post.deploy_live_url) : "Idle");
  if (post.deploy_commit_sha && !["success", "failed"].includes(post.deploy_status)) pollPages(post.deploy_commit_sha, post.deploy_live_url);
}

async function pollPages(commitSha, liveUrl) {
  state.activePoll = commitSha;
  for (let attempt = 0; attempt < 20; attempt++) {
    if (state.activePoll !== commitSha) return;
    await wait(3000);
    if (state.activePoll !== commitSha) return;
    const status = await api("/api/pages-build/" + commitSha);
    const build = status.latest_build;
    deployStep("deployPages", build ? build.status + (build.matches_commit ? "" : " (other commit)") : "No build yet");
    modalStep("modalStepPages", build ? build.status : "No build yet");
    if (build?.matches_commit && status.deploy_status === "success") {
      deployStep("deployPages", "Success");
      deployStep("deployLive", link(liveUrl || status.live_url || status.pages_url, liveUrl || status.live_url || status.pages_url || "Live"));
      modalStep("modalStepPages", "Built");
      setModalState("success", "Published", "GitHub Pages is live.");
      modalLinks({ live_url: liveUrl || status.live_url || status.pages_url });
      await loadDeployments();
      return;
    }
    if (build?.matches_commit && status.deploy_status === "failed") {
      deployStep("deployPages", "Failed");
      deployStep("deployLive", esc(build.error?.message || "Unknown error"));
      modalStep("modalStepPages", "Failed");
      setModalState("error", "GitHub Pages failed", build.error?.message || "Unknown error");
      await loadDeployments();
      return;
    }
  }
  deployStep("deployPages", "Still pending");
  modalStep("modalStepPages", "Still pending");
}

async function loadSettings() {
  const result = await api("/api/settings");
  state.settings = result.settings;
  for (const [key, value] of Object.entries(state.settings)) {
    if ($(key)) $(key).value = value || "";
  }
  const theme = state.settings.theme_id || "editorial";
  document.querySelectorAll('input[name="theme_id"]').forEach((input) => {
    input.checked = input.value === theme;
    input.closest(".theme-card").classList.toggle("selected", input.checked);
  });
}

async function saveSettings() {
  const checkedTheme = document.querySelector('input[name="theme_id"]:checked');
  const keys = ["site_title", "logo_text", "logo_url", "favicon_url", "default_seo_title", "default_seo_description", "accent_color", "custom_css", "hero_title", "hero_subtitle", "primary_cta_label", "primary_cta_url", "secondary_cta_label", "secondary_cta_url", "intro_html", "custom_html", "featured_posts_count", "nav_cta_label", "nav_cta_url", "footer_text"];
  const payload = Object.fromEntries(keys.filter((key) => $(key)).map((key) => [key, $(key).value]));
  payload.theme_id = checkedTheme ? checkedTheme.value : state.settings.theme_id || "editorial";
  const result = await api("/api/settings", { method: "POST", body: JSON.stringify(payload) });
  state.settings = result.settings;
  return result.settings;
}

async function saveTheme() {
  await saveSettings();
  $("themeMessage").textContent = "Theme saved. Publish site to update GitHub Pages.";
}

async function saveLanding() {
  await saveSettings();
  $("landingMessage").textContent = "Landing saved.";
}

async function publishSite() {
  $("publishSite").disabled = true;
  try {
    openPublishModal("Publishing site", "Saving site settings.");
    modalStep("modalStepSave", "Saving");
    await saveSettings();
    modalStep("modalStepSave", "Saved");
    modalStep("modalStepCommit", "Committing");
    const result = await api("/api/publish-site", { method: "POST" });
    modalStep("modalStepCommit", "Committed");
    modalStep("modalStepPages", "Waiting");
    modalLinks(result);
    setModalState("loading", "Waiting for GitHub Pages", "Publish is pending.");
    if (result.commit_sha) pollPages(result.commit_sha, result.live_url || result.pages_url);
    $("landingMessage").textContent = "Published " + shortSha(result.commit_sha);
    await loadDeployments();
  } finally {
    $("publishSite").disabled = false;
  }
}

function openPublishModal(title, text) {
  $("publishModal").classList.remove("hidden");
  $("modalClose").disabled = false;
  setModalState("loading", title, text);
  modalStep("modalStepSave", "Waiting");
  modalStep("modalStepCommit", "Waiting");
  modalStep("modalStepPages", "Waiting");
  $("modalLive").classList.add("hidden");
  $("modalCommit").classList.add("hidden");
}

function setModalState(stateName, title, text) {
  const mark = $("modalMark");
  mark.className = "modal-mark " + (stateName === "loading" ? "loading" : stateName === "success" ? "success" : stateName === "error" ? "error" : "");
  mark.textContent = "";
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
}

function modalStep(id, value) {
  const row = $(id);
  if (row) row.querySelector("strong").textContent = value;
}

function modalLinks(result) {
  if (result.commit_url) {
    $("modalCommit").href = result.commit_url;
    $("modalCommit").classList.remove("hidden");
  }
  const live = result.live_url || result.pages_url;
  if (live) {
    $("modalLive").href = live;
    $("modalLive").classList.remove("hidden");
  }
}

async function loadNavigation() {
  const data = await api("/api/navigation");
  state.navigation = data.items;
  renderLinks("navItems", state.navigation);
}

async function saveNavigation() {
  await saveSettings();
  state.navigation = await saveLinkRows("/api/navigation", "navItems");
  $("navMessage").textContent = "Navigation saved.";
}

async function loadFooter() {
  const data = await api("/api/footer-links");
  state.footer = data.items;
  renderLinks("footerItems", state.footer);
}

async function saveFooter() {
  await saveSettings();
  state.footer = await saveLinkRows("/api/footer-links", "footerItems");
  $("footerMessage").textContent = "Footer saved.";
}

function renderLinks(containerId, items) {
  $(containerId).innerHTML = (items.length ? items : [{ label: "", url: "", sort_order: 0, target: "_self" }]).map((item, index) => linkRow(item, index)).join("");
  document.querySelectorAll("#" + containerId + " [data-remove]").forEach((button) => button.onclick = () => button.closest(".link-row").remove());
}

function linkRow(item, index) {
  return '<div class="link-row"><input class="form-control" placeholder="Label" data-field="label" value="' + attr(item.label || "") + '"><input class="form-control" placeholder="URL" data-field="url" value="' + attr(item.url || "") + '"><input class="form-control" type="number" data-field="sort_order" value="' + attr(item.sort_order ?? index) + '"><select class="form-select" data-field="target"><option value="_self"' + (item.target !== "_blank" ? " selected" : "") + '>Same tab</option><option value="_blank"' + (item.target === "_blank" ? " selected" : "") + '>New tab</option></select><button class="btn btn-outline-secondary" type="button" data-remove>X</button></div>';
}

async function saveLinkRows(path, containerId) {
  const items = [...document.querySelectorAll("#" + containerId + " .link-row")].map((row) => Object.fromEntries([...row.querySelectorAll("[data-field]")].map((field) => [field.dataset.field, field.value])));
  const result = await api(path, { method: "POST", body: JSON.stringify({ items }) });
  renderLinks(containerId, result.items);
  return result.items;
}

async function loadDeployments(page = state.deploymentsPage) {
  const data = await api("/api/deployments?page=" + page + "&per_page=12");
  state.deployments = data.deployments;
  state.deploymentsPage = data.page;
  state.deploymentsTotalPages = data.total_pages;
  const rows = state.deployments.length ? state.deployments.map((item) => '<tr><td><strong>' + deploymentType(item) + '</strong>' + (item.post_title ? '<br><span class="text-secondary small">' + esc(item.post_title) + '</span>' : '') + '</td><td>' + statusPill(item.status) + '</td><td>' + fmt(item.updated_at) + '</td></tr>').join("") : '<tr><td colspan="3" class="text-secondary">No deployments yet.</td></tr>';
  $("deploymentsTable").innerHTML = rows;
  if ($("dashboardDeployments")) $("dashboardDeployments").innerHTML = state.deployments.length ? state.deployments.slice(0, 5).map((item) => '<tr><td>' + deploymentType(item) + '</td><td>' + statusPill(item.status) + '</td><td>' + fmt(item.updated_at) + '</td></tr>').join("") : '<tr><td colspan="3" class="text-secondary">No deployments yet.</td></tr>';
  if ($("deployPageInfo")) $("deployPageInfo").textContent = "Page " + state.deploymentsPage + " / " + state.deploymentsTotalPages;
  if ($("deployPrev")) $("deployPrev").disabled = state.deploymentsPage <= 1;
  if ($("deployNext")) $("deployNext").disabled = state.deploymentsPage >= state.deploymentsTotalPages;
}

function renderDashboard() {
  const published = state.posts.filter((post) => post.status === "published").length;
  const drafts = state.posts.filter((post) => post.status === "draft").length;
  $("dashPosts").textContent = String(state.posts.length);
  $("dashPublished").textContent = String(published);
  $("dashDrafts").textContent = String(drafts);
  const latest = state.deployments[0];
  $("dashDeploy").textContent = latest ? deploymentType(latest) + " / " + latest.status : "No deployments yet";
}

function deploymentType(item) {
  if (item.type === "post") return "Post publish";
  if (item.type === "site") return "Site publish";
  return esc(item.type || "Publish");
}

function statusPill(status) {
  const value = ["pending", "success", "failed"].includes(status) ? status : "pending";
  return '<span class="status status-' + value + '">' + value + '</span>';
}

function setColorMode(mode) {
  const next = mode === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("cms:theme", next);
  if ($("themeToggle")) $("themeToggle").textContent = next === "dark" ? "Light" : "Dark";
}

async function initEditor() {
  if (!window.ClassicEditor) return;
  state.editor = await ClassicEditor.create($("body_html"), {
    toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "blockQuote", "insertTable", "undo", "redo"]
  });
}

function getEditorData() {
  return state.editor ? state.editor.getData() : $("body_html").value;
}

function setEditorData(value) {
  if (state.editor) state.editor.setData(value || "");
  else $("body_html").value = value || "";
}

function deployStep(id, value) { $(id).innerHTML = value || "Idle"; }
function commitLink(url, sha) { return sha ? (url ? link(url, shortSha(sha)) : shortSha(sha)) : "Idle"; }
function link(url, label) { return url ? '<a href="' + attr(url) + '" target="_blank" rel="noopener">' + esc(label || url) + '</a>' : ""; }
function shortSha(value) { return value ? String(value).slice(0, 7) : ""; }
function fmt(value) { return value ? new Date(value).toLocaleString() : ""; }
function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function attr(value) { return esc(value).replace(/"/g, "&quot;"); }

document.querySelectorAll(".nav button").forEach((button) => button.onclick = () => showView(button.dataset.view));
document.querySelectorAll("[data-jump]").forEach((button) => button.onclick = () => showView(button.dataset.jump));
$("refreshAll").onclick = refreshAll;
$("newPost").onclick = newPost;
$("dashNewPost").onclick = newPost;
$("postSearch").oninput = renderPostsTable;
$("statusFilter").onchange = renderPostsTable;
$("postForm").onsubmit = async (event) => { event.preventDefault(); try { await savePost(); } catch (error) { $("postMessage").textContent = error.message; } };
$("publishPost").onclick = publishPost;
$("deletePost").onclick = deletePost;
$("previewPost").onclick = previewPost;
$("insertImage").onclick = insertImage;
$("landingForm").onsubmit = async (event) => { event.preventDefault(); try { await saveLanding(); } catch (error) { $("landingMessage").textContent = error.message; } };
$("publishLanding").onclick = publishSite;
$("publishSite").onclick = publishSite;
$("settingsForm").onsubmit = async (event) => { event.preventDefault(); try { await saveSettings(); $("settingsMessage").textContent = "Settings saved."; } catch (error) { $("settingsMessage").textContent = error.message; } };
document.querySelectorAll('input[name="theme_id"]').forEach((input) => input.onchange = () => {
  document.querySelectorAll(".theme-card").forEach((card) => card.classList.toggle("selected", card.querySelector("input").checked));
});
$("saveTheme").onclick = saveTheme;
$("addNavItem").onclick = () => $("navItems").insertAdjacentHTML("beforeend", linkRow({}, document.querySelectorAll("#navItems .link-row").length));
$("saveNavigation").onclick = saveNavigation;
$("addFooterItem").onclick = () => $("footerItems").insertAdjacentHTML("beforeend", linkRow({}, document.querySelectorAll("#footerItems .link-row").length));
$("saveFooter").onclick = saveFooter;
$("refreshDeployments").onclick = () => loadDeployments();
$("deployPrev").onclick = () => loadDeployments(state.deploymentsPage - 1);
$("deployNext").onclick = () => loadDeployments(state.deploymentsPage + 1);
$("themeToggle").onclick = () => setColorMode(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
$("modalClose").onclick = () => $("publishModal").classList.add("hidden");
$("previewClose").onclick = () => $("previewModal").classList.add("hidden");

setColorMode(localStorage.getItem("cms:theme") || "light");
initEditor().catch((error) => { $("postMessage").textContent = "Editor failed: " + error.message; });
refreshAll().then(() => {
  showView(localStorage.getItem("cms:view") || "dashboard");
}).catch((error) => {
  $("dashPosts").textContent = error.message;
});
`;
