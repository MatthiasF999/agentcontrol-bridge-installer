import { useCallback, useEffect, useRef } from "react";
import { installSystemdService, openOperatorPortal, pairBridge } from "../api";
import { InputField } from "../components/InputField";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";
import { useStepRunner } from "../useStepRunner";

export function Pair({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.pair;
  const { distro, formData } = state;
  const runner = useStepRunner("pair", dispatch);
  const started = useRef(false);

  const run = useCallback(
    (code: string) => {
      void runner(async (eventId) => {
        const paired = await pairBridge(distro, code, eventId);
        if (paired.exitCode !== 0) {
          return paired;
        }
        return installSystemdService(distro, eventId);
      });
    },
    [runner, distro],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: auto-pair once if a claim code was provided
  useEffect(() => {
    if (!started.current && status === "pending" && formData.claimCode.trim()) {
      started.current = true;
      run(formData.claimCode.trim());
    }
  }, []);

  const hasCode = formData.claimCode.trim().length > 0;

  return (
    <StepFrame
      title={STEP_META.pair.title}
      description="Pairing registers this bridge with your AgentControl org and enables it on boot."
      status={status}
      error={state.errors.pair}
      onBack={onBack}
      onNext={onNext}
      onRetry={() => run(formData.claimCode.trim())}
      nextDisabled={status !== "done"}
    >
      {!hasCode ? (
        <>
          <p>
            Open the operator portal to generate a claim code, then paste it
            below.
          </p>
          <button type="button" onClick={() => void openOperatorPortal()}>
            Open operator portal
          </button>
          <InputField
            label="Claim code"
            value={formData.claimCode}
            placeholder="Paste claim code"
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { claimCode: v } })
            }
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!hasCode || status === "running"}
            onClick={() => run(formData.claimCode.trim())}
          >
            Pair bridge
          </button>
        </>
      ) : null}
      <LogStream lines={state.stepLogs.pair} />
    </StepFrame>
  );
}
