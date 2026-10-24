"use client";

import { useAuth } from "@/context/auth-context";
import { realtimeBus } from "@/lib/realtime-bus";
import {
  ChevronRight,
  Command,
  HelpCircle,
  LogOut,
  Menu,
  Radio,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DateRangePicker } from "./date-range-picker";
import { NotificationCenter } from "./notification-center";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onToggleMobileSidebar: () => void;
}

export function Topbar({
  onOpenCommandPalette,
  onOpenShortcuts,
  onToggleMobileSidebar,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = realtimeBus.onConnectionChange(setIsConnected);
    return unsub;
  }, []);

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/80 dark:border-[#283a2d] bg-white/85 dark:bg-[#121a14]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-border dark:border-[#283a2d] text-forest dark:text-stone-300 hover:bg-stone-50"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-sage dark:text-stone-400 hover:text-forest dark:hover:text-white transition-colors font-medium"
          >
            Dashboard
          </Link>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.href}>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
              {i === breadcrumbs.length - 1 ? (
                <span className="font-bold text-forest dark:text-white truncate">
                  {b.label}
                </span>
              ) : (
                <Link
                  href={b.href}
                  className="text-sage dark:text-stone-400 hover:text-forest dark:hover:text-white transition-colors font-medium truncate"
                >
                  {b.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50/70 dark:bg-[#1b2820] text-xs text-sage hover:border-meadow/50 dark:hover:border-meadow/50 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-sage" />
            <span>Search orders, items, patrons, actions...</span>
          </span>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-[#141f18] border border-border dark:border-[#283a2d] text-stone-500 shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Live status, Date Picker, Shortcuts, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Live SSE / WebSocket connection status */}
        <div
          title={isConnected ? "Real-time sync active (SSE)" : "Reconnecting to live event feed..."}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 dark:border-[#283a2d] bg-stone-50/50 dark:bg-[#141f18] text-[11px] font-medium text-sage select-none"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-meadow animate-pulse" : "bg-rose-500 animate-ping"
            }`}
          />
          <span className="text-[10px] font-mono uppercase tracking-wider">
            {isConnected ? "LIVE" : "SYNC"}
          </span>
        </div>

        {/* Date Range Picker */}
        <div className="hidden lg:block">
          <DateRangePicker />
        </div>

        {/* Keyboard shortcut help button */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (?)"
          className="p-2 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#141f18] text-forest dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1e2e23] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-sage" />
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#141f18] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-forest text-meadow dark:bg-meadow dark:text-forest flex items-center justify-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="text-xs font-bold text-forest dark:text-white hidden sm:inline max-w-[100px] truncate">
              {user?.email?.split("@")[0] || "Admin"}
            </span>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] shadow-2xl z-50 p-2 text-xs divide-y divide-border/50 dark:divide-[#283a2d] animate-in fade-in duration-150">
                <div className="p-2">
                  <p className="font-bold text-forest dark:text-white truncate">
                    {user?.email || "admin@sablecafe.com"}
                  </p>
                  <p className="text-[10px] text-sage mt-0.5 uppercase tracking-wider font-semibold">
                    Role: {user?.roles?.[0] || "ADMINISTRATOR"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#141f18]"
                  >
                    <User className="w-3.5 h-3.5 text-sage" />
                    <span>Profile & Settings</span>
                  </Link>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
