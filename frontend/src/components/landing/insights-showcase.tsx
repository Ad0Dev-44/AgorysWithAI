import { Sparkles } from "lucide-react";

const insights = [
  "Revenue from Product A grew 15% month-over-month — up from a 4% average over the prior quarter.",
  "Return rate on the North region climbed to 6.2%, well above your 3% baseline. Worth a look before next month's shipment.",
  "Forecast points to a seasonal dip in week 3 of next month, consistent with the same drop last year.",
];

export function InsightsShowcase() {
  return (
    <section id="insights" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-xl">
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
          Insights showcase
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Trends and predictions, written like a person would say them.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every generated report reads like this — specific, dated, and tied
          to a number you can check.
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {insights.map((insight) => (
          <div
            key={insight}
            className="flex gap-3 rounded-xl border border-border bg-insight/5 p-5"
          >
            <Sparkles className="mt-0.5 size-4 shrink-0 text-insight" />
            <p className="text-sm leading-relaxed text-foreground">{insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}