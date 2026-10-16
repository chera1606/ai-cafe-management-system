"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  ChefHat,
  Coffee,
  Flame,
  LayoutGrid,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type KdsStation, type KdsWorkloadSummary } from "@/lib/kds-api";
import { kdsAudio } from "./kds-audio-chime";
import { cn } from "@/lib/utils";

interface KdsHeaderProps {
  station: KdsStation;
  onStationChange: (st: KdsStation) => void;
  metrics: KdsWorkloadSummary;
  isPolling: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
}

export function KdsHeader({
  station,
  onStationChange,
  metrics,
  isPolling,
  onRefresh,
  lastUpdated,
}: KdsHeaderProps) {
  const [isMuted, setIsMuted] = useState(kdsAudio.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleMute = () => {
    const next = kdsAudio.toggleMute();
    setIsMuted(next);
  };

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
    <header className="border-b bg-card text-card-foreground shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Station Tabs */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-tight">
                Kitchen Display System
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
                <span>•</span>
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Station Selector Tabs */}
          <div className="flex items-center p-1 bg-muted rounded-lg border border-border/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onStationChange("ALL")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all",
                station === "ALL"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Stations</span>
            </button>

            <button
              type="button"
              onClick={() => onStationChange("BARISTA")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all",
                station === "BARISTA"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>Barista</span>
            </button>

            <button
              type="button"
              onClick={() => onStationChange("KITCHEN")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all",
                station === "KITCHEN"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Kitchen</span>
            </button>
          </div>
        </div>

        {/* Right: Live Workload Metrics & Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Workload Chips */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-md bg-muted/70 border flex items-center gap-1.5">
              <span className="text-muted-foreground font-sans">Active:</span>
              <span className="font-bold text-foreground">
                {metrics.activeCount}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span className="font-sans">Prep:</span>
              <span className="font-bold">{metrics.preparingCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="font-sans">Ready:</span>
              <span className="font-bold">{metrics.readyCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-muted/70 border flex items-center gap-1.5" title="Average order prep time">
              <span className="text-muted-foreground font-sans">Avg:</span>
              <span className="font-bold text-foreground">
                {metrics.averagePrepTimeMinutes}m
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={isMuted ? "Unmute arrival chime" : "Mute arrival chime"}
              className="h-8 px-2.5 text-xs"
            >
              {isMuted ? (
                <>
                  <BellOff className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Muted
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 mr-1 text-primary" />
                  Sound On
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isPolling}
              title="Refresh queue"
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isPolling && "animate-spin")}
              />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle fullscreen (Kiosk/Wall Mount Mode)"
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
