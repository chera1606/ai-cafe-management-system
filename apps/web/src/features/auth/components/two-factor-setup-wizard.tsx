"use client";

import { useState, type FormEvent } from "react";
import {
  Smartphone,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type {
  TwoFactorEnableResponse,
  TwoFactorGenerateResponse,
} from "@/types/auth";

export function TwoFactorSetupWizard() {
  const [setupData, setSetupData] = useState<TwoFactorGenerateResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleStartSetup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiClient<TwoFactorGenerateResponse>("/auth/2fa/generate", {
        method: "POST",
      });
      setSetupData(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to generate 2FA secret",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEnable = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiClient<TwoFactorEnableResponse>("/auth/2fa/enable", {
        method: "POST",
        body: JSON.stringify({ code: verifyCode.trim() }),
      });
      setIs2FaEnabled(true);
      setRecoveryCodes(res.recoveryCodes);
      setSetupData(null);
      setSuccess("Two-factor authentication is now active!");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiClient("/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode.trim() }),
      });
      setIs2FaEnabled(false);
      setDisableCode("");
      setSuccess("Two-factor authentication has been disabled.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid code to disable 2FA.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-600" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security using Google Authenticator or 1Password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {recoveryCodes && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Save your backup recovery codes!</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              If you lose access to your phone, these are the only way to sign in. Store them in a password manager.
            </p>
            <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-white dark:bg-stone-900 rounded border border-amber-200 dark:border-amber-800/80 font-mono text-xs text-stone-800 dark:text-stone-200">
              {recoveryCodes.map((code) => (
                <span key={code} className="text-center py-0.5">{code}</span>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copyRecoveryCodes}
              className="w-full text-xs"
            >
              {copiedCodes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy All Codes
                </>
              )}
            </Button>
          </div>
        )}

        {setupData && (
          <form onSubmit={handleConfirmEnable} className="space-y-4">
            <div className="text-center p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
              {/* biome-ignore lint/performance/noImgElement: Data URI base64 QR code image is generated dynamically in memory */}
              <img
                src={setupData.qrCodeUrl}
                alt="2FA QR Code"
                className="w-40 h-40 mx-auto rounded"
              />
              <p className="text-[11px] text-stone-500 mt-2 font-mono break-all">
                Secret: {setupData.secret}
              </p>
            </div>

            <Input
              label="Enter 6-digit Code from Authenticator"
              type="text"
              placeholder="123456"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              maxLength={6}
              required
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                className="flex-1"
              >
                Activate 2FA
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSetupData(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {!setupData && !recoveryCodes && (
          <div>
            {is2FaEnabled ? (
              <form onSubmit={handleDisable} className="space-y-3">
                <div className="flex items-center justify-between text-xs p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    2FA is currently active
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <Input
                  label="To disable, enter current authenticator code"
                  type="text"
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Disable 2FA
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-500">
                  Protect your cafe account by requiring a time-based one-time password on sign in.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartSetup}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
