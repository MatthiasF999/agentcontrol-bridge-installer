# AgentControl Bridge Installer

Tauri 2.x installer wizard for the **AgentControl Bridge** — handles
WSL2 + Ubuntu setup on Windows, installs Node.js + Claude Code CLI,
configures git, downloads the bridge, generates a fresh API key, and
walks the user through pairing.

## Status

**Phase 55.2.0 — scaffold + GH Actions build pipeline (this release).**
First tagged `v0.0.1` ships an empty wizard skeleton purely to prove
the bundler produces `.msi`/`.nsis exe`/`.dmg`/`.deb`/`.AppImage` on
GH-hosted runners. Wizard logic lands in Phase 55.2.1.

See `agentcontrol-supabase/docs/PHASE-55-SUMMARY.md` for the full
phase plan.

## What the installer does

Five user-visible screens. The bulk of the work — 11 automated
sub-tasks — runs without interaction inside the **Installing** screen.

1. **Setup** — git name + git email. "Start installation".
2. **Installing** — runs 11 sub-tasks sequentially with a live log and
   progress bar; auto-advances when finished, Retry on error:
   WSL2 → Ubuntu 22.04 → system dependencies → git config →
   Node.js 22 → Claude Code CLI → bridge source → npm install →
   build bridge (`npm run build`) → generate `.env` (64-char `API_KEY`)
   → systemd-user service. The bridge starts here, which mints a
   one-time **claim code** in its journal.
3. **Sign in to AgentControl** — reads the claim code from the bridge
   journal and opens the operator portal
   `/pair-installer/?code=<CLAIM_CODE>&label=<MACHINE>` page. After
   sign-in the portal redirects to the
   `agentcontrol-bridge-installer://pair?refresh_token=…&bridge_id=…&org_id=…&lan_api_key=…`
   deep link; the installer writes those into the bridge `.env`,
   restarts the service and auto-advances. Optional — "Skip for now"
   continues without pairing.
4. **Sign in to Claude Code** — opens the browser for OAuth; polls for
   credentials and auto-advances once detected.
5. **Done** — shows the `API_KEY` (needed for first AgentControl app
   sign-in), pairing status, and links to the operator portal +
   AgentControl app download.

## What the installer does NOT do

- **No Tailscale install.** The bridge subscribes outbound to the
  cloud-supabase Realtime, so the core autonomous-coding flow works
  without inbound networking. Tailscale is only needed for advanced
  features (voice streaming, file browser, live chat with the bridge)
  and remains a manual operator install.

## Build (dev)

```bash
pnpm install
pnpm tauri dev
```

## Releases

Tag-push (`vX.Y.Z`) triggers `.github/workflows/build-release.yml` →
GH-hosted Windows/macOS/Linux runners build signed-tomorrow-but-unsigned-
today bundles and upload them to a GitHub release.

Code-signing wiring (Tauri minisign + Windows EV + Apple notarization)
lands in Phase 55.2.4 after the wizard logic stabilises.

## License

MIT — see `LICENSE`.
