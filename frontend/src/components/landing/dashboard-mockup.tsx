import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

const bars = [42, 55, 48, 67, 60, 78, 72, 88, 95];

export function DashboardMockup() {
  return (
    <div className="rounded-xl border bg-card shadow-xl">
      <div className="border-b px-4 py-3 text-xs text-muted-foreground">
        app.agorys.com / dashboard
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Revenue", value: "$128k", up: true },
            { label: "AOV", value: "$84", up: true },
            { label: "Returns", value: "2.8%", up: false },
          ].map((kpi) => (
            <div key={kpi.label} className="border p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-semibold">{kpi.value}</p>
              {kpi.up ? (
                <ArrowUpRight className="text-primary size-4" />
              ) : (
                <ArrowDownRight className="text-red-500 size-4" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-end gap-1 h-24">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="flex gap-2 bg-primary/10 p-3 rounded-lg">
          <Sparkles className="text-primary size-4" />
          <p className="text-xs">Insight: Revenue up 15% from Product A</p>
        </div>
      </div>
    </div>
  );
}
