"use client";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process request";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Password reset instructions have been sent"
      >
        <div className="text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            If an account is registered with <strong>{email}</strong>, you will
            receive an email shortly with a secure password reset link (valid
            for 15 minutes).
          </p>

          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <p className="text-xs text-stone-500 dark:text-stone-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-amber-700 hover:text-amber-800 dark:text-amber-400 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Send Reset Link
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
