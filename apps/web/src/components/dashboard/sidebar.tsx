"use client";

import { useAuth } from "@/context/auth-context";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CreditCard,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ThemeToggle } from "../ui/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "meadow" | "amber" | "rose";
  roles?: string[]; // If undefined, accessible to all
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        label: "Orders",
        href: "/orders",
        icon: ShoppingBag,
        badge: 6,
        badgeVariant: "meadow",
      },
      {
        label: "Kitchen KDS",
        href: "/kitchen",
        icon: Flame,
        badge: 4,
        badgeVariant: "amber",
        roles: ["OWNER", "MANAGER", "KITCHEN_STAFF", "BARISTA", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Fast POS",
        href: "/pos",
        icon: Receipt,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "ADMINISTRATOR", "ADMIN"],
      },
    ],
  },
  {
    group: "Catalog & Supply",
    items: [
      {
        label: "Menu & BOM",
        href: "/menu-admin",
        icon: Coffee,
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Package,
        badge: 3,
        badgeVariant: "amber",
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
    ],
  },
  {
    group: "Patrons & Credit",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["OWNER", "MANAGER", "CASHIER", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Credit Accounts",
        href: "/credit",
        icon: CreditCard,
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Complaints",
        href: "/complaints",
        icon: AlertCircle,
        badge: 1,
        badgeVariant: "rose",
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
    ],
  },
  {
    group: "People & Reports",
    items: [
      {
        label: "Staff Directory",
        href: "/staff",
        icon: Users,
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Reports & Sales",
        href: "/reports",
        icon: FileText,
        roles: ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"],
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        label: "Audit Log",
        href: "/audit",
        icon: Shield,
        roles: ["OWNER", "ADMINISTRATOR", "ADMIN"],
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["OWNER", "ADMINISTRATOR", "ADMIN"],
      },
    ],
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cafe_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("cafe_sidebar_collapsed", String(next));
  };

  const userRoles = user?.roles?.map((r) => r.toUpperCase()) || ["ADMINISTRATOR"];

  // Filter items by role
  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.some((r) => userRoles.includes(r));
  };

  const badgeColors = {
    meadow: "bg-meadow text-white",
    amber: "bg-amber text-white",
    rose: "bg-rose-500 text-white",
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-border/80 dark:border-[#283a2d]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-forest dark:bg-meadow flex items-center justify-center text-meadow dark:text-forest shrink-0 shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-display font-black text-sm tracking-tight text-forest dark:text-white block leading-tight">
                  Sable Cafe
                </span>
                <span className="text-[10px] font-bold text-meadow-dark dark:text-emerald-400 uppercase tracking-widest block">
                  Back-Office
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse to rail"}
            className="hidden lg:flex p-1.5 rounded-lg border border-border dark:border-[#283a2d] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isItemVisible);
            if (!visibleItems.length) return null;

            return (
              <div key={group.group} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-sage dark:text-stone-400">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        title={isCollapsed ? item.label : undefined}
                        className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-forest dark:bg-meadow text-white dark:text-forest shadow-xs font-bold"
                            : "text-forest dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#141f18]"
                        } ${isCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-meadow dark:text-forest" : "text-stone-400 dark:text-stone-400"}`} />
                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              badgeColors[item.badgeVariant || "meadow"]
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer: User profile, theme toggle, logout */}
      <div className="p-3 border-t border-border/80 dark:border-[#283a2d] bg-stone-50/50 dark:bg-[#141f18]">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-forest text-meadow dark:bg-meadow dark:text-forest flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-forest dark:text-white truncate">
                    {user?.email?.split("@")[0] || "Admin"}
                  </p>
                  <span className="text-[10px] font-semibold text-meadow-dark dark:text-emerald-400 uppercase tracking-wider block">
                    {user?.roles?.[0] || "ADMIN"}
                  </span>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              title="Sign out"
              className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (collapsible rail) */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#121a14] border-r border-border/80 dark:border-[#283a2d] transition-all duration-200 ${
          isCollapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-in Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#121a14] shadow-2xl border-r border-border dark:border-[#283a2d] animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
