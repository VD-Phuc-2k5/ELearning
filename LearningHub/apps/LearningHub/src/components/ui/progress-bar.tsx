type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
  ariaLabel?: string;
};

export function ProgressBar({
  value,
  className = '',
  barClassName = '',
  ariaLabel = 'Progress',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      className={`h-3 w-full rounded-full bg-slate-100 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={`h-full rounded-full bg-indigo-600 transition-all duration-500 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
