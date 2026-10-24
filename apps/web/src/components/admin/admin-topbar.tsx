"use client";

import {
  Bell,
  Boxes,
  ChefHat,
  Coffee,
  ExternalLink,
  Menu,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function AdminTopbar({
  onOpenMobileSidebar,
  title,
  subtitle,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  // Generate dynamic breadcrumb segments based on route
  const getBreadcrumbs = () => {
    if (pathname === "/admin") {
      return [{ label: "Operations Dashboard", href: "/admin", current: true }];
    }
    if (pathname.startsWith("/admin/orders")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Live Orders Management",
          href: "/admin/orders",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/analytics")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Sales & Financial Analytics",
          href: "/admin/analytics",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/inventory")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Inventory & Stock Engine",
          href: "/admin/inventory",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/procurement")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Procurement & Sourcing Hub",
          href: "/admin/procurement",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/menu")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Catalog & Recipe Formulations",
          href: "/admin/menu",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/staff")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Team & Staff Management",
          href: "/admin/staff",
          current: true,
        },
      ];
    }
    if (pathname.startsWith("/admin/settings")) {
      return [
        { label: "Dashboard", href: "/admin", current: false },
        {
          label: "Store Configuration",
          href: "/admin/settings",
          current: true,
        },
      ];
    }
    return [{ label: "Operations Dashboard", href: "/admin", current: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav
          className="flex items-center gap-2 text-xs font-semibold"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {idx > 0 && <span className="text-slate-300">/</span>}
              {crumb.current ? (
                <span className="text-slate-900 font-bold tracking-tight">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Middle: Quick Search / Filter shortcut */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
        <div
          className={`relative w-full flex items-center rounded-xl border px-3 py-1.5 transition-all ${
            searchFocused
              ? "border-emerald-500 bg-white shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-slate-100 hover:border-slate-300"
          }`}
        >
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Quick search (menu, SKU, order)..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Quick Action Buttons & Store Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launch Buttons */}
        <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-200 pr-3 mr-1">
          <Link
            href="/pos"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title="Open Cashier POS"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">POS Terminal</span>
          </Link>
          <Link
            href="/kitchen"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title="Launch Kitchen Display"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xl:inline">Kitchen KDS</span>
          </Link>
        </div>

        {/* View Customer Storefront */}
        <Link
          href="/menu"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Coffee className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Storefront</span>
          <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
        </Link>

        {/* Critical Alerts Bell */}
        <Link
          href="/admin/inventory"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Critical Low Stock Warnings"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </Link>
      </div>
    </header>
  );
}
