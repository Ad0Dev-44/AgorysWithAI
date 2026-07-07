import { ArrowRight, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";

export function InsightsShowcase() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">

        <div className="mb-14">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Insights Showcase
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Explore trends, patterns, and predictions generated from your data.
          </p>
        </div>


        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            bg-white
            px-8
            py-20
            text-center
            shadow-sm
          "
        >

          {/* Decorative glow */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-blue-50
              via-transparent
              to-transparent
            "
          />


          <div className="relative">

            {/* AI Badge */}
            <div
              className="
                mx-auto
                mb-6
                flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                bg-white
                px-4
                py-2
                text-sm
                text-slate-700
              "
            >
              <Sparkles
                className="size-4"
                aria-hidden="true"
              />

              AI-powered analytics
            </div>


            {/* Heading */}
            <h3
              className="
                mx-auto
                max-w-3xl
                text-5xl
                font-semibold
                tracking-tight
                text-slate-900
              "
            >
              Stop guessing.
              <br />
              Start deciding with data.
            </h3>


            {/* Description */}
            <p
              className="
                mx-auto
                mt-6
                max-w-xl
                text-lg
                text-slate-600
              "
            >
              Upload your dataset and get instant insights,
              trends, and predictions.
            </p>


            {/* CTA */}
            <Link
              href="/register"
              className="
                group
                mt-10
                inline-flex
                items-center
                gap-3
                rounded-xl
                bg-black
                px-8
                py-4
                font-medium
                text-white
                transition
                hover:bg-slate-800
              "
            >
              <UploadCloud
                className="size-5"
                aria-hidden="true"
              />

              Start free

              <ArrowRight
                className="
                  size-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
