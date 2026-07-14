import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

const bars = [42, 55, 48, 67, 60, 78, 72, 88, 95];

export function DashboardMockup() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-destructive/60" />
        <span className="size-2 rounded-full bg-insight/60" />
        <span className="size-2 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground">
          app.agorys.com / dashboard
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Revenue", value: "$128k", up: true },
            { label: "AOV", value: "$84", up: true },
            { label: "Returns", value: "2.8%", up: false },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-mono text-sm font-semibold tabular-figures text-foreground">
                {kpi.value}
              </p>
              {kpi.up ? (
                <ArrowUpRight className="size-4 text-success" />
              ) : (
                <ArrowDownRight className="size-4 text-destructive" />
              )}
            </div>
          ))}
        </div>

        <div className="flex h-24 items-end gap-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="flex gap-2 rounded-lg bg-insight/10 p-3">
          <Sparkles className="size-4 shrink-0 text-insight" />
          <p className="text-xs text-foreground">
            Insight: Revenue up 15% from Product A
          </p>
        </div>
      </div>
    </div>
  );
}
