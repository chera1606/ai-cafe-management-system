import { type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />,
  };

  const variants = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200",
    error: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-200",
    warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200",
    info: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-200",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-3.5 rounded-lg border text-sm",
        variants[variant],
        className,
      )}
    >
      {icons[variant]}
      <div className="space-y-0.5">
        {title && <h5 className="font-medium text-xs uppercase tracking-wider">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
