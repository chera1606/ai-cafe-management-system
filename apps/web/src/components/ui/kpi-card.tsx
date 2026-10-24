"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React, { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: number;
  formatAs?: "currency" | "number" | "raw";
  delta?: number; // e.g. +14.2% or -3.1%
  deltaLabel?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  subtitle?: string;
  statusColor?: "meadow" | "amber" | "rose" | "blue";
}

export function KpiCard({
  title,
  value,
  formatAs = "number",
  delta,
  deltaLabel = "vs last period",
  sparklineData,
  icon,
  subtitle,
  statusColor = "meadow",
}: KpiCardProps) {
  // Animated count-up simulation
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  const formattedDisplay =
    formatAs === "currency"
      ? `ETB ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(displayValue)}`
      : new Intl.NumberFormat("en-US").format(displayValue);

  const isPositive = delta !== undefined && delta >= 0;

  // Mini sparkline SVG renderer
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return (
      <svg
        width={width}
        height={height}
        className="overflow-visible shrink-0 text-meadow opacity-85"
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-5 shadow-xs hover:shadow-forest transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sage dark:text-stone-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-stone-50 dark:bg-[#141f18] text-forest dark:text-stone-300 flex items-center justify-center border border-border/50 dark:border-[#283a2d]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-black font-display text-forest dark:text-white tabular-nums tracking-tight">
          {formattedDisplay}
        </div>
        {renderSparkline()}
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md ${
              isPositive
                ? "text-[#2e7d32] bg-[rgba(72,168,83,0.12)] dark:text-[#66bb6a] dark:bg-[rgba(72,168,83,0.2)]"
                : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-[11px] text-sage dark:text-stone-400 truncate">
          {subtitle || deltaLabel}
        </span>
      </div>
    </div>
  );
}
