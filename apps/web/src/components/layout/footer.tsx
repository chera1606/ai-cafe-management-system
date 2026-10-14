"use client";

import {
  ArrowRight,
  Clock,
  Coffee,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { showToast } from "@/components/ui/toast";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast(
      "success",
      "Subscribed to Sable Journal",
      "You will receive monthly roastery notes & private tasting invites.",
    );
    setNewsletterEmail("");
  };

  return (
    <footer className="relative bg-gradient-to-br from-forest to-forest-2 text-cream overflow-hidden">
      {/* Subtle Leaf Decorative Background Pattern Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(var(--meadow)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand Blurb (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-meadow flex items-center justify-center text-white shadow-forest">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-3xl font-black tracking-tight text-white">
                Sable
              </span>
            </Link>

            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              Artisan Ethiopian roastery and highland kitchen celebrating
              ceremonial Jebena rituals, organic slow-simmered culinary
              classics, and seamless AI hospitality.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-meadow flex items-center justify-center text-white transition-colors"
              >
                <svg
                  role="img"
                  aria-label="Instagram"
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <title>Instagram</title>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-meadow flex items-center justify-center text-white transition-colors"
              >
                <svg
                  role="img"
                  aria-label="Facebook"
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <title>Facebook</title>
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a
                href="#twitter"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-meadow flex items-center justify-center text-white transition-colors"
              >
                <svg
                  role="img"
                  aria-label="Twitter"
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <title>Twitter</title>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-meadow">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-stone-300 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Roastery
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-white transition-colors"
                >
                  Artisanal Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/#why-us"
                  className="hover:text-white transition-colors"
                >
                  Why Sable
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Order Intelligence
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Guest Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Opening Hours & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-meadow">
              Hours &amp; Location
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    Mon – Fri: 6:30 AM – 9:00 PM
                  </p>
                  <p className="text-stone-400">
                    Sat – Sun: 7:30 AM – 10:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <p>
                  142 Bole Highline Boulevard,
                  <br />
                  Roastery Quarter, Addis Ababa
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-meadow shrink-0" />
                <p>+251 (11) 682-9011</p>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter Input (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-meadow">
              The Roaster's Dispatch
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Receive notifications when rare harvest micro-lots drop, plus $5
              credit on your first order.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl bg-white/10 border border-white/20 pl-4 pr-12 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-meadow focus:bg-white/15"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-xl bg-meadow hover:bg-meadow-alt active:bg-meadow-dark text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                Zero spam. Only fresh roast aromas and seasonal updates.
              </p>
            </form>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} Sable Artisan Cafe &amp; Roastery.
            All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <span className="flex items-center gap-1 text-meadow font-bold">
              <Sparkles className="w-3 h-3 text-amber" />
              AI-Powered Hospitality
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
