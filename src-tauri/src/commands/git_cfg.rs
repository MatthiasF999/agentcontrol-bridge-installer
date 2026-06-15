use super::shell::{run_in_wsl, shell_quote, CommandResult};
use tauri::AppHandle;

#[tauri::command]
pub async fn configure_git(
    app: AppHandle,
    distro: String,
    name: String,
    email: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!(
        "git config --global user.name {} && git config --global user.email {}",
        shell_quote(&name),
        shell_quote(&email),
    );
    run_in_wsl(app, distro, cmd, event_id).await
}
