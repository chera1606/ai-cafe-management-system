"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Coffee,
  Copy,
  Key,
  Laptop,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import type {
  SessionInfo,
  TwoFactorEnableResponse,
  TwoFactorGenerateResponse,
} from "@/types/auth";

export default function SecuritySettingsPage() {
  const { user, changePassword, logout } = useAuth();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // 2FA state
  const [twoFaSetupData, setTwoFaSetupData] =
    useState<TwoFactorGenerateResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [is2FaLoading, setIs2FaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const data = await apiClient<SessionInfo[]>("/auth/sessions");
      setSessions(data);
    } catch {
      // Handled silently
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }

    setPwLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPwSuccess(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPwLoading(false);
    }
  };

  const handleStart2FaSetup = async () => {
    setTwoFaError(null);
    setIs2FaLoading(true);
    try {
      const data = await apiClient<TwoFactorGenerateResponse>(
        "/auth/2fa/generate",
        {
          method: "POST",
        },
      );
      setTwoFaSetupData(data);
    } catch (err: unknown) {
      setTwoFaError(
        err instanceof Error ? err.message : "Failed to start 2FA setup",
      );
    } finally {
      setIs2FaLoading(false);
    }
  };

  const handleConfirmEnable2Fa = async (e: FormEvent) => {
    e.preventDefault();
    setTwoFaError(null);
    setIs2FaLoading(true);
    try {
      const res = await apiClient<TwoFactorEnableResponse>("/auth/2fa/enable", {
        method: "POST",
        body: JSON.stringify({ code: verifyCode.trim() }),
      });
      setIs2FaEnabled(true);
      setRecoveryCodes(res.recoveryCodes);
      setTwoFaSetupData(null);
      setTwoFaSuccess("Two-factor authentication is now active!");
    } catch (err: unknown) {
      setTwoFaError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    } finally {
      setIs2FaLoading(false);
    }
  };

  const handleDisable2Fa = async (e: FormEvent) => {
    e.preventDefault();
    setTwoFaError(null);
    setIs2FaLoading(true);
    try {
      await apiClient("/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode.trim() }),
      });
      setIs2FaEnabled(false);
      setDisableCode("");
      setTwoFaSuccess("Two-factor authentication has been disabled.");
    } catch (err: unknown) {
      setTwoFaError(
        err instanceof Error ? err.message : "Invalid code to disable 2FA.",
      );
    } finally {
      setIs2FaLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient(`/auth/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // Handled silently
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await apiClient("/auth/logout-all", { method: "POST" });
      await logout();
    } catch {
      // Handled silently
    }
  };

  const copyRecoveryCodes = () => {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-700" />
                Security & Authentication
              </h1>
              <p className="text-xs text-stone-500">
                Manage your credentials, two-factor authentication, and active
                sessions
              </p>
            </div>
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PASSWORD MANAGEMENT CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account uses a strong, unique password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pwError && <Alert variant="error">{pwError}</Alert>}
              {pwSuccess && <Alert variant="success">{pwSuccess}</Alert>}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={pwLoading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TWO-FACTOR AUTHENTICATION CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security using Google Authenticator or
                1Password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFaError && <Alert variant="error">{twoFaError}</Alert>}
              {twoFaSuccess && <Alert variant="success">{twoFaSuccess}</Alert>}

              {/* RECOVERY CODES MODAL VIEW */}
              {recoveryCodes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Save your recovery codes!</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    If you lose access to your phone, these are the only way to
                    sign in. Store them in a password manager.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-white dark:bg-stone-900 rounded border border-amber-200 dark:border-amber-800/80 font-mono text-xs text-stone-800 dark:text-stone-200">
                    {recoveryCodes.map((code) => (
                      <span key={code} className="text-center py-0.5">
                        {code}
                      </span>
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

              {/* SETUP QR CODE VIEW */}
              {twoFaSetupData && (
                <form onSubmit={handleConfirmEnable2Fa} className="space-y-4">
                  <div className="text-center p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
                    {/* biome-ignore lint/performance/noImgElement: Data URI base64 QR code image is generated dynamically in memory */}
                    <img
                      src={twoFaSetupData.qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-40 h-40 mx-auto rounded"
                    />
                    <p className="text-[11px] text-stone-500 mt-2 font-mono break-all">
                      Secret: {twoFaSetupData.secret}
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
                      isLoading={is2FaLoading}
                      className="flex-1"
                    >
                      Activate 2FA
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTwoFaSetupData(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* IDLE / TOGGLE VIEW */}
              {!twoFaSetupData && !recoveryCodes && (
                <div>
                  {is2FaEnabled ? (
                    <form onSubmit={handleDisable2Fa} className="space-y-3">
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
                        isLoading={is2FaLoading}
                        className="w-full"
                      >
                        Disable 2FA
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-stone-500">
                        Protect your cafe account from unauthorized access by
                        requiring a time-based one-time password on sign in.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleStart2FaSetup}
                        isLoading={is2FaLoading}
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
        </div>

        {/* ACTIVE SESSIONS CARD */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-amber-600" />
                  Active Sessions & Devices
                </CardTitle>
                <CardDescription>
                  Devices and locations currently signed in to your account.
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Sign Out Everywhere Else
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                Loading session devices...
              </p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No active sessions found.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-stone-900 dark:text-stone-100">
                            {session.deviceInfo || "Unknown Browser / Device"}
                          </p>
                          {session.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">
                          IP: {session.ipAddress || "Unknown"} • Active:{" "}
                          {new Date(session.lastActiveAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
