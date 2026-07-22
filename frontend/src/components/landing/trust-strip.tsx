import { ShieldCheck, Gauge, TrendingUp, Sparkles } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Secure" },
  { icon: Gauge, label: "Reliable" },
  { icon: TrendingUp, label: "Scalable" },
  { icon: Sparkles, label: "AI powered" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-12 gap-y-4 px-4 py-8 sm:px-6">
        {items.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <Icon className="size-4 text-primary" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}