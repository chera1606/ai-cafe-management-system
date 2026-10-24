"use client";

import {
  Building2,
  Coffee,
  FolderPlus,
  Layers,
  Scale,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminCategoriesTab } from "./admin-categories-tab";
import { AdminDepartmentsTab } from "./admin-departments-tab";
import { AdminIngredientsTab } from "./admin-ingredients-tab";
import { AdminMenuItemsTab } from "./admin-menu-items-tab";

type ActiveTab = "items" | "categories" | "departments" | "ingredients";

export function AdminMenuView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("items");

  const tabs = [
    {
      id: "items" as const,
      label: "Menu Items & Recipes",
      icon: Coffee,
      count: "16",
    },
    {
      id: "categories" as const,
      label: "Categories",
      icon: FolderPlus,
      count: "6",
    },
    {
      id: "departments" as const,
      label: "Stations & Routing",
      icon: Building2,
      count: "3",
    },
    {
      id: "ingredients" as const,
      label: "Raw Ingredients (BOM)",
      icon: Scale,
      count: "24",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              Catalog & Recipe Formulations
            </h1>
            <p className="text-xs text-slate-500">
              Menu item offerings, pricing, station preparation routing, and recipe Bill of Materials (BOM).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Segmented Control Tab Navigation */}
      <div className="p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 inline-flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400",
                )}
              />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-200/70 text-slate-600",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="pt-2">
        {activeTab === "items" && <AdminMenuItemsTab />}
        {activeTab === "categories" && <AdminCategoriesTab />}
        {activeTab === "departments" && <AdminDepartmentsTab />}
        {activeTab === "ingredients" && <AdminIngredientsTab />}
      </div>
    </div>
  );
}
