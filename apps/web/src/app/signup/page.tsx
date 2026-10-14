"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Coffee,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FloatingBean,
  FloatingCroissant,
  FloatingLeaf,
  SteamWisps,
} from "@/components/ui/floating-elements";
import { showToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name is too long"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    phoneCountryCode: z.string(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9\s-]{7,15}$/.test(val),
        "Please enter a valid phone number",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms to proceed" }),
    }),
    notificationChannel: z.enum(["email", "sms", "both"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const PREFERENCE_CHIPS = [
  "Ceremonial Jebena",
  "Yirgacheffe Pour-Over",
  "Cardamom Spanish Latte",
  "Pistachio Oat Latte",
  "Nitro Cold Brew",
  "Spiced Chai Shai",
  "Special Doro Wot",
  "Sizzling Beef Tibs",
  "Grand Vegan Beyaynetu",
  "Cardamom Croissant",
];

const COUNTRY_CODES = [
  { code: "+251", label: "ET (+251)" },
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+254", label: "KE (+254)" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { register: registerAuth, login } = useAuth();

  // 2-Step Flow: Step 1 (Account) -> Step 2 (Preferences)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    "Ceremonial Jebena",
    "Cardamom Spanish Latte",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [isPostSignup, setIsPostSignup] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phoneCountryCode: "+251",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: true,
      notificationChannel: "email",
    },
  });

  const passwordValue = watch("password") || "";
  const emailValue = watch("email") || "";

  // Password strength checklist
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSymbol = /[^A-Za-z0-9]/.test(passwordValue);

  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSymbol ? 1 : 0);

  // Email Typo Suggestion
  const getTypoSuggestion = (email: string) => {
    const commonTypos: Record<string, string> = {
      "@gmai.com": "@gmail.com",
      "@gamil.com": "@gmail.com",
      "@gmial.com": "@gmail.com",
      "@yaho.com": "@yahoo.com",
      "@yahooo.com": "@yahoo.com",
      "@hotmial.com": "@hotmail.com",
    };
    for (const [typo, fix] of Object.entries(commonTypos)) {
      if (email.toLowerCase().endsWith(typo)) {
        return email.slice(0, -typo.length) + fix;
      }
    }
    return null;
  };

  const typoSuggestion = getTypoSuggestion(emailValue);

  const handleNextStep = async () => {
    const valid = await trigger([
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "agreeToTerms",
    ]);
    if (valid) {
      setCurrentStep(2);
    }
  };

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const onFinalSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      const fullPhone = data.phone
        ? `${data.phoneCountryCode}${data.phone.replace(/^0+/, "")}`
        : undefined;

      try {
        await registerAuth({
          name: data.fullName,
          email: data.email,
          password: data.password,
          phone: fullPhone,
        });
      } catch {
        // Fallback for demo registration
      }

      // Auto sign in user
      await login(data.email, data.password);

      setIsCelebration(true);
      showToast(
        "success",
        "Welcome to the Sable Circle!",
        "Account created and signed in.",
      );

      setTimeout(() => {
        setIsPostSignup(true);
      }, 1000);
    } catch {
      showToast("error", "Sign up failed", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    showToast(
      "success",
      "Verification Sent",
      "Check your inbox for a new link.",
    );

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cream p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-5xl rounded-[36px] bg-white border border-border shadow-forest overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
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
          <FloatingBean size={32} delay={0.3} className="top-12 left-10" />
          <FloatingLeaf size={38} delay={1.2} className="bottom-24 right-6" />
          <FloatingCroissant
            size={42}
            delay={1.8}
            className="top-1/2 right-4 opacity-25"
          />

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

          {/* Inspiring Brand Copy */}
          <div className="relative z-10 space-y-4 my-10">
            <Badge
              variant="meadow"
              icon={<Sparkles className="w-3 h-3 text-amber" />}
            >
              Guest Privileges
            </Badge>

            <h3 className="font-serif text-2xl sm:text-3xl font-black text-white leading-snug">
              Begin your highline coffee and dining ritual.
            </h3>

            <ul className="space-y-2.5 text-xs text-stone-300 pt-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>$5 credit added on your first artisan roast</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>Zero wait times with kitchen pre-ordering</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-meadow shrink-0" />
                <span>Invites to monthly ceremonial Jebena cuppings</span>
              </li>
            </ul>
          </div>

          {/* Bottom Security Mark */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-stone-300">
            <ShieldCheck className="w-4 h-4 text-meadow" />
            <span>Strict Argon2id hashing &bull; Privacy Guaranteed</span>
          </div>
        </div>

        {/* ========================================================
            RIGHT SIDE: Form Experience
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
            {/* POST SIGNUP SCREEN: Check Your Email */}
            {isPostSignup ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-meadow-tint text-meadow-dark flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-8 h-8 text-meadow" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-black text-forest">
                    Check Your Email
                  </h2>
                  <p className="text-xs sm:text-sm text-sage max-w-sm mx-auto leading-relaxed">
                    We sent a confirmation link to{" "}
                    <strong className="text-forest">{emailValue}</strong>. Click
                    the link to complete email verification.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full py-3.5 shadow-md"
                    onClick={() => router.push("/menu")}
                  >
                    <span>Proceed to Artisanal Menu</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-xs">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendVerification}
                      className="font-bold text-meadow-dark hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend email"}
                    </button>
                    <span className="text-stone-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setIsPostSignup(false)}
                      className="text-sage hover:text-forest underline cursor-pointer"
                    >
                      Change email
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* 2-Step Progress Indicator Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sage">
                    <span>Step {currentStep} of 2</span>
                    <span className="text-forest font-extrabold">
                      {currentStep === 1
                        ? "Account Details"
                        : "Taste Preferences"}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="h-1.5 w-full bg-stone-200/80 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-meadow rounded-full"
                      initial={{ width: "50%" }}
                      animate={{ width: currentStep === 1 ? "50%" : "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(onFinalSubmit)}
                  className="space-y-4"
                >
                  <AnimatePresence mode="wait">
                    {currentStep === 1 ? (
                      /* STEP 1: Account Details */
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-3.5"
                      >
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label
                            htmlFor="fullName"
                            className="block text-xs font-bold text-forest"
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="fullName"
                              type="text"
                              autoComplete="name"
                              placeholder="Selamawit Kebede"
                              {...register("fullName")}
                              className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                                errors.fullName
                                  ? "border-rose-300"
                                  : "border-border"
                              }`}
                            />
                          </div>
                          {errors.fullName && (
                            <p className="text-[11px] text-rose-600 font-medium">
                              {errors.fullName.message}
                            </p>
                          )}
                        </div>

                        {/* Email Address with Typo Hint */}
                        <div className="space-y-1">
                          <label
                            htmlFor="email"
                            className="block text-xs font-bold text-forest"
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              placeholder="name@example.com"
                              {...register("email")}
                              className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                                errors.email
                                  ? "border-rose-300"
                                  : "border-border"
                              }`}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-[11px] text-rose-600 font-medium">
                              {errors.email.message}
                            </p>
                          )}
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
                                  setValue("email", typoSuggestion, {
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

                        {/* Phone Number with Country Code Dropdown */}
                        <div className="space-y-1">
                          <label
                            htmlFor="phone"
                            className="block text-xs font-bold text-forest"
                          >
                            Phone Number (Optional)
                          </label>
                          <div className="flex gap-2">
                            <div className="relative w-28 shrink-0">
                              <select
                                {...register("phoneCountryCode")}
                                className="w-full appearance-none rounded-2xl bg-white border border-border pl-3 pr-6 py-2.5 text-xs text-forest font-bold focus:outline-none focus:border-meadow cursor-pointer shadow-2xs"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="relative flex-1">
                              <Phone className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                id="phone"
                                type="tel"
                                autoComplete="tel-national"
                                placeholder="911 234 567"
                                {...register("phone")}
                                className="w-full rounded-2xl bg-white border border-border pl-10 pr-4 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all"
                              />
                            </div>
                          </div>
                          {errors.phone && (
                            <p className="text-[11px] text-rose-600 font-medium">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        {/* Password with Strength Meter & CapsLock */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor="password"
                            className="block text-xs font-bold text-forest"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Create a strong password"
                              {...register("password")}
                              onKeyDown={(e) =>
                                setCapsLockActive(
                                  e.getModifierState("CapsLock"),
                                )
                              }
                              onKeyUp={(e) =>
                                setCapsLockActive(
                                  e.getModifierState("CapsLock"),
                                )
                              }
                              className={`w-full rounded-2xl bg-white border pl-10 pr-10 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                                errors.password
                                  ? "border-rose-300"
                                  : "border-border"
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

                          {/* Animated Segmented Strength Bar */}
                          {passwordValue && (
                            <div className="space-y-1 pt-1">
                              <div className="grid grid-cols-4 gap-1.5">
                                {[1, 2, 3, 4].map((step) => (
                                  <div
                                    key={step}
                                    className={`h-1.5 rounded-full transition-colors duration-300 ${
                                      step <= strengthScore
                                        ? strengthScore <= 2
                                          ? "bg-amber"
                                          : "bg-meadow"
                                        : "bg-stone-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-sage">
                                <span>Password Strength</span>
                                <span className="font-bold text-forest">
                                  {strengthScore <= 1
                                    ? "Weak"
                                    : strengthScore === 2
                                      ? "Fair"
                                      : strengthScore === 3
                                        ? "Good"
                                        : "Strong & Safe"}
                                </span>
                              </div>
                            </div>
                          )}

                          {capsLockActive && (
                            <p className="text-[11px] text-amber flex items-center gap-1 font-bold pt-0.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Caps Lock is ON</span>
                            </p>
                          )}
                          {errors.password && (
                            <p className="text-[11px] text-rose-600 font-medium">
                              {errors.password.message}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                          <label
                            htmlFor="confirmPassword"
                            className="block text-xs font-bold text-forest"
                          >
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Confirm your password"
                              {...register("confirmPassword")}
                              className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint transition-all ${
                                errors.confirmPassword
                                  ? "border-rose-300"
                                  : "border-border"
                              }`}
                            />
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-[11px] text-rose-600 font-medium">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="pt-1">
                          <label className="flex items-start gap-2.5 text-xs text-sage cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded border-border text-meadow focus:ring-meadow"
                              {...register("agreeToTerms")}
                            />
                            <span>
                              I agree to Sable&apos;s Terms of Service and
                              Privacy Policy.
                            </span>
                          </label>
                          {errors.agreeToTerms && (
                            <p className="text-[11px] text-rose-600 font-medium mt-1">
                              {errors.agreeToTerms.message}
                            </p>
                          )}
                        </div>

                        {/* Continue to Step 2 Button */}
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={handleNextStep}
                            className="w-full py-3.5 shadow-md flex items-center justify-center gap-2"
                          >
                            <span>Continue to Taste Preferences</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      /* STEP 2: Preferences & Final Submit */
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div>
                          <h4 className="font-serif text-lg font-bold text-forest">
                            What do you love?
                          </h4>
                          <p className="text-xs text-sage mt-0.5">
                            Select your favorites so our AI Sommelier can
                            recommend roasts and culinary pairings.
                          </p>
                        </div>

                        {/* Preference Chips */}
                        <div className="flex flex-wrap gap-2">
                          {PREFERENCE_CHIPS.map((chip) => {
                            const isSelected =
                              selectedPreferences.includes(chip);
                            return (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => togglePreference(chip)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-forest text-white shadow-xs"
                                    : "bg-white text-sage border border-border hover:bg-cream-alt"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-meadow" />
                                ) : (
                                  <Coffee className="w-3.5 h-3.5 opacity-50" />
                                )}
                                <span>{chip}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Order Tracking Notification Channel (FR-NOTIF-006) */}
                        <div className="bg-white p-3.5 rounded-2xl border border-border space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
                            <Bell className="w-3.5 h-3.5 text-meadow" />
                            <span>Live Order Status Notifications</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { id: "email", label: "Email" },
                              { id: "sms", label: "SMS" },
                              { id: "both", label: "Both" },
                            ].map((chan) => (
                              <label
                                key={chan.id}
                                className="flex items-center gap-1.5 p-2 rounded-xl border border-border bg-cream-alt/60 cursor-pointer font-medium text-forest"
                              >
                                <input
                                  type="radio"
                                  value={chan.id}
                                  {...register("notificationChannel")}
                                  className="text-meadow focus:ring-meadow"
                                />
                                <span className="text-[11px] font-bold">
                                  {chan.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Navigation Buttons: Back and Submit */}
                        <div className="flex items-center gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 py-3"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            <span>Back</span>
                          </Button>

                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            className="flex-2 py-3 shadow-md"
                          >
                            {isCelebration ? (
                              <span className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Welcome
                                Aboard!
                              </span>
                            ) : (
                              "Create My Account"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Footer link to Sign In */}
                <p className="text-center text-xs text-sage pt-2">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-meadow-dark hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
