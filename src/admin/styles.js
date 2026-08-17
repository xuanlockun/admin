export const ADMIN_CSS = `
:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #1b2329;
  background: #f3f5f7;
}
* { box-sizing: border-box; }
body { margin: 0; }
button, input, textarea, select { font: inherit; }
a { color: #146985; }
.app { min-height: 100vh; display: grid; grid-template-columns: 248px 1fr; }
.sidebar { background: #101820; color: #f7faf8; padding: 18px; display: grid; grid-template-rows: auto 1fr auto; gap: 22px; box-shadow: inset -1px 0 0 rgba(255,255,255,.06); }
.brand { display: grid; gap: 3px; }
.brand strong { font-size: 18px; }
.brand span { color: #aeb9b2; font-size: 13px; }
.nav { display: grid; align-content: start; gap: 6px; }
.nav button { display: flex; align-items: center; justify-content: space-between; width: 100%; border: 0; border-radius: 8px; padding: 10px 11px; background: transparent; color: #dbe4df; cursor: pointer; text-align: left; }
.nav button span { color: #8fa19a; font-size: 12px; }
.nav button.active { background: #e9f1ed; color: #101820; }
.nav button.active span { color: #50615a; }
.logout { color: #b8c7bf; text-decoration: none; font-size: 14px; }
.main { min-width: 0; display: grid; grid-template-rows: auto 1fr; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; background: rgba(255,255,255,.94); border-bottom: 1px solid #d8dee2; backdrop-filter: blur(12px); }
.topbar h1 { font-size: 22px; margin: 0; }
.topbar p { margin: 4px 0 0; color: #657168; }
.content { padding: 22px 24px 40px; max-width: 1380px; width: 100%; }
.view { display: none; }
.view.active { display: block; }
.grid { display: grid; gap: 16px; }
.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.panel { background: #fff; border: 1px solid #d8dee2; border-radius: 10px; padding: 16px; box-shadow: 0 1px 2px rgba(16,24,32,.04); }
.panel h2 { margin: 0 0 14px; font-size: 18px; }
.actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.button, button { border: 1px solid #172026; background: #172026; color: #fff; border-radius: 7px; padding: 9px 12px; cursor: pointer; text-decoration: none; }
button.secondary, .button.secondary { background: #fff; color: #172026; border-color: #c4ccd0; }
button.danger { background: #8b1e1e; border-color: #8b1e1e; }
button:disabled { opacity: .55; cursor: not-allowed; }
label { display: grid; gap: 6px; margin-bottom: 13px; color: #26332c; font-weight: 650; }
input, textarea, select { width: 100%; border: 1px solid #c4ccd0; border-radius: 7px; padding: 10px; background: #fff; color: #172026; }
input:focus, textarea:focus, select:focus { outline: 2px solid rgba(20,105,133,.16); border-color: #146985; }
textarea { min-height: 150px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.muted { color: #657168; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 11px 10px; border-bottom: 1px solid #e8edf0; text-align: left; vertical-align: top; }
.table th { font-size: 12px; color: #657168; text-transform: uppercase; letter-spacing: .04em; }
.row-click { cursor: pointer; }
.row-click:hover { background: #f6f9fa; }
.status { display: inline-flex; align-items: center; border: 1px solid #b8c0b2; border-radius: 999px; padding: 2px 8px; font-size: 12px; color: #344239; }
.editor-shell { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
.ck-editor__editable { min-height: 360px; }
.link-list { display: grid; gap: 10px; }
.link-row { display: grid; grid-template-columns: 1fr 1.4fr 110px 92px 42px; gap: 8px; align-items: center; }
.deploy-card { display: grid; gap: 8px; }
.deploy-line { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #eef0eb; padding-top: 8px; color: #46514a; }
.deploy-line:first-child { border-top: 0; padding-top: 0; }
.toast { min-height: 24px; color: #385243; }
.theme-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.theme-card { display: block; margin: 0; cursor: pointer; }
.theme-card input { position: absolute; opacity: 0; pointer-events: none; }
.theme-preview { min-height: 190px; display: grid; align-content: end; gap: 8px; border: 1px solid #d8dee2; border-radius: 12px; padding: 16px; background: #fff; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.theme-card.selected .theme-preview { border-color: #146985; box-shadow: 0 0 0 3px rgba(20,105,133,.12); transform: translateY(-1px); }
.theme-preview div { height: 84px; border-radius: 10px; margin-bottom: 8px; }
.editorial-preview { background: #fbfaf6; }
.editorial-preview div { background: linear-gradient(135deg, #181713 0 34%, #ded9cd 34% 38%, #fff 38%); }
.studio-preview { background: #eef3f2; }
.studio-preview div { background: radial-gradient(circle at 20% 20%, #9bd1c7, transparent 32%), linear-gradient(135deg, #fff, #dcebe7); border: 1px solid #cad8d4; }
.theme-preview strong { font-size: 18px; }
.theme-preview span { color: #657168; font-weight: 500; line-height: 1.4; }
.modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px; background: rgba(16,24,32,.46); }
.publish-modal { width: min(460px, 100%); display: grid; gap: 12px; padding: 22px; border-radius: 14px; background: #fff; box-shadow: 0 30px 100px rgba(0,0,0,.28); text-align: center; }
.preview-modal { width: min(860px, 100%); max-height: min(760px, calc(100vh - 40px)); overflow: auto; display: grid; gap: 16px; padding: 22px; border-radius: 14px; background: #fff; box-shadow: 0 30px 100px rgba(0,0,0,.28); }
.preview-article { font-size: 18px; line-height: 1.75; color: #172026; }
.preview-article h1 { font-size: 42px; line-height: 1.05; margin: 0 0 12px; }
.preview-article img { max-width: 100%; height: auto; border-radius: 8px; }
.modal-mark { width: 58px; height: 58px; display: grid; place-items: center; margin: 0 auto; border-radius: 50%; background: #edf6f3; font-size: 28px; }
.modal-mark.loading { animation: spin 1.2s linear infinite; }
.modal-mark.success { background: #e8f7ee; color: #177245; }
.modal-mark.error { background: #fdecec; color: #9a1f1f; }
.publish-modal h2 { margin: 0; font-size: 24px; }
.publish-modal p { margin: 0; color: #657168; }
.modal-progress { display: grid; gap: 8px; margin: 8px 0; text-align: left; }
.modal-step { display: flex; justify-content: space-between; gap: 12px; padding: 9px 10px; border: 1px solid #e8edf0; border-radius: 8px; color: #657168; }
.modal-step strong { color: #172026; }
.modal-actions { justify-content: center; }
@keyframes spin { to { transform: rotate(360deg); } }
.hidden { display: none !important; }
@media (max-width: 980px) {
  .app { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .editor-shell, .two, .three { grid-template-columns: 1fr; }
  .link-row { grid-template-columns: 1fr; }
}
`;
