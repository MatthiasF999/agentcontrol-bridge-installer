import { useCallback } from "react";
import { downloadBridge } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function BridgeSource({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.source;
  const runner = useStepRunner("source", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => downloadBridge(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.source.title}
      description={STEP_META.source.description}
      status={status}
      error={state.errors.source}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.source} />
    </StepFrame>
  );
}
