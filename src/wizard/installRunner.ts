import type { Dispatch } from "react";
import {
  aptInstallDeps,
  type CommandResult,
  configureGit,
  detectUbuntu,
  detectWsl,
  downloadBridge,
  generateApiKey,
  installClaudeCli,
  installNode22,
  installSystemdService,
  installUbuntu,
  installWsl,
  npmInstallBridge,
  npmRunBuildBridge,
  writeEnvFile,
} from "./api";
import type { Action, AutoStep, FormData } from "./state";

// `$HOME` (literal) lands in the rendered .env line; WSL bash expands
// it the first time the bridge sources the file. A tilde would NOT
// expand because the env-write happens via sed/upsert that treats the
// value as data, not as a command-position token.
const CLAUDE_HOME = "$HOME/.claude";

export const STREAMING_STEPS: ReadonlySet<AutoStep> = new Set<AutoStep>([
  "deps",
  "gitcfg",
  "node",
  "claude_cli",
  "source",
  "npm_install",
  "build",
  "systemd",
]);

async function expectOk(promise: Promise<CommandResult>): Promise<void> {
  const result = await promise;
  if (result.exitCode !== 0) {
    throw new Error(`Command exited with code ${result.exitCode}`);
  }
}

export async function executeStep(
  step: AutoStep,
  distro: string,
  form: FormData,
  dispatch: Dispatch<Action>,
): Promise<void> {
  switch (step) {
    case "wsl_install": {
      const wsl = await detectWsl();
      if (!wsl.installed) {
        await installWsl();
      }
      return;
    }
    case "ubuntu_install": {
      if (!(await detectUbuntu(distro))) {
        await installUbuntu();
      }
      dispatch({ type: "SET_DISTRO", distro });
      return;
    }
    case "deps":
      return expectOk(aptInstallDeps(distro, step));
    case "gitcfg":
      return expectOk(configureGit(distro, form.gitName, form.gitEmail, step));
    case "node":
      return expectOk(installNode22(distro, step));
    case "claude_cli":
      return expectOk(installClaudeCli(distro, step));
    case "source":
      return expectOk(downloadBridge(distro, step));
    case "npm_install":
      return expectOk(npmInstallBridge(distro, step));
    case "build":
      return expectOk(npmRunBuildBridge(distro, step));
    case "env": {
      const key = await generateApiKey();
      await writeEnvFile(distro, key, CLAUDE_HOME);
      dispatch({ type: "SET_API_KEY", key });
      return;
    }
    case "systemd":
      return expectOk(installSystemdService(distro, step));
  }
}
