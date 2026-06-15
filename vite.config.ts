import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri-aware Vite config — mirrors the agentcontrol-tray pattern.
// Fixed port 1420 so `tauri dev`/`tauri build` can wait for the dev
// server reliably; strict so it surfaces conflicts rather than picking
// a random port.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: ["es2022", "chrome116", "safari14"],
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
