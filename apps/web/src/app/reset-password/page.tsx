"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Invalid or Missing Token
        </h3>
        <p className="text-xs text-stone-500">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Password Updated Successfully
        </h3>
        <p className="text-xs text-stone-500">
          Your password has been reset. All previous sessions have been signed out. Redirecting to sign in...
        </p>
        <Link href="/login">
          <Button className="w-full">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="New Password"
        type={showPassword ? "text" : "password"}
        placeholder="At least 8 characters"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={8}
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

      <Input
        label="Confirm New Password"
        type={showPassword ? "text" : "password"}
        placeholder="Repeat new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
        leftIcon={<Lock className="w-4 h-4" />}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter a strong new password for your account"
    >
      <Suspense fallback={<div className="text-center text-xs text-stone-400 py-6">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
