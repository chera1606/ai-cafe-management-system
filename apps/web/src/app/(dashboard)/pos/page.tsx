"use client";

import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type CustomerCreditAccount, type MenuItem } from "@/services/mock-data";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coffee,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface TicketItem {
  item: MenuItem;
  quantity: number;
  selectedOption?: string;
  notes?: string;
}

export default function PosPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<CustomerCreditAccount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticket, setTicket] = useState<TicketItem[]>([]);
  const [fulfillment, setFulfillment] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [tableNumber, setTableNumber] = useState("T-1");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCreditAccount | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TELEBIRR" | "CREDIT" | "CBE_BIRR">("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      const [items, custs] = await Promise.all([
        dashboardService.getMenuItems(),
        dashboardService.getCustomers(),
      ]);
      setMenuItems(items);
      setCustomers(custs);
    }
    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToTicket = (item: MenuItem) => {
    setTicket((prev) => {
      const existing = prev.find((t) => t.item.id === item.id);
      if (existing) {
        return prev.map((t) =>
          t.item.id === item.id ? { ...t, quantity: t.quantity + 1 } : t
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setTicket((prev) =>
      prev
        .map((t) => (t.item.id === itemId ? { ...t, quantity: t.quantity + delta } : t))
        .filter((t) => t.quantity > 0)
    );
  };

  const subtotal = ticket.reduce((sum, t) => sum + t.item.price * t.quantity, 0);
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + tax;

  const handleOpenPayment = () => {
    if (ticket.length === 0) {
      toast.error("Ticket is empty! Add items first.");
      return;
    }
    setCashTendered(total);
    setIsPaymentModalOpen(true);
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === "CREDIT") {
      if (!selectedCustomer) {
        toast.error("Please select an approved customer credit account.");
        return;
      }
      if (selectedCustomer.availableCredit < total) {
        toast.error(
          `Credit limit exceeded! Available: ${formatETB(selectedCustomer.availableCredit)}`
        );
        return;
      }
    }

    const receipt = {
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ticket: [...ticket],
      subtotal,
      tax,
      total,
      fulfillment,
      tableNumber: fulfillment === "DINE_IN" ? tableNumber : undefined,
      paymentMethod,
      cashTendered: paymentMethod === "CASH" ? cashTendered : undefined,
      change: paymentMethod === "CASH" ? Math.max(0, cashTendered - total) : undefined,
      customer: selectedCustomer?.customerName,
    };

    setReceiptData(receipt);
    setIsPaymentModalOpen(false);
    setTicket([]);
    toast.success("Order transaction recorded successfully!");
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
      {/* LEFT PANE: Product Grid & Category Filters (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl overflow-hidden shadow-xs">
        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-border/80 dark:border-[#283a2d] space-y-3 bg-stone-50/50 dark:bg-[#141f18]">
          <div className="relative">
            <Search className="w-4 h-4 text-sage absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name or code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-forest dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-meadow"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-forest dark:bg-meadow text-white dark:text-forest shadow-xs"
                    : "bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] text-sage hover:text-forest"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addToTicket(item)}
              className="p-3.5 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50/50 dark:bg-[#141f18] hover:border-meadow/80 dark:hover:border-meadow text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xs cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold text-meadow-dark dark:text-emerald-400 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-forest dark:text-white mt-1 leading-snug group-hover:text-meadow-dark transition-colors">
                  {item.name}
                </h4>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/50 dark:border-[#283a2d] pt-2">
                <span className="font-bold text-xs text-forest dark:text-stone-200 tabular-nums">
                  {formatETB(item.price)}
                </span>
                <span className="w-6 h-6 rounded-lg bg-meadow-tint text-meadow-dark flex items-center justify-center font-bold text-xs">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Current Ticket & Fast Tender Checkout (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl overflow-hidden shadow-xs">
        {/* Ticket Header & Dining Options */}
        <div className="p-4 border-b border-border/80 dark:border-[#283a2d] bg-stone-50/50 dark:bg-[#141f18] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-meadow" />
              <h3 className="text-sm font-bold font-display text-forest dark:text-white">
                Active Ticket
              </h3>
            </div>
            {ticket.length > 0 && (
              <button
                type="button"
                onClick={() => setTicket([])}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Fulfillment selector */}
            <div className="flex rounded-xl border border-border dark:border-[#283a2d] p-0.5 bg-white dark:bg-[#1b2820]">
              {(["DINE_IN", "TAKEAWAY"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFulfillment(mode)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                    fulfillment === mode
                      ? "bg-forest dark:bg-meadow text-white dark:text-forest"
                      : "text-sage"
                  }`}
                >
                  {mode === "DINE_IN" ? "Dine-In" : "Takeaway"}
                </button>
              ))}
            </div>

            {/* Table selector if dine-in */}
            {fulfillment === "DINE_IN" && (
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="py-1 px-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-xs font-bold text-forest dark:text-white"
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <option key={i} value={`T-${i + 1}`}>
                    Table {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Ticket Line Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border/60 dark:divide-[#283a2d]">
          {ticket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-sage text-xs py-12">
              <ShoppingBag className="w-10 h-10 text-stone-300 mb-2 stroke-[1.5]" />
              <p className="font-bold text-forest dark:text-stone-300">Ticket is Empty</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Tap items on the left to add them to this order.
              </p>
            </div>
          ) : (
            ticket.map((t) => (
              <div key={t.item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-forest dark:text-white truncate">
                    {t.item.name}
                  </p>
                  <p className="text-[11px] text-sage tabular-nums">
                    {formatETB(t.item.price)} each
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(t.item.id, -1)}
                    className="w-6 h-6 rounded-lg border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] flex items-center justify-center font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold tabular-nums text-forest dark:text-white">
                    {t.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(t.item.id, 1)}
                    className="w-6 h-6 rounded-lg border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] flex items-center justify-center font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-20 text-right font-bold text-forest dark:text-white tabular-nums">
                  {formatETB(t.item.price * t.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Calculations & Checkout Button */}
        <div className="p-4 border-t border-border/80 dark:border-[#283a2d] bg-stone-50/50 dark:bg-[#141f18] space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-sage">
              <span>Estimated Subtotal:</span>
              <span className="tabular-nums font-semibold">{formatETB(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sage">
              <span>VAT (15%):</span>
              <span className="tabular-nums font-semibold">{formatETB(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-forest dark:text-white border-t border-border/80 dark:border-[#283a2d] pt-1.5">
              <span>Total Due:</span>
              <span className="tabular-nums">{formatETB(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenPayment}
            disabled={ticket.length === 0}
            className="w-full py-3.5 rounded-2xl bg-meadow hover:bg-meadow-alt text-white font-black text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Charge {formatETB(total)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payment Dialog Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 dark:border-[#283a2d] pb-4">
              <div>
                <h3 className="text-base font-bold font-display text-forest dark:text-white">
                  Tender & Settle Payment
                </h3>
                <p className="text-xs text-sage">Total Due: {formatETB(total)}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-xl border text-sage hover:text-forest"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(["CASH", "TELEBIRR", "CBE_BIRR", "CREDIT"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-2xl border font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === method
                      ? "border-meadow bg-meadow-tint text-meadow-dark dark:text-emerald-400 shadow-2xs"
                      : "border-border dark:border-[#283a2d] text-sage hover:bg-stone-50"
                  }`}
                >
                  {method.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Cash Tender Details & Change Calculator */}
            {paymentMethod === "CASH" && (
              <div className="p-4 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-forest dark:text-white mb-1">
                    Cash Tendered (ETB)
                  </label>
                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] text-base font-bold tabular-nums"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-border dark:border-[#283a2d]">
                  <span className="text-sage">Change Due to Patron:</span>
                  <span className="text-meadow-dark dark:text-emerald-400 text-sm font-black tabular-nums">
                    {formatETB(Math.max(0, cashTendered - total))}
                  </span>
                </div>
              </div>
            )}

            {/* Customer Credit Account Selector with Eligibility Check */}
            {paymentMethod === "CREDIT" && (
              <div className="p-4 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] space-y-3 text-xs">
                <label className="block font-bold text-forest dark:text-white mb-1">
                  Select Registered Credit Account
                </label>
                <select
                  value={selectedCustomer?.id || ""}
                  onChange={(e) => {
                    const c = customers.find((cust) => cust.id === e.target.value);
                    setSelectedCustomer(c || null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] text-xs font-bold"
                >
                  <option value="">-- Choose Account --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} (Available: {formatETB(c.availableCredit)})
                    </option>
                  ))}
                </select>

                {selectedCustomer && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sage">Credit Limit:</span>
                      <span className="font-bold">{formatETB(selectedCustomer.creditLimit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage">Available Remaining:</span>
                      <span className="font-bold text-meadow-dark">{formatETB(selectedCustomer.availableCredit)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Tender */}
            <button
              type="button"
              onClick={handleCompleteOrder}
              className="w-full py-3.5 rounded-2xl bg-meadow hover:bg-meadow-alt text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Print Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal View */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-border dark:border-stone-700">
              <h2 className="font-bold text-sm text-forest dark:text-white uppercase tracking-wider">
                SABLE CAFE ADDIS
              </h2>
              <p className="text-[10px] text-sage">Bole Sub-City, Addis Ababa, Ethiopia</p>
              <p className="text-[10px] text-sage">VAT TIN: 0098412851</p>
              <p className="text-[11px] font-bold text-forest dark:text-white mt-1">
                Receipt #{receiptData.orderNumber}
              </p>
            </div>

            <div className="space-y-1.5 divide-y divide-border/40 dark:divide-stone-800">
              {receiptData.ticket.map((t: any) => (
                <div key={t.item.id} className="pt-1.5 flex justify-between">
                  <span>
                    {t.quantity}x {t.item.name}
                  </span>
                  <span>{formatETB(t.item.price * t.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-border dark:border-stone-700 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatETB(receiptData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%):</span>
                <span>{formatETB(receiptData.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-forest dark:text-white border-t pt-1">
                <span>Total:</span>
                <span>{formatETB(receiptData.total)}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-sage text-center">
              Thank you for savoring Ethiopian Coffee with us!
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptData(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
