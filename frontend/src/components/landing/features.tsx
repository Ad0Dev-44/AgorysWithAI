import { BarChart3, LineChart, Sparkles, FileText } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    description:
      "Every dataset you upload gets a live KPI board — revenue, average order value, return rate — updated the moment the data lands.",
  },
  {
    icon: LineChart,
    title: "Forecasting",
    description:
      "A six-month revenue projection generated straight from your trend line, plotted alongside the actuals so you can see where it breaks from history.",
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    description:
      "Plain-language calls to action when a number needs attention — not a wall of statistics you have to interpret yourself.",
  },
  {
    icon: FileText,
    title: "Report generation",
    description:
      "One click turns the dashboard into an executive summary, ready to paste into a memo or send to whoever asked for the numbers.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-xl">
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
          Features
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything between a CSV and a decision.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}