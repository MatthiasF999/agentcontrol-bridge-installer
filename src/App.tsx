import { useState } from "react";

// Placeholder wizard list — Phase 55.2.0 ships scaffold only.
// Phase 55.2.1 (rust-installer + react-wizard) replaces these stubs
// with real step components driven by Tauri commands.
const STEPS: ReadonlyArray<{ key: string; title: string; description: string }> = [
  { key: "welcome", title: "Welcome", description: "What this installer will do" },
  { key: "wsl", title: "WSL2 setup", description: "Detect and install WSL2 (Windows only)" },
  { key: "ubuntu", title: "Ubuntu", description: "Install Ubuntu 22.04 if missing" },
  { key: "config", title: "Configuration", description: "Git name, email, optional claim code" },
  { key: "deps", title: "System dependencies", description: "build-essential, git, python3" },
  { key: "gitcfg", title: "Git config", description: "git config --global user.name/email" },
  { key: "node", title: "Node.js 22", description: "Install Node.js 22 via NodeSource" },
  { key: "claude", title: "Claude Code CLI", description: "npm install -g @anthropic-ai/claude-code" },
  { key: "source", title: "Bridge source", description: "Download bridge tarball" },
  { key: "npm", title: "npm install", description: "Install bridge npm dependencies" },
  { key: "env", title: "Generate .env", description: "Auto-generate 64-char API_KEY" },
  { key: "oauth", title: "Sign in to Claude", description: "Open browser for OAuth login" },
  { key: "pair", title: "Pair bridge", description: "Pair with your AgentControl org" },
  { key: "done", title: "Done", description: "Bridge running, app download link" },
];

export default function App(): JSX.Element {
  const [active, setActive] = useState<number>(0);
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>AgentControl Bridge Installer</h1>
        <ol className="steps">
          {STEPS.map((step, idx) => (
            <li key={step.key} className={idx === active ? "active" : ""}>
              <span className="num">{idx + 1}</span>
              <span>{step.title}</span>
            </li>
          ))}
        </ol>
      </aside>
      <main className="content">
        <h2>{STEPS[active]?.title}</h2>
        <p>{STEPS[active]?.description}</p>
        <p className="placeholder">
          Phase 55.2.0 scaffold — wizard logic ships in Phase 55.2.1.
        </p>
        <div className="actions">
          <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)}>
            Back
          </button>
          <button
            type="button"
            disabled={active === STEPS.length - 1}
            onClick={() => setActive(active + 1)}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
