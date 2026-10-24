"use client";

import { Boxes, PlusCircle, RefreshCw } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
            Inventory & Stock Engine
          </h1>
          <p className="text-xs text-slate-500">
            Live ingredient on-hand levels, automated recipe depletions, and waste
            tracking.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
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
  );
}
