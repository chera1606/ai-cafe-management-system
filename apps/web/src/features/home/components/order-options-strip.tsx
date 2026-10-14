"use client";

import { ArrowRight, Coffee, Truck, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/tilt-card";

export function OrderOptionsStrip() {
  return (
    <section className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: Table Dine-In */}
        <TiltCard maxTilt={8} className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-meadow-tint text-meadow flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-black text-forest">
                Table Dine-In &amp; Buna
              </h3>
              <p className="text-xs text-sage mt-1 leading-relaxed">
                Scan your mesob table QR code to order live ceremonial
                pour-overs and sizzling skillet platters straight to your seat.
              </p>
              <Link
                href="/menu?mode=dine-in"
                className="inline-flex items-center gap-1 text-xs font-bold text-meadow hover:underline mt-3"
              >
                Order for table <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </TiltCard>

        {/* Option 2: Express Pickup */}
        <TiltCard maxTilt={8} className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber/15 text-amber flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-black text-forest">
                Express Steam Pickup
              </h3>
              <p className="text-xs text-sage mt-1 leading-relaxed">
                Skip the counter rush. Your pour-over is extracted to the second
                and waiting at our pickup shelf.
              </p>
              <Link
                href="/menu?mode=pickup"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber hover:underline mt-3"
              >
                Pre-order pickup <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </TiltCard>

        {/* Option 3: Eco Thermal Delivery */}
        <TiltCard maxTilt={8} className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-black text-forest">
                Eco Thermal Delivery
              </h3>
              <p className="text-xs text-sage mt-1 leading-relaxed">
                Hot skillet meals and insulated roast carafes delivered straight
                to your home or studio workspace.
              </p>
              <Link
                href="/menu?mode=delivery"
                className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline mt-3"
              >
                Order delivery <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
