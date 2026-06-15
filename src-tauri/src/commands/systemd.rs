use super::shell::{run_in_wsl, CommandResult};
use tauri::AppHandle;

const SERVICE_UNIT: &str = r#"[Unit]
Description=AgentControl Bridge
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=%h/agentcontrol-bridge
ExecStart=/usr/bin/env npm start
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
"#;

#[tauri::command]
pub async fn install_systemd_service(
    app: AppHandle,
    distro: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let cmd = format!(
        "mkdir -p $HOME/.config/systemd/user && \
         cat > $HOME/.config/systemd/user/agentcontrol-bridge.service <<'UNIT_EOF'\n\
         {SERVICE_UNIT}\
         UNIT_EOF\n\
         systemctl --user daemon-reload && \
         systemctl --user enable --now agentcontrol-bridge"
    );
    run_in_wsl(app, distro, cmd, event_id).await
}
