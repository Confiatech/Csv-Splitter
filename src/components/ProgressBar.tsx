interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="card px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex items-center gap-2 text-sm text-indigo-200/70">
            {/* Spinner */}
            <svg
              className="w-4 h-4 text-indigo-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {label}
          </div>
        )}
        <span className="text-sm font-semibold text-indigo-300 ml-auto">
          {Math.round(pct)}%
        </span>
      </div>

      {/* Track */}
      <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full progress-shimmer transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
