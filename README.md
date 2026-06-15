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

## What the installer does (Phase 55.2.1 target)

1. **Welcome** — list of steps, admin-rights check
2. **WSL2** — detect; if missing run `wsl --install` (admin elevation + reboot handling)
3. **Ubuntu** — detect; if missing install Ubuntu-22.04
4. **Configuration** — form: git name, git email, optional pairing tokens (refresh token + bridge ID + org ID)
5. **System dependencies** — `apt install -y build-essential git curl python3`
6. **Git config** — `git config --global user.{name,email}` from form values
7. **Node.js 22** — NodeSource setup
8. **Claude Code CLI** — `npm install -g @anthropic-ai/claude-code`
9. **Bridge source** — download tarball from the bridge repo
10. **npm install** — install bridge dependencies (with progress)
11. **Build bridge** — `npm run build` (compile TypeScript to `dist/`)
12. **Generate `.env`** — auto-gen 64-char hex `API_KEY`
13. **Claude OAuth** — opens browser to `claude.ai`; polls for credentials
14. **Pair bridge** — uses pairing tokens if provided, otherwise opens operator-portal
15. **Done** — bridge running under a systemd-user service; shows the
    `API_KEY` (needed for first AgentControl app sign-in) and link to
    the AgentControl mobile + tray downloads

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
