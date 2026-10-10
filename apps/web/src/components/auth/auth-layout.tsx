import { type ReactNode } from "react";
import Link from "next/link";
import { Coffee, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-stone-50 dark:bg-stone-950 p-4 sm:p-6 lg:p-8 relative selection:bg-amber-500/20 selection:text-amber-900">
      {/* Decorative ambient cafe gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-stone-500/10 rounded-full blur-3xl" />
      </div>

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
