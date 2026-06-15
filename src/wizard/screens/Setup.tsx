import { useEffect, useRef } from "react";
import { readGitConfig } from "../api";
import { InputField } from "../components/InputField";
import type { ScreenProps } from "../state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Setup({ state, dispatch }: ScreenProps) {
  const { gitName, gitEmail } = state.formData;
  const emailValid = EMAIL_RE.test(gitEmail);
  const canStart = gitName.trim().length > 0 && emailValid;

  // Pre-fill from the existing WSL distro's git config so users with a
  // `~/.gitconfig` already in place don't have to retype name + email. Only
  // patches fields that are still empty (so the user's edits always win).
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current) return;
    prefilledRef.current = true;
    readGitConfig()
      .then((cfg) => {
        const patch: { gitName?: string; gitEmail?: string } = {};
        if (cfg.name && !state.formData.gitName) patch.gitName = cfg.name;
        if (cfg.email && !state.formData.gitEmail) patch.gitEmail = cfg.email;
        if (Object.keys(patch).length) {
          dispatch({ type: "UPDATE_FORM", data: patch });
        }
      })
      .catch(() => {
        /* WSL not installed yet — leave the fields blank for manual entry. */
      });
  }, [dispatch, state.formData.gitName, state.formData.gitEmail]);

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
