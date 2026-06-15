import { useCallback, useEffect, useRef } from "react";
import { generateApiKey, writeEnvFile } from "../api";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

const CLAUDE_HOME = "~/.claude";

export function EnvGen({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.env;
  const { distro, apiKey } = state;
  const started = useRef(false);

  const run = useCallback(async () => {
    dispatch({ type: "SET_STATUS", step: "env", status: "running" });
    try {
      const key = await generateApiKey();
      dispatch({ type: "SET_API_KEY", key });
      await writeEnvFile(distro, key, CLAUDE_HOME);
      dispatch({ type: "SET_STATUS", step: "env", status: "done" });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "env",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, [dispatch, distro]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run generation once on mount
  useEffect(() => {
    if (!started.current && status === "pending") {
      started.current = true;
      void run();
    }
  }, []);

  return (
    <StepFrame
      title={STEP_META.env.title}
      description="A unique 64-character API key authenticates this bridge to your org."
      status={status}
      error={state.errors.env}
      onBack={onBack}
      onNext={onNext}
      onRetry={() => void run()}
      nextDisabled={status !== "done"}
    >
      {apiKey ? (
        <div className="key-box">
          <span className="key-label">API_KEY</span>
          <code className="key-value">{apiKey}</code>
        </div>
      ) : (
        <p>Generating API key and writing the bridge .env file…</p>
      )}
    </StepFrame>
  );
}
