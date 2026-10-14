"use client";

import { useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ProductModal } from "@/components/product/product-modal";
import { AiAssistantButton } from "@/components/ui/ai-assistant-button";
import {
  CAFE_FEATURES,
  HOW_IT_WORKS_STEPS,
  MENU_ITEMS,
  TESTIMONIALS,
} from "@/data/mock-cafe";
import type {
  CafeFeature,
  HowItWorksStep,
  MenuItem,
  Testimonial,
} from "@/data/types";
import {
  AiOrderShowcaseSection,
  CtaBannerSection,
  FeaturesBentoSection,
  HeroSection,
  HowItWorksSection,
  OrderOptionsStrip,
  PopularFavoritesSection,
  TestimonialsSection,
} from "@/features/home";

export default function HomePage() {
  const [featuredItems] = useState<MenuItem[]>(() =>
    MENU_ITEMS.filter((item) => item.isPopular),
  );
  const [testimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [features] = useState<CafeFeature[]>(CAFE_FEATURES);
  const [steps] = useState<HowItWorksStep[]>(HOW_IT_WORKS_STEPS);
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest selection:bg-meadow-tint selection:text-forest">
      {/* Global Transparent-to-Glass Navbar */}
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* 1. Hero Section (Split Layout with 3D/Parallax Floating Hero) */}
        <HeroSection />

        {/* 2. Quick Order Options Strip (Tilt Cards for Dine-in, Pickup, Delivery) */}
        <OrderOptionsStrip />

        {/* 3. Popular / Today's Favorites (4-Column Responsive Grid) */}
        <PopularFavoritesSection
          items={featuredItems}
          onItemClick={(item) => setActiveModalItem(item)}
        />

        {/* 4. How It Works (Timeline with Connecting Line) */}
        <HowItWorksSection steps={steps} />

        {/* 5. "Order with AI" Showcase Section (Dark Forest Gradient with Simulated Chat UI) */}
        <AiOrderShowcaseSection />

        {/* 6. Why Us / Features (Bento Grid) */}
        <FeaturesBentoSection features={features} />

        {/* 7. Testimonials (Carousel with Amber Stars) */}
        <TestimonialsSection testimonials={testimonials} />

        {/* 8. Conversion CTA Banner */}
        <CtaBannerSection />
      </main>

      {/* Global Luxury Footer */}
      <Footer />

      {/* Product Quick-View Modal */}
      <ProductModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
      />

      {/* Floating AI Order Assistant Shell Button */}
      <AiAssistantButton />
    </div>
  );
}
