import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

const OPERATOR_URL = "https://178.105.244.59/operator";
const APP_URL = "https://178.105.244.59/operator/download";

export function Done({ state, onBack }: StepProps) {
  const { apiKey } = state;
  const [copied, setCopied] = useState(false);

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <StepFrame
      title={STEP_META.done.title}
      description="Your bridge is installed, paired, and running as a service."
      status={state.stepStatus.done}
    >
      <p className="step-ok">
        Setup complete. Keep your API key somewhere safe:
      </p>
      <div className="key-box">
        <code className="key-value">{apiKey || "(no key generated)"}</code>
        <button type="button" onClick={copyKey} disabled={!apiKey}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <ul className="link-list">
        <li>
          <button
            type="button"
            className="link"
            onClick={() => void openUrl(OPERATOR_URL)}
          >
            Open the operator portal
          </button>
        </li>
        <li>
          <button
            type="button"
            className="link"
            onClick={() => void openUrl(APP_URL)}
          >
            Download the AgentControl app
          </button>
        </li>
      </ul>
      <footer className="actions">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void getCurrentWindow().close()}
        >
          Close
        </button>
      </footer>
    </StepFrame>
  );
}
