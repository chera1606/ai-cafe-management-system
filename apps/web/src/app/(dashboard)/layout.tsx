"use client";

import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Coffee, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function DashboardProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // If loading, show clean non-blocking loading shimmer
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#121a14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-forest dark:bg-meadow text-meadow dark:text-forest flex items-center justify-center animate-pulse shadow-md">
            <Coffee className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-sage">Connecting to Sable Cafe Back-Office...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, prompt to sign in
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#121a14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-display text-forest dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-sage dark:text-stone-300 leading-relaxed">
            Please sign in with your staff or administrator credentials to access the management dashboard.
          </p>
          <div className="pt-2">
            <Link href="/login?redirect=/dashboard" className="block">
              <Button variant="primary" size="md" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check role: customers cannot view internal staff back-office
  const roles = user?.roles?.map((r) => r.toUpperCase()) || ["ADMINISTRATOR"];
  const isInternalStaff = roles.some((r) =>
    ["OWNER", "MANAGER", "CASHIER", "BARISTA", "KITCHEN_STAFF", "WAITER", "ADMINISTRATOR", "ADMIN"].includes(r)
  );

  if (!isInternalStaff) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#121a14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-display text-forest dark:text-white">
            403 — Restricted Area
          </h2>
          <p className="text-xs text-sage dark:text-stone-300 leading-relaxed">
            Your account ({user?.email}) does not possess staff or administrative authorization for the back-office.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/menu">
              <Button variant="secondary" size="md">
                Return to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
