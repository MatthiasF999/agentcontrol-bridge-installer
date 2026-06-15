import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export type WslStatus = {
  installed: boolean;
  defaultDistro: string | null;
  distros: string[];
};

export type CommandResult = { exitCode: number };

export type WslOutputEvent = {
  stream: "stdout" | "stderr";
  line: string;
};

export function detectWsl(): Promise<WslStatus> {
  return invoke<WslStatus>("detect_wsl");
}

export function installWsl(): Promise<null> {
  return invoke<null>("install_wsl");
}

export function detectUbuntu(distro: string): Promise<boolean> {
  return invoke<boolean>("detect_ubuntu", { distro });
}

export function installUbuntu(): Promise<null> {
  return invoke<null>("install_ubuntu");
}

export function runInWsl(
  distro: string,
  command: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("run_in_wsl", { distro, command, eventId });
}

export function aptInstallDeps(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("apt_install_deps", { distro, eventId });
}

export function installNode22(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("install_node22", { distro, eventId });
}

export function installClaudeCli(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("install_claude_cli", { distro, eventId });
}

export function configureGit(
  distro: string,
  name: string,
  email: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("configure_git", {
    distro,
    name,
    email,
    eventId,
  });
}

export function downloadBridge(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("download_bridge", { distro, eventId });
}

export function npmInstallBridge(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("npm_install_bridge", { distro, eventId });
}

export function generateApiKey(): Promise<string> {
  return invoke<string>("generate_api_key");
}

export function writeEnvFile(
  distro: string,
  apiKey: string,
  claudeHome: string,
): Promise<null> {
  return invoke<null>("write_env_file", { distro, apiKey, claudeHome });
}

export function openClaudeOauth(): Promise<null> {
  return invoke<null>("open_claude_oauth");
}

export function pollClaudeCreds(distro: string): Promise<boolean> {
  return invoke<boolean>("poll_claude_creds", { distro });
}

export function openOperatorPortal(): Promise<null> {
  return invoke<null>("open_operator_portal");
}

export function pairBridge(
  distro: string,
  claimCode: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("pair_bridge", { distro, claimCode, eventId });
}

export function installSystemdService(
  distro: string,
  eventId: string,
): Promise<CommandResult> {
  return invoke<CommandResult>("install_systemd_service", { distro, eventId });
}

export function listenWslOutput(
  eventId: string,
  onLine: (event: WslOutputEvent) => void,
): Promise<UnlistenFn> {
  return listen<WslOutputEvent>(`wsl-output-${eventId}`, (event) => {
    onLine(event.payload);
  });
}
