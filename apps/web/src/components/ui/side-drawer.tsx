"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = "max-w-xl",
}: SideDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={`w-screen ${widthClass} bg-white dark:bg-[#1b2820] border-l border-border dark:border-[#283a2d] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250`}
        >
          {/* Header */}
          <div className="p-6 border-b border-border dark:border-[#283a2d] flex items-start justify-between gap-4 bg-stone-50/60 dark:bg-[#141f18]">
            <div>
              <h2 className="text-lg font-bold font-display text-forest dark:text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-sage dark:text-stone-400 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {/* Optional Footer */}
          {footer && (
            <div className="p-4 border-t border-border dark:border-[#283a2d] bg-stone-50/60 dark:bg-[#141f18]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
