use super::shell::{env_upsert, run_in_wsl_quiet};
use tauri::{AppHandle, Emitter};
use tauri_plugin_opener::OpenerExt;
use url::Url;

const OPERATOR_PORTAL: &str = "https://178.105.244.59/operator/";
const BRIDGE_DIR: &str = "$HOME/agentcontrol-bridge";

#[derive(Clone, serde::Serialize)]
pub struct PairTokens {
    pub refresh_token: String,
    pub bridge_id: String,
    pub org_id: String,
}

#[tauri::command]
pub fn open_operator_portal(app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_url(OPERATOR_PORTAL, None::<&str>)
        .map_err(|e| e.to_string())
}

/// Parse `agentcontrol-bridge-installer://pair?...` deep links and forward the
/// pairing tokens to the frontend via the `pair-tokens-received` event.
pub fn emit_pair_tokens(app: &AppHandle, url: &Url) {
    if url.scheme() != "agentcontrol-bridge-installer" || url.host_str() != Some("pair") {
        return;
    }
    let mut refresh_token = String::new();
    let mut bridge_id = String::new();
    let mut org_id = String::new();
    for (key, value) in url.query_pairs() {
        match key.as_ref() {
            "refresh_token" => refresh_token = value.into_owned(),
            "bridge_id" => bridge_id = value.into_owned(),
            "org_id" => org_id = value.into_owned(),
            _ => {}
        }
    }
    if refresh_token.is_empty() || bridge_id.is_empty() || org_id.is_empty() {
        return;
    }
    let _ = app.emit(
        "pair-tokens-received",
        PairTokens {
            refresh_token,
            bridge_id,
            org_id,
        },
    );
}

/// Write the smoke-pairing credentials the bridge reads at boot, restart the
/// systemd service, then wait for it to report healthy.
#[tauri::command]
pub async fn pair_bridge(
    distro: String,
    refresh_token: String,
    bridge_id: String,
    org_id: String,
) -> Result<(), String> {
    let write_env = format!(
        "cd {BRIDGE_DIR} && touch .env && {} && {} && {}",
        env_upsert("BRIDGE_SMOKE_REFRESH_TOKEN", &refresh_token),
        env_upsert("BRIDGE_SMOKE_BRIDGE_ID", &bridge_id),
        env_upsert("BRIDGE_SMOKE_ORG_ID", &org_id),
    );
    let written = run_in_wsl_quiet(&distro, &write_env).await?;
    if written.exit_code != 0 {
        return Err(format!(
            "failed to write pairing env (exit {})",
            written.exit_code
        ));
    }
    run_in_wsl_quiet(&distro, "systemctl --user restart agentcontrol-bridge").await?;
    wait_for_health(&distro).await
}

/// Poll the bridge `/health` endpoint inside WSL for up to ~30s after restart.
async fn wait_for_health(distro: &str) -> Result<(), String> {
    let probe = "sleep 3; for _ in $(seq 1 15); do \
                 code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/health || true); \
                 if [ \"$code\" = \"200\" ]; then exit 0; fi; sleep 2; done; exit 1";
    let result = run_in_wsl_quiet(distro, probe).await?;
    if result.exit_code == 0 {
        Ok(())
    } else {
        Err("bridge did not report healthy within 30s after restart".to_string())
    }
}
