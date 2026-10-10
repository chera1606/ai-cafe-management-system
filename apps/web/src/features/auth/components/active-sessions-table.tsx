"use client";

import { Laptop, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import type { SessionInfo } from "@/types/auth";

export function ActiveSessionsTable() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<SessionInfo[]>("/auth/sessions");
      setSessions(data);
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

  return (
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
        {isLoading ? (
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
  );
}
