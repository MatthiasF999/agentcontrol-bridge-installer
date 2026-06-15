# AgentControl Bridge Installer — DEPRECATED

> [!WARNING]
> **This repo is deprecated as of Phase 55.3.0.** Its functionality
> has been folded into [`agentcontrol-tray`](https://github.com/MatthiasF999/agentcontrol-tray),
> a Tauri 2 menu-bar / system-tray app that handles BOTH first-run
> onboarding (what this installer used to do) AND persistent
> start/stop/status control for the bridge daemon (Tailscale-pattern).
>
> Download the tray app from [`agentcontrol-tray` releases](https://github.com/MatthiasF999/agentcontrol-tray/releases/latest).

## Why we moved

A one-shot installer that ends up in `/Applications/` (macOS) or
`Programs and Features` (Windows) is a UX anti-pattern — the
installer is gone the moment it's done, but users still see it
sitting in their app list. Worse, there's no way for the user to
restart or stop the bridge from a GUI; they'd have to drop to a
terminal and run `systemctl --user`.

The tray app fixes both problems: it's a persistent menu-bar icon
(like Tailscale, Docker Desktop, etc.) that controls the bridge
daemon. First run does the install; subsequent runs are the control
panel. The thing that ends up in `/Applications/` is the persistent
UI, which is what users expect to see persisted.

## Historical artifacts

Tags `v0.0.1` … `v0.0.16` remain published for users on the old
flow. They still work — the bridge `.env` shape + Hetzner
`/install/bridge.tar.gz` + `/app/pair-bridge` URL all stayed
compatible. But all future development happens in `agentcontrol-tray`.

This repo's source is retained for reference. If you want to
understand WHY the tray's onboarding looks the way it does, the
debug history here (`CHANGELOG.md` Phase 55.2.0 → 55.2.14) is
where it all surfaced.
