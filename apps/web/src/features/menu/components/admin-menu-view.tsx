"use client";

import {
  Building2,
  Coffee,
  FolderPlus,
  Scale,
  ShieldCheck,
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
      description: "Manage offerings, pricing, live availability, and recipes",
    },
    {
      id: "categories" as const,
      label: "Categories",
      icon: FolderPlus,
      description: "Catalog groupings (Signature Espresso, Pastries, etc.)",
    },
    {
      id: "departments" as const,
      label: "Preparation Stations",
      icon: Building2,
      description: "Fulfillment routing (Espresso Bar, Cold Bar, Kitchen)",
    },
    {
      id: "ingredients" as const,
      label: "Raw Ingredients",
      icon: Scale,
      description: "Ingredients and units of measure for recipes",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin & Operations
            </span>
            <div className="flex items-center gap-1 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manager Privileges Active</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Menu & Recipe Manager
          </h1>
          <p className="text-xs text-stone-300">
            Real-time catalog oversight, preparation routing, and recipe Bill of
            Materials (BOM) management.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-amber-700 text-white shadow-sm shadow-amber-700/20"
                  : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
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
