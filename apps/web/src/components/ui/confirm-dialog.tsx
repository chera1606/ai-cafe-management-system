"use client";

import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  requireReason?: boolean;
  reasonPlaceholder?: string;
  minReasonLength?: number;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  variant = "danger",
  requireReason = false,
  reasonPlaceholder = "Please provide an audit justification...",
  minReasonLength = 5,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const isReasonValid = !requireReason || reason.trim().length >= minReasonLength;

  const handleConfirm = async () => {
    if (requireReason && !isReasonValid) {
      setTouched(true);
      return;
    }
    await onConfirm(requireReason ? reason.trim() : undefined);
    setReason("");
    setTouched(false);
  };

  const variantBtnClasses = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    primary: "bg-meadow hover:bg-meadow-alt text-white",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header icon + title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === "danger"
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-forest dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-sage dark:text-stone-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Reason Input */}
        {requireReason && (
          <div className="mt-4 pt-3 border-t border-border dark:border-[#283a2d]">
            <label className="block text-xs font-semibold text-forest dark:text-stone-200 mb-1.5">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setTouched(true);
              }}
              rows={3}
              placeholder={reasonPlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] text-forest dark:text-white focus:outline-none focus:ring-2 focus:ring-meadow resize-none"
            />
            {touched && !isReasonValid && (
              <p className="text-[11px] text-rose-500 mt-1">
                Please enter at least {minReasonLength} characters for the immutable audit trail.
              </p>
            )}
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
              Required by SRS Financial Audit Standard (BR-009). This reason is logged permanently.
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            {cancelLabel}
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !isReasonValid)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantBtnClasses[variant]}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
