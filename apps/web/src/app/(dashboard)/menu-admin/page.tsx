"use client";

import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type MenuItem } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Coffee,
  Edit,
  Eye,
  EyeOff,
  Grid,
  List,
  Plus,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Upload,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Form edit state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Coffee");
  const [editPrice, setEditPrice] = useState(150);
  const [editCostPrice, setEditCostPrice] = useState(40);
  const [editDescription, setEditDescription] = useState("");
  const [editDepartment, setEditDepartment] = useState<MenuItem["department"]>("BEVERAGE");
  const [editAvailable, setEditAvailable] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getMenuItems();
      setItems(data);
    } catch (e) {
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleAvailability = async (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic update
    const previous = [...items];
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
    );
    setItems(updated);

    try {
      await dashboardService.toggleMenuItemAvailability(item.id);
      toast.success(
        `${item.name} is now ${!item.isAvailable ? "Available" : "86'd / Unavailable"}`
      );
    } catch (err) {
      setItems(previous);
      toast.error("Failed to update availability");
    }
  };

  const handleOpenEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPrice(item.price);
    setEditCostPrice(item.costPrice);
    setEditDescription(item.description);
    setEditDepartment(item.department);
    setEditAvailable(item.isAvailable);
    setIsEditDrawerOpen(true);
  };

  const handleSaveItem = () => {
    if (!selectedItem) return;
    const updated: MenuItem = {
      ...selectedItem,
      name: editName,
      category: editCategory,
      price: editPrice,
      costPrice: editCostPrice,
      description: editDescription,
      department: editDepartment,
      isAvailable: editAvailable,
    };
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setIsEditDrawerOpen(false);
    toast.success(`Menu item ${updated.name} updated successfully!`);
  };

  // Table Columns
  const columns: ColumnDef<MenuItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Item Name",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-forest dark:text-white block">
              {row.original.name}
            </span>
            <span className="text-[11px] text-sage">{row.original.category}</span>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: "Station",
        cell: ({ row }) => (
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold">
            {row.original.department}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: "Selling Price",
        cell: ({ row }) => (
          <span className="font-bold tabular-nums text-forest dark:text-white">
            {formatETB(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "costPrice",
        header: "Cost Price (BOM)",
        cell: ({ row }) => (
          <span className="text-sage tabular-nums">{formatETB(row.original.costPrice)}</span>
        ),
      },
      {
        id: "margin",
        header: "Margin",
        cell: ({ row }) => {
          const margin = Math.round(
            ((row.original.price - row.original.costPrice) / (row.original.price || 1)) * 100
          );
          return (
            <span className="font-bold text-meadow-dark dark:text-emerald-400 tabular-nums">
              {margin}%
            </span>
          );
        },
      },
      {
        accessorKey: "isAvailable",
        header: "Availability",
        cell: ({ row }) => {
          const isAvail = row.original.isAvailable;
          return (
            <button
              type="button"
              onClick={(e) => handleToggleAvailability(row.original, e)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border"
              style={{
                backgroundColor: isAvail ? "rgba(72,168,83,0.12)" : "rgba(239,68,68,0.12)",
                color: isAvail ? "#2e7d32" : "#b91c1c",
                borderColor: isAvail ? "rgba(72,168,83,0.25)" : "rgba(239,68,68,0.25)",
              }}
            >
              {isAvail ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{isAvail ? "In Stock" : "86'd / Out"}</span>
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row.original);
            }}
            className="p-1.5 rounded-lg border border-border dark:border-[#283a2d] hover:bg-stone-50 text-sage hover:text-forest"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    [items]
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Menu Catalog & Recipe BOM
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Product catalog pricing, department routing, and instant 86'd stock switches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Cards toggle */}
          <div className="flex items-center p-0.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "table"
                  ? "bg-forest dark:bg-meadow text-white dark:text-forest"
                  : "text-sage"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "cards"
                  ? "bg-forest dark:bg-meadow text-white dark:text-forest"
                  : "text-sage"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const newItem: MenuItem = {
                id: `item-${Date.now()}`,
                name: "New Ethiopian Dish / Drink",
                slug: "new-dish",
                category: "Coffee",
                department: "BEVERAGE",
                price: 180,
                costPrice: 45,
                description: "Freshly crafted recipe item.",
                isAvailable: true,
                isActive: true,
                prepTimeMinutes: 5,
              };
              handleOpenEdit(newItem);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold hover:bg-forest-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-meadow dark:text-forest" />
            <span>Create Item</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table or Card Grid */}
      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search item name or category..."
          searchColumn="name"
          onRowClick={(item) => handleOpenEdit(item)}
          exportFileName="sable-cafe-menu"
          isLoading={isLoading}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEdit(item)}
              className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-4 shadow-xs hover:shadow-forest transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold">
                    {item.department}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-forest dark:text-white">{item.name}</h3>
                <p className="text-xs text-sage line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 dark:border-[#283a2d] flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-forest dark:text-white tabular-nums">
                    {formatETB(item.price)}
                  </span>
                  <span className="text-[10px] text-sage block">Cost: {formatETB(item.costPrice)}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleToggleAvailability(item, e)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer border ${
                    item.isAvailable
                      ? "bg-meadow-tint text-meadow-dark border-meadow/30"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "86'd"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Sheet Drawer: Create / Edit Item */}
      <SideDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={selectedItem?.name ? `Edit: ${selectedItem.name}` : "New Menu Item"}
        subtitle="Catalog parameters, preparation station, and raw BOM pricing"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditDrawerOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-sage hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="px-4 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-meadow dark:text-forest" />
              <span>Save Item</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Item Title</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest dark:text-stone-200 mb-1">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
              />
            </div>

            <div>
              <label className="block font-bold text-forest dark:text-stone-200 mb-1">Station</label>
              <select
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] font-bold"
              >
                <option value="BEVERAGE">BEVERAGE (Barista)</option>
                <option value="KITCHEN">KITCHEN (Cooks)</option>
                <option value="BAKERY">BAKERY (Pastry)</option>
                <option value="SPECIALTY">SPECIALTY (Ceremony)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest dark:text-stone-200 mb-1">
                Selling Price (ETB)
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-forest dark:text-stone-200 mb-1">
                Cost of Goods (BOM)
              </label>
              <input
                type="number"
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
            />
          </div>

          {/* Availability switch */}
          <div className="p-3 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] flex items-center justify-between">
            <div>
              <p className="font-bold text-forest dark:text-white">Live Availability</p>
              <p className="text-[11px] text-sage">Allow orders for this item in POS & Customer Menu</p>
            </div>
            <button
              type="button"
              onClick={() => setEditAvailable(!editAvailable)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                editAvailable
                  ? "bg-meadow-tint text-meadow-dark border-meadow/30"
                  : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              {editAvailable ? "Available" : "86'd / Hidden"}
            </button>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
