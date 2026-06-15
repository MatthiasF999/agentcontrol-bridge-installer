import { useCallback, useEffect, useState } from "react";
import { detectWsl, installWsl, type WslStatus } from "../api";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

export function WslSetup({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.wsl;
  const [wsl, setWsl] = useState<WslStatus | null>(null);
  const [installing, setInstalling] = useState(false);

  const detect = useCallback(async () => {
    dispatch({ type: "SET_STATUS", step: "wsl", status: "running" });
    try {
      const result = await detectWsl();
      setWsl(result);
      dispatch({
        type: "SET_STATUS",
        step: "wsl",
        status: result.installed ? "done" : "pending",
      });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "wsl",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, [dispatch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run detection once on mount
  useEffect(() => {
    void detect();
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    dispatch({ type: "SET_STATUS", step: "wsl", status: "running" });
    try {
      await installWsl();
      dispatch({ type: "SET_STATUS", step: "wsl", status: "done" });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "wsl",
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <StepFrame
      title={STEP_META.wsl.title}
      description={STEP_META.wsl.description}
      status={status}
      error={state.errors.wsl}
      onBack={onBack}
      onNext={onNext}
      onRetry={() => void detect()}
      nextDisabled={!wsl?.installed}
    >
      {wsl?.installed ? (
        <p className="step-ok">
          WSL2 is installed. Distros:{" "}
          {wsl.distros.length ? wsl.distros.join(", ") : "none yet"}.
        </p>
      ) : (
        <>
          <p>
            WSL2 was not detected. Install it now (a reboot may be required
            afterwards).
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleInstall}
            disabled={installing || status === "running"}
          >
            {installing ? "Installing…" : "Install WSL2"}
          </button>
        </>
      )}
    </StepFrame>
  );
}
