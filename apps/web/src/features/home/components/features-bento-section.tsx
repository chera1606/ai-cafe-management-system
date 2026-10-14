"use client";

import { Clock, Coffee, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";
import type { CafeFeature } from "@/data/types";

interface FeaturesBentoSectionProps {
  features: CafeFeature[];
}

export function FeaturesBentoSection({ features }: FeaturesBentoSectionProps) {
  return (
    <section id="why-us" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Craft & Technology"
          title="Why Coffee Lovers &amp; Foodies Choose Sable"
          highlightWord="Choose"
          subtitle="Where ancient ceremonial traditions meet modern, frictionless guest convenience."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              className={`${feature.colSpan || "lg:col-span-4"}`}
            >
              <Reveal delay={idx * 0.1}>
                <TiltCard
                  maxTilt={6}
                  className="p-8 h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-meadow-tint text-meadow flex items-center justify-center">
                        {idx === 0 && <Coffee className="w-6 h-6" />}
                        {idx === 1 && <Cpu className="w-6 h-6" />}
                        {idx === 2 && <Sparkles className="w-6 h-6" />}
                        {idx === 3 && <Clock className="w-6 h-6" />}
                        {idx === 4 && <ShieldCheck className="w-6 h-6" />}
                      </div>

                      {feature.badge && (
                        <Badge variant="cream" size="sm">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-black text-forest">
                      {feature.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-sage leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
