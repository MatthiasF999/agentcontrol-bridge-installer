use super::shell::{run_in_wsl_quiet, shell_quote};
use rand::RngCore;

const PLACEHOLDER: &str = "change-me-generate-a-long-random-string";
const BRIDGE_DIR: &str = "$HOME/agentcontrol-bridge";

#[tauri::command]
pub fn generate_api_key() -> String {
    let mut bytes = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut bytes);
    hex::encode(bytes)
}

/// Materialise the bridge `.env` from its bundled `.env.example`: inject the
/// generated API key and point `CLAUDE_HOME` at the WSL Claude config dir.
#[tauri::command]
pub async fn write_env_file(
    distro: String,
    api_key: String,
    claude_home: String,
) -> Result<(), String> {
    let key = shell_quote(&api_key);
    let home = shell_quote(&claude_home);
    let cmd = format!(
        "cd {BRIDGE_DIR} && cp -n .env.example .env && \
         sed -i \"s|{PLACEHOLDER}|$(printf %s {key})|\" .env && \
         if grep -q '^CLAUDE_HOME=' .env; then \
           sed -i \"s|^CLAUDE_HOME=.*|CLAUDE_HOME=$(printf %s {home})|\" .env; \
         else echo \"CLAUDE_HOME=$(printf %s {home})\" >> .env; fi",
    );
    let result = run_in_wsl_quiet(&distro, &cmd).await?;
    if result.exit_code == 0 {
        Ok(())
    } else {
        Err(format!("write_env_file failed with exit code {}", result.exit_code))
    }
}
