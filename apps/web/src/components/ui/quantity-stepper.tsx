"use client";

import { Minus, Plus } from "lucide-react";

export interface QuantityStepperProps {
  quantity: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onChange?: (qty: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className = "",
}: QuantityStepperProps) {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  const handleDecrement = () => {
    if (onDecrement) onDecrement();
    else if (onChange) onChange(Math.max(min, quantity - 1));
  };

  const handleIncrement = () => {
    if (onIncrement) onIncrement();
    else if (onChange) onChange(Math.min(max, quantity + 1));
  };

  const sizeStyles = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-3 text-sm",
  };

  const btnSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
  };

  return (
    <div
      className={`inline-flex items-center justify-between rounded-full bg-cream-alt border border-border text-forest select-none ${sizeStyles[size]} ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDecrement();
        }}
        disabled={isMin}
        aria-label="Decrease quantity"
        className={`${btnSizes[size]} rounded-full flex items-center justify-center text-sage hover:text-forest hover:bg-white/80 active:scale-90 transition-all disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span aria-live="polite" className="font-bold px-3 text-center min-w-6">
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleIncrement();
        }}
        disabled={isMax}
        aria-label="Increase quantity"
        className={`${btnSizes[size]} rounded-full flex items-center justify-center text-white bg-meadow hover:bg-meadow-alt active:bg-meadow-dark transition-all disabled:opacity-40 shadow-forest cursor-pointer`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
