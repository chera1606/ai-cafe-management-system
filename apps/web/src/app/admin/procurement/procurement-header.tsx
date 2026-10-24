"use client";

import { PlusCircle, RefreshCw, Truck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcurementHeaderProps {
  onRefresh: () => void;
  onOpenCreatePo: () => void;
  onOpenAddSupplier: () => void;
  isRefreshing?: boolean;
}

export function ProcurementHeader({
  onRefresh,
  onOpenCreatePo,
  onOpenAddSupplier,
  isRefreshing = false,
}: ProcurementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
            Procurement & Sourcing Hub
          </h1>
          <p className="text-xs text-slate-500">
            Direct-trade roaster supply chain, PO creation, and inbound shipment intake.
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
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-600" : ""}`}
            />
          }
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddSupplier}
          leftIcon={<UserPlus className="w-3.5 h-3.5 text-sky-600" />}
        >
          <span className="hidden sm:inline">Add Supplier</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreatePo}
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
        >
          Create PO
        </Button>
      </div>
    </div>
  );
}
