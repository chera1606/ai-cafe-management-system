"use client";

import { Coffee, Lock, ShieldAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If auth is still checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
          <p className="text-xs text-sage font-medium">
            Verifying manager credentials...
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrManager =
    isAuthenticated &&
    user?.roles?.some((role) =>
      [
        "admin",
        "administrator",
        "owner",
        "manager",
        "operations",
        "barista",
      ].includes(role.toLowerCase()),
    );

  // In development/demo, permit staff preview
  const allowStaffPreview = true;

  if (!isAdminOrManager && !allowStaffPreview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-forest text-center">
        <div className="p-4 rounded-3xl bg-meadow-tint text-meadow-dark mb-4 shadow-sm border border-meadow/20">
          <ShieldAlert className="w-10 h-10 text-meadow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest mb-2">
          Management Access Restricted
        </h1>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed">
          The Sable Operations Console is reserved for authorized staff and
          management members.
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/menu" variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-1.5 text-meadow" />
            Public Menu
          </LinkButton>
          <LinkButton href="/login" size="sm">
            <Lock className="w-4 h-4 mr-1.5" />
            Staff Sign In
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Unified Admin Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified Admin Topbar */}
        <AdminTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Nested Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
