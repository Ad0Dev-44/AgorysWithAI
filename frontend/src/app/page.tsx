import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InsightsShowcase } from "@/components/landing/insights-showcase";
import { TrustStrip } from "@/components/landing/trust-strip";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <InsightsShowcase />
      </main>
    </div>
  );
}
