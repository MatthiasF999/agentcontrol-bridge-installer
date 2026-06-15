import { useCallback } from "react";
import { npmRunBuildBridge } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function BridgeBuild({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.build;
  const runner = useStepRunner("build", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => npmRunBuildBridge(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.build.title}
      description={STEP_META.build.description}
      status={status}
      error={state.errors.build}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.build} />
    </StepFrame>
  );
}
