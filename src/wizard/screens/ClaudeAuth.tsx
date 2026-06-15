import { useCallback, useEffect, useRef, useState } from "react";
import { openClaudeOauth, pollClaudeCreds } from "../api";
import type { ScreenProps } from "../state";

const POLL_MS = 5000;

export function ClaudeAuth({ state, dispatch }: ScreenProps) {
  const { distro } = state.install;
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const signIn = async () => {
    setError(null);
    try {
      await openClaudeOauth();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    setPolling(true);
    timer.current = setInterval(async () => {
      const found = await pollClaudeCreds(distro).catch(() => false);
      if (found) {
        stop();
        dispatch({ type: "SCREEN", screen: "done" });
      }
    }, POLL_MS);
  };

  return (
    <section className="screen">
      <h1>Sign in to Claude Code</h1>
      <p className="screen-intro">
        The bridge runs Claude Code to drive autonomous agents. Authorize it
        once in your browser — the installer detects the credentials
        automatically and continues.
      </p>
      <footer className="actions">
        <button
          type="button"
          className="btn-primary"
          onClick={signIn}
          disabled={polling}
        >
          {polling ? "Waiting for Claude Code login…" : "Open browser"}
        </button>
      </footer>
      {error ? <div className="step-error-banner">{error}</div> : null}
    </section>
  );
}
