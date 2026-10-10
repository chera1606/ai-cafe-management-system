"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { loginSchema } from "../schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (!res.requires2fa) {
        router.push("/");
      }
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
        }}
        error={fieldErrors.email}
        required
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-medium text-stone-700 dark:text-stone-300"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="login-password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={fieldErrors.password}
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-stone-700 dark:hover:text-stone-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
