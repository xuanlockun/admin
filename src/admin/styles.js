export const ADMIN_CSS = `
:root {
  --cms-bg: #f7f8fa;
  --cms-panel: #ffffff;
  --cms-panel-2: #f1f3f5;
  --cms-line: #d9dee5;
  --cms-text: #111827;
  --cms-muted: #697586;
  --cms-accent: #2563eb;
  --cms-accent-text: #ffffff;
  --cms-ok: #15803d;
  --cms-warn: #b7791f;
  --cms-bad: #b42318;
}

:root[data-theme="dark"] {
  --cms-bg: #111418;
  --cms-panel: #181c22;
  --cms-panel-2: #20252d;
  --cms-line: #2b323c;
  --cms-text: #eef2f7;
  --cms-muted: #9aa4b2;
  --cms-accent: #60a5fa;
  --cms-accent-text: #08111f;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--cms-bg);
  color: var(--cms-text);
  font-size: 14px;
}
a { color: var(--cms-accent); text-decoration: none; }
button, input, textarea, select { font: inherit; }

.cms-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
}

.cms-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  padding: 18px 12px;
  background: var(--cms-panel);
  border-right: 1px solid var(--cms-line);
}

.cms-brand {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;
  padding: 0 8px 16px;
  border-bottom: 1px solid var(--cms-line);
}

.cms-brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--cms-panel-2);
  color: var(--cms-text);
  font-size: 12px;
  font-weight: 800;
}

.cms-brand strong { display: block; line-height: 1.2; }
.cms-brand span, .cms-topbar p, .card-head p, .theme-preview span, .text-secondary { color: var(--cms-muted) !important; }

.cms-nav {
  display: grid;
  align-content: start;
  gap: 2px;
}

.cms-nav button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 8px;
  padding: 9px 10px;
  background: transparent;
  color: var(--cms-muted);
  text-align: left;
  cursor: pointer;
}

.cms-nav button:hover,
.cms-nav button.active {
  background: var(--cms-panel-2);
  color: var(--cms-text);
}

.cms-nav .nav-main { font-weight: 700; }
.cms-nav button > span:last-child { font-size: 12px; }
.cms-logout {
  display: block;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--cms-muted);
}
.cms-logout:hover { background: var(--cms-panel-2); color: var(--cms-text); }

.cms-main {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
}

.cms-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  min-height: 74px;
  padding: 14px 26px;
  background: color-mix(in srgb, var(--cms-bg) 90%, transparent);
  border-bottom: 1px solid var(--cms-line);
  backdrop-filter: blur(12px);
}

.cms-breadcrumb {
  margin-bottom: 3px;
  color: var(--cms-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.cms-topbar h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
}
.cms-topbar p { margin: 3px 0 0; }
.cms-actions, .modal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.cms-content {
  width: min(1360px, 100%);
  padding: 22px 26px 44px;
}

.view { display: none; }
.view.active { display: block; }
.cms-grid { display: grid; gap: 16px; }
.two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.compact { gap: 10px; }

.cms-card {
  background: var(--cms-panel);
  border: 1px solid var(--cms-line);
  border-radius: 8px;
  padding: 16px;
  box-shadow: none;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.card-head h2, .cms-card h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.stat-card {
  min-height: 102px;
  display: grid;
  align-content: space-between;
}
.stat-card span {
  color: var(--cms-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.stat-card strong {
  display: block;
  margin-top: 18px;
  font-size: 26px;
  line-height: 1.05;
}

.quick-actions { display: grid; gap: 8px; }
.table-toolbar {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 10px;
  margin-bottom: 12px;
}
.table { color: var(--cms-text); }
.cms-table { margin: 0; }
.cms-table th {
  color: var(--cms-muted);
  font-size: 11px;
  text-transform: uppercase;
}
.cms-table td {
  vertical-align: middle;
  border-color: var(--cms-line);
}
.row-click { cursor: pointer; }
.row-click:hover { background: var(--cms-panel-2); }

.status {
  display: inline-flex;
  align-items: center;
  min-width: 68px;
  justify-content: center;
  border-radius: 999px;
  padding: 3px 9px;
  background: var(--cms-panel-2);
  color: var(--cms-muted);
  font-size: 12px;
  font-weight: 700;
}
.status-pending { color: var(--cms-warn); }
.status-success { color: var(--cms-ok); }
.status-failed { color: var(--cms-bad); }

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.editor-side {
  position: sticky;
  top: 96px;
  display: grid;
  gap: 16px;
}

.publish-card .btn-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.ck-editor__editable {
  min-height: 420px;
  background: var(--cms-panel);
  color: var(--cms-text);
}
.form-label {
  display: grid;
  gap: 6px;
  margin-bottom: 13px;
  color: var(--cms-text);
  font-weight: 700;
}
.form-control, .form-select {
  background-color: var(--cms-bg);
  border-color: var(--cms-line);
  color: var(--cms-text);
  border-radius: 8px;
}
.form-control:focus, .form-select:focus {
  background-color: var(--cms-bg);
  color: var(--cms-text);
  border-color: var(--cms-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cms-accent) 18%, transparent);
}
textarea.form-control { min-height: 132px; resize: vertical; }
.code-area {
  min-height: 460px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 14px;
  color: var(--cms-text);
  font-weight: 700;
}
.cms-toast {
  min-height: 22px;
  margin: 10px 0 0;
  color: var(--cms-ok);
}

.deploy-card { display: grid; gap: 9px; }
.deploy-line, .modal-step {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--cms-line);
  color: var(--cms-muted);
}
.deploy-line:first-of-type { border-top: 0; padding-top: 0; }
.deploy-line strong, .modal-step strong {
  color: var(--cms-text);
  text-align: right;
}

.link-list {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}
.link-row {
  display: grid;
  grid-template-columns: 1fr 1.4fr 100px 108px 40px;
  gap: 8px;
  align-items: center;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.theme-card {
  display: block;
  margin: 0;
  cursor: pointer;
}
.theme-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.theme-preview {
  min-height: 220px;
  display: grid;
  align-content: end;
  gap: 8px;
  border: 1px solid var(--cms-line);
  border-radius: 8px;
  padding: 14px;
  background: var(--cms-bg);
}
.theme-card.selected .theme-preview {
  border-color: var(--cms-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cms-accent) 18%, transparent);
}
.theme-shot {
  height: 112px;
  border-radius: 8px;
  margin-bottom: 6px;
  overflow: hidden;
}
.editorial-preview .theme-shot {
  background: linear-gradient(135deg, #111827 0 24%, #f8fafc 24% 70%, #d1d5db 70%);
}
.studio-preview .theme-shot {
  background: linear-gradient(135deg, #0f766e 0 28%, #f8fafc 28% 72%, #93c5fd 72%);
}
.theme-preview strong { font-size: 18px; }
.theme-preview span { font-weight: 500; line-height: 1.45; }

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  color: var(--cms-muted);
}

.btn {
  border-radius: 8px;
  font-weight: 700;
}
.btn-primary {
  background: var(--cms-accent);
  border-color: var(--cms-accent);
  color: var(--cms-accent-text);
}
.btn-outline-secondary {
  border-color: var(--cms-line);
  color: var(--cms-text);
  background: var(--cms-panel);
}
.btn-outline-secondary:hover {
  background: var(--cms-panel-2);
  border-color: var(--cms-line);
  color: var(--cms-text);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.5);
}

.publish-modal, .preview-modal {
  width: min(500px, 100%);
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 8px;
  border: 1px solid var(--cms-line);
  background: var(--cms-panel);
  box-shadow: 0 20px 80px rgba(0,0,0,.24);
}

.publish-modal { text-align: center; }
.preview-modal {
  width: min(920px, 100%);
  max-height: min(780px, calc(100vh - 40px));
  overflow: auto;
  text-align: left;
}
.modal-mark {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--cms-panel-2);
}
.modal-mark::before {
  content: "";
  width: 24px;
  height: 24px;
  border: 3px solid var(--cms-line);
  border-top-color: var(--cms-accent);
  border-radius: 50%;
}
.modal-mark.loading::before { animation: spin 1s linear infinite; }
.modal-mark.success::before {
  width: 21px;
  height: 11px;
  border: 0;
  border-left: 4px solid var(--cms-ok);
  border-bottom: 4px solid var(--cms-ok);
  border-radius: 0;
  transform: rotate(-45deg);
}
.modal-mark.error::before {
  content: "!";
  width: auto;
  height: auto;
  border: 0;
  color: var(--cms-bad);
  font-size: 32px;
  font-weight: 800;
}
.publish-modal h2 { margin: 0; font-size: 22px; }
.publish-modal p { margin: 0; color: var(--cms-muted); }
.modal-progress {
  display: grid;
  gap: 8px;
  margin: 8px 0;
  text-align: left;
}
.modal-step {
  border: 1px solid var(--cms-line);
  border-radius: 8px;
  padding: 9px 10px;
}
.modal-actions { justify-content: center; }
.preview-article {
  font-size: 17px;
  line-height: 1.75;
  color: var(--cms-text);
}
.preview-article h1 {
  font-size: 38px;
  line-height: 1.08;
  margin: 0 0 12px;
}
.preview-article img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.hidden { display: none !important; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
}
.login-card { width: min(380px, 100%); }
.login-brand {
  margin: -4px 0 18px;
  padding: 0 0 16px;
  border-bottom: 1px solid var(--cms-line);
}

@media (max-width: 1100px) {
  .cms-shell { grid-template-columns: 1fr; }
  .cms-sidebar { position: static; height: auto; }
  .cms-nav { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .editor-layout, .two-col, .stat-grid { grid-template-columns: 1fr; }
  .editor-side { position: static; }
  .table-toolbar, .link-row { grid-template-columns: 1fr; }
  .cms-topbar { align-items: flex-start; flex-direction: column; }
}
`;
