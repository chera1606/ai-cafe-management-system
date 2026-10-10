"use client";

import { ArrowLeft, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export function TwoFactorChallenge() {
  const router = useRouter();
  const { complete2Fa, cancel2Fa } = useAuth();

  const [code, setCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await complete2Fa(code.trim());
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-4">
        <Input
          label={isRecoveryCode ? "Recovery Code" : "Authenticator Code"}
          type="text"
          placeholder={isRecoveryCode ? "e.g. a1b2c3d4" : "000000"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoFocus
          maxLength={isRecoveryCode ? 16 : 6}
          leftIcon={<KeyRound className="w-4 h-4" />}
        />

        <button
          type="button"
          onClick={() => {
            setIsRecoveryCode(!isRecoveryCode);
            setCode("");
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
  );
}
