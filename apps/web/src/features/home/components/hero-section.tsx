"use client";

import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { FloatingHeroCoffee } from "@/components/hero/floating-hero-coffee";
import { HeroBackground } from "@/components/hero/hero-background";
import { LinkButton } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Rating } from "@/components/ui/rating";
import { Reveal } from "@/components/ui/reveal";

export function HeroSection() {
  return (
    <section className="relative isolate pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden min-h-[92vh] flex flex-col justify-center">
      <HeroBackground intensity="normal" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
                <span className="w-2 h-2 rounded-full bg-meadow animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Freshly Brewed &bull; Order in Seconds
                </span>
              </div>
            </Reveal>

            {/* Big Display Headline with Hand-Drawn Underline in Meadow */}
            <Reveal delay={0.2}>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.12] tracking-tight drop-shadow-md">
                Artisanal Coffee &amp; Culinary{" "}
                <span className="relative inline-block text-meadow">
                  Heritage
                  <svg
                    className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-meadow overflow-visible pointer-events-none"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 13C25 4 65 6 97 14C75 17 35 15 12 18"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                , Powered by AI.
              </h1>
            </Reveal>

            {/* Subtitle in Crisp Light Tone */}
            <Reveal delay={0.3}>
              <p className="text-base sm:text-lg text-stone-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal drop-shadow-xs">
                Experience slow-simmered highland wots, live pan-roasted
                Yirgacheffe ceremonies, and frictionless table ordering synced
                with kitchen telemetry.
              </p>
            </Reveal>

            {/* Dual CTAs (Magnetic Primary + Outline) */}
            <Reveal delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full">
                <MagneticButton strength={0.25} className="w-full sm:w-auto">
                  <LinkButton
                    href="/menu"
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto shadow-forest-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    Order Now
                  </LinkButton>
                </MagneticButton>

                <LinkButton
                  href="/menu"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 hover:border-white shadow-sm"
                >
                  View Full Menu
                </LinkButton>
              </div>
            </Reveal>

            {/* Trust Row */}
            <Reveal delay={0.5}>
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Rating score={5} size="sm" showNumber={false} />
                  <span className="font-bold text-white">4.9</span>
                  <span>(2,400+ reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-meadow" />
                  <span className="font-bold text-white">Avg. 18 min</span>
                  <span>prep to table</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-meadow" />
                  <span>Fresh organic teff injera</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: 3D / Parallax Coffee Floating Hero */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Reveal direction="up" delay={0.3} className="w-full max-w-md">
              <FloatingHeroCoffee />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
