import { useEffect } from "react";
import {
  listenForPairTokens,
  openPairInstallerSignIn,
  type PairTokens,
} from "../api";
import { InputField } from "../components/InputField";
import type { ScreenProps } from "../state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Setup({ state, dispatch }: ScreenProps) {
  const { gitName, gitEmail, refreshToken } = state.formData;
  const emailValid = EMAIL_RE.test(gitEmail);
  const canStart = gitName.trim().length > 0 && emailValid;
  const signedIn = refreshToken.length > 0;

  useEffect(() => {
    const unlisten = listenForPairTokens((tokens: PairTokens) => {
      dispatch({
        type: "UPDATE_FORM",
        data: {
          refreshToken: tokens.refresh_token,
          bridgeId: tokens.bridge_id,
          orgId: tokens.org_id,
        },
      });
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, [dispatch]);

  return (
    <section className="screen">
      <h1>Set up AgentControl Bridge</h1>
      <p className="screen-intro">
        This installs the bridge inside WSL2 + Ubuntu and configures everything
        needed to run autonomous agents. Some steps may prompt for admin
        elevation. It takes a few minutes — you can watch progress on the next
        screen.
      </p>

      <InputField
        label="Git user name"
        value={gitName}
        required
        placeholder="Ada Lovelace"
        onChange={(v) =>
          dispatch({ type: "UPDATE_FORM", data: { gitName: v } })
        }
      />
      <InputField
        label="Git email"
        type="email"
        value={gitEmail}
        required
        placeholder="ada@example.com"
        error={
          gitEmail.length > 0 && !emailValid
            ? "Enter a valid email address"
            : null
        }
        onChange={(v) =>
          dispatch({ type: "UPDATE_FORM", data: { gitEmail: v } })
        }
      />

      <p className="screen-section">AgentControl account</p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => void openPairInstallerSignIn()}
      >
        Sign in to AgentControl
      </button>
      {signedIn ? (
        <p className="step-ok">✓ Signed in. Click Start to install.</p>
      ) : (
        <p className="step-hint">
          Optional — sign in now to auto-pair, or skip and pair manually later.
        </p>
      )}

      <footer className="actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!canStart}
          onClick={() => dispatch({ type: "SCREEN", screen: "installing" })}
        >
          Start installation
        </button>
      </footer>
    </section>
  );
}
