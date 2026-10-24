"use client";

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Flame,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export interface DashboardNotification {
  id: string;
  type: "ORDER" | "LOW_STOCK" | "PAYMENT_FAILED" | "COMPLAINT";
  title: string;
  description: string;
  timestamp: string;
  href: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-1",
    type: "ORDER",
    title: "New Order #ORD-9799",
    description: "Table 4 — 2x Pour Over, 1x Chechebsa",
    timestamp: "2 mins ago",
    href: "/orders",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "LOW_STOCK",
    title: "Critical Stock Warning",
    description: "Barista Oat Milk reached 6 cartons (threshold: 12)",
    timestamp: "18 mins ago",
    href: "/inventory",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "COMPLAINT",
    title: "New High Severity Ticket",
    description: "Ato Berhanu: 35 min delay on pour-over",
    timestamp: "1 hour ago",
    href: "/complaints",
    isRead: false,
  },
  {
    id: "notif-4",
    type: "PAYMENT_FAILED",
    title: "Credit Overdue Alert",
    description: "Selamawit Kebede balance ETB 14,200 exceeded terms",
    timestamp: "3 hours ago",
    href: "/credit",
    isRead: true,
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag className="w-4 h-4 text-meadow" />;
      case "LOW_STOCK":
        return <AlertTriangle className="w-4 h-4 text-amber" />;
      case "COMPLAINT":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "PAYMENT_FAILED":
        return <CreditCard className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#141f18] text-forest dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1e2e23] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-3.5 border-b border-border dark:border-[#283a2d] flex items-center justify-between bg-stone-50/60 dark:bg-[#141f18]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-meadow-dark dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40 dark:divide-[#283a2d]">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-sage">
                  No notifications at this time.
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      markAsRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3.5 transition-colors hover:bg-stone-50 dark:hover:bg-[#141f18] ${
                      !n.isRead ? "bg-meadow-tint/20 dark:bg-emerald-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-forest dark:text-white truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-sage shrink-0">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-sage dark:text-stone-300 mt-0.5 leading-snug line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
