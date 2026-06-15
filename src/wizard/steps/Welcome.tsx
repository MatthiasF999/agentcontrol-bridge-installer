import { useState } from "react";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, STEP_ORDER, type StepProps } from "../state";

export function Welcome({ state, onNext }: StepProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const steps = STEP_ORDER.filter((k) => k !== "welcome" && k !== "done");

  return (
    <StepFrame
      title={STEP_META.welcome.title}
      description="This wizard sets up the AgentControl Bridge on your machine end-to-end."
      status={state.stepStatus.welcome}
      onNext={onNext}
      nextLabel="Start"
      nextDisabled={!acknowledged}
    >
      <p className="step-intro">The installer will walk through these steps:</p>
      <ol className="step-list">
        {steps.map((key) => (
          <li key={key}>
            <strong>{STEP_META[key].title}</strong> —{" "}
            {STEP_META[key].description}
          </li>
        ))}
      </ol>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        <span>
          I understand admin elevation may be required (WSL2 / Ubuntu install).
        </span>
      </label>
    </StepFrame>
  );
}
