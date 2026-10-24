"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FloatingBean,
  FloatingLeaf,
  SteamWisps,
} from "@/components/ui/floating-elements";
import { showToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone number is required")
    .refine(
      (val) => val.includes("@") || /^\+?[0-9\s-]{7,15}$/.test(val),
      "Please enter a valid email or phone number",
    ),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("redirect") || searchParams.get("next");

  const { login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true,
    },
  });

  const identifierValue = watch("identifier") || "";

  // Email typo suggestion
  const getTypoSuggestion = (email: string) => {
    const commonTypos: Record<string, string> = {
      "@gmai.com": "@gmail.com",
      "@gamil.com": "@gmail.com",
      "@gmial.com": "@gmail.com",
      "@yaho.com": "@yahoo.com",
      "@yahooo.com": "@yahoo.com",
      "@hotmial.com": "@hotmail.com",
      "@outlok.com": "@outlook.com",
    };
    for (const [typo, fix] of Object.entries(commonTypos)) {
      if (email.toLowerCase().endsWith(typo)) {
        return email.slice(0, -typo.length) + fix;
      }
    }
    return null;
  };

  const typoSuggestion = getTypoSuggestion(identifierValue);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer === null || lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const onSubmit = async (data: LoginFormData) => {
    if (lockoutTimer && lockoutTimer > 0) return;
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const { requires2fa, user } = await login(data.identifier, data.password);

      if (requires2fa) {
        showToast(
          "info",
          "2FA Required",
          "Please enter your authentication code.",
        );
        return;
      }

      setIsSuccess(true);
      showToast("success", "Welcome back!", "Signed in successfully.");

      // Role-based routing: Respect nextUrl if present, otherwise Admin -> /admin, Customer -> /menu
      const roles = user?.roles?.map((r) => r.toUpperCase()) || [];
      const isAdmin = roles.some((r) =>
        ["ADMIN", "ADMINISTRATOR", "OWNER", "MANAGER"].includes(r),
      );

      setTimeout(() => {
        if (nextUrl?.startsWith("/")) {
          router.push(nextUrl);
        } else if (isAdmin) {
          router.push("/dashboard");
        } else {
          router.push("/menu");
        }
      }, 700);
    } catch (err: unknown) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutTimer(272); // 4 min 32 sec
        setAuthError(
          "Too many failed attempts. Account temporarily locked for security.",
        );
      } else {
        setAuthError(
          err instanceof Error
            ? err.message
            : "Invalid credentials. Please verify your email/phone and password.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setValue("identifier", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setAuthError(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cream p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-5xl rounded-[36px] bg-white border border-border shadow-forest overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ========================================================
            LEFT SIDE: Immersive Brand Panel (Desktop only for fast mobile access)
           ======================================================== */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-forest via-forest-2 to-forest text-white p-8 sm:p-12 flex-col justify-between overflow-hidden">
          {/* Subtle Background Pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--meadow)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
          />

          {/* Floating Steam & Decorative Beans */}
          <SteamWisps className="top-1/4 left-1/2 -translate-x-1/2" />
          <FloatingBean size={32} delay={0.2} className="top-16 left-8" />
          <FloatingLeaf size={38} delay={1} className="bottom-20 right-8" />

          {/* Top Back Link & Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cafe</span>
            </Link>

            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-meadow">
              <Coffee className="w-5 h-5 text-emerald-300" />
            </div>
          </div>

          {/* Inspiring Brand Quote */}
          <div className="relative z-10 space-y-4 my-12">
            <Badge
              variant="meadow"
              icon={<Sparkles className="w-3 h-3 text-amber" />}
            >
              Specialty Buna Heritage
            </Badge>

            <blockquote className="font-serif text-2xl sm:text-3xl font-black text-white leading-snug">
              &ldquo;Coffee is not just a drink in the highlands; it is an hour
              of conversation and hospitality.&rdquo;
            </blockquote>

            <p className="text-xs text-stone-300 leading-relaxed max-w-xs">
              Sign in to manage your roast subscriptions, kitchen orders, and
              role-specific dashboards.
            </p>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center gap-3 text-xs text-stone-300">
            <ShieldCheck className="w-4 h-4 text-meadow" />
            <span>End-to-end encrypted session &bull; SRS FR-AUTH-001</span>
          </div>
        </div>

        {/* ========================================================
            RIGHT SIDE: Clean Form Card on Cream
           ======================================================== */}
        <div className="lg:col-span-7 bg-cream p-6 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mobile Header (Shown only on small screens) */}
            <div className="flex lg:hidden items-center justify-between pb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sage hover:text-forest transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Cafe</span>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-meadow flex items-center justify-center text-white">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="font-serif font-black text-forest text-lg">
                  Sable
                </span>
              </div>
            </div>

            {/* Header */}
            <div>
              <h2 className="font-serif text-3xl font-black text-forest tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-sage mt-1 font-medium">
                Enter your credentials to access your account and dashboard.
              </p>
            </div>

            {/* Quick Demo Credentials Pill Bar with Role Indication */}
            <div className="bg-white p-3.5 rounded-2xl border border-border shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                  1-Click Role Testing:
                </span>
                <span className="text-[10px] text-meadow-dark font-bold">
                  Auto-Routing Enabled
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    handleFillDemo("admin@sablecafe.com", "Admin123!@#")
                  }
                  className="px-3 py-1.5 rounded-xl bg-forest text-white hover:bg-forest-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-meadow" />
                  <span>Admin &rarr; /dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFillDemo("customer@cafe.com", "Password123!")
                  }
                  className="px-3 py-1.5 rounded-xl bg-white border border-border hover:bg-meadow-tint text-forest text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5 text-meadow" />
                  <span>Customer &rarr; /menu</span>
                </button>
              </div>
            </div>

            {/* Lockout Warning Banner */}
            <AnimatePresence>
              {lockoutTimer !== null && lockoutTimer > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-2xl bg-amber-50 border border-amber/30 text-amber-900 text-xs flex items-start gap-3"
                >
                  <Clock className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Security Lockout Active</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Too many consecutive attempts. Please try again in{" "}
                      <span className="font-mono font-black text-amber">
                        {formatTimer(lockoutTimer)}
                      </span>
                      .
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Error Banner (FR-AUTH-001 Generic) */}
            <AnimatePresence>
              {authError && !lockoutTimer && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form with Shake Animation on Error */}
            <motion.form
              animate={
                authError ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Floating Label Identifier Field */}
              <div className="space-y-1">
                <label
                  htmlFor="identifier"
                  className="block text-xs font-bold text-forest"
                >
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="email"
                    placeholder="name@example.com or +251 91..."
                    {...register("identifier")}
                    className={`w-full rounded-2xl bg-white border pl-10 pr-10 py-3 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                      errors.identifier
                        ? "border-rose-300"
                        : identifierValue && !errors.identifier
                          ? "border-meadow/50"
                          : "border-border"
                    }`}
                  />
                  {identifierValue && !errors.identifier && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-meadow-dark">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {errors.identifier && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {errors.identifier.message}
                  </p>
                )}

                {/* Gentle Typo Hint */}
                {typoSuggestion && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber/20 flex items-center justify-between">
                    <span>
                      Did you mean{" "}
                      <strong className="text-forest font-bold">
                        {typoSuggestion}
                      </strong>
                      ?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setValue("identifier", typoSuggestion, {
                          shouldValidate: true,
                        })
                      }
                      className="text-meadow-dark font-bold underline ml-2 cursor-pointer"
                    >
                      Fix
                    </button>
                  </p>
                )}
              </div>

              {/* Password Field with CapsLock & Show/Hide */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-forest"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    onKeyDown={(e) =>
                      setCapsLockActive(e.getModifierState("CapsLock"))
                    }
                    onKeyUp={(e) =>
                      setCapsLockActive(e.getModifierState("CapsLock"))
                    }
                    className={`w-full rounded-2xl bg-white border pl-10 pr-10 py-3 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                      errors.password ? "border-rose-300" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage hover:text-forest cursor-pointer p-0.5"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {errors.password.message}
                  </p>
                )}

                {/* Caps Lock Warning */}
                {capsLockActive && (
                  <p className="text-[11px] text-amber flex items-center gap-1 font-bold pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Caps Lock is ON</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-sage select-none">
                    <input
                      type="checkbox"
                      className="rounded border-border text-meadow focus:ring-meadow"
                      {...register("rememberMe")}
                    />
                    <span className="font-medium text-forest">Remember me</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="font-bold text-meadow-dark hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  disabled={lockoutTimer !== null && lockoutTimer > 0}
                  className="w-full py-3.5 shadow-md"
                >
                  {isSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Signed In!
                      Redirecting...
                    </span>
                  ) : (
                    "Sign In to Account"
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Social Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border w-full" />
              <span className="bg-cream px-3 text-xs font-bold uppercase text-sage">
                or
              </span>
            </div>

            {/* Social Button Placeholders (Disabled "Coming soon" per SRS specs) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                className="py-2.5 px-4 rounded-2xl bg-white/60 border border-border text-xs font-bold text-stone-400 flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
              >
                <span>Google</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-500">
                  Coming soon
                </span>
              </button>

              <button
                type="button"
                disabled
                className="py-2.5 px-4 rounded-2xl bg-white/60 border border-border text-xs font-bold text-stone-400 flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
              >
                <span>Apple ID</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-500">
                  Coming soon
                </span>
              </button>
            </div>

            {/* Footer link to Sign Up */}
            <p className="text-center text-xs text-sage pt-2">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-bold text-meadow-dark hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
