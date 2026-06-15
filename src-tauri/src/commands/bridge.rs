use super::shell::{run_in_wsl, run_in_wsl_capture, CommandResult};
use tauri::AppHandle;
use tokio::time::{sleep, Duration};

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

/// Poll the bridge journal for the one-time claim code (`AB12-CD34`) it mints on
/// boot. Checks once per second for up to 30s; errors if the bridge never logged
/// one (didn't start, or didn't reach the claim step).
#[tauri::command]
pub async fn wait_for_claim_code(distro: String) -> Result<String, String> {
    let cmd = "journalctl --user -u agentcontrol-bridge --since '2 minutes ago' \
               --no-pager 2>/dev/null | grep -oE '[A-Z0-9]{4}-[A-Z0-9]{4}' | tail -1";
    for _ in 0..30 {
        let out = run_in_wsl_capture(&distro, cmd).await?;
        if !out.is_empty() {
            return Ok(out);
        }
        sleep(Duration::from_secs(1)).await;
    }
    Err("no claim code found in bridge logs within 30s".to_string())
}
