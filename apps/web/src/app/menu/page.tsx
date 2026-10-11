import { Coffee, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { CustomerMenuView } from "@/features/menu/components/customer-menu-view";

export const metadata: Metadata = {
  title: "Artisan Menu & Offerings | AI Cafe",
  description:
    "Explore our artisan coffee selections, iced specialties, fresh pastries, and breakfast menu.",
};

export default function MenuPage() {
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
                Artisan Catalog
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <LinkButton href="/" variant="ghost" size="sm" className="text-xs">
              Home
            </LinkButton>
            <LinkButton
              href="/admin/menu"
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              Manage Menu
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Main Catalog View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <CustomerMenuView />
      </main>
    </div>
  );
}
