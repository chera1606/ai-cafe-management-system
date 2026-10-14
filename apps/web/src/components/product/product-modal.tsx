"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/data/types";
import { ProductDetailView } from "./product-detail-view";

interface ProductModalProps {
  item: MenuItem | null;
  relatedItems?: MenuItem[];
  onClose?: () => void;
}

export function ProductModal({
  item,
  relatedItems = [],
  onClose,
}: ProductModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const dragControls = useDragControls();

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check window size & reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  // Focus trapping and Esc key listener
  useEffect(() => {
    if (!item) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus first element in modal
    setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [item, handleClose]);

  if (!item) return null;

  // Animation variants
  const desktopVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.94, y: 16 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 320, damping: 28 },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          y: 12,
          transition: { duration: 0.2 },
        },
      };

  const mobileVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { y: "100%", opacity: 0.5 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: "spring" as const, damping: 30, stiffness: 350 },
        },
        exit: {
          y: "100%",
          opacity: 0,
          transition: { duration: 0.25 },
        },
      };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} details`}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      >
        {/* Blurred Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm cursor-pointer z-0"
          aria-hidden="true"
        />

        {/* Modal Dialog Window / Bottom Sheet Container */}
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          variants={isMobile ? mobileVariants : desktopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag={isMobile ? "y" : false}
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_e, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              handleClose();
            }
          }}
          className={`relative z-10 w-full bg-white shadow-[0_24px_50px_rgba(38,50,40,0.28)] flex flex-col focus:outline-none min-h-0 ${
            isMobile
              ? "h-[92vh] max-h-[92vh] rounded-t-[28px] pb-safe overflow-hidden"
              : "max-w-[960px] h-[88vh] max-h-[88vh] rounded-[28px] border border-stone-200/80 overflow-hidden"
          }`}
        >
          {/* Mobile Drag Handle - triggers drag dismissal */}
          {isMobile && (
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
            >
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>
          )}

          {/* Close X Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close product preview"
            className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-white/90 hover:bg-stone-100 text-forest shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-meadow cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Content Body - strictly constrained so inner area scrolls */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ProductDetailView
              item={item}
              relatedItems={relatedItems}
              onClose={handleClose}
              isModal={true}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
