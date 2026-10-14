"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Nut,
  Sparkles,
  Wheat,
} from "lucide-react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/data/types";

interface ProductGalleryProps {
  item: MenuItem;
  layoutId?: string;
}

export function ProductGallery({ item, layoutId }: ProductGalleryProps) {
  const images =
    item.gallery && item.gallery.length > 0 ? item.gallery : [item.image];
  const [activeIndex, setActiveIndex] = useState(0);

  // 3D Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineX, setShineX] = useState(50);
  const [shineY, setShineY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setIsTouchOrReduced(isTouch || prefersReduced);
    }
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouchOrReduced || !item.available) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8; // max 8 deg
    const rotY = ((x - centerX) / centerX) * 8; // max 8 deg

    setRotateX(rotX);
    setRotateY(rotY);
    setShineX((x / rect.width) * 100);
    setShineY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (!isTouchOrReduced) {
      setIsHovered(true);
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const _handleKeyDown = (e: KeyboardEvent) => {
    if (images.length <= 1) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextImage();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevImage();
    }
  };

  return (
    <section
      aria-label={`${item.name} image gallery`}
      className="relative flex flex-col gap-3 select-none"
    >
      {/* Main Image Stage */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 3D perspective tilt tracking */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square rounded-[24px] overflow-hidden bg-gradient-to-br from-cream via-white to-meadow-tint p-6 flex items-center justify-center border border-border shadow-xs"
        style={{
          perspective: 1000,
        }}
      >
        {/* Parallax Shine Layer */}
        {isHovered && !isTouchOrReduced && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`,
            }}
          />
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.discountPercent ? (
              <Badge variant="amber" size="sm">
                -{item.discountPercent}% OFF
              </Badge>
            ) : null}

            {item.isPopular && (
              <Badge
                variant="forest"
                size="sm"
                icon={<Sparkles className="w-3 h-3 text-amber" />}
              >
                Popular
              </Badge>
            )}

            {item.dietary?.includes("vegan") && (
              <Badge
                variant="cream"
                size="sm"
                icon={<Leaf className="w-3 h-3 text-meadow-dark" />}
              >
                Vegan
              </Badge>
            )}

            {item.dietary?.includes("vegetarian") &&
              !item.dietary?.includes("vegan") && (
                <Badge
                  variant="cream"
                  size="sm"
                  icon={<Leaf className="w-3 h-3 text-meadow" />}
                >
                  Vegetarian
                </Badge>
              )}

            {item.allergens?.includes("Tree Nuts") && (
              <Badge
                variant="cream"
                size="sm"
                icon={<Nut className="w-3 h-3 text-amber" />}
              >
                Contains Nuts
              </Badge>
            )}

            {item.dietary?.includes("gluten-free") && (
              <Badge
                variant="cream"
                size="sm"
                icon={<Wheat className="w-3 h-3 text-sage" />}
              >
                Gluten-Free
              </Badge>
            )}
          </div>
        </div>

        {/* 3D Tilted Product Image container */}
        <motion.div
          layoutId={layoutId || `product-image-${item.id}`}
          animate={{
            rotateX,
            rotateY,
            scale: isHovered ? 1.03 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 20,
          }}
          className="relative w-4/5 h-4/5 filter drop-shadow-[0_16px_24px_rgba(38,50,40,0.20)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full h-full"
            >
              <Image
                src={images[activeIndex] || item.image}
                alt={`${item.name} - view ${activeIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                priority
                className={`object-cover rounded-2xl transition-all duration-300 ${
                  !item.available
                    ? "grayscale opacity-50 contrast-75"
                    : "contrast-[1.02]"
                }`}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Unavailable Banner Overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[3px] flex items-center justify-center p-4 z-30">
            <div className="px-4 py-2 rounded-full bg-white text-forest text-xs font-black uppercase tracking-wider shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Currently Unavailable
            </div>
          </div>
        )}

        {/* Gallery Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous gallery image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-forest shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next gallery image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-forest shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Gallery Thumbnails / Dot Indicators */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
              aria-current={activeIndex === idx}
              className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                activeIndex === idx
                  ? "w-12 h-12 ring-2 ring-meadow ring-offset-2 scale-105"
                  : "w-10 h-10 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
