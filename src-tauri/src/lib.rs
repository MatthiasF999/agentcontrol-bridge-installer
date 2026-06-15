// Phase 55.2.1 — installer wizard backend.
//
// Tauri commands live in `commands/`: WSL detection/install, the run-in-wsl
// streaming shell wrapper, system deps, git config, Node/Claude install,
// bridge download + npm install, .env generation, OAuth/pairing helpers,
// and the systemd-user service.

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![
            commands::wsl::detect_wsl,
            commands::wsl::install_wsl,
            commands::ubuntu::detect_ubuntu,
            commands::ubuntu::install_ubuntu,
            commands::shell::run_in_wsl,
            commands::deps::apt_install_deps,
            commands::deps::install_node22,
            commands::deps::install_claude_cli,
            commands::git_cfg::configure_git,
            commands::bridge::download_bridge,
            commands::bridge::npm_install_bridge,
            commands::api_key::generate_api_key,
            commands::api_key::write_env_file,
            commands::oauth::open_claude_oauth,
            commands::oauth::poll_claude_creds,
            commands::pair::open_operator_portal,
            commands::pair::pair_bridge,
            commands::systemd::install_systemd_service,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
