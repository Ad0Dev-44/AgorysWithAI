import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-primary bg-signal-grid px-6 py-14 text-center">
        <div className="pointer-events-none absolute inset-0 bg-primary/85" />

        <div className="relative">
          <h2 className="font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Stop guessing. Start deciding with data.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
            Upload your dataset and get insights instantly.
          </p>

          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
