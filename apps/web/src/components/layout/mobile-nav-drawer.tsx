"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, X } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

interface NavLinkItem {
  label: string;
  href: string;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  navLinks: NavLinkItem[];
  user: AuthUser | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  pathname,
  navLinks,
  user,
  isAuthenticated,
  onLogout,
}: MobileNavDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-4/5 max-w-sm h-full bg-cream p-6 pb-safe shadow-2xl flex flex-col justify-between z-10 overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-meadow flex items-center justify-center text-white">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-xl font-black text-forest">
                    Sable
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-sage hover:text-forest cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href.startsWith("/#") && pathname === "/");

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={onClose}
                      className={`text-base font-bold px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-meadow text-white shadow-forest"
                          : "text-forest hover:bg-stone-200/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions & Auth */}
            <div className="pt-6 border-t border-border space-y-4">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-white rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-meadow" />
                      <span className="text-sm font-bold text-forest">
                        {user.customer?.name || user.email}
                      </span>
                    </div>
                  </div>

                  {user.roles?.some((r) =>
                    ["ADMIN", "ADMINISTRATOR", "OWNER", "MANAGER"].includes(
                      r.toUpperCase(),
                    ),
                  ) && (
                    <LinkButton
                      href="/admin/menu"
                      variant="outline"
                      className="w-full border-meadow text-meadow-dark font-bold text-sm"
                      onClick={onClose}
                    >
                      <Coffee className="w-4 h-4 mr-2 text-meadow" />
                      Admin Management Panel
                    </LinkButton>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 text-center text-sm font-bold text-sage hover:text-forest cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <LinkButton
                    href="/login"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={onClose}
                  >
                    Log in
                  </LinkButton>
                  <LinkButton
                    href="/signup"
                    variant="primary"
                    className="w-full justify-center shadow-md"
                    onClick={onClose}
                  >
                    Sign up
                  </LinkButton>
                </div>
              )}

              {/* Operating Info */}
              <div className="text-[11px] text-sage text-center pt-2">
                Open Daily: 06:30 — 21:00 &bull; Addis Ababa Roastery
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
