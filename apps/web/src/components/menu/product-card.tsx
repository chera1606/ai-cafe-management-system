"use client";

import { Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Rating } from "@/components/ui/rating";
import { TiltCard } from "@/components/ui/tilt-card";
import { showToast } from "@/components/ui/toast";
import { useCart } from "@/context/cart-context";
import type { MenuItem } from "@/data/types";

export interface ProductCardProps {
  item: MenuItem;
  onOpenDetail?: (item: MenuItem) => void;
  priorityImage?: boolean;
}

export function ProductCard({
  item,
  onOpenDetail,
  priorityImage = false,
}: ProductCardProps) {
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const cartEntry = items.find((i) => (i.menuItemId || i.id) === item.id);
  const currentQuantity = cartEntry?.quantity || 0;

  const targetSlug = item.slug || item.id;
  const targetUrl = `/menu/${targetSlug}`;

  const handlePrefetch = () => {
    router.prefetch(targetUrl);
  };

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(item);
    } else {
      router.push(targetUrl, { scroll: false });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    if (!item.available) return;

    addItem(
      {
        id: item.id,
        menuItemId: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.categoryName,
      },
      1,
      { openDrawer: false },
    );

    showToast(
      "success",
      `Added ${item.name}`,
      `$${item.price.toFixed(2)} added to your order`,
    );
  };

  const handleIncrement = () => {
    if (cartEntry) {
      updateQuantity(cartEntry.id, cartEntry.quantity + 1);
    } else {
      addItem(
        {
          id: item.id,
          menuItemId: item.id,
          slug: item.slug,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.categoryName,
        },
        1,
        { openDrawer: false },
      );
    }
  };

  const handleDecrement = () => {
    if (cartEntry && cartEntry.quantity > 1) {
      updateQuantity(cartEntry.id, cartEntry.quantity - 1);
    } else if (cartEntry) {
      removeItem(cartEntry.id);
    }
  };

  return (
    <TiltCard
      maxTilt={6}
      onClick={handleCardClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-2 focus:ring-meadow"
    >
      <div>
        {/* Top Image Showcase Area */}
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-cream to-cream-alt p-4 flex items-center justify-center overflow-hidden rounded-t-[24px]">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-radial from-white/70 to-transparent opacity-60" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            {item.discountPercent ? (
              <Badge variant="amber" size="sm">
                -{item.discountPercent}% OFF
              </Badge>
            ) : item.isChefSignature ? (
              <Badge
                variant="forest"
                size="sm"
                icon={<Sparkles className="w-2.5 h-2.5 text-amber" />}
              >
                Chef Pick
              </Badge>
            ) : (
              <span />
            )}

            {item.tags?.[0] && (
              <Badge variant="cream" size="sm">
                {item.tags[0]}
              </Badge>
            )}
          </div>

          {/* Floating Product Image with Hardware Acceleration */}
          <div className="relative w-4/5 h-4/5 filter drop-shadow-[0_12px_16px_rgba(38,50,40,0.18)] transition-transform duration-300 group-hover:scale-105">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priorityImage}
              className={`object-cover rounded-2xl transition-all duration-300 ${
                !item.available ? "grayscale opacity-50 contrast-75" : ""
              }`}
            />
          </div>

          {/* Unavailable Overlay (SRS BR-002) */}
          {!item.available && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-20">
              <span className="px-3 py-1.5 rounded-full bg-white text-forest text-xs font-black uppercase tracking-wider shadow-lg">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-black text-forest group-hover:text-meadow-dark transition-colors leading-snug line-clamp-1">
              {item.name}
            </h3>
            <Rating score={item.rating} size="sm" showNumber />
          </div>

          <p className="text-xs text-sage line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border">
        <div>
          <span className="text-[11px] font-bold text-sage uppercase block leading-none">
            Price
          </span>
          <span className="text-xl font-black text-forest">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <div>
          {!item.available ? (
            <Button
              size="sm"
              variant="secondary"
              disabled
              className="opacity-60 cursor-not-allowed"
            >
              Sold Out
            </Button>
          ) : currentQuantity > 0 ? (
            <QuantityStepper
              quantity={currentQuantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              size="sm"
            />
          ) : (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAdd}
              className="shadow-sm"
            >
              Add
            </Button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
