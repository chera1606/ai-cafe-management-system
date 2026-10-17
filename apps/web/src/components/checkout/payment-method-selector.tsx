"use client";

import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { PaymentMethod } from "@/lib/payments-api";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  customerPhone?: string;
  onPhoneChange?: (phone: string) => void;
  transactionRef?: string;
  onTransactionRefChange?: (ref: string) => void;
  orderTotal: number;
}

interface MethodOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  badge?: string;
  icon: typeof Banknote;
}

const PAYMENT_OPTIONS: MethodOption[] = [
  {
    id: "CASH",
    title: "Cash on Counter / Delivery",
    subtitle: "Pay in person upon table service, pickup, or delivery",
    badge: "Direct",
    icon: Banknote,
  },
  {
    id: "TELEBIRR",
    title: "Telebirr Mobile Payment",
    subtitle: "Instant payment via Ethio Telecom Telebirr superapp",
    badge: "Instant",
    icon: Smartphone,
  },
  {
    id: "CBE_BIRR",
    title: "CBE Birr / CBE Mobile",
    subtitle: "Commercial Bank of Ethiopia mobile or branch transfer",
    badge: "Verified",
    icon: PhoneCall,
  },
  {
    id: "CARD",
    title: "Debit / Credit Card",
    subtitle: "Visa, Mastercard, or local debit processing",
    badge: "Secure",
    icon: CreditCard,
  },
  {
    id: "CREDIT",
    title: "House Credit Account",
    subtitle: "Charge to verified monthly patron or corporate account",
    badge: "Patron Account",
    icon: Building2,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  customerPhone = "",
  onPhoneChange,
  transactionRef = "",
  onTransactionRefChange,
  orderTotal,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-forest">
            Payment Method
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select your preferred settlement channel (FR-PAY-001)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedMethod === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectMethod(opt.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer",
                isSelected
                  ? "border-forest bg-forest/[0.03] shadow-xs ring-1 ring-forest/20"
                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-forest text-white"
                    : "bg-stone-100 text-stone-600",
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-forest">
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span
                      className={cn(
                        "text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded font-bold",
                        isSelected
                          ? "bg-forest/10 text-forest"
                          : "bg-stone-100 text-stone-500",
                      )}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                  {opt.subtitle}
                </p>
              </div>

              <div
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  isSelected
                    ? "border-forest bg-forest text-white"
                    : "border-stone-300 bg-white",
                )}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Telebirr / CBE Birr Prompt details */}
      {(selectedMethod === "TELEBIRR" || selectedMethod === "CBE_BIRR") && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <QrCode className="w-4 h-4 text-amber-700" />
            <span>
              {selectedMethod === "TELEBIRR" ? "Telebirr USSD / QR Push" : "CBE Birr Account Transfer"}
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Upon placing the order, an electronic request of{" "}
            <strong>${orderTotal.toFixed(2)}</strong> will be registered. You may optionally enter your mobile number or confirmation code below:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label
                htmlFor="mobile-number-input"
                className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1"
              >
                Mobile Number
              </label>
              <input
                id="mobile-number-input"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={customerPhone}
                onChange={(e) => onPhoneChange?.(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white text-forest focus:outline-hidden focus:ring-2 focus:ring-forest/30"
              />
            </div>
            <div>
              <label
                htmlFor="txn-ref-input"
                className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1"
              >
                Transaction Ref (Optional)
              </label>
              <input
                id="txn-ref-input"
                type="text"
                placeholder="e.g. TXN-TB-90218"
                value={transactionRef}
                onChange={(e) => onTransactionRefChange?.(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white text-forest focus:outline-hidden focus:ring-2 focus:ring-forest/30 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Card Info Notice */}
      {selectedMethod === "CARD" && (
        <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <CreditCard className="w-4 h-4 text-forest" />
            <span>Card Terminal / Web Gateway</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Card settlement is processed via tokenized checkout. You will be directed to finalize authorization or pay on the wireless POS upon table presentation.
          </p>
        </div>
      )}

      {/* House Credit Notice */}
      {selectedMethod === "CREDIT" && (
        <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>Corporate / Patron Monthly Ledger</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            This order will be added to your verified monthly balance. An itemized invoice will be delivered to your registered email at billing cycle close.
          </p>
        </div>
      )}
    </div>
  );
}
