"use client";

import React from "react";
import { formatETB } from "@/lib/formatters";

interface StatGaugeProps {
  label: string;
  current: number;
  max: number;
  formatAsCurrency?: boolean;
  unit?: string;
  dangerThresholdPercent?: number;
}

export function StatGauge({
  label,
  current,
  max,
  formatAsCurrency = false,
  unit = "",
  dangerThresholdPercent = 85,
}: StatGaugeProps) {
  const percent = Math.min(100, Math.max(0, Math.round((current / (max || 1)) * 100)));
  const isDanger = percent >= dangerThresholdPercent;
  const isWarning = percent >= 70 && !isDanger;

  const barColor = isDanger
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-meadow";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-sage dark:text-stone-400">{label}</span>
        <span className="font-bold text-forest dark:text-white tabular-nums">
          {formatAsCurrency ? formatETB(current) : `${current} ${unit}`} /{" "}
          {formatAsCurrency ? formatETB(max) : `${max} ${unit}`} ({percent}%)
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
