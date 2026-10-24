"use client";

import { Command, HelpCircle, X } from "lucide-react";
import React from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: "Navigation",
      shortcuts: [
        { key: "g d", desc: "Go to Overview Dashboard" },
        { key: "g o", desc: "Go to Orders list" },
        { key: "g k", desc: "Go to Kitchen Display (KDS)" },
        { key: "g p", desc: "Go to POS Terminal" },
        { key: "g i", desc: "Go to Inventory" },
      ],
    },
    {
      group: "Actions & Search",
      shortcuts: [
        { key: "⌘ K / Ctrl+K", desc: "Open Command Palette & Global Search" },
        { key: "/", desc: "Focus primary search input" },
        { key: "n", desc: "Create new order shortcut" },
        { key: "?", desc: "Open this keyboard shortcuts help" },
        { key: "Esc", desc: "Close drawer, dialog, or modal" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-border dark:border-[#283a2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-meadow-tint text-meadow-dark dark:text-emerald-400 flex items-center justify-center">
              <Command className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-forest dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {shortcutGroups.map((g) => (
            <div key={g.group} className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-sage dark:text-stone-400 uppercase tracking-wider">
                {g.group}
              </h4>
              <div className="divide-y divide-border/50 dark:divide-[#283a2d]">
                {g.shortcuts.map((s) => (
                  <div key={s.key} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-forest dark:text-stone-200">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-mono text-[11px] font-bold">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border dark:border-[#283a2d] text-center text-[11px] text-sage">
          Press <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border font-mono">?</kbd> anywhere to toggle this cheat-sheet.
        </div>
      </div>
    </div>
  );
}
