export function ConfidenceRing({
  percent,
  className,
  loading,
}: {
  percent: number;
  className: string;
  loading?: boolean;
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={radius} className="fill-none stroke-muted" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className={`fill-none transition-all duration-700 ${className}`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference : offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-lg font-semibold leading-none text-ink tabular-nums">
            {loading ? "–" : `${percent}%`}
          </div>
          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft">conf</div>
        </div>
      </div>
    </div>
  );
}

export function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold leading-5 text-ink">{value}</p>
    </div>
  );
}
