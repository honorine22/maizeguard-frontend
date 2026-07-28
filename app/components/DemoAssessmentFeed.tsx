import { PackageCheck } from "lucide-react";
import { history } from "../lib/maizeguard";

export function DemoAssessmentFeed() {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Demo assessment feed</h2>
            <p className="mt-1 text-sm text-ink-soft">Example workflow states for the capstone demo.</p>
          </div>
        </div>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft">
          Sample data
        </span>
      </div>
      <ul className="mt-5 space-y-3">
        {history.map((item) => (
          <li
            key={`${item.site}-${item.time}`}
            className="rounded-2xl border border-border bg-surface-2 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-bold ${
                  item.risk === "High"
                    ? "bg-danger/10 text-danger"
                    : item.risk === "Medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                }`}>
                  {item.site[0]}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{item.site}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">{item.result}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                item.risk === "High"
                  ? "bg-danger/10 text-danger"
                  : item.risk === "Medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
              }`}>
                {item.risk}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-ink-soft">
              <span>Post-harvest screening</span>
              <span className="font-medium tabular-nums">{item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
