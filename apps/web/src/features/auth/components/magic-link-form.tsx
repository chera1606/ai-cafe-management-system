"use client";

import { Mail, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { magicLinkSchema } from "../schemas/auth.schema";

export function MagicLinkForm() {
  const { requestMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setGeneralError(null);
    setSuccessMessage(null);

    const validation = magicLinkSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(
        validation.error.errors[0]?.message || "Invalid email address",
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestMagicLink(email.trim());
      setSuccessMessage(res.message);
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to request magic link",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-stone-500 dark:text-stone-400">
        We&apos;ll email you an instant, secure login link. No password
        required.
      </p>

      {generalError && <Alert variant="error">{generalError}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldError) setFieldError(null);
        }}
        error={fieldError || undefined}
        required
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        <Sparkles className="w-4 h-4 mr-1.5" />
        Send Magic Link
      </Button>
    </form>
  );
}
