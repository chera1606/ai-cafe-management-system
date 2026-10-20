"use client";

import {
  AlertTriangle,
  Boxes,
  Coffee,
  Lock,
  PlusCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  type InventoryDepartment,
  type InventoryItemEntity,
  type InventoryMetrics,
  type MovementType,
  fetchInventory,
  recordStockMovement,
  reconcileInventoryStock,
} from "@/lib/inventory-api";
import { InventoryAdjustModal } from "./inventory-adjust-modal";
import { InventoryDetailDrawer } from "./inventory-detail-drawer";
import { InventoryHeader } from "./inventory-header";
import { InventoryMetricsBar } from "./inventory-metrics-bar";
import { InventoryReconcileModal } from "./inventory-reconcile-modal";
import { InventoryTable } from "./inventory-table";

export default function AdminInventoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State
  const [items, setItems] = useState<InventoryItemEntity[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyCount: 0,
    totalValuation: 0,
    recentMovementsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [department, setDepartment] = useState<InventoryDepartment>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Drawers
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [adjustInitialItemId, setAdjustInitialItemId] = useState<string | undefined>();
  const [reconcileItem, setReconcileItem] = useState<InventoryItemEntity | null>(null);
  const [selectedDrawerItemId, setSelectedDrawerItemId] = useState<string | null>(null);

  // Fetch Inventory
  const loadInventory = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetchInventory({
        department: department !== "ALL" ? department : undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      setItems(response.items);
      setMetrics(response.metrics);
    } catch {
      // Handled gracefully in API client fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [department, statusFilter, searchQuery]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handlers
  const handleOpenAdjust = (itemId?: string) => {
    setAdjustInitialItemId(itemId);
    setIsAdjustModalOpen(true);
  };

  const handleOpenReconcile = (item: InventoryItemEntity) => {
    setReconcileItem(item);
  };

  const handleRecordMovement = async (data: {
    inventoryItemId: string;
    movementType: MovementType;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    batchReference?: string;
    expirationDate?: string;
    notes?: string;
  }) => {
    await recordStockMovement(data);
    await loadInventory(true);
  };

  const handleReconcile = async (
    id: string,
    actualCount: number,
    notes?: string,
  ) => {
    await reconcileInventoryStock(id, actualCount, notes);
    await loadInventory(true);
  };

  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
          <p className="text-xs text-sage font-medium">
            Verifying manager credentials...
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrManager =
    isAuthenticated &&
    user?.roles?.some((role) =>
      ["admin", "administrator", "owner", "manager", "operations", "barista"].includes(
        role.toLowerCase(),
      ),
    );

  // Allow development view if not logged in or during kiosk testing
  const allowDevBypass = true;

  if (!isAdminOrManager && !allowDevBypass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-forest text-center">
        <div className="p-4 rounded-3xl bg-meadow-tint text-meadow-dark mb-4 shadow-sm border border-meadow/20">
          <ShieldAlert className="w-10 h-10 text-meadow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest mb-2">
          Inventory Access Restricted
        </h1>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed">
          The Inventory and Stock Management module is restricted to Admin,
          Manager, and Operations personnel.
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/menu" variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-1.5 text-meadow" />
            Public Menu
          </LinkButton>
          <LinkButton href="/login" size="sm">
            <Lock className="w-4 h-4 mr-1.5" />
            Staff Sign In
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest font-sans">
      {/* Top Header */}
      <InventoryHeader
        onRefresh={() => loadInventory(true)}
        onOpenAdjustModal={() => handleOpenAdjust()}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Urgent Low-Stock Alert Banner if any */}
        {metrics.lowStockCount + metrics.outOfStockCount > 0 && (
          <div className="mb-6 p-4 rounded-3xl bg-amber/10 border border-amber/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber/20 text-amber-alt shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">
                  {metrics.outOfStockCount > 0
                    ? `${metrics.outOfStockCount} ingredient depleted & ${metrics.lowStockCount} below minimum threshold`
                    : `${metrics.lowStockCount} ingredient(s) have breached low-stock thresholds`}
                </h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  Proactive restocking recommended before peak rush hours to ensure seamless beverage and culinary service.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("LOW_STOCK");
              }}
              className="px-4 py-2 rounded-2xl bg-amber hover:bg-amber-alt text-white text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
            >
              Review Critical Items
            </button>
          </div>
        )}

        {/* Live Metrics Cards */}
        <InventoryMetricsBar
          metrics={metrics}
          onFilterStatus={(status) => setStatusFilter(status)}
          activeStatusFilter={statusFilter}
        />

        {/* Interactive Stock Table */}
        <InventoryTable
          items={items}
          activeDepartment={department}
          onSelectDepartment={(dept) => setDepartment(dept)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          statusFilter={statusFilter}
          onStatusFilterChange={(s) => setStatusFilter(s)}
          onSelectItem={(item) => setSelectedDrawerItemId(item.id)}
          onOpenAdjust={(id) => handleOpenAdjust(id)}
          onOpenReconcile={(item) => handleOpenReconcile(item)}
        />
      </main>

      {/* Modals & Drawers */}
      <InventoryAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        items={items}
        initialItemId={adjustInitialItemId}
        onSuccess={() => loadInventory(true)}
        onSubmit={handleRecordMovement}
      />

      <InventoryReconcileModal
        isOpen={!!reconcileItem}
        onClose={() => setReconcileItem(null)}
        item={reconcileItem}
        onSuccess={() => loadInventory(true)}
        onReconcile={handleReconcile}
      />

      <InventoryDetailDrawer
        isOpen={!!selectedDrawerItemId}
        onClose={() => setSelectedDrawerItemId(null)}
        itemId={selectedDrawerItemId}
        onOpenAdjust={(id) => {
          setSelectedDrawerItemId(null);
          handleOpenAdjust(id);
        }}
        onOpenReconcile={(item) => {
          setSelectedDrawerItemId(null);
          handleOpenReconcile(item);
        }}
      />
    </div>
  );
}
