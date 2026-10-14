"use client";

import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/menu/product-card";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MenuItem } from "@/data/types";

interface PopularFavoritesSectionProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export function PopularFavoritesSection({
  items,
  onItemClick,
}: PopularFavoritesSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionHeading
            eyebrow="Chef's Selection"
            title="Today's Handcrafted Favorites"
            highlightWord="Favorites"
            subtitle="Small-batch single origin beans, slow-simmered wots, and warm brioche baked fresh every morning."
            align="left"
          />

          <LinkButton
            href="/menu"
            variant="outline"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="self-start md:self-end"
          >
            Full Menu
          </LinkButton>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.1}>
              <ProductCard
                item={item}
                onOpenDetail={(it) => onItemClick(it)}
                priorityImage={idx === 0}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
