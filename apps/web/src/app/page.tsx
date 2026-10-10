"use client";

import {
  ArrowRight,
  CheckCircle,
  Coffee,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Top Navigation */}
      <header className="border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50">
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
                Management System
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/settings/security">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Security
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    {(user.customer?.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </div>
                  <span>{user.customer?.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-stone-500 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-xs">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        {isAuthenticated && user ? (
          /* AUTHENTICATED USER DASHBOARD TEASER */
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-900 to-stone-900 text-white shadow-xl shadow-amber-950/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                    Authenticated Session Active
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Welcome back, {user.customer?.name || user.email}!
                  </h1>
                </div>
                <div className="flex gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm"
                    >
                      {role.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-stone-300 max-w-2xl">
                Your account is verified and protected with modern JWT token
                rotation and TOTP two-factor security.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/settings/security">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs font-semibold bg-white hover:bg-stone-100 text-stone-900"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                    Manage 2FA & Active Devices
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats & Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  Menu & Ordering
                </h3>
                <p className="text-xs text-stone-500">
                  Explore fresh coffees, pastries, and smart orders coming soon
                  in the next update.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Security Status
                </h3>
                <p className="text-xs text-stone-500">
                  Email verification complete. Review your connected devices
                  anytime.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  AI Assistant
                </h3>
                <p className="text-xs text-stone-500">
                  Intelligent recommendations and cafe management tools ready to
                  activate.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* GUEST HERO SECTION */
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Next-Generation Cafe Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
              Intelligent Cafe Operations,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600">
                Simplified.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Order seamlessly, streamline kitchen workflows, monitor real-time
              inventory, and secure operations with enterprise-grade
              authentication.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="shadow-lg shadow-amber-700/20">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In to Account
                </Button>
              </Link>
            </div>

            {/* Feature Checklist */}
            <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  2FA Authenticator Setup
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Passwordless Magic Links
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Google OAuth2 Integration
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Multi-device Session Revocation
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
