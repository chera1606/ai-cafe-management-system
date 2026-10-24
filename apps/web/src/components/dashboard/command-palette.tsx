"use client";

import { Command as CmdkCommand } from "cmdk";
import {
  AlertCircle,
  Coffee,
  CreditCard,
  FileText,
  Flame,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl shadow-2xl overflow-hidden">
        <CmdkCommand className="w-full flex flex-col">
          {/* Input */}
          <div className="flex items-center px-4 border-b border-border dark:border-[#283a2d]">
            <Search className="w-4 h-4 text-sage mr-2.5 shrink-0" />
            <CmdkCommand.Input
              autoFocus
              placeholder="Type a page, command, order #, or customer name..."
              className="w-full py-3.5 text-xs bg-transparent text-forest dark:text-white placeholder:text-stone-400 focus:outline-none"
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
              Esc
            </kbd>
          </div>

          {/* List */}
          <CmdkCommand.List className="max-h-80 overflow-y-auto p-2 text-xs divide-y divide-border/40 dark:divide-[#283a2d]">
            <CmdkCommand.Empty className="py-6 text-center text-xs text-sage">
              No matching pages or actions found.
            </CmdkCommand.Empty>

            {/* Quick Actions */}
            <CmdkCommand.Group heading="Quick Actions" className="p-1 text-[11px] font-bold text-sage uppercase tracking-wider">
              <CmdkCommand.Item
                onSelect={() => navigateTo("/pos")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-meadow" />
                <span>New POS Order Ticket</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/kitchen")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber" />
                <span>Launch Kitchen Display System (KDS)</span>
              </CmdkCommand.Item>
            </CmdkCommand.Group>

            {/* Navigation Pages */}
            <CmdkCommand.Group heading="Navigation" className="p-1 pt-2 text-[11px] font-bold text-sage uppercase tracking-wider">
              <CmdkCommand.Item
                onSelect={() => navigateTo("/dashboard")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-stone-500" />
                <span>Overview Dashboard</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/orders")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-stone-500" />
                <span>Orders Directory</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/menu-admin")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-stone-500" />
                <span>Menu Catalog & BOM</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/inventory")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Package className="w-4 h-4 text-stone-500" />
                <span>Inventory & Stock Movements</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/credit")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-stone-500" />
                <span>Customer Credit Accounts</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/staff")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Users className="w-4 h-4 text-stone-500" />
                <span>Staff & Role Matrix</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/complaints")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-stone-500" />
                <span>Guest Complaints & Feedback</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/reports")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-stone-500" />
                <span>Reports & Analytics</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/audit")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Shield className="w-4 h-4 text-stone-500" />
                <span>Immutable System Audit Log</span>
              </CmdkCommand.Item>
              <CmdkCommand.Item
                onSelect={() => navigateTo("/settings")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141f18] cursor-pointer"
              >
                <Settings className="w-4 h-4 text-stone-500" />
                <span>Cafe Settings</span>
              </CmdkCommand.Item>
            </CmdkCommand.Group>
          </CmdkCommand.List>
        </CmdkCommand>
      </div>
    </div>
  );
}
