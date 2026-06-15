use super::shell::{run_wsl_host, CommandResult};
use super::wsl::list_distros;

#[tauri::command]
pub fn detect_ubuntu(distro: String) -> bool {
    list_distros().iter().any(|d| d.eq_ignore_ascii_case(&distro))
}

#[tauri::command]
pub async fn install_ubuntu() -> Result<CommandResult, String> {
    run_wsl_host(&["--install", "-d", "Ubuntu-22.04"]).await
}
