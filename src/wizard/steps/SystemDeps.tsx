import { useCallback } from "react";
import { aptInstallDeps } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function SystemDeps({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.deps;
  const runner = useStepRunner("deps", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => aptInstallDeps(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.deps.title}
      description={STEP_META.deps.description}
      status={status}
      error={state.errors.deps}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.deps} />
    </StepFrame>
  );
}
