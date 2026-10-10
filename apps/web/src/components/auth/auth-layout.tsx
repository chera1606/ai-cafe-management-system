import { Coffee, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-stone-50 dark:bg-stone-950 p-4 sm:p-6 lg:p-8 relative selection:bg-amber-500/20 selection:text-amber-900">
      {/* High-performance ambient cafe glow (zero GPU blur overhead) */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgba(245, 158, 11, 0.08) 0px, transparent 50%), radial-gradient(at 100% 50%, rgba(234, 88, 12, 0.08) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(120, 113, 108, 0.08) 0px, transparent 50%)",
        }}
      />

      {/* Main card wrapper */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-medium tracking-wide transition-transform hover:scale-105"
          >
            <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>AI Cafe System</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form container */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8">
          {children}
        </div>

        {/* Security footer notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-stone-400 dark:text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          <span>Encrypted with 256-bit SSL & TOTP 2FA protection</span>
        </div>
      </div>
    </div>
  );
}
