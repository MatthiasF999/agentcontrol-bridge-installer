import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { pairBridge } from "../api";
import { InputField } from "../components/InputField";
import type { ScreenProps } from "../state";

const OPERATOR_URL = "https://178.105.244.59/operator";
const APP_URL = "https://178.105.244.59/operator/download";

export function Done({ state, dispatch }: ScreenProps) {
  const { apiKey, formData } = state;
  const { distro, paired } = state.install;
  const { refreshToken, bridgeId, orgId } = formData;
  const [copied, setCopied] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const canPair = Boolean(refreshToken && bridgeId && orgId);
  const pairNow = async () => {
    setPairing(true);
    setPairError(null);
    try {
      await pairBridge(distro, refreshToken, bridgeId, orgId);
      dispatch({ type: "SET_PAIRED", paired: true });
    } catch (e) {
      setPairError(e instanceof Error ? e.message : String(e));
    } finally {
      setPairing(false);
    }
  };

  return (
    <section className="screen">
      <h1>Bridge installed</h1>
      <p className="step-ok">
        The bridge is installed and running as a systemd-user service. Keep your
        API key somewhere safe — you need it for the first AgentControl sign-in:
      </p>
      <div className="key-box">
        <code className="key-value">{apiKey || "(no key generated)"}</code>
        <button type="button" onClick={copyKey} disabled={!apiKey}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {paired ? (
        <p className="step-ok">Bridge paired with your AgentControl org.</p>
      ) : (
        <>
          <p className="screen-section">
            Pair this bridge with your org (operator portal → "Pair new
            bridge"):
          </p>
          <InputField
            label="Refresh token"
            value={refreshToken}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { refreshToken: v } })
            }
          />
          <InputField
            label="Bridge ID"
            value={bridgeId}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { bridgeId: v } })
            }
          />
          <InputField
            label="Org ID"
            value={orgId}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { orgId: v } })
            }
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!canPair || pairing}
            onClick={pairNow}
          >
            {pairing ? "Pairing…" : "Pair bridge"}
          </button>
          {pairError ? (
            <div className="step-error-banner">{pairError}</div>
          ) : null}
        </>
      )}

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
        <button
          type="button"
          className="btn-primary"
          onClick={() => void getCurrentWindow().close()}
        >
          Close
        </button>
      </footer>
    </section>
  );
}
