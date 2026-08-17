export const ADMIN_CSS = `
:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #172026;
  background: #f5f6f3;
}
* { box-sizing: border-box; }
body { margin: 0; }
button, input, textarea, select { font: inherit; }
a { color: #1d5f75; }
.app { min-height: 100vh; display: grid; grid-template-columns: 248px 1fr; }
.sidebar { background: #111a20; color: #f7faf8; padding: 18px; display: grid; grid-template-rows: auto 1fr auto; gap: 22px; }
.brand { display: grid; gap: 3px; }
.brand strong { font-size: 18px; }
.brand span { color: #aeb9b2; font-size: 13px; }
.nav { display: grid; align-content: start; gap: 6px; }
.nav button { display: flex; align-items: center; justify-content: space-between; width: 100%; border: 0; border-radius: 6px; padding: 10px 11px; background: transparent; color: #dbe4df; cursor: pointer; text-align: left; }
.nav button.active { background: #e7efe9; color: #111a20; }
.logout { color: #b8c7bf; text-decoration: none; font-size: 14px; }
.main { min-width: 0; display: grid; grid-template-rows: auto 1fr; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; background: #fff; border-bottom: 1px solid #d9ddd5; }
.topbar h1 { font-size: 22px; margin: 0; }
.topbar p { margin: 4px 0 0; color: #657168; }
.content { padding: 22px 24px 40px; }
.view { display: none; }
.view.active { display: block; }
.grid { display: grid; gap: 16px; }
.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.panel { background: #fff; border: 1px solid #d9ddd5; border-radius: 8px; padding: 16px; }
.panel h2 { margin: 0 0 14px; font-size: 18px; }
.actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.button, button { border: 1px solid #172026; background: #172026; color: #fff; border-radius: 6px; padding: 9px 12px; cursor: pointer; text-decoration: none; }
button.secondary { background: #fff; color: #172026; border-color: #b8c0b2; }
button.danger { background: #8b1e1e; border-color: #8b1e1e; }
button:disabled { opacity: .55; cursor: not-allowed; }
label { display: grid; gap: 6px; margin-bottom: 13px; color: #26332c; font-weight: 650; }
input, textarea, select { width: 100%; border: 1px solid #b8c0b2; border-radius: 6px; padding: 10px; background: #fff; color: #172026; }
textarea { min-height: 150px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.muted { color: #657168; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 10px; border-bottom: 1px solid #e5e8e1; text-align: left; vertical-align: top; }
.table th { font-size: 12px; color: #657168; text-transform: uppercase; letter-spacing: .04em; }
.row-click { cursor: pointer; }
.row-click:hover { background: #f7f8f4; }
.status { display: inline-flex; align-items: center; border: 1px solid #b8c0b2; border-radius: 999px; padding: 2px 8px; font-size: 12px; color: #344239; }
.editor-shell { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
.ck-editor__editable { min-height: 360px; }
.link-list { display: grid; gap: 10px; }
.link-row { display: grid; grid-template-columns: 1fr 1.4fr 110px 92px 42px; gap: 8px; align-items: center; }
.deploy-card { display: grid; gap: 8px; }
.deploy-line { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #eef0eb; padding-top: 8px; color: #46514a; }
.deploy-line:first-child { border-top: 0; padding-top: 0; }
.toast { min-height: 24px; color: #385243; }
.hidden { display: none !important; }
@media (max-width: 980px) {
  .app { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .editor-shell, .two, .three { grid-template-columns: 1fr; }
  .link-row { grid-template-columns: 1fr; }
}
`;
