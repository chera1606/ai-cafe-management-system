"use client";

import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import React, { useState } from "react";

export type DateRangePreset = "today" | "yesterday" | "7d" | "30d" | "this_month" | "custom";

interface DateRangePickerProps {
  currentPreset?: DateRangePreset;
  onPresetChange?: (preset: DateRangePreset) => void;
}

export function DateRangePicker({
  currentPreset = "today",
  onPresetChange,
}: DateRangePickerProps) {
  const [selected, setSelected] = useState<DateRangePreset>(currentPreset);
  const [isOpen, setIsOpen] = useState(false);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "this_month", label: "This Month" },
    { id: "custom", label: "Custom Range..." },
  ];

  const handleSelect = (preset: DateRangePreset) => {
    setSelected(preset);
    setIsOpen(false);
    if (onPresetChange) onPresetChange(preset);
  };

  const activeLabel = presets.find((p) => p.id === selected)?.label || "Today";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#141f18] text-xs font-semibold text-forest dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#1e2e23] transition-colors cursor-pointer"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-meadow" />
        <span>{activeLabel}</span>
        <ChevronDown className="w-3 h-3 text-sage" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] shadow-xl z-50 p-1 divide-y divide-border/40 dark:divide-[#283a2d]">
            <div className="py-1">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    selected === preset.id
                      ? "bg-meadow-tint text-meadow-dark dark:text-emerald-400 font-bold"
                      : "text-forest dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#141f18]"
                  }`}
                >
                  <span>{preset.label}</span>
                  {selected === preset.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-meadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
