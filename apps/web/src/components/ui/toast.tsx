"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function showToast(
  type: ToastType,
  title: string,
  description?: string,
) {
  const id = Math.random().toString(36).substring(2, 9);
  const toast: ToastMessage = { id, type, title, description };
  for (const listener of toastListeners) {
    listener(toast);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handler);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-border shadow-forest"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-meadow shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-sm">
              <p className="font-bold text-forest leading-tight">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-sage mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-sage hover:text-forest p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
