"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>(
    "Verifying your email address...",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the link.");
      return;
    }

    let isMounted = true;
    verifyEmail(token)
      .then((res) => {
        if (isMounted) {
          setStatus("success");
          setMessage(
            res.message || "Your email address has been successfully verified.",
          );
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setStatus("error");
          setMessage(
            err instanceof Error
              ? err.message
              : "Invalid or expired verification token.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  if (status === "loading") {
    return (
      <div className="text-center py-6 space-y-4">
        <Loader2 className="w-10 h-10 text-amber-700 animate-spin mx-auto" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Verifying Email...
        </h3>
        <p className="text-xs text-stone-500">
          Please wait while we confirm your email address.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 space-y-5">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Email Verified Successfully!
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">{message}</p>
        </div>
        <div className="pt-2">
          <LinkButton href="/login" className="w-full">
            Proceed to Sign In
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
          Verification Failed
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">{message}</p>
      </div>
      <div className="pt-2 space-y-2">
        <LinkButton href="/login" variant="outline" className="w-full">
          Back to Sign In
        </LinkButton>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Activating your AI Cafe account"
    >
      <Suspense
        fallback={
          <div className="text-center text-xs text-stone-400 py-6">
            Loading verification...
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
