import { useCallback, useEffect, useRef } from "react";
import { listenWslOutput } from "../api";
import { LogStream } from "../components/LogStream";
import { executeStep, STREAMING_STEPS } from "../installRunner";
import {
  AUTO_STEPS,
  type ScreenProps,
  STEP_LABELS,
  type StepStatus,
} from "../state";

const STATUS_ICON: Record<StepStatus, string> = {
  pending: "○",
  running: "◌",
  done: "●",
  error: "✕",
};

export function Installing({ state, dispatch }: ScreenProps) {
  const { install, formData } = state;
  const { stepStatus, distro } = install;
  const runningRef = useRef(false);

  const runFrom = useCallback(
    async (startIdx: number) => {
      if (runningRef.current) return;
      runningRef.current = true;
      // Track distro locally — `ubuntu_install` may resolve to an existing
      // distro (e.g. user's "Ubuntu") rather than the seed value. Subsequent
      // steps must target that name, but the captured `distro` closure is
      // stale until React re-renders, so thread the resolved name through here.
      let currentDistro = distro;
      try {
        for (let i = startIdx; i < AUTO_STEPS.length; i++) {
          const step = AUTO_STEPS[i];
          dispatch({ type: "STEP_START", step });
          const unlisten = STREAMING_STEPS.has(step)
            ? await listenWslOutput(step, (ev) =>
                dispatch({
                  type: "APPEND_LOG",
                  step,
                  line: ev.stream === "stderr" ? `!${ev.line}` : ev.line,
                }),
              )
            : null;
          try {
            const result = await executeStep(
              step,
              currentDistro,
              formData,
              dispatch,
            );
            if (typeof result === "string") {
              currentDistro = result;
            }
            dispatch({ type: "STEP_DONE", step });
          } catch (e) {
            dispatch({
              type: "STEP_ERROR",
              step,
              error: e instanceof Error ? e.message : String(e),
            });
            return;
          } finally {
            unlisten?.();
          }
        }
        dispatch({ type: "SCREEN", screen: "signin" });
      } finally {
        runningRef.current = false;
      }
    },
    [dispatch, distro, formData],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: kick off the install once on mount
  useEffect(() => {
    void runFrom(0);
  }, []);

  const completed = AUTO_STEPS.filter((s) => stepStatus[s] === "done").length;
  const pct = Math.round((completed / AUTO_STEPS.length) * 100);
  const active = AUTO_STEPS.find(
    (s) => stepStatus[s] === "running" || stepStatus[s] === "error",
  );
  const erroredIdx = AUTO_STEPS.findIndex((s) => stepStatus[s] === "error");

  return (
    <section className="screen">
      <h1>Installing…</h1>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <ol className="install-steps">
        {AUTO_STEPS.map((step) => (
          <li key={step} className={`status-${stepStatus[step]}`}>
            <span className={`status-icon status-${stepStatus[step]}`}>
              {STATUS_ICON[stepStatus[step]]}
            </span>
            <span>{STEP_LABELS[step]}</span>
          </li>
        ))}
      </ol>

      {active ? <LogStream lines={install.logs[active]} /> : null}

      {install.errorMsg ? (
        <>
          <div className="step-error-banner">{install.errorMsg}</div>
          <footer className="actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => void runFrom(erroredIdx < 0 ? 0 : erroredIdx)}
            >
              Retry
            </button>
          </footer>
        </>
      ) : null}
    </section>
  );
}
