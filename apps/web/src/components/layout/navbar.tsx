"use client";

import { motion } from "framer-motion";
import { Coffee, Menu as MenuIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { NavAuthActions } from "./nav-auth-actions";

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll for glass navbar effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Kitchen KDS", href: "/kitchen" },
    { label: "About", href: "/#why-us" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "glass-navbar py-3 shadow-forest" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 focus:outline-none"
              aria-label="Sable Cafe Home"
            >
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-meadow to-forest-2 flex items-center justify-center text-white shadow-forest group-hover:scale-105 transition-transform duration-200">
                <Coffee className="w-5 h-5 text-emerald-100" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber border-2 border-white flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white" />
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-serif text-2xl font-black tracking-tight text-forest leading-none group-hover:text-meadow-dark transition-colors">
                  Sable
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-sage mt-0.5">
                  Artisan &bull; Roastery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href.startsWith("/#") && pathname === "/");

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative text-sm font-bold tracking-wide transition-colors py-1 text-forest hover:text-meadow-dark"
                  >
                    <span>{link.label}</span>
                    {isActive && pathname === link.href && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-meadow rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Cart Icon with Live Count Badge (Amber) */}
              <button
                type="button"
                data-cart-button="true"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-white/80 hover:bg-white text-forest hover:text-meadow-dark border border-border shadow-forest transition-all hover:scale-105 cursor-pointer"
                aria-label={`Open shopping cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber text-white text-[11px] font-black flex items-center justify-center shadow-xs"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {/* Desktop Auth Actions */}
              <NavAuthActions
                user={user}
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                className="hidden sm:flex"
              />

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-forest hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Open menu navigation"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        navLinks={navLinks}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
    </>
  );
}
