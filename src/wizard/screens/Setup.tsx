import { InputField } from "../components/InputField";
import type { ScreenProps } from "../state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Setup({ state, dispatch }: ScreenProps) {
  const { gitName, gitEmail } = state.formData;
  const emailValid = EMAIL_RE.test(gitEmail);
  const canStart = gitName.trim().length > 0 && emailValid;

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
