"use client";

import { Boxes, Coffee, Lock, ShieldAlert } from "lucide-react";
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
      ["admin", "administrator", "owner", "manager", "operations"].includes(
        role.toLowerCase(),
      ),
    );

  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-forest text-center">
        <div className="p-4 rounded-3xl bg-meadow-tint text-meadow-dark mb-4 shadow-sm border border-meadow/20">
          <ShieldAlert className="w-10 h-10 text-meadow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest mb-2">
          Management Access Restricted
        </h1>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed">
          The Menu and Recipe configuration manager is restricted to Admin and
          Manager staff members. Please sign in with an authorized operational
          account.
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
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      {/* Top Navigation */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-2xl bg-meadow text-white shadow-md shadow-forest group-hover:bg-meadow-alt transition-colors">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-forest">
                  Sable Artisan Cafe
                </span>
                <span className="hidden sm:inline-block text-[11px] text-meadow-dark font-semibold px-2 py-0.5 rounded-full bg-meadow-tint border border-meadow/30">
                  Operations Console
                </span>
              </div>
              <p className="text-[11px] text-sage hidden sm:block">
                Catalog & Formulation Control
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LinkButton
              href="/admin/inventory"
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Boxes className="w-3.5 h-3.5 mr-1 text-meadow" />
              Inventory Stock
            </LinkButton>
            <LinkButton
              href="/menu"
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Coffee className="w-3.5 h-3.5 mr-1 text-meadow" />
              View Customer Menu
            </LinkButton>
            <LinkButton href="/" variant="ghost" size="sm" className="text-xs">
              Home
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
