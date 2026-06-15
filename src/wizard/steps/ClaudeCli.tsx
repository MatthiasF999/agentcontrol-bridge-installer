import { useCallback } from "react";
import { installClaudeCli } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function ClaudeCli({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.claude;
  const runner = useStepRunner("claude", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => installClaudeCli(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.claude.title}
      description={STEP_META.claude.description}
      status={status}
      error={state.errors.claude}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.claude} />
    </StepFrame>
  );
}
