import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Stop guessing. Start deciding with data.
        </h2>

        <p className="mt-4 text-muted-foreground">
          Upload your dataset and get insights instantly.
        </p>

        <div className="mt-8">
          <Link href="/login">
            <Button size="lg">
              Start free
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
