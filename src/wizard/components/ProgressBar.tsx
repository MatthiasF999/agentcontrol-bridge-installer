type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={`Step ${current + 1} of ${total}`}
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
