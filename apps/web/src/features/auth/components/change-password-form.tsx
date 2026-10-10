"use client";

import { useState, type FormEvent } from "react";
import { Key } from "lucide-react";
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
import { useAuth } from "@/context/auth-context";
import { changePasswordSchema } from "../schemas/auth.schema";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
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
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        {generalError && <Alert variant="error">{generalError}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (fieldErrors.currentPassword)
                setFieldErrors((prev) => ({ ...prev, currentPassword: "" }));
            }}
            error={fieldErrors.currentPassword}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters (1 uppercase & 1 number)"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.newPassword)
                setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
            error={fieldErrors.newPassword}
            required
            minLength={8}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword)
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={fieldErrors.confirmPassword}
            required
            minLength={8}
          />
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            className="w-full"
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
