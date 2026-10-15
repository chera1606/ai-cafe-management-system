"use client";

import {
  FileText,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  User,
  UtensilsCrossed,
} from "lucide-react";
import type { OrderType } from "@/lib/orders-api";

export interface CustomerFormData {
  orderType: OrderType;
  tableNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dropoffNotes: string;
  kitchenNotes: string;
}

interface CustomerInfoFormProps {
  data: CustomerFormData;
  onChange: (updated: Partial<CustomerFormData>) => void;
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  disabled?: boolean;
}

export function CustomerInfoForm({
  data,
  onChange,
  isAuthenticated,
  userName,
  userEmail,
  disabled = false,
}: CustomerInfoFormProps) {
  const fulfilmentOptions: {
    type: OrderType;
    label: string;
    sublabel: string;
    icon: typeof UtensilsCrossed;
  }[] = [
    {
      type: "DINE_IN",
      label: "Dine-In",
      sublabel: "Served directly to your table",
      icon: UtensilsCrossed,
    },
    {
      type: "TAKEAWAY",
      label: "Takeaway",
      sublabel: "Freshly packaged for pickup",
      icon: ShoppingBag,
    },
    {
      type: "DELIVERY",
      label: "Delivery",
      sublabel: "Delivered to your address",
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Fulfilment Channel Selector */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <h3 className="text-base font-serif font-bold text-forest mb-4 flex items-center gap-2">
          <span>1. Select Fulfilment Method</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fulfilmentOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = data.orderType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ orderType: opt.type })}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-meadow bg-meadow-tint/40 shadow-xs ring-1 ring-meadow"
                    : "border-stone-200 bg-cream/30 hover:border-meadow/40 hover:bg-white"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-meadow text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-meadow bg-meadow"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-forest">
                    {opt.label}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 leading-snug">
                    {opt.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional Dine-in Table Number */}
        {data.orderType === "DINE_IN" && (
          <div className="mt-5 pt-5 border-t border-stone-100">
            <label
              htmlFor="table-number-input"
              className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
            >
              Table Number or Booth Name *
            </label>
            <div className="relative">
              <input
                id="table-number-input"
                type="text"
                disabled={disabled}
                required
                placeholder="e.g. Table 4, Booth B, or Counter 2"
                value={data.tableNumber}
                onChange={(e) => onChange({ tableNumber: e.target.value })}
                className="w-full px-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
              />
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Please enter the table number marked on your table stand.
            </p>
          </div>
        )}

        {/* Conditional Delivery Address */}
        {data.orderType === "DELIVERY" && (
          <div className="mt-5 pt-5 border-t border-stone-100 space-y-4">
            <div>
              <label
                htmlFor="delivery-address-input"
                className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
              >
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                <input
                  id="delivery-address-input"
                  type="text"
                  disabled={disabled}
                  required
                  placeholder="Street name, house/apartment number, building"
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dropoff-notes-input"
                className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
              >
                Drop-off Instructions (Optional)
              </label>
              <input
                id="dropoff-notes-input"
                type="text"
                disabled={disabled}
                placeholder="e.g. Leave with concierge, gate code #1234"
                value={data.dropoffNotes}
                onChange={(e) => onChange({ dropoffNotes: e.target.value })}
                className="w-full px-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Customer Contact Details */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <h3 className="text-base font-serif font-bold text-forest mb-4 flex items-center justify-between">
          <span>2. Contact Information</span>
          {isAuthenticated && (
            <span className="text-xs font-medium text-meadow bg-meadow-tint px-2.5 py-1 rounded-full">
              Signed in
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="customer-name-input"
              className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
            >
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              <input
                id="customer-name-input"
                type="text"
                disabled={disabled}
                required
                placeholder={userName || "Your full name"}
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="customer-phone-input"
              className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              <input
                id="customer-phone-input"
                type="tel"
                disabled={disabled}
                placeholder="+1 (555) 000-0000"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="customer-email-input"
              className="block text-xs font-bold text-forest uppercase tracking-wider mb-2"
            >
              Email Address (for order updates &amp; receipt)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              <input
                id="customer-email-input"
                type="email"
                disabled={disabled}
                placeholder={userEmail || "you@example.com"}
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Kitchen & Preparation Note */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <h3 className="text-base font-serif font-bold text-forest mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sage" />
            3. Kitchen &amp; Preparation Instructions
          </span>
          <span className="text-xs text-stone-400 font-mono">
            {data.kitchenNotes.length}/200
          </span>
        </h3>
        <p className="text-xs text-stone-500 mb-3">
          Special dietary alerts or preferences for our baristas and chefs.
        </p>
        <textarea
          rows={2}
          maxLength={200}
          disabled={disabled}
          placeholder="e.g. Extra hot milk, dressing on the side, allergic to sesame..."
          value={data.kitchenNotes}
          onChange={(e) => onChange({ kitchenNotes: e.target.value })}
          className="w-full px-4 py-3 bg-cream/40 border border-stone-300 rounded-xl text-forest text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-meadow focus:ring-1 focus:ring-meadow resize-none"
        />
      </div>
    </div>
  );
}
