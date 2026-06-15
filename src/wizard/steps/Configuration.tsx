import { InputField } from "../components/InputField";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Configuration({ state, dispatch, onNext, onBack }: StepProps) {
  const { gitName, gitEmail, refreshToken, bridgeId, orgId } = state.formData;
  const emailValid = EMAIL_RE.test(gitEmail);
  const nameValid = gitName.trim().length > 0;
  const valid = nameValid && emailValid;

  const handleNext = () => {
    dispatch({ type: "SET_STATUS", step: "config", status: "done" });
    onNext();
  };

  return (
    <StepFrame
      title={STEP_META.config.title}
      description={STEP_META.config.description}
      status={state.stepStatus.config}
      onBack={onBack}
      onNext={handleNext}
      nextLabel="Continue"
      nextDisabled={!valid}
    >
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
      <p className="step-intro">
        Pairing tokens (from operator portal → Pair new bridge). Fill all three
        to auto-pair, or leave blank to pair later in step 14.
      </p>
      <InputField
        label="Refresh token"
        value={refreshToken}
        placeholder="Optional — paste from operator portal"
        onChange={(v) =>
          dispatch({ type: "UPDATE_FORM", data: { refreshToken: v } })
        }
      />
      <InputField
        label="Bridge ID"
        value={bridgeId}
        placeholder="Optional"
        onChange={(v) =>
          dispatch({ type: "UPDATE_FORM", data: { bridgeId: v } })
        }
      />
      <InputField
        label="Org ID"
        value={orgId}
        placeholder="Optional"
        onChange={(v) => dispatch({ type: "UPDATE_FORM", data: { orgId: v } })}
      />
    </StepFrame>
  );
}
