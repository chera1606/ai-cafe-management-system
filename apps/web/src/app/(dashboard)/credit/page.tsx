"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatGauge } from "@/components/ui/stat-gauge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type CustomerCreditAccount } from "@/services/mock-data";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreditAccountsPage() {
  const [customers, setCustomers] = useState<CustomerCreditAccount[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomerCreditAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Partial Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(1000);
  const [payRef, setPayRef] = useState<string>("CBE-BIRR-TX-998");

  // Adjustment Modal State (requires mandatory audit justification)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustAmountDelta, setAdjustAmountDelta] = useState<number>(-500);

  // Statement Preview State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getCustomers();
      setCustomers(data);
      if (data.length > 0 && data[0]) {
        setSelectedCust(data[0]);
      }
    } catch (e) {
      toast.error("Failed to load credit accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Record Partial Payment
  const handleRecordPayment = async () => {
    if (!selectedCust || payAmount <= 0) return;
    try {
      const updated = await dashboardService.recordCreditPayment(
        selectedCust.id,
        payAmount,
        payRef
      );
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCust(updated);
      setIsPaymentModalOpen(false);
      toast.success(`Payment of ${formatETB(payAmount)} credited to ${updated.customerName}!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment");
    }
  };

  // Record Adjustment with mandatory reason
  const handleConfirmAdjustment = async (reason?: string) => {
    if (!selectedCust || !reason) return;
    try {
      const updated = await dashboardService.adjustCreditBalance(
        selectedCust.id,
        adjustAmountDelta,
        reason
      );
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCust(updated);
      setIsAdjustmentModalOpen(false);
      toast.success(`Audit adjustment applied to ${updated.customerName}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to adjust balance");
    }
  };

  if (isLoading || !selectedCust) {
    return <div className="py-20 text-center text-xs text-sage">Loading financial ledgers...</div>;
  }

  const totalOutstandingAll = customers.reduce((s, c) => s + c.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & KPI Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Customer Credit & Running Ledgers
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            FR-CREDIT-001..007: Approved credit lines, running debt ledger, and audit-governed adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStatementModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-xs font-bold text-forest dark:text-white hover:bg-stone-50"
          >
            <FileText className="w-3.5 h-3.5 text-meadow" />
            <span>Monthly Statement</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Accounts List (4 cols) & Active Account Ledger (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accounts Selector List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/80 dark:border-[#283a2d]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-sage">
              Credit Accounts ({customers.length})
            </h3>
            <span className="font-bold text-xs tabular-nums text-forest dark:text-white">
              Total Due: {formatETB(totalOutstandingAll)}
            </span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            {customers.map((c) => {
              const isSelected = selectedCust.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCust(c)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-meadow bg-meadow-tint/30 dark:bg-emerald-950/20 shadow-xs"
                      : "border-border dark:border-[#283a2d] hover:bg-stone-50 dark:hover:bg-[#141f18]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-forest dark:text-white truncate">
                      {c.customerName}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-sage">Balance:</span>
                    <span
                      className={`font-black tabular-nums ${
                        c.currentBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-meadow-dark"
                      }`}
                    >
                      {formatETB(c.currentBalance)}
                    </span>
                  </div>

                  {/* Limit bar */}
                  <div className="mt-2">
                    <StatGauge
                      label=""
                      current={c.currentBalance}
                      max={c.creditLimit}
                      formatAsCurrency={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Account Ledger & Actions */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-6">
          {/* Account Profile Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80 dark:border-[#283a2d]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold font-display text-forest dark:text-white">
                  {selectedCust.customerName}
                </h2>
                <StatusBadge status={selectedCust.status} />
              </div>
              <p className="text-xs text-sage mt-1">
                Account: <span className="font-mono font-bold">{selectedCust.customerId}</span> · Terms: {selectedCust.paymentTermsDays} Net Days · Phone: {selectedCust.phone}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-meadow hover:bg-meadow-alt text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Record Repayment
              </button>

              <button
                type="button"
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] text-xs font-bold text-forest dark:text-white hover:bg-stone-100 cursor-pointer"
              >
                Audit Adjustment (±)
              </button>
            </div>
          </div>

          {/* Limit Gauge & Financial Summary Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#141f18] border border-border dark:border-[#283a2d] space-y-3">
            <StatGauge
              label="Credit Facility Utilization"
              current={selectedCust.currentBalance}
              max={selectedCust.creditLimit}
              formatAsCurrency={true}
            />

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border dark:border-[#283a2d] text-xs">
              <div>
                <span className="text-sage block">Approved Limit:</span>
                <span className="font-bold text-forest dark:text-white tabular-nums">
                  {formatETB(selectedCust.creditLimit)}
                </span>
              </div>
              <div>
                <span className="text-sage block">Current Debt Balance:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {formatETB(selectedCust.currentBalance)}
                </span>
              </div>
              <div>
                <span className="text-sage block">Remaining Available:</span>
                <span className="font-black text-meadow-dark dark:text-emerald-400 tabular-nums">
                  {formatETB(selectedCust.availableCredit)}
                </span>
              </div>
            </div>
          </div>

          {/* Running Transaction Ledger Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-sage">
                Running Transaction Ledger ({selectedCust.ledger.length} entries)
              </h3>
              <span className="text-[11px] text-sage">
                Immutable chronologic accounting
              </span>
            </div>

            <div className="rounded-2xl border border-border dark:border-[#283a2d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-[#141f18] border-b border-border dark:border-[#283a2d] text-sage">
                  <tr>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Reference</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                    <th className="p-3 font-semibold text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-[#283a2d]">
                  {selectedCust.ledger.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sage">
                        No transactions recorded for this billing cycle yet.
                      </td>
                    </tr>
                  ) : (
                    selectedCust.ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-stone-50/50">
                        <td className="p-3 text-sage tabular-nums">{entry.date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              entry.type === "PAYMENT"
                                ? "bg-meadow-tint text-meadow-dark"
                                : entry.type === "CHARGE"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-medium text-forest dark:text-stone-300">
                          {entry.reference}
                          {entry.reason && (
                            <p className="text-[10px] text-sage mt-0.5">{entry.reason}</p>
                          )}
                        </td>
                        <td
                          className={`p-3 text-right font-bold tabular-nums ${
                            entry.type === "PAYMENT" ? "text-meadow-dark" : "text-forest dark:text-white"
                          }`}
                        >
                          {entry.type === "PAYMENT" ? `−${formatETB(entry.amount)}` : `+${formatETB(entry.amount)}`}
                        </td>
                        <td className="p-3 text-right font-black tabular-nums text-forest dark:text-white">
                          {formatETB(entry.balanceAfter)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Partial Repayment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-[#283a2d]">
              <h3 className="text-base font-bold font-display text-forest dark:text-white">
                Record Credit Repayment
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-sage hover:text-forest"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sage">
              Crediting payment towards <strong>{selectedCust.customerName}</strong>. Current debt is {formatETB(selectedCust.currentBalance)}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-forest dark:text-white mb-1">
                  Repayment Amount (ETB)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-forest dark:text-white mb-1">
                  Payment Reference / Bank Slip #
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 font-bold text-sage"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="px-4 py-2 rounded-xl bg-meadow text-white font-bold shadow-xs cursor-pointer"
              >
                Post Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Adjustment Dialog with Mandatory Reason */}
      <ConfirmDialog
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title={`Audit Balance Adjustment: ${selectedCust.customerName}`}
        description="Per SRS FR-CREDIT-006, manual debt adjustments permanently write to the financial audit log. Enter positive amount to add debt, negative to issue credit."
        confirmLabel="Apply Adjustment"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="e.g. Approved billing error compensation from ticket #9712..."
        minReasonLength={8}
        onConfirm={handleConfirmAdjustment}
      />

      {/* Monthly Statement Preview Modal */}
      {isStatementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-8 shadow-2xl space-y-6 font-mono text-xs">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-bold font-display uppercase tracking-wider text-forest dark:text-white">
                  SABLE CAFE — MONTHLY CREDIT STATEMENT
                </h2>
                <p className="text-[10px] text-sage">Statement Period: October 1 - October 31, 2026</p>
                <p className="text-[11px] font-bold mt-1 text-forest dark:text-white">
                  Patron: {selectedCust.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatementModalOpen(false)}
                className="p-1 text-sage"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>Credit Limit: {formatETB(selectedCust.creditLimit)}</div>
              <div>Payment Terms: {selectedCust.paymentTermsDays} Net Days</div>
              <div>Closing Debt: {formatETB(selectedCust.currentBalance)}</div>
              <div>Available Credit: {formatETB(selectedCust.availableCredit)}</div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <span className="font-bold text-xs">Recent Billing Activity:</span>
              <div className="divide-y divide-border/60">
                {selectedCust.ledger.slice(0, 4).map((l) => (
                  <div key={l.id} className="py-1.5 flex justify-between">
                    <span>{l.date} — {l.reference}</span>
                    <span className="font-bold">{formatETB(l.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
