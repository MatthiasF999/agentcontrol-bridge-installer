import { useCallback, useEffect, useState } from "react";
import { detectUbuntu, installUbuntu } from "../api";
import { LogStream } from "../components/LogStream";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

export function UbuntuSetup({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.ubuntu;
  const { distro } = state;
  const [present, setPresent] = useState<boolean | null>(null);
  const [installing, setInstalling] = useState(false);

  const detect = useCallback(async () => {
    dispatch({ type: "SET_STATUS", step: "ubuntu", status: "running" });
    try {
      const found = await detectUbuntu(distro);
      setPresent(found);
      dispatch({
        type: "SET_STATUS",
        step: "ubuntu",
        status: found ? "done" : "pending",
      });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "ubuntu",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, [dispatch, distro]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run detection once on mount
  useEffect(() => {
    void detect();
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    dispatch({ type: "SET_STATUS", step: "ubuntu", status: "running" });
    try {
      await installUbuntu();
      setPresent(true);
      dispatch({ type: "SET_STATUS", step: "ubuntu", status: "done" });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "ubuntu",
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <StepFrame
      title={STEP_META.ubuntu.title}
      description={STEP_META.ubuntu.description}
      status={status}
      error={state.errors.ubuntu}
      onBack={onBack}
      onNext={onNext}
      onRetry={() => void detect()}
      nextDisabled={!present}
    >
      {present ? (
        <p className="step-ok">{distro} is installed and ready.</p>
      ) : (
        <>
          <p>
            {distro} was not found. Install it now — this downloads the distro
            image.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleInstall}
            disabled={installing || status === "running"}
          >
            {installing ? "Installing…" : `Install ${distro}`}
          </button>
        </>
      )}
      {state.stepLogs.ubuntu.length > 0 ? (
        <LogStream lines={state.stepLogs.ubuntu} />
      ) : null}
    </StepFrame>
  );
}
