# Changelog

All notable changes to the AgentControl Bridge Installer are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 55.2.1 — real 15-step wizard frontend driven by the Tauri
  command contract. Adds a **Build bridge** step (`npm run build`,
  compiles TypeScript to `dist/`) between npm install and `.env`
  generation.

### Changed

- Phase 55.2.3 — Setup screen now uses a deep-link "Sign in to
  AgentControl" button instead of three paste-in pairing-token fields.
  Sign-in opens the operator portal and captures tokens via the
  `agentcontrol-bridge-installer://pair` URL scheme (new
  `tauri-plugin-deep-link`), emitting a `pair-tokens-received` event the
  wizard listens for. Manual paste-in pairing still available on Done.
- Collapsed the 15 step screens to 4 user-visible screens (Setup →
  Installing → Sign in to Claude Code → Done); the 11 non-interactive
  sub-tasks now run automatically inside the Installing screen with a
  single progress bar and live log.
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
