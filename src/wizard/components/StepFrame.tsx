import type { ReactNode } from "react";
import type { StepStatus } from "../state";

type StepFrameProps = {
  title: string;
  description: string;
  status: StepStatus;
  error?: string | null;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onRetry?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
};

const STATUS_ICON: Record<StepStatus, string> = {
  pending: "○",
  running: "◌",
  done: "●",
  error: "✕",
  skipped: "—",
};

export function StepFrame({
  title,
  description,
  status,
  error,
  children,
  onBack,
  onNext,
  onRetry,
  nextLabel = "Next",
  nextDisabled = false,
  backDisabled = false,
}: StepFrameProps) {
  return (
    <section className="step-frame">
      <header className="step-header">
        <span className={`status-icon status-${status}`} title={status}>
          {STATUS_ICON[status]}
        </span>
        <div>
          <h2>{title}</h2>
          <p className="step-desc">{description}</p>
        </div>
      </header>

      <div className="step-body">{children}</div>

      {error ? <div className="step-error-banner">{error}</div> : null}

      {onBack || onNext || onRetry ? (
        <footer className="actions">
          {onBack ? (
            <button type="button" onClick={onBack} disabled={backDisabled}>
              Back
            </button>
          ) : null}
          {status === "error" && onRetry ? (
            <button type="button" className="btn-primary" onClick={onRetry}>
              Retry
            </button>
          ) : null}
          {onNext ? (
            <button
              type="button"
              className="btn-primary"
              onClick={onNext}
              disabled={nextDisabled}
            >
              {nextLabel}
            </button>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
