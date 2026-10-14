"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-forest tracking-wide"
          >
            {label}
            {props.required && <span className="text-amber ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-2xl transition-all shadow-forest">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sage">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-2xl bg-white border text-sm text-forest placeholder-sage/70 transition-all duration-200 outline-none ${
              leftIcon ? "pl-10" : "pl-4"
            } ${rightIcon ? "pr-10" : "pr-4"} py-3 ${
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                : "border-border hover:border-sage/50 focus:border-meadow focus:ring-4 focus:ring-meadow-tint"
            } ${disabled ? "bg-cream-alt text-sage/60 cursor-not-allowed" : ""} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-sage mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
