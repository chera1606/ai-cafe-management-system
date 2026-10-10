"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { API_BASE_URL } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login, complete2Fa, cancel2Fa, twoFactorPending, requestMagicLink } =
    useAuth();

  // Tab state: "password" | "magic-link"
  const [tab, setTab] = useState<"password" | "magic-link">("password");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle standard password login
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.requires2fa) {
        router.push("/");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 2FA submission
  const handle2FaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await complete2Fa(twoFactorCode.trim(), isRecoveryCode);
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid verification code";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle magic link request
  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await requestMagicLink(email);
      setSuccessMessage(res.message);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to request magic link";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth redirect
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // ─── 2FA CHALLENGE SCREEN ──────────────────────────────────────────────────
  if (twoFactorPending.isPending) {
    return (
      <AuthLayout
        title="Two-Factor Authentication"
        subtitle={
          isRecoveryCode
            ? "Enter one of your 8-character recovery codes"
            : "Enter the 6-digit code from your authenticator app"
        }
      >
        <form onSubmit={handle2FaSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-4">
            <Input
              label={isRecoveryCode ? "Recovery Code" : "Authenticator Code"}
              type="text"
              placeholder={isRecoveryCode ? "e.g. a1b2c3d4" : "000000"}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              required
              autoFocus
              maxLength={isRecoveryCode ? 16 : 6}
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <button
              type="button"
              onClick={() => {
                setIsRecoveryCode(!isRecoveryCode);
                setTwoFactorCode("");
                setError(null);
              }}
              className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400 font-medium hover:underline block"
            >
              {isRecoveryCode
                ? "← Use authenticator app instead"
                : "Lost access? Use a backup recovery code"}
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify & Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={cancel2Fa}
              className="w-full text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Cancel and back to login
            </Button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // ─── STANDARD LOGIN SCREEN ─────────────────────────────────────────────────
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your AI Cafe account">
      <div className="space-y-6">
        {/* Method selector tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("password");
              setError(null);
              setSuccessMessage(null);
            }}
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
            onClick={() => {
              setTab("magic-link");
              setError(null);
              setSuccessMessage(null);
            }}
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

        {error && <Alert variant="error">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {tab === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
        ) : (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              We&apos;ll email you an instant, secure login link. No password
              required.
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
              <Sparkles className="w-4 h-4 mr-1.5" />
              Send Magic Link
            </Button>
          </form>
        )}

        {/* Social / OAuth divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200 dark:border-stone-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-stone-900 px-2 text-stone-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full"
        >
          <svg
            role="img"
            aria-label="Google logo"
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
          >
            <title>Google</title>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </Button>

        {/* Footer sign up prompt */}
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
