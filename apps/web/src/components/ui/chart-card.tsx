"use client";

import React, { useState } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  periods = ["Hourly", "Daily", "Weekly"],
  activePeriod = "Daily",
  onPeriodChange,
  action,
  children,
}: ChartCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);

  const handlePeriodClick = (p: string) => {
    setSelectedPeriod(p);
    if (onPeriodChange) onPeriodChange(p);
  };

  return (
    <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold font-display text-forest dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-sage dark:text-stone-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {action}
          {periods.length > 0 && (
            <div className="flex items-center p-0.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodClick(p)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedPeriod === p
                      ? "bg-white dark:bg-[#1b2820] text-forest dark:text-white shadow-2xs"
                      : "text-sage hover:text-forest dark:hover:text-stone-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
