use super::shell::{run_in_wsl, CommandResult};
use tauri::AppHandle;

#[tauri::command]
pub async fn apt_install_deps(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = "sudo apt-get update && sudo apt-get install -y \
               build-essential git curl python3 openssl ca-certificates";
    run_in_wsl(app, distro, cmd.to_string(), event_id).await
}

#[tauri::command]
pub async fn install_node22(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - \
               && sudo apt-get install -y nodejs";
    run_in_wsl(app, distro, cmd.to_string(), event_id).await
}

#[tauri::command]
pub async fn install_claude_cli(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = "sudo npm install -g @anthropic-ai/claude-code";
    run_in_wsl(app, distro, cmd.to_string(), event_id).await
}
