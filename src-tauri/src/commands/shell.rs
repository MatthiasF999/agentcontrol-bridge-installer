use serde::Serialize;
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Clone, Serialize)]
pub struct CommandResult {
    pub exit_code: i32,
}

#[derive(Clone, Serialize)]
struct OutputLine {
    stream: String,
    line: String,
}

/// Spawn `wsl -d <distro> -- bash -c "<command>"`, streaming each stdout/stderr
/// line to the frontend via the `wsl-output-<event_id>` Tauri event. This is the
/// single shell abstraction every other long-running WSL command wraps.
#[tauri::command]
pub async fn run_in_wsl(
    app: AppHandle,
    distro: String,
    command: String,
    event_id: String,
) -> Result<CommandResult, String> {
    let mut child = Command::new("wsl")
        .args(["-d", &distro, "--", "bash", "-c", &command])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to spawn wsl: {e}"))?;

    let stdout = child.stdout.take().ok_or("missing stdout pipe")?;
    let stderr = child.stderr.take().ok_or("missing stderr pipe")?;
    let event = format!("wsl-output-{event_id}");

    let out_task = stream_pipe(app.clone(), event.clone(), stdout, "stdout");
    let err_task = stream_pipe(app.clone(), event, stderr, "stderr");

    let status = child.wait().await.map_err(|e| format!("wait failed: {e}"))?;
    let _ = out_task.await;
    let _ = err_task.await;

    Ok(CommandResult {
        exit_code: status.code().unwrap_or(-1),
    })
}

fn stream_pipe<R>(
    app: AppHandle,
    event: String,
    reader: R,
    stream: &'static str,
) -> tokio::task::JoinHandle<()>
where
    R: tokio::io::AsyncRead + Unpin + Send + 'static,
{
    tokio::spawn(async move {
        let mut lines = BufReader::new(reader).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            let _ = app.emit(
                &event,
                OutputLine {
                    stream: stream.to_string(),
                    line,
                },
            );
        }
    })
}

/// Run a WSL bash command without streaming; used by quick existence/config
/// checks that only care about the exit code.
pub(crate) async fn run_in_wsl_quiet(distro: &str, command: &str) -> Result<CommandResult, String> {
    let status = Command::new("wsl")
        .args(["-d", distro, "--", "bash", "-c", command])
        .status()
        .await
        .map_err(|e| format!("failed to spawn wsl: {e}"))?;
    Ok(CommandResult {
        exit_code: status.code().unwrap_or(-1),
    })
}

/// Run `wsl <args...>` on the host (not inside a distro), e.g. `wsl --install`.
pub(crate) async fn run_wsl_host(args: &[&str]) -> Result<CommandResult, String> {
    let status = Command::new("wsl")
        .args(args)
        .status()
        .await
        .map_err(|e| format!("failed to spawn wsl: {e}"))?;
    Ok(CommandResult {
        exit_code: status.code().unwrap_or(-1),
    })
}

/// Single-quote a value for safe interpolation into a bash command string.
pub(crate) fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}
