use super::shell::{run_in_wsl, CommandResult};
use tauri::AppHandle;

const TARBALL_URL: &str =
    "https://github.com/MatthiasF999/agentcontrol-bridge/archive/refs/heads/main.tar.gz";
const BRIDGE_DIR: &str = "$HOME/agentcontrol-bridge";

#[tauri::command]
pub async fn download_bridge(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!(
        "mkdir -p {dir} && curl -fsSL {url} | tar -xz -C {dir} --strip-components=1",
        dir = BRIDGE_DIR,
        url = TARBALL_URL,
    );
    run_in_wsl(app, distro, cmd, event_id).await
}

#[tauri::command]
pub async fn npm_install_bridge(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!("cd {BRIDGE_DIR} && npm install --no-fund --no-audit");
    run_in_wsl(app, distro, cmd, event_id).await
}

/// Compile the bridge TypeScript; required before `npm start` runs `dist/index.js`.
#[tauri::command]
pub async fn npm_run_build_bridge(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!("cd {BRIDGE_DIR} && npm run build");
    run_in_wsl(app, distro, cmd, event_id).await
}
