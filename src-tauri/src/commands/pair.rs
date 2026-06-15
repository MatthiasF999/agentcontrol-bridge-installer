use super::shell::{run_in_wsl, shell_quote, CommandResult};
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

const OPERATOR_PORTAL: &str = "https://178.105.244.59/operator/";
const BRIDGE_DIR: &str = "$HOME/agentcontrol-bridge";

#[tauri::command]
pub fn open_operator_portal(app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_url(OPERATOR_PORTAL, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pair_bridge(
    app: AppHandle,
    distro: String,
    claim_code: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!(
        "cd {BRIDGE_DIR} && BRIDGE_CLAIM_CODE={} node scripts/bridge-pair-smoke.mjs",
        shell_quote(&claim_code),
    );
    run_in_wsl(app, distro, cmd, event_id).await
}
