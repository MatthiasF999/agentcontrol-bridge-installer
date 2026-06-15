import { type Dispatch, useCallback, useEffect, useRef } from "react";
import { type CommandResult, listenWslOutput } from "./api";
import type { Action, StepKey, StepStatus } from "./state";

type Task = (eventId: string) => Promise<CommandResult>;

export function useStepRunner(step: StepKey, dispatch: Dispatch<Action>) {
  return useCallback(
    async (task: Task) => {
      const eventId = `${step}-${Date.now()}`;
      dispatch({ type: "SET_STATUS", step, status: "running" });
      const unlisten = await listenWslOutput(eventId, (ev) => {
        const line = ev.stream === "stderr" ? `!${ev.line}` : ev.line;
        dispatch({ type: "APPEND_LOG", step, line });
      });
      try {
        const result = await task(eventId);
        if (result.exitCode !== 0) {
          dispatch({
            type: "SET_ERROR",
            step,
            error: `Command exited with code ${result.exitCode}`,
          });
        } else {
          dispatch({ type: "SET_STATUS", step, status: "done" });
        }
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          step,
          error: e instanceof Error ? e.message : String(e),
        });
      } finally {
        unlisten();
      }
    },
    [step, dispatch],
  );
}

export function useRunOnce(status: StepStatus, run: () => void) {
  const started = useRef(false);
  useEffect(() => {
    if (!started.current && status === "pending") {
      started.current = true;
      run();
    }
  }, [status, run]);
}
