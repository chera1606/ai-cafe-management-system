"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/context/auth-context";
import {
  LoginForm,
  MagicLinkForm,
  SocialLogin,
  TwoFactorChallenge,
} from "@/features/auth";

export default function LoginPage() {
  const { twoFactorPending } = useAuth();
  const [tab, setTab] = useState<"password" | "magic-link">("password");

  if (twoFactorPending.isPending) {
    return (
      <AuthLayout
        title="Two-Factor Authentication"
        subtitle="Verify your identity with your authenticator device"
      >
        <TwoFactorChallenge />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your AI Cafe account">
      <div className="space-y-6">
        {/* Method selector tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`py-2 rounded-md transition-all ${
              tab === "password"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setTab("magic-link")}
            className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              tab === "magic-link"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            Magic Link
          </button>
        </div>

        {tab === "password" ? <LoginForm /> : <MagicLinkForm />}

        <SocialLogin />

        <p className="text-center text-xs text-stone-600 dark:text-stone-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
