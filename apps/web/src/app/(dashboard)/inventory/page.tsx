"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatETB } from "@/lib/formatters";
import { calculateExpectedClosing, calculateVariance } from "@/lib/reconciliation";
import { dashboardService } from "@/services/dashboard-service";
import { type InventoryItem, type StockMovement } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ITEMS" | "MOVEMENTS" | "RECONCILIATION">("ITEMS");
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);

  // Waste Log State
  const [isWasteDrawerOpen, setIsWasteDrawerOpen] = useState(false);
  const [wasteItemId, setWasteItemId] = useState("");
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState<string>("EXPIRATION_SPOILAGE");
  const [wasteNotes, setWasteNotes] = useState("");

  // Purchase Log State
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [purchaseItemId, setPurchaseItemId] = useState("");
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState(100);
  const [purchaseSupplier, setPurchaseSupplier] = useState("Oromia Coffee Cooperative");

  // Reconciliation calculation state
  const [reconOpening, setReconOpening] = useState(120);
  const [reconPurchases, setReconPurchases] = useState(50);
  const [reconConsumption, setReconConsumption] = useState(65);
  const [reconWaste, setReconWaste] = useState(4);
  const [reconAdjustments, setReconAdjustments] = useState(-2);
  const [reconActualCount, setReconActualCount] = useState(99);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getInventory();
      setInventory(data);
      if (data.length > 0 && data[0]) {
        setWasteItemId(data[0].id);
        setPurchaseItemId(data[0].id);
      }
    } catch (e) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle Adjustment with mandatory audit justification
  const handleConfirmAdjust = async (reason?: string) => {
    if (!selectedItemForAdjust || !reason) return;
    try {
      const updated = await dashboardService.adjustStock(
        selectedItemForAdjust.id,
        adjustQuantity,
        reason
      );
      setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setIsAdjustModalOpen(false);
      setSelectedItemForAdjust(null);
      toast.success(`Inventory stock adjusted for ${updated.name}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to adjust stock");
    }
  };

  // Handle Log Waste
  const handleLogWaste = () => {
    const item = inventory.find((i) => i.id === wasteItemId);
    if (!item) return;
    // Deduct stock
    dashboardService.adjustStock(item.id, -wasteQty, `WASTE: ${wasteReason} — ${wasteNotes}`);
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, currentStock: Math.max(0, i.currentStock - wasteQty) } : i))
    );
    setIsWasteDrawerOpen(false);
    toast.success(`Logged ${wasteQty} ${item.unit} waste for ${item.name}`);
  };

  // Handle Purchase Order receipt
  const handleLogPurchase = () => {
    const item = inventory.find((i) => i.id === purchaseItemId);
    if (!item) return;
    dashboardService.adjustStock(item.id, purchaseQty, `PURCHASE RECEIPT from ${purchaseSupplier}`);
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, currentStock: i.currentStock + purchaseQty } : i))
    );
    setIsPurchaseDrawerOpen(false);
    toast.success(`Received ${purchaseQty} ${item.unit} for ${item.name}`);
  };

  // Reconciliation calculations
  const expectedClosing = calculateExpectedClosing({
    openingStock: reconOpening,
    purchases: reconPurchases,
    consumption: reconConsumption,
    waste: reconWaste,
    adjustments: reconAdjustments,
  });

  const { variance, isBalanced } = calculateVariance(reconActualCount, expectedClosing);

  // Table Columns
  const columns: ColumnDef<InventoryItem>[] = useMemo(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] font-bold text-sage">
            {row.original.sku}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Ingredient / Supply",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-forest dark:text-white block">
              {row.original.name}
            </span>
            <span className="text-[10px] text-sage">{row.original.supplier}</span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-[10px] font-bold text-sage uppercase">
            {row.original.category.replace("_", " ")}
          </span>
        ),
      },
      {
        accessorKey: "currentStock",
        header: "In Stock",
        cell: ({ row }) => (
          <div className="font-bold tabular-nums text-forest dark:text-white">
            {row.original.currentStock} {row.original.unit}
          </div>
        ),
      },
      {
        accessorKey: "minThreshold",
        header: "Safety Threshold",
        cell: ({ row }) => (
          <span className="text-sage tabular-nums">
            {row.original.minThreshold} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "costPerUnit",
        header: "Unit Cost",
        cell: ({ row }) => (
          <span className="tabular-nums font-medium text-forest dark:text-stone-200">
            {formatETB(row.original.costPerUnit)} / {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Stock Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemForAdjust(row.original);
              setAdjustQuantity(0);
              setIsAdjustModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg border border-border dark:border-[#283a2d] hover:bg-stone-50 text-[11px] font-bold text-meadow-dark dark:text-emerald-400 cursor-pointer"
          >
            Adjust
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Inventory & Supply Ledger
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Raw materials, batch expiry, append-only stock movement ledgers, and reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action Buttons */}
          <button
            type="button"
            onClick={() => setIsPurchaseDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-xs font-bold text-forest dark:text-stone-200 hover:bg-stone-50 cursor-pointer shadow-2xs"
          >
            + Receive Purchase
          </button>

          <button
            type="button"
            onClick={() => setIsWasteDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
          >
            Log Waste
          </button>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820]">
            {(["ITEMS", "RECONCILIATION"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer ${
                  activeTab === tab
                    ? "bg-forest dark:bg-meadow text-white dark:text-forest"
                    : "text-sage"
                }`}
              >
                {tab === "ITEMS" ? "Stock Items" : "Reconciliation"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: Stock Items Table */}
      {activeTab === "ITEMS" && (
        <DataTable
          columns={columns}
          data={inventory}
          searchPlaceholder="Search ingredient name or SKU..."
          searchColumn="name"
          exportFileName="sable-cafe-inventory"
          isLoading={isLoading}
        />
      )}

      {/* Tab 2: Stock Reconciliation View (SRS BR-009) */}
      {activeTab === "RECONCILIATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold font-display text-forest dark:text-white">
                Physical Stock Reconciliation Calculator
              </h2>
              <p className="text-xs text-sage mt-1">
                Authoritative Equation: Closing = Opening + Purchases − Consumption − Waste ± Adjustments (SRS BR-009)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  1. Opening Stock (kg / units)
                </label>
                <input
                  type="number"
                  value={reconOpening}
                  onChange={(e) => setReconOpening(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  2. Purchases (+)
                </label>
                <input
                  type="number"
                  value={reconPurchases}
                  onChange={(e) => setReconPurchases(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  3. POS Consumption (−)
                </label>
                <input
                  type="number"
                  value={reconConsumption}
                  onChange={(e) => setReconConsumption(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  4. Logged Waste (−)
                </label>
                <input
                  type="number"
                  value={reconWaste}
                  onChange={(e) => setReconWaste(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  5. Adjustments (±)
                </label>
                <input
                  type="number"
                  value={reconAdjustments}
                  onChange={(e) => setReconAdjustments(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-stone-300 mb-1">
                  6. Actual Physical Count
                </label>
                <input
                  type="number"
                  value={reconActualCount}
                  onChange={(e) => setReconActualCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-black text-meadow-dark dark:text-emerald-400"
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="p-4 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-sage block">Expected Closing:</span>
                <span className="text-xl font-black font-display text-forest dark:text-white tabular-nums">
                  {expectedClosing}
                </span>
              </div>

              <div>
                <span className="text-sage block">Audit Variance:</span>
                <span
                  className={`text-xl font-black font-display tabular-nums ${
                    isBalanced ? "text-meadow-dark" : "text-rose-600"
                  }`}
                >
                  {variance > 0 ? `+${variance}` : variance}
                </span>
              </div>

              <div>
                <span className="text-sage block">Reconciliation Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs mt-1 ${
                    isBalanced
                      ? "bg-meadow-tint text-meadow-dark"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {isBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {isBalanced ? "Balanced (Zero Discrepancy)" : "Variance Detected"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold font-display text-sm text-forest dark:text-white">
              Inventory Compliance Rules
            </h3>
            <div className="space-y-2.5 text-xs text-sage leading-relaxed">
              <p>
                <strong>BR-009 Append-Only Rule:</strong> Historical stock logs can never be deleted or modified.
              </p>
              <p>
                <strong>Shrinkage Variance:</strong> Discrepancies greater than 2% require mandatory manager sign-off with audit notes.
              </p>
              <p>
                <strong>Recipe Auto-Deduction:</strong> Each POS sale fires BOM deductions automatically upon ticket confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Confirm Modal with Mandatory Reason */}
      <ConfirmDialog
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItemForAdjust(null);
        }}
        title={`Adjust Stock for ${selectedItemForAdjust?.name}`}
        description={`Current on-hand stock: ${selectedItemForAdjust?.currentStock} ${selectedItemForAdjust?.unit}. Enter adjustment quantity (+ to add, - to reduce) and an audit explanation.`}
        confirmLabel="Record Adjustment"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="e.g. Periodic physical stock-take recount / found extra bag..."
        minReasonLength={5}
        onConfirm={handleConfirmAdjust}
      />

      {/* Waste Drawer */}
      <SideDrawer
        isOpen={isWasteDrawerOpen}
        onClose={() => setIsWasteDrawerOpen(false)}
        title="Log Ingredient / Spoilage Waste"
        subtitle="SRS 5.10 Waste categories with cost calculation"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsWasteDrawerOpen(false)}
              className="px-4 py-2 text-xs font-bold text-sage"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogWaste}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl"
            >
              Confirm Waste Entry
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Select Item</label>
            <select
              value={wasteItemId}
              onChange={(e) => setWasteItemId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Stock: {i.currentStock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Quantity Lost</label>
              <input
                type="number"
                value={wasteQty}
                onChange={(e) => setWasteQty(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Reason Category</label>
              <select
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              >
                <option value="EXPIRATION_SPOILAGE">Expiration / Spoilage</option>
                <option value="PREPARATION_SPILL">Prep Spill / Dropped</option>
                <option value="OVER_EXTRACTION_BURNT">Burnt / Failed Extraction</option>
                <option value="DEFECTIVE_BATCH">Defective Supplier Batch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Audit Notes</label>
            <textarea
              rows={3}
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
              placeholder="Provide exact details for accountant audit..."
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d]"
            />
          </div>
        </div>
      </SideDrawer>

      {/* Purchase Drawer */}
      <SideDrawer
        isOpen={isPurchaseDrawerOpen}
        onClose={() => setIsPurchaseDrawerOpen(false)}
        title="Receive Purchase Order"
        subtitle="Log incoming stock batch from approved supplier"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPurchaseDrawerOpen(false)}
              className="px-4 py-2 text-xs font-bold text-sage"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogPurchase}
              className="px-4 py-2 text-xs font-bold bg-meadow text-white rounded-xl"
            >
              Receive Into Stock
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Select Item</label>
            <select
              value={purchaseItemId}
              onChange={(e) => setPurchaseItemId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Quantity Received</label>
              <input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Unit Cost (ETB)</label>
              <input
                type="number"
                value={purchaseUnitCost}
                onChange={(e) => setPurchaseUnitCost(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Supplier Name</label>
            <input
              type="text"
              value={purchaseSupplier}
              onChange={(e) => setPurchaseSupplier(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d]"
            />
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
