"use client";

import {
  Boxes,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ExternalLink,
  Flame,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
  external?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navGroups: NavGroup[] = [
    {
      group: "Overview & Reports",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Orders Management",
          href: "/admin/orders",
          icon: Receipt,
          badge: "Live",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        },
        {
          label: "Sales & Analytics",
          href: "/admin/analytics",
          icon: TrendingUp,
        },
      ],
    },
    {
      group: "Catalog & Production",
      items: [
        {
          label: "Menu & Recipes",
          href: "/admin/menu",
          icon: UtensilsCrossed,
        },
      ],
    },
    {
      group: "Inventory & Supply",
      items: [
        {
          label: "Stock & Depletion",
          href: "/admin/inventory",
          icon: Boxes,
          badge: "Stock",
          badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        },
        {
          label: "Procurement & POs",
          href: "/admin/procurement",
          icon: Truck,
        },
      ],
    },
    {
      group: "Management & Config",
      items: [
        {
          label: "Staff & Shifts",
          href: "/admin/staff",
          icon: Users,
        },
        {
          label: "Store Settings",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
    {
      group: "Floor Terminals",
      items: [
        {
          label: "Launch POS Terminal",
          href: "/pos",
          icon: ShoppingBag,
          external: true,
        },
        {
          label: "Launch Kitchen KDS",
          href: "/kitchen",
          icon: ChefHat,
          external: true,
        },
        {
          label: "Public Storefront",
          href: "/menu",
          icon: ExternalLink,
          external: true,
        },
      ],
    },
  ];

  const displayName =
    user?.customer?.name || user?.email?.split("@")[0] || "Operations Lead";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between bg-[#0e1611] text-stone-200 border-r border-[#1b2b20] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand & Store Header */}
      <div>
        <div className="p-4 border-b border-[#1b2b20] flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden group focus:outline-none"
            onClick={onCloseMobile}
          >
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-black text-base text-white tracking-tight truncate leading-tight group-hover:text-emerald-300 transition-colors">
                  Sable Admin
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Operations Console
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1a2b20] transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Live Cafe Operational Status */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-[#142219] border border-[#223628] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-stone-300">
                Store Live
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Peak Shift
            </span>
          </div>
        )}

        {/* Navigation Group Items */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-none">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  {grp.group}
                </p>
              )}
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950 font-bold"
                          : "text-stone-300 hover:text-white hover:bg-[#18281d]"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? "text-white scale-110"
                            : "text-stone-400 group-hover:text-emerald-400"
                        }`}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between overflow-hidden">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${
                                item.badgeColor || "bg-stone-700 text-stone-300"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.external && (
                            <ExternalLink className="w-3 h-3 text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff User Footer */}
      <div className="p-3 border-t border-[#1b2b20] bg-[#09100c]">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-2`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-tight">
                  {displayName}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Mode</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
