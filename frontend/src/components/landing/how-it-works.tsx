import { Upload, Wand2, TrendingUp, MessageSquareText } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your dataset",
    description: "Drop in a CSV. Agorys detects the columns automatically.",
  },
  {
    icon: Wand2,
    title: "Map date, product & revenue",
    description: "Tell it which column is which — a one-time, thirty-second step.",
  },
  {
    icon: TrendingUp,
    title: "Get trends & forecasts",
    description: "See where revenue has been, and a six-month projection of where it's going.",
  },
  {
    icon: MessageSquareText,
    title: "Receive recommendations",
    description: "Read what changed and what to do next, written in plain language.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From spreadsheet to summary in four steps.
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}