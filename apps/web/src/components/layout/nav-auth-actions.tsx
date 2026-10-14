"use client";

import { Coffee } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

interface NavAuthActionsProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  className?: string;
}

export function NavAuthActions({
  user,
  isAuthenticated,
  onLogout,
  className = "",
}: NavAuthActionsProps) {
  if (isAuthenticated && user) {
    const isAdmin = user.roles?.some((r) =>
      ["ADMIN", "ADMINISTRATOR", "OWNER", "MANAGER"].includes(r.toUpperCase()),
    );
    const displayName = (
      user.customer?.name ||
      user.email.split("@")[0] ||
      "Guest"
    ).split(" ")[0];

    return (
      <div className={`items-center gap-2 ${className}`}>
        {isAdmin && (
          <LinkButton
            href="/admin/menu"
            variant="outline"
            size="sm"
            className="border-meadow text-meadow-dark hover:bg-meadow-tint font-bold text-xs"
          >
            <Coffee className="w-3.5 h-3.5 mr-1 text-meadow" />
            Admin Panel
          </LinkButton>
        )}
        <span className="text-xs font-bold text-forest px-3 py-1.5 bg-cream-alt rounded-full border border-border flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-meadow" />
          <span>{displayName}</span>
          {isAdmin && (
            <span className="text-[10px] uppercase font-black px-1.5 py-0.2 bg-meadow text-white rounded-md">
              Admin
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-bold text-sage hover:text-forest px-2 py-1 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={`items-center gap-2 ${className}`}>
      <LinkButton
        href="/login"
        variant="ghost"
        size="sm"
        className="font-bold text-forest"
      >
        Log in
      </LinkButton>
      <LinkButton
        href="/signup"
        variant="primary"
        size="sm"
        className="shadow-sm"
      >
        Sign up
      </LinkButton>
    </div>
  );
}
