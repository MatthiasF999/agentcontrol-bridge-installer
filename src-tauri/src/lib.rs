// Phase 55.2.0 — Tauri 2.x scaffold only.
//
// Commands for the actual installer wizard land in Phase 55.2.1 under
// `src/commands/` (WSL detection/install, run-in-wsl shell wrapper,
// git config, Node/Claude install, bridge download, .env generation,
// systemd-user service, etc.).

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
