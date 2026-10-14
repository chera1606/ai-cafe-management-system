"use client";

import {
  ArrowLeft,
  Coffee,
  Flame,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-cream dark:bg-stone-950 p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-meadow-tint selection:text-forest-2">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-meadow-tint rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div
        className="absolute bottom-0 -right-40 w-96 h-96 bg-amber/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"
        style={{ animationDelay: "4s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(var(--meadow)_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* Top Navigation Back Link */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 text-xs font-bold text-forest-2 dark:text-stone-200 shadow-sm hover:bg-white dark:hover:bg-stone-800 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/menu"
          className="text-xs font-bold text-meadow hover:underline hidden sm:inline-flex items-center gap-1"
        >
          Explore Menu
        </Link>
      </div>

      {/* Main Showcase Split Card */}
      <div className="w-full max-w-5xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden grid lg:grid-cols-12 z-10">
        {/* Left Side: Cinematic Roastery Showcase (Hidden on small mobile, visible on lg) */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 bg-forest-2 text-white overflow-hidden">
          {/* Animated Ken Burns Background Photo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80"
              alt="Ethiopian Buna Ceremony Roastery"
              fill
              className="object-cover opacity-30 animate-ken-burns filter blur-[0.5px]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-2 via-forest-2/80 to-transparent" />
          </div>

          {/* Floating Steam Particles */}
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-amber/20 rounded-full blur-2xl animate-steam pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Sable Artisan Roastery &amp; Kitchen</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white leading-snug">
              Authentic Taste. <br />
              <span className="text-meadow">Intelligent Hospitality.</span>
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed max-w-xs">
              Direct-trade Yirgacheffe beans, slow-simmered culinary stews, and
              real-time orders powered by AI table intelligence.
            </p>
          </div>

          {/* Bottom Floating Testimonial Card */}
          <div className="relative z-10 space-y-4 pt-10">
            {/* Live Floating Badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2 animate-float-slow">
              <div className="flex items-center gap-1 text-amber">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 fill-amber" />
                ))}
                <span className="text-xs font-bold text-white ml-1.5">
                  5.0 / 5.0
                </span>
              </div>
              <p className="text-xs text-stone-200 italic leading-relaxed">
                &ldquo;The Jebena Buna and Doro Wot here represent the highest
                expression of Ethiopian hospitality.&rdquo;
              </p>
              <div className="text-[11px] font-bold text-emerald-300">
                — Master Barista &amp; Coffee Sommelier
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-300 font-medium">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber" /> Claypot Heated
              </span>
              <span>•</span>
              <span>100% Pure Teff</span>
              <span>•</span>
              <span>Sidama Beans</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meadow-tint dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-forest-2 dark:text-emerald-200 text-xs font-bold">
                <Coffee className="w-4 h-4 text-meadow" />
                <span>AI Cafe Experience</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-forest-2 dark:text-stone-100">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-sage dark:text-stone-400">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Slot */}
            <div className="pt-2">{children}</div>

            {/* Security Footer Notice */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-2 text-[11px] text-sage dark:text-stone-400">
              <ShieldCheck className="w-4 h-4 text-meadow" />
              <span>End-to-End SSL Encryption &amp; Argon2 Hashing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
