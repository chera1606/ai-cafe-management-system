"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

function MagicLinkVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyMagicLink } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Magic link token is missing.");
      return;
    }

    let isMounted = true;
    verifyMagicLink(token)
      .then(() => {
        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setStatus("error");
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "This magic link has expired or has already been used.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyMagicLink, router]);

  if (status === "loading") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="relative inline-block">
          <Loader2 className="w-10 h-10 text-amber-700 animate-spin mx-auto" />
          <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Signing You In...
        </h3>
        <p className="text-xs text-stone-500">
          Validating your single-use magic login link.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
          Signed In Successfully!
        </h3>
        <p className="text-xs text-stone-500">
          Welcome back to AI Cafe. Redirecting you now...
        </p>
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
          Invalid Magic Link
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">{errorMsg}</p>
      </div>
      <div className="pt-2">
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <AuthLayout
      title="Magic Link Sign In"
      subtitle="Passwordless authentication for AI Cafe"
    >
      <Suspense fallback={<div className="text-center text-xs text-stone-400 py-6">Validating magic link...</div>}>
        <MagicLinkVerifyContent />
      </Suspense>
    </AuthLayout>
  );
}
