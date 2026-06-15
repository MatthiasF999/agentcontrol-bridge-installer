# Changelog

All notable changes to the AgentControl Bridge Installer are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Phase 55.2.5 — `System dependencies`, `Node.js 22` and `Claude Code CLI`
  steps no longer hang silently on a hidden sudo password prompt. They now
  run under `wsl -u root` so `sudo` (and its `/dev/tty` password prompt) is
  out of the picture. Symptom in v0.0.5: a blank `wsl.exe` window with a
  blinking cursor + the installer stuck on "Waiting for output…". Per-user
  steps (git clone, npm install, build, systemd-user) continue to run as
  the distro's default user so `node_modules` ownership stays correct.
- Phase 55.2.4 — Ubuntu-detection no longer exact-matches `"Ubuntu-22.04"`.
  The installer now reuses whatever WSL distro is already present (preferring
  the WSL default if one is set) instead of installing a second Ubuntu
  alongside the user's own `Ubuntu` / `Ubuntu-24.04` / Debian / etc.
  Only when WSL has zero distros registered does the installer fall back to
  `wsl --install -d Ubuntu-22.04`.

### Added

- Phase 55.2.1 — real 15-step wizard frontend driven by the Tauri
  command contract. Adds a **Build bridge** step (`npm run build`,
  compiles TypeScript to `dist/`) between npm install and `.env`
  generation.

### Changed

- Phase 55.2.3 — replaced the three paste-in pairing-token fields with a
  deep-link sign-in flow on a dedicated **Sign in to AgentControl**
  screen that runs *after* install (so the bridge can mint a one-time
  claim code). The screen reads the claim code from the bridge journal
  (`wait_for_claim_code`), opens the operator portal
  `/pair-installer/?code=…&label=…` page, and captures the returned
  tokens (incl. `lan_api_key`) via the `agentcontrol-bridge-installer://`
  URL scheme (`tauri-plugin-deep-link`) → `pair-tokens-received` event.
  On receive it writes the env (`write_pair_env`) and restarts the
  bridge (`restart_bridge_service`). New wizard order:
  Setup → Installing → Sign in to AgentControl → Sign in to Claude Code
  → Done. Pairing is skippable. Removed `pair_bridge`; Done no longer
  carries a manual paste-in pair form.
- Collapsed the 15 step screens to 5 user-visible screens (Setup →
  Installing → Sign in to AgentControl → Sign in to Claude Code →
  Done); the 11 non-interactive sub-tasks now run automatically inside
  the Installing screen with a single progress bar and live log.
- Pairing now uses three tokens (refresh token + bridge ID + org ID)
  from the operator portal "Pair new bridge" flow instead of a single
  claim code; `pair_bridge` no longer streams output.

### Fixed

- Primary buttons rendered white-on-white (invisible text): `.actions
  button` outspecified `.btn-primary`. Bumped to `button.btn-primary`.

## [0.0.1] — 2026-06-15

### Added

- Phase 55.2.0 — Tauri 2.x scaffold + GH Actions build pipeline.
  Empty wizard skeleton (14 steps as placeholders) purely to prove
  the bundler produces `.msi`, `.nsis exe`, `.dmg`, `.deb`, and
  `.AppImage` from GH-hosted Windows/macOS/Linux runners. Wizard
  logic lands in Phase 55.2.1.
