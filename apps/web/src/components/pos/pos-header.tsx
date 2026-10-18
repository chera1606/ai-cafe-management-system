"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Coffee,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PosHeaderProps {
  cashierName?: string;
  onClearTicket: () => void;
  ticketItemCount: number;
}

export function PosHeader({
  cashierName = "Counter Register 1",
  onClearTicket,
  ticketItemCount,
}: PosHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <header className="h-16 border-b border-stone-800 bg-stone-900 text-stone-100 px-4 flex items-center justify-between gap-4 select-none shrink-0 shadow-md">
      {/* Left: Branding & Station Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-meadow flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          title="Return to Home"
        >
          <Coffee className="w-5 h-5 text-emerald-100" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-base tracking-tight text-white">
              Sable POS
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700">
              Terminal 1
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>{cashierName}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Station Clock */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-300 font-mono text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 text-stone-400" />
        <span>{currentTime}</span>
      </div>

      {/* Right: Operational Shortcuts & Kiosk Mode */}
      <div className="flex items-center gap-2">
        {/* Link to Kitchen Display System */}
        <Link href="/kitchen" target="_blank" rel="noopener noreferrer">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-stone-300 hover:text-white hover:bg-stone-800 gap-1.5"
            title="Open Kitchen Display System in new window"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Kitchen KDS</span>
          </Button>
        </Link>

        {/* Link to Past Orders */}
        <Link href="/orders" target="_blank" rel="noopener noreferrer">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-stone-300 hover:text-white hover:bg-stone-800 gap-1.5"
            title="View order history"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Orders</span>
          </Button>
        </Link>

        {/* Clear Ticket Button */}
        {ticketItemCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearTicket}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 gap-1"
            title="Void current ticket"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Void Ticket</span>
          </Button>
        )}

        {/* Fullscreen Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="border-stone-700 bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 px-2.5"
          title={isFullscreen ? "Exit kiosk fullscreen" : "Enter kiosk fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
