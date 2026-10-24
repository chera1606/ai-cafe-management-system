"use client";

import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Package,
  RefreshCw,
  Truck,
  UserCheck,
  UserX,
} from "lucide-react";
import React from "react";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  variant,
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const norm = status.toUpperCase().replace(/\s+/g, "_");

  // Auto-detect variant and icon if not explicitly provided
  let determinedVariant: StatusVariant = variant || "neutral";
  let IconComponent = HelpCircle;

  switch (norm) {
    case "COMPLETED":
    case "PAID":
    case "READY":
    case "ACTIVE":
    case "RESOLVED":
    case "OK":
      determinedVariant = variant || "success";
      IconComponent = CheckCircle2;
      break;

    case "PREPARING":
    case "ACCEPTED":
    case "IN_PROGRESS":
      determinedVariant = variant || "warning";
      IconComponent = Flame;
      break;

    case "PENDING":
    case "NEW":
    case "UNPAID":
    case "OPEN":
    case "PARTIAL":
      determinedVariant = variant || "info";
      IconComponent = Clock;
      break;

    case "CANCELLED":
    case "REFUNDED":
    case "OUT":
    case "OVERDUE":
    case "SUSPENDED":
    case "URGENT":
    case "HIGH":
      determinedVariant = variant || "danger";
      IconComponent = norm === "CANCELLED" || norm === "REFUNDED" ? Ban : AlertCircle;
      break;

    case "LOW":
    case "EXPIRING":
    case "MEDIUM":
      determinedVariant = variant || "warning";
      IconComponent = AlertTriangle;
      break;

    case "DELIVERING":
      determinedVariant = variant || "info";
      IconComponent = Truck;
      break;

    default:
      determinedVariant = variant || "neutral";
      IconComponent = HelpCircle;
      break;
  }

  const variantStyles: Record<StatusVariant, string> = {
    success:
      "bg-[rgba(72,168,83,0.12)] text-[#2e7d32] border-[rgba(72,168,83,0.25)] dark:bg-[rgba(72,168,83,0.2)] dark:text-[#66bb6a]",
    warning:
      "bg-[rgba(245,158,11,0.12)] text-[#b45309] border-[rgba(245,158,11,0.25)] dark:bg-[rgba(245,158,11,0.2)] dark:text-[#fbbf24]",
    danger:
      "bg-[rgba(239,68,68,0.12)] text-[#b91c1c] border-[rgba(239,68,68,0.25)] dark:bg-[rgba(239,68,68,0.2)] dark:text-[#f87171]",
    info:
      "bg-[rgba(59,130,246,0.12)] text-[#1d4ed8] border-[rgba(59,130,246,0.25)] dark:bg-[rgba(59,130,246,0.2)] dark:text-[#60a5fa]",
    neutral:
      "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const formattedText = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full select-none ${variantStyles[determinedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <IconComponent className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} aria-hidden="true" />}
      <span>{formattedText}</span>
    </span>
  );
}
