"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface KdsSlaTimerProps {
  createdAt: string;
  completedAt?: string | null;
  status: string;
  className?: string;
}

export function KdsSlaTimer({
  createdAt,
  completedAt,
  status,
  className,
}: KdsSlaTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const start = new Date(createdAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 1000));
  });

  useEffect(() => {
    if (status === "COMPLETED" || status === "CANCELLED") return;

    const timer = setInterval(() => {
      const start = new Date(createdAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, status]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // SLA Color thresholds
  const isOverdue = minutes >= 15;
  const isWarning = minutes >= 8 && minutes < 15;
  const isNormal = minutes < 8;

  if (status === "COMPLETED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium text-muted-foreground bg-muted/60",
          className,
        )}
      >
        <Clock className="w-3 h-3" />
        {timeFormatted} total
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors",
        isNormal &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        isWarning &&
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
        isOverdue &&
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/40 animate-pulse",
        className,
      )}
      title={`Received: ${new Date(createdAt).toLocaleTimeString()}`}
    >
      <Clock
        className={cn("w-3.5 h-3.5", isOverdue && "animate-spin text-rose-500")}
        style={{ animationDuration: isOverdue ? "6s" : undefined }}
      />
      <span>{timeFormatted}</span>
      {isOverdue && (
        <span className="uppercase text-[10px] tracking-wider ml-0.5 font-sans font-extrabold">
          RUSH
        </span>
      )}
    </span>
  );
}
