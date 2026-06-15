import { useCallback } from "react";
import { npmInstallBridge } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function NpmInstall({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.npm;
  const runner = useStepRunner("npm", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => npmInstallBridge(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.npm.title}
      description="Installing bridge dependencies — this can take 3–5 minutes."
      status={status}
      error={state.errors.npm}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.npm} />
    </StepFrame>
  );
}
