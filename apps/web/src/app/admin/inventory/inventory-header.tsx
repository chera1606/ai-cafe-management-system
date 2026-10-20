"use client";

import {
  Boxes,
  ChefHat,
  Coffee,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InventoryHeaderProps {
  onRefresh: () => void;
  onOpenAdjustModal: () => void;
  isRefreshing?: boolean;
}

export function InventoryHeader({
  onRefresh,
  onOpenAdjustModal,
  isRefreshing = false,
}: InventoryHeaderProps) {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-2xl bg-meadow text-white shadow-md shadow-forest group-hover:bg-meadow-alt transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-forest block leading-tight font-serif">
                Sable Cafe
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sage block">
                Inventory & Stock Engine
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-border/80">
            <Link
              href="/admin/menu"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sage hover:text-forest hover:bg-cream transition-colors flex items-center gap-1.5"
            >
              <Coffee className="w-3.5 h-3.5" />
              Menu & Catalog
            </Link>
            <Link
              href="/kitchen"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sage hover:text-forest hover:bg-cream transition-colors flex items-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5" />
              Kitchen KDS
            </Link>
            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sage hover:text-forest hover:bg-cream transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Cashier POS
            </Link>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-meadow" : ""}`}
              />
            }
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAdjustModal}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Record Movement
          </Button>
        </div>
      </div>
    </header>
  );
}
