export const ADMIN_CSS = `
:root {
  --cms-sidebar: #18212b;
  --cms-sidebar-muted: #8d9aa7;
  --cms-bg: #f4f6f8;
  --cms-line: #dce3e8;
  --cms-card: #ffffff;
  --cms-text: #18212b;
  --cms-muted: #647281;
  --cms-accent: #206bc4;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--cms-bg); color: var(--cms-text); }
a { text-decoration: none; }
button, input, textarea, select { font: inherit; }

.cms-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
}

.cms-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
  padding: 18px 14px;
  background: var(--cms-sidebar);
  color: #fff;
}

.cms-brand {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: center;
  padding: 6px 8px 14px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.cms-brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #fff;
  color: var(--cms-sidebar);
  font-weight: 800;
  font-size: 13px;
}

.cms-brand strong { display: block; font-size: 16px; line-height: 1.2; }
.cms-brand span { color: var(--cms-sidebar-muted); font-size: 13px; }

.cms-nav {
  display: grid;
  align-content: start;
  gap: 4px;
}

.cms-nav button {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 8px;
  padding: 10px 11px;
  background: transparent;
  color: #dbe4ec;
  text-align: left;
  cursor: pointer;
}

.cms-nav button:hover { background: rgba(255,255,255,.06); }
.cms-nav button.active { background: #fff; color: var(--cms-sidebar); box-shadow: 0 8px 24px rgba(0,0,0,.18); }
.cms-nav .nav-main { font-weight: 700; }
.cms-nav button > span:last-child { color: var(--cms-sidebar-muted); font-size: 12px; }
.cms-nav button.active > span:last-child { color: #647281; }
.cms-logout { color: #c6d0d9; padding: 10px 12px; border-radius: 8px; }
.cms-logout:hover { background: rgba(255,255,255,.06); color: #fff; }

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
  min-height: 82px;
  padding: 16px 28px;
  background: rgba(255,255,255,.92);
  border-bottom: 1px solid var(--cms-line);
  backdrop-filter: blur(14px);
}

.cms-breadcrumb {
  margin-bottom: 3px;
  color: var(--cms-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.cms-topbar h1 { margin: 0; font-size: 24px; line-height: 1.15; }
.cms-topbar p { margin: 4px 0 0; color: var(--cms-muted); }
.cms-actions, .modal-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.cms-content { width: min(1420px, 100%); padding: 24px 28px 48px; }

.view { display: none; }
.view.active { display: block; }
.cms-grid { display: grid; gap: 18px; }
.two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.compact { gap: 12px; }

.cms-card {
  background: var(--cms-card);
  border: 1px solid var(--cms-line);
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 1px 2px rgba(24,33,43,.04);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card-head h2, .cms-card h2 { margin: 0; font-size: 18px; line-height: 1.25; }
.card-head p { margin: 4px 0 0; color: var(--cms-muted); }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
.stat-card { min-height: 118px; display: grid; align-content: space-between; }
.stat-card span { color: var(--cms-muted); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }
.stat-card strong { display: block; margin-top: 18px; font-size: 28px; line-height: 1; }
.quick-actions { display: grid; gap: 10px; }
.table-toolbar { display: grid; grid-template-columns: 1fr 190px; gap: 12px; margin-bottom: 14px; }
.cms-table { margin: 0; }
.cms-table th { color: var(--cms-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
.cms-table td { vertical-align: middle; }
.row-click { cursor: pointer; }
.row-click:hover { background: #f8fafc; }
.status { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 9px; background: #eef3f7; color: #304352; font-size: 12px; font-weight: 700; }

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
  align-items: start;
}

.editor-side {
  position: sticky;
  top: 106px;
  display: grid;
  gap: 18px;
}

.publish-card .btn-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.publish-card .btn-list .btn-success, .publish-card .btn-list .btn-danger { grid-column: span 1; }
.ck-editor__editable { min-height: 420px; }
.form-label { display: grid; gap: 7px; margin-bottom: 14px; font-weight: 700; color: #2b3a45; }
textarea.form-control { min-height: 132px; resize: vertical; }
.cms-toast { min-height: 24px; margin: 12px 0 0; color: #2f6b49; }

.deploy-card { display: grid; gap: 10px; }
.deploy-line, .modal-step {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 9px;
  border-top: 1px solid #edf1f4;
  color: var(--cms-muted);
}
.deploy-line:first-of-type { border-top: 0; padding-top: 0; }
.deploy-line strong, .modal-step strong { color: var(--cms-text); text-align: right; }

.link-list { display: grid; gap: 10px; margin-bottom: 14px; }
.link-row { display: grid; grid-template-columns: 1fr 1.4fr 110px 112px 42px; gap: 8px; align-items: center; }

.theme-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
.theme-card { display: block; margin: 0; cursor: pointer; }
.theme-card input { position: absolute; opacity: 0; pointer-events: none; }
.theme-preview {
  min-height: 250px;
  display: grid;
  align-content: end;
  gap: 9px;
  border: 1px solid var(--cms-line);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
}
.theme-card.selected .theme-preview { border-color: var(--cms-accent); box-shadow: 0 0 0 3px rgba(32,107,196,.14); transform: translateY(-1px); }
.theme-shot { height: 130px; border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
.editorial-preview { background: #fbfaf6; }
.editorial-preview .theme-shot { background: linear-gradient(135deg, #181713 0 26%, #ded9cd 26% 29%, #fff 29% 68%, #fbfaf6 68%); border: 1px solid #ded9cd; }
.studio-preview { background: #eef3f2; }
.studio-preview .theme-shot { background: radial-gradient(circle at 22% 22%, #9bd1c7, transparent 30%), linear-gradient(135deg, #fff, #dcebe7); border: 1px solid #cad8d4; }
.theme-preview strong { font-size: 20px; }
.theme-preview span { color: var(--cms-muted); font-weight: 500; line-height: 1.45; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(12,18,24,.52);
}

.publish-modal, .preview-modal {
  width: min(520px, 100%);
  display: grid;
  gap: 14px;
  padding: 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 30px 100px rgba(0,0,0,.28);
}

.publish-modal { text-align: center; }
.preview-modal { width: min(920px, 100%); max-height: min(780px, calc(100vh - 40px)); overflow: auto; text-align: left; }
.modal-mark {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  border-radius: 50%;
  background: #edf4ff;
}
.modal-mark::before {
  content: "";
  width: 28px;
  height: 28px;
  border: 3px solid #b8cff5;
  border-top-color: var(--cms-accent);
  border-radius: 50%;
}
.modal-mark.loading::before { animation: spin 1s linear infinite; }
.modal-mark.success { background: #e8f7ee; }
.modal-mark.success::before { width: 22px; height: 12px; border: 0; border-left: 4px solid #177245; border-bottom: 4px solid #177245; border-radius: 0; transform: rotate(-45deg); }
.modal-mark.error { background: #fdecec; }
.modal-mark.error::before { content: "!"; width: auto; height: auto; border: 0; color: #9a1f1f; font-size: 34px; font-weight: 800; }
.publish-modal h2 { margin: 0; font-size: 24px; }
.publish-modal p { margin: 0; color: var(--cms-muted); }
.modal-progress { display: grid; gap: 8px; margin: 8px 0; text-align: left; }
.modal-step { border: 1px solid #edf1f4; border-radius: 8px; padding: 9px 10px; }
.modal-actions { justify-content: center; }
.preview-article { font-size: 18px; line-height: 1.75; color: var(--cms-text); }
.preview-article h1 { font-size: 42px; line-height: 1.05; margin: 0 0 12px; }
.preview-article img { max-width: 100%; height: auto; border-radius: 8px; }

.hidden { display: none !important; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
}
.login-card { width: min(380px, 100%); }
.login-brand { margin: -4px 0 18px; padding: 0 0 16px; border-bottom: 1px solid var(--cms-line); color: var(--cms-text); }
.login-brand span { color: var(--cms-muted); }

@media (max-width: 1100px) {
  .cms-shell { grid-template-columns: 1fr; }
  .cms-sidebar { position: static; height: auto; }
  .cms-nav { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  .editor-layout, .two-col, .stat-grid { grid-template-columns: 1fr; }
  .editor-side { position: static; }
  .table-toolbar, .link-row { grid-template-columns: 1fr; }
}
`;
