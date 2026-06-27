import { Footer } from "@/components/landing/footer";
import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InsightsShowcase } from "@/components/landing/insights-showcase";
import { TrustStrip } from "@/components/landing/trust-strip";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <InsightsShowcase />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}