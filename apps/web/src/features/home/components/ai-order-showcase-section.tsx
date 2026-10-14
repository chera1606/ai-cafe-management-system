"use client";

import { Bot, CheckCircle2 } from "lucide-react";
import { openAiAssistant } from "@/components/ui/ai-assistant-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function AiOrderShowcaseSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-forest to-forest-2 text-cream relative overflow-hidden">
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -right-40 w-96 h-96 bg-meadow/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <Badge
              variant="meadow"
              icon={<Bot className="w-3.5 h-3.5 text-meadow" />}
            >
              Conversational Hospitality
            </Badge>

            <h2 className="font-serif text-3xl sm:text-5xl font-black text-white leading-tight">
              Order Naturally, Like Talking to Your Favorite Barista.
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
              Type or speak your complex orders in plain language. Our assistant
              verifies kitchen bean inventory, suggests fresh pastry pairings,
              and reserves your pickup slot seamlessly.
            </p>

            <div className="space-y-3 pt-2 text-xs text-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>Understands multi-item modifiers and dietary notes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>
                  Live synchronisation with barista extraction inventory
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>No confusing dropdown menus or form clutter</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => openAiAssistant()}
                leftIcon={<Bot className="w-4 h-4" />}
                className="shadow-forest"
              >
                Try AI Order Assistant
              </Button>
            </div>
          </div>

          {/* Right Column: Animated Mock Chat UI Shell */}
          <div className="lg:col-span-7">
            <Reveal direction="left" delay={0.2}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-4">
                {/* Chat Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-meadow flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Sable Live Assistant
                      </p>
                      <p className="text-[10px] text-emerald-300">
                        Active &bull; Kitchen sync online
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-stone-300">
                    Natural Language Demo
                  </span>
                </div>

                {/* Chat Bubble: User */}
                <div className="flex justify-end">
                  <div className="max-w-md bg-meadow text-white p-3.5 rounded-2xl rounded-tr-none text-xs sm:text-sm font-medium shadow-md">
                    &ldquo;Two cappuccinos with oat milk and one warm cardamom
                    croissant, pickup at 5:00 PM.&rdquo;
                  </div>
                </div>

                {/* Chat Bubble: AI */}
                <div className="flex justify-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-meadow-tint flex items-center justify-center text-meadow shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="max-w-md bg-white/95 text-forest p-4 rounded-2xl rounded-tl-none text-xs sm:text-sm shadow-md space-y-3">
                    <p className="font-medium text-stone-800">
                      Order prepared! Both items verified available at our
                      roastery counter.
                    </p>

                    {/* Order Summary Card that built itself */}
                    <div className="bg-cream rounded-xl p-3 border border-stone-200 text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-forest">
                        <span>2x Pistachio Oat Flat White</span>
                        <span>$14.50</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-forest">
                        <span>1x Cardamom Almond Croissant</span>
                        <span>$5.50</span>
                      </div>
                      <div className="flex justify-between items-center text-sage text-[11px] pt-1 border-t border-stone-200">
                        <span>Pickup Slot:</span>
                        <span className="font-bold text-amber">
                          Today @ 5:00 PM
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black text-forest pt-1">
                        <span>Estimated Total:</span>
                        <span className="text-meadow">$20.00</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => openAiAssistant()}
                        className="px-3.5 py-1.5 rounded-full bg-meadow hover:bg-meadow-alt text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Add to My Tray
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
