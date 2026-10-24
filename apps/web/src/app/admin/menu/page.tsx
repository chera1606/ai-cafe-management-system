"use client";

import { Boxes, Coffee, Lock, ShieldAlert, Truck } from "lucide-react";
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminMenuView />
    </div>
  );
}
