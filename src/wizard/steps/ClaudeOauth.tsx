import { useCallback, useEffect, useRef, useState } from "react";
import { openClaudeOauth, pollClaudeCreds } from "../api";
import { StepFrame } from "../components/StepFrame";
import { STEP_META, type StepProps } from "../state";

const POLL_MS = 5000;

export function ClaudeOauth({ state, dispatch, onNext, onBack }: StepProps) {
  const status = state.stepStatus.oauth;
  const { distro } = state;
  const [polling, setPolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPolling(false);
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const handleSignIn = async () => {
    dispatch({ type: "SET_STATUS", step: "oauth", status: "running" });
    try {
      await openClaudeOauth();
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        step: "oauth",
        error: e instanceof Error ? e.message : String(e),
      });
      return;
    }
    setPolling(true);
    timer.current = setInterval(async () => {
      const found = await pollClaudeCreds(distro).catch(() => false);
      if (found) {
        stopPolling();
        dispatch({ type: "SET_STATUS", step: "oauth", status: "done" });
      }
    }, POLL_MS);
  };

  const done = status === "done";

  return (
    <StepFrame
      title={STEP_META.oauth.title}
      description="Authorize Claude Code so the bridge can run autonomous agents."
      status={status}
      error={state.errors.oauth}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!done}
    >
      {done ? (
        <p className="step-ok">
          Claude credentials detected. You're signed in.
        </p>
      ) : (
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSignIn}
            disabled={polling}
          >
            {polling ? "Waiting for sign-in…" : "Sign in to Claude"}
          </button>
          {polling ? (
            <p className="step-hint">
              Complete the login in your browser. This page updates
              automatically.
            </p>
          ) : null}
        </>
      )}
    </StepFrame>
  );
}
