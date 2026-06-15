import { useCallback } from "react";
import { installNode22 } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useRunOnce, useStepRunner } from "../useStepRunner";

export function NodeInstall({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.node;
  const runner = useStepRunner("node", dispatch);
  const { distro } = state;

  const run = useCallback(() => {
    void runner((eventId) => installNode22(distro, eventId));
  }, [runner, distro]);

  useRunOnce(status, run);

  return (
    <StepFrame
      title={STEP_META.node.title}
      description={STEP_META.node.description}
      status={status}
      error={state.errors.node}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      <LogStream lines={state.stepLogs.node} />
    </StepFrame>
  );
}
