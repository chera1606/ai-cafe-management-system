"use client";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HowItWorksStep } from "@/data/types";

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-cream-alt/70 border-y border-stone-200/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Smart Hospitality"
          title="How Your Order Journeys to You"
          highlightWord="Journeys"
          subtitle="From the highland cooperative farms to your cup in four seamless steps."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line between steps */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-12 right-12 h-1 bg-meadow-tint z-0"
          />

          {steps.map((step, idx) => (
            <Reveal
              key={step.step}
              delay={idx * 0.15}
              className="relative z-10"
            >
              <div className="bg-white rounded-[28px] p-6 border border-stone-200 shadow-sm flex flex-col items-center text-center h-full">
                {/* Step Number Circle */}
                <div className="w-14 h-14 rounded-2xl bg-meadow text-white font-serif font-black text-xl flex items-center justify-center shadow-md shadow-forest mb-5">
                  0{step.step}
                </div>

                <h3 className="font-serif text-lg font-black text-forest">
                  {step.title}
                </h3>

                <p className="text-xs text-sage mt-2 leading-relaxed">
                  {step.description}
                </p>

                {step.duration && (
                  <span className="mt-4 px-3 py-1 rounded-full bg-cream-alt text-[11px] font-bold text-meadow">
                    {step.duration}
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
