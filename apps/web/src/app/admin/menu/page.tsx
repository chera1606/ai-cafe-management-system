"use client";

import { Coffee, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { AdminMenuView } from "@/features/menu/components/admin-menu-view";

export default function AdminMenuPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin" />
          <p className="text-xs text-stone-500 font-medium">
            Verifying manager credentials...
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrManager =
    isAuthenticated &&
    user?.roles?.some((role) =>
      ["admin", "manager", "ADMIN", "MANAGER"].includes(role),
    );

  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-stone-950 text-center">
        <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mb-4 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
          Management Access Restricted
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mb-6 leading-relaxed">
          The Menu and Recipe configuration manager is restricted to Admin and
          Manager staff members. Please sign in with an authorized operational
          account.
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/menu" variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-1.5" />
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
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Top Navigation */}
      <header className="border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-700 text-white shadow-sm shadow-amber-700/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100">
                AI Cafe
              </span>
              <span className="hidden sm:inline-block text-[11px] text-amber-700 dark:text-amber-400 font-medium ml-2 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60">
                Operations
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <LinkButton
              href="/menu"
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Coffee className="w-3.5 h-3.5 mr-1 text-amber-600" />
              View Customer Menu
            </LinkButton>
            <LinkButton href="/" variant="ghost" size="sm" className="text-xs">
              Dashboard
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AdminMenuView />
      </main>
    </div>
  );
}
