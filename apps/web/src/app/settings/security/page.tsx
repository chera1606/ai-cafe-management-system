"use client";

import { ArrowLeft, Coffee, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ActiveSessionsTable,
  ChangePasswordForm,
  TwoFactorSetupWizard,
} from "@/features/auth";

export default function SecuritySettingsPage() {
  const { user } = useAuth();

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

        {/* Credentials & 2FA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChangePasswordForm />
          <TwoFactorSetupWizard />
        </div>

        {/* Devices & Sessions */}
        <ActiveSessionsTable />
      </div>
    </div>
  );
}
