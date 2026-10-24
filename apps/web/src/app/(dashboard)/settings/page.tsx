"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Bell,
  Check,
  Clock,
  Coffee,
  CreditCard,
  Globe,
  MapPin,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Store,
  Sun,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [cafeName, setCafeName] = useState("Sable Cafe Addis");
  const [address, setAddress] = useState("Bole Sub-City, Next to Edna Mall, Addis Ababa");
  const [phone, setPhone] = useState("+251 91 123 4567");
  const [vatTin, setVatTin] = useState("0098412851");
  const [openTime, setOpenTime] = useState("07:00");
  const [closeTime, setCloseTime] = useState("22:30");

  // Payment toggles
  const [telebirrActive, setTelebirrActive] = useState(true);
  const [cbeActive, setCbeActive] = useState(true);
  const [cashActive, setCashActive] = useState(true);
  const [creditActive, setCreditActive] = useState(true);

  // Notification toggles
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewTicket, setNotifyNewTicket] = useState(true);
  const [notifyComplaints, setNotifyComplaints] = useState(true);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
          Cafe Configuration & Operational Settings
        </h1>
        <p className="text-xs text-sage dark:text-stone-400 mt-1">
          Store identity, business hours, payment gateway toggles, and staff notification alerts.
        </p>
      </div>

      {/* 1. Cafe Profile & Location */}
      <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/80 dark:border-[#283a2d]">
          <Store className="w-5 h-5 text-meadow" />
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Establishment Profile & Legal Info
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Cafe Name</label>
            <input
              type="text"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
            />
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Official VAT TIN #</label>
            <input
              type="text"
              value={vatTin}
              onChange={(e) => setVatTin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
            />
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
            />
          </div>
        </div>
      </div>

      {/* 2. Business Hours */}
      <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/80 dark:border-[#283a2d]">
          <Clock className="w-5 h-5 text-amber" />
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Operating Hours & Shift Schedules
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Morning Opening</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-stone-200 mb-1">Night Closing</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* 3. Payment Methods */}
      <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/80 dark:border-[#283a2d]">
          <CreditCard className="w-5 h-5 text-meadow-dark" />
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Accepted Payment Channels
          </h2>
        </div>

        <div className="divide-y divide-border/60 dark:divide-[#283a2d] text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-forest dark:text-white">Telebirr Merchant QR</p>
              <p className="text-sage">Mobile digital wallet payments across Ethiopia</p>
            </div>
            <input
              type="checkbox"
              checked={telebirrActive}
              onChange={(e) => setTelebirrActive(e.target.checked)}
              className="w-4 h-4 text-meadow rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-forest dark:text-white">Commercial Bank of Ethiopia (CBE Birr)</p>
              <p className="text-sage">National CBE instant merchant settlement</p>
            </div>
            <input
              type="checkbox"
              checked={cbeActive}
              onChange={(e) => setCbeActive(e.target.checked)}
              className="w-4 h-4 text-meadow rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-forest dark:text-white">Physical Cash</p>
              <p className="text-sage">Cash register drawer transactions with change calculator</p>
            </div>
            <input
              type="checkbox"
              checked={cashActive}
              onChange={(e) => setCashActive(e.target.checked)}
              className="w-4 h-4 text-meadow rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-forest dark:text-white">Customer Credit Accounts</p>
              <p className="text-sage">Net-15 / Net-30 approved corporate accounts</p>
            </div>
            <input
              type="checkbox"
              checked={creditActive}
              onChange={(e) => setCreditActive(e.target.checked)}
              className="w-4 h-4 text-meadow rounded"
            />
          </div>
        </div>
      </div>

      {/* 4. Appearance & Theme */}
      <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/80 dark:border-[#283a2d]">
          <Palette className="w-5 h-5 text-meadow" />
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Appearance & Visual Theme
          </h2>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-forest dark:text-white">Forest Dark Mode</p>
            <p className="text-sage">Soft organic dark tones tuned for low-glare kitchen and evening POS work</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-6 py-2.5 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold shadow-xs hover:bg-forest-2 cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-meadow dark:text-forest" />
          <span>Save System Settings</span>
        </button>
      </div>
    </div>
  );
}
