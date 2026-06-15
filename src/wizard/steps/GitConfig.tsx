import { useCallback } from "react";
import { configureGit } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function GitConfig({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.gitcfg;
  const runner = useStepRunner("gitcfg", dispatch);
  const { distro, formData } = state;

  const run = useCallback(() => {
    void runner((eventId) =>
      configureGit(distro, formData.gitName, formData.gitEmail, eventId),
    );
  }, [runner, distro, formData.gitName, formData.gitEmail]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.gitcfg.title}
      description={`Setting git user.name and user.email for ${formData.gitName || "you"}.`}
      status={status}
      error={state.errors.gitcfg}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.gitcfg} />
    </StepFrame>
  );
}
