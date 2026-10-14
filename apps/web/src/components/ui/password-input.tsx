"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input, type InputProps } from "./input";

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "rightIcon"> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        leftIcon={leftIcon || <Lock className="w-4 h-4 text-sage" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-sage hover:text-forest p-1 rounded-lg transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";
