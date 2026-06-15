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
  const { refreshToken, bridgeId, orgId } = formData;
  const runner = useStepRunner("pair", dispatch);
  const started = useRef(false);

  const hasTokens =
    refreshToken.trim().length > 0 &&
    bridgeId.trim().length > 0 &&
    orgId.trim().length > 0;

  const run = useCallback(() => {
    void runner(async (eventId) => {
      await pairBridge(
        distro,
        refreshToken.trim(),
        bridgeId.trim(),
        orgId.trim(),
      );
      return installSystemdService(distro, eventId);
    });
  }, [runner, distro, refreshToken, bridgeId, orgId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: auto-pair once if all tokens were provided
  useEffect(() => {
    if (!started.current && status === "pending" && hasTokens) {
      started.current = true;
      run();
    }
  }, []);

  return (
    <StepFrame
      title={STEP_META.pair.title}
      description="Pairing registers this bridge with your AgentControl org and enables it on boot."
      status={status}
      error={state.errors.pair}
      onBack={onBack}
      onNext={onNext}
      onRetry={run}
      nextDisabled={status !== "done"}
    >
      {status !== "done" ? (
        <>
          <p>
            Open the operator portal → "Pair new bridge" to get these tokens.
          </p>
          <button type="button" onClick={() => void openOperatorPortal()}>
            Open operator portal
          </button>
          <InputField
            label="Refresh token"
            value={refreshToken}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { refreshToken: v } })
            }
          />
          <InputField
            label="Bridge ID"
            value={bridgeId}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { bridgeId: v } })
            }
          />
          <InputField
            label="Org ID"
            value={orgId}
            onChange={(v) =>
              dispatch({ type: "UPDATE_FORM", data: { orgId: v } })
            }
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!hasTokens || status === "running"}
            onClick={run}
          >
            Pair bridge
          </button>
        </>
      ) : null}
      <LogStream lines={state.stepLogs.pair} />
    </StepFrame>
  );
}
