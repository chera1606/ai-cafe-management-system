"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { KeyboardShortcutsModal } from "../ui/keyboard-shortcuts-modal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global keybindings
  useEffect(() => {
    let keyBuffer = "";
    let bufferTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside text inputs
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      // Help overlay "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Command palette ⌘K or "/"
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // New order "n"
      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        router.push("/pos");
        return;
      }

      // Two-key chord navigation (e.g. "g d", "g o", "g k", "g p", "g i")
      keyBuffer += e.key.toLowerCase();
      if (bufferTimeout) clearTimeout(bufferTimeout);
      bufferTimeout = setTimeout(() => {
        keyBuffer = "";
      }, 700);

      if (keyBuffer === "gd") {
        router.push("/dashboard");
        keyBuffer = "";
      } else if (keyBuffer === "go") {
        router.push("/orders");
        keyBuffer = "";
      } else if (keyBuffer === "gk") {
        router.push("/kitchen");
        keyBuffer = "";
      } else if (keyBuffer === "gp") {
        router.push("/pos");
        keyBuffer = "";
      } else if (keyBuffer === "gi") {
        router.push("/inventory");
        keyBuffer = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (bufferTimeout) clearTimeout(bufferTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-cream dark:bg-[#121a14] text-forest dark:text-stone-100 flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}
