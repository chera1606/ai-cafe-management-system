"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coffee,
  Download,
  FileText,
  Printer,
  QrCode,
  RotateCcw,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  type DigitalReceiptResponse,
  getReceipt,
} from "@/lib/payments-api";
import { cn } from "@/lib/utils";

export default function OrderReceiptPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";

  const [receipt, setReceipt] = useState<DigitalReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let mounted = true;
    async function loadReceipt() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await getReceipt(orderId);
        if (mounted) setReceipt(data);
      } catch (err: unknown) {
        if (mounted) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Unable to load digital receipt.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadReceipt();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Navigation / Action Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Tracker</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || !receipt}
              className="text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-forest animate-spin mx-auto" />
            <p className="text-sm font-medium text-stone-500">
              Generating verified digital receipt...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="bg-white rounded-3xl p-8 text-center border border-rose-200 shadow-xs space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="font-serif font-bold text-xl text-stone-900">
              Receipt Not Found
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              {errorMsg}
            </p>
            <Link href={`/orders/${orderId}`}>
              <Button variant="primary" size="sm">
                Return to Order
              </Button>
            </Link>
          </div>
        )}

        {/* Receipt Document Card */}
        {!isLoading && receipt && (
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-md p-6 sm:p-10 relative overflow-hidden print:border-none print:shadow-none print:p-0">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-forest via-amber-600 to-forest print:hidden" />

            {/* Receipt Header */}
            <div className="text-center pb-6 border-b border-dashed border-stone-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest/10 text-forest mb-2">
                <Coffee className="w-6 h-6" />
              </div>
              <h1 className="font-serif font-black text-2xl text-stone-900 tracking-tight">
                {receipt.cafe.name}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {receipt.cafe.legalEntity}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {receipt.cafe.address} • {receipt.cafe.phone}
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400 font-mono mt-1">
                <span>{receipt.cafe.taxRegistrationNumber}</span>
                <span>•</span>
                <span>VAT Registered (15%)</span>
              </div>
            </div>

            {/* Transaction Identification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-stone-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                  Receipt No
                </span>
                <span className="font-mono font-black text-stone-900">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                  Order Code
                </span>
                <span className="font-mono font-bold text-stone-800">
                  {receipt.orderNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                  Fulfilment
                </span>
                <span className="font-semibold text-stone-800">
                  {receipt.orderType === "DINE_IN"
                    ? receipt.tableNumber
                      ? `Table ${receipt.tableNumber}`
                      : "Dine In"
                    : receipt.orderType === "TAKEAWAY"
                      ? "Takeaway"
                      : "Delivery"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                  Date &amp; Time
                </span>
                <span className="font-mono text-stone-700">
                  {new Date(receipt.issuedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="py-3 border-b border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mr-2">
                  Customer:
                </span>
                <span className="font-semibold text-stone-900">
                  {receipt.customerName}
                </span>
                {receipt.customerPhone && (
                  <span className="text-stone-500 ml-2 font-mono">
                    ({receipt.customerPhone})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    receipt.paymentStatus === "PAID" &&
                      "bg-emerald-100 text-emerald-800 border border-emerald-300",
                    receipt.paymentStatus === "UNPAID" &&
                      "bg-amber-100 text-amber-800 border border-amber-300",
                    receipt.paymentStatus === "PARTIALLY_PAID" &&
                      "bg-blue-100 text-blue-800 border border-blue-300",
                    receipt.paymentStatus === "REFUNDED" &&
                      "bg-rose-100 text-rose-800 border border-rose-300",
                  )}
                >
                  {receipt.paymentStatus}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px] tracking-wider text-left">
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Artisan Item</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="py-2.5">
                      <td className="py-2.5 font-mono font-bold text-stone-900 align-top w-12">
                        {item.quantity}x
                      </td>
                      <td className="py-2.5 align-top">
                        <div className="font-semibold text-stone-900">
                          {item.name}
                        </div>
                        {item.specialInstruction && (
                          <div className="text-[11px] text-amber-700 italic mt-0.5">
                            Note: {item.specialInstruction}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-stone-600 text-right align-top w-20">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-stone-900 text-right align-top w-20">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-dashed border-stone-300 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Value Added Tax (VAT 15%)</span>
                <span className="font-mono">${receipt.taxAmount.toFixed(2)}</span>
              </div>
              {receipt.deliveryFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  <span className="font-mono">${receipt.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {receipt.tipAmount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Staff Gratuity / Tip</span>
                  <span className="font-mono">${receipt.tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-300">
                <span>Total Amount Due</span>
                <span className="font-mono font-black">${receipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
                <span>Total Amount Settled</span>
                <span className="font-mono">${receipt.amountPaid.toFixed(2)}</span>
              </div>
              {receipt.balanceDue > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-700">
                  <span>Outstanding Balance</span>
                  <span className="font-mono">${receipt.balanceDue.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Payment Transactions List */}
            {receipt.payments.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Payment Transactions
                </div>
                {receipt.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.paymentMethod}</span>
                      {p.providerReference && (
                        <span className="font-mono text-[10px] text-stone-400">
                          ({p.providerReference})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">${p.amount.toFixed(2)}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white border border-stone-200 font-semibold">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* QR / Barcode Verification Stamp */}
            <div className="mt-8 pt-6 border-t border-dashed border-stone-300 text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-stone-100 border border-stone-200">
                <QrCode className="w-16 h-16 text-stone-800" />
              </div>
              <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">
                Official Electronic Fiscal Receipt • {receipt.receiptNumber}
              </p>
              <p className="text-xs text-stone-500 font-serif italic">
                Thank you for honoring our artisan coffee ritual and culinary heritage.
              </p>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
