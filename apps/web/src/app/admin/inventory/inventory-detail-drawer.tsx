"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Hash,
  Scale,
  Sparkles,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type InventoryItemDetail,
  type InventoryItemEntity,
  fetchInventoryItemDetail,
} from "@/lib/inventory-api";

interface InventoryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  onOpenAdjust: (itemId: string) => void;
  onOpenReconcile: (item: InventoryItemEntity) => void;
}

export function InventoryDetailDrawer({
  isOpen,
  onClose,
  itemId,
  onOpenAdjust,
  onOpenReconcile,
}: InventoryDetailDrawerProps) {
  const [detail, setDetail] = useState<InventoryItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !itemId) {
      setDetail(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchInventoryItemDetail(itemId)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch(() => {
        // Handled
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        className="absolute inset-0 bg-forest/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-border flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border bg-cream/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sage block mb-1">
                Ingredient Profile
              </span>
              <h3 className="text-xl font-bold tracking-tight text-forest font-serif line-clamp-1">
                {detail?.name || "Loading..."}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-cream-alt text-sage hover:text-forest transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading || !detail ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-sage">
                <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
                <span className="text-xs font-medium">Loading ingredient records...</span>
              </div>
            ) : (
              <>
                {/* Stock Level Card */}
                <div className="p-5 rounded-3xl bg-cream border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-sage block mb-1">
                        Current On-Hand
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-forest">
                          {detail.currentQuantity}
                        </span>
                        <span className="text-sm font-bold text-sage">
                          {detail.unitOfMeasure}
                        </span>
                      </div>
                    </div>

                    <div>
                      {detail.status === "OUT_OF_STOCK" && (
                        <Badge variant="amber" icon={<XCircle className="w-3.5 h-3.5" />}>
                          Depleted
                        </Badge>
                      )}
                      {detail.status === "LOW_STOCK" && (
                        <Badge variant="amber" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                          Low Stock
                        </Badge>
                      )}
                      {detail.status === "IN_STOCK" && (
                        <Badge variant="meadow" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                          In Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Threshold Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-border/80">
                    <div className="flex items-center justify-between text-xs font-medium text-sage">
                      <span>Reorder Threshold</span>
                      <span className="font-bold text-forest">
                        {detail.reorderLevel} {detail.unitOfMeasure}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-cream-alt overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          detail.status === "OUT_OF_STOCK"
                            ? "bg-rose-500 w-0"
                            : detail.status === "LOW_STOCK"
                              ? "bg-amber-500"
                              : "bg-meadow"
                        }`}
                        style={{
                          width: `${Math.min(100, (detail.currentQuantity / (detail.reorderLevel * 2 || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions inside card */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenReconcile(detail)}
                      leftIcon={<Scale className="w-3.5 h-3.5" />}
                    >
                      Audit Count
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenAdjust(detail.id)}
                      leftIcon={<Truck className="w-3.5 h-3.5" />}
                    >
                      Restock / Move
                    </Button>
                  </div>
                </div>

                {/* Key Attributes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-cream-alt/60 border border-border">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1">
                      Department
                    </span>
                    <span className="text-sm font-bold text-forest">
                      {detail.department === "BARISTA" ? "Barista Station" : "Kitchen Bakery"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-cream-alt/60 border border-border">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1">
                      Unit Cost
                    </span>
                    <span className="text-sm font-black text-forest">
                      ${detail.unitCost.toFixed(2)} / {detail.unitOfMeasure}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-cream-alt/60 border border-border col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1">
                      Primary Supplier
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                      <Building2 className="w-3.5 h-3.5 text-meadow shrink-0" />
                      <span>{detail.supplier || "Local Ethiopian Roaster / Farm Direct"}</span>
                    </div>
                  </div>
                </div>

                {/* Active Batches */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sage flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-forest" />
                      Active Batches & Lots
                    </h4>
                    <span className="text-xs text-sage">{detail.activeBatches?.length || 0} batches</span>
                  </div>

                  {detail.activeBatches && detail.activeBatches.length > 0 ? (
                    <div className="space-y-2">
                      {detail.activeBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className="p-3.5 rounded-2xl border border-border bg-white text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-forest">
                            <span>{batch.batchReference}</span>
                            <span>
                              {batch.quantity} {detail.unitOfMeasure}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sage text-[11px]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Exp: {batch.expirationDate || "Non-perishable"}
                            </span>
                            <span className="text-meadow-dark font-semibold">
                              ${batch.unitCost.toFixed(2)}/unit
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-border text-center text-xs text-sage">
                      No active batch tags assigned.
                    </div>
                  )}
                </div>

                {/* Recent Movement Log */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sage flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-forest" />
                      Recent Stock Movements
                    </h4>
                  </div>

                  {detail.recentMovements && detail.recentMovements.length > 0 ? (
                    <div className="space-y-2.5">
                      {detail.recentMovements.map((mov) => {
                        const isPositive =
                          mov.movementType === "PURCHASE" ||
                          mov.movementType === "ADJUSTMENT_IN";

                        return (
                          <div
                            key={mov.id}
                            className="p-3.5 rounded-2xl border border-border bg-white text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-xl ${
                                  isPositive
                                    ? "bg-meadow-tint text-meadow-dark"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-forest block">
                                  {mov.movementType}
                                </span>
                                <span className="text-[11px] text-sage">
                                  {mov.notes || mov.referenceType || "Stock adjustment"}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`font-black text-sm block ${
                                  isPositive ? "text-meadow-dark" : "text-rose-700"
                                }`}
                              >
                                {isPositive ? "+" : "-"}
                                {mov.quantity} {detail.unitOfMeasure}
                              </span>
                              <span className="text-[10px] text-sage">
                                {new Date(mov.occurredAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-border text-center text-xs text-sage">
                      No recent movements logged.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
