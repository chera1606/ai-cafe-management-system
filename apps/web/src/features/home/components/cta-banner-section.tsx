"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function CtaBannerSection() {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[36px] bg-gradient-to-br from-forest to-forest-2 p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
          {/* Subtle glow circle */}
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-meadow/20 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              Direct-Trade Highland Roast
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-black text-white leading-tight">
              Ready to Savor Real Ethiopian Coffee Craft?
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
              Skip the queue with express counter pickup, reserve a ceremonial
              Jebena table, or get piping hot wots delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
              <MagneticButton strength={0.25} className="w-full sm:w-auto">
                <LinkButton
                  href="/menu"
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto shadow-forest-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Order Online Now
                </LinkButton>
              </MagneticButton>

              <LinkButton
                href="/menu"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 hover:border-white shadow-sm"
              >
                Browse Menu
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
