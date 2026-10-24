"use client";

import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  DollarSign,
  Globe,
  Printer,
  Save,
  Settings,
  Shield,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState("Sable Artisan Cafe & Roastery");
  const [tagline, setTagline] = useState("Ceremonial Ethiopian Roasts & Slow-Simmered Culinary Delights");
  const [phone, setPhone] = useState("+251 (91) 123-4567");
  const [email, setEmail] = useState("concierge@sablecafe.com");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("8.5");
  const [tableCount, setTableCount] = useState("24");
  const [aiOrderingEnabled, setAiOrderingEnabled] = useState(true);
  const [aiUpsellEnabled, setAiUpsellEnabled] = useState(true);
  const [autoPrintKds, setAutoPrintKds] = useState(true);
  const [tipSuggestions, setTipSuggestions] = useState("15, 18, 20");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-800 text-white shadow-md shadow-slate-800/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              Store & Operations Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Cafe profile, taxes, AI table ordering rules, and hardware print dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
          <Button
            type="submit"
            form="admin-settings-form"
            variant="primary"
            size="sm"
            disabled={isSaving}
            leftIcon={isSaving ? undefined : <Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form id="admin-settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Cafe Profile */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Store className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cafe & Roastery Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Store Business Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Public Tagline & Description
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Store Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours & Floor Capacity */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Operating Hours & Floor Capacity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Daily Opening Time
              </label>
              <input
                type="time"
                defaultValue="07:00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Daily Closing Time
              </label>
              <input
                type="time"
                defaultValue="21:00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Total Dining Tables
              </label>
              <input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Taxes, Currency & Tips */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial Taxes & Tip Presets
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="USD">USD ($)</option>
                <option value="ETB">ETB (Br)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Sales Tax Rate (%)
              </label>
              <input
                type="text"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tip Suggestions (%)
              </label>
              <input
                type="text"
                value={tipSuggestions}
                onChange={(e) => setTipSuggestions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 4: AI Assistant & Automation */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Ordering & Up-Selling Intelligence
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">
                  Enable AI Table & Voice Ordering
                </span>
                <span className="text-slate-500">
                  Allow customers to speak or chat with the AI assistant to assemble orders with natural language.
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiOrderingEnabled}
                onChange={(e) => setAiOrderingEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">
                  Automated Recipe Up-Selling Recommendations
                </span>
                <span className="text-slate-500">
                  Intelligently suggest Ethiopian cardamom pastries and milk pairings during pour-over checkouts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiUpsellEnabled}
                onChange={(e) => setAiUpsellEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">
                  Auto-Dispatch to Kitchen Display System (KDS)
                </span>
                <span className="text-slate-500">
                  Immediately route confirmed POS & table orders to barista and kitchen stations without cashier confirmation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPrintKds}
                onChange={(e) => setAutoPrintKds(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
