"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/data/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[currentIndex] ?? testimonials[0];

  return (
    <section className="py-20 sm:py-28 bg-cream-alt/60 border-y border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeading
          eyebrow="Guest Stories"
          title="Loved by Connoisseurs &amp; Regulars"
          highlightWord="Regulars"
          subtitle="Real experiences from our roastery room and digital ordering counter."
        />

        <div className="mt-14 relative bg-white rounded-[32px] p-8 sm:p-12 shadow-xl border border-stone-200">
          <div className="flex justify-center mb-6">
            <Rating score={5} size="lg" showNumber={false} />
          </div>

          <blockquote className="font-serif text-xl sm:text-2xl text-forest font-bold leading-relaxed italic">
            &ldquo;{current?.comment}&rdquo;
          </blockquote>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-meadow">
              <Image
                src={current?.avatar || ""}
                alt={current?.name || ""}
                fill
                className="object-cover"
              />
            </div>

            <div className="text-left">
              <p className="font-bold text-sm text-forest">{current?.name}</p>
              <p className="text-xs text-sage">{current?.role}</p>
            </div>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? testimonials.length - 1 : prev - 1,
                )
              }
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-forest transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-sage">
              {currentIndex + 1} / {testimonials.length}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === testimonials.length - 1 ? 0 : prev + 1,
                )
              }
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-forest transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
