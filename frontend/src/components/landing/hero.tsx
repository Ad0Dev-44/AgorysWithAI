import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-signal-grid">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-background to-transparent" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-insight" />
            AI-generated recommendations, not just charts
          </div>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Turn raw spreadsheets into decisions you can defend.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Upload a dataset. Agorys reads it, finds the trend, forecasts
            what&apos;s next, and tells you what to do about it — in minutes,
            not a week with an analyst.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Log in
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            No credit card required · CSV in, insight out
          </p>
        </div>

        <div className="lg:pl-4">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}