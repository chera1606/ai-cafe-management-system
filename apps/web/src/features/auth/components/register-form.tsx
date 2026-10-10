"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { registerSchema } from "../schemas/auth.schema";

export function RegisterForm() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const validation = registerSchema.safeParse({
      name,
      email,
      phone: phone || undefined,
      password,
      confirmPassword,
    });

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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to register account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Check Your Email
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Your account has been registered for <strong>{email}</strong>. Please check your inbox and click the verification link to activate your account.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login">
            <Button className="w-full">Proceed to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
        }}
        error={fieldErrors.name}
        required
        leftIcon={<User className="w-4 h-4" />}
      />

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

      <Input
        label="Phone Number (Optional)"
        type="tel"
        placeholder="+1234567890"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
        }}
        error={fieldErrors.phone}
        leftIcon={<Phone className="w-4 h-4" />}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters with 1 capital and 1 number"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={fieldErrors.password}
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
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        placeholder="Repeat password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }}
        error={fieldErrors.confirmPassword}
        required
        minLength={8}
        leftIcon={<Lock className="w-4 h-4" />}
      />

      <Button type="submit" isLoading={isLoading} className="w-full mt-2">
        Create Account
      </Button>

      <p className="text-center text-xs text-stone-600 dark:text-stone-400 pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
