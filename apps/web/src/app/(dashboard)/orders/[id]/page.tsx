"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type Order } from "@/services/mock-data";
import { ArrowLeft, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SingleOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      try {
        const o = await dashboardService.getOrderById(id);
        setOrder(o);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-meadow animate-spin" />
        <p className="text-xs text-sage">Loading order {id}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold font-display text-forest dark:text-white">Order Not Found</h2>
        <p className="text-xs text-sage">The requested order ticket ({id}) could not be located.</p>
        <Link href="/orders">
          <Button variant="secondary" size="md">
            Return to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-sage hover:text-forest dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders List</span>
      </Link>

      <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/80 dark:border-[#283a2d] gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black font-display text-forest dark:text-white">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-sage mt-1">
              Placed {formatDateTime(order.createdAt)} · {order.fulfillmentType} {order.tableNumber ? `(${order.tableNumber})` : ""}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-sage block">Total Amount</span>
            <span className="text-xl font-black font-display text-forest dark:text-white tabular-nums">
              {formatETB(order.total)}
            </span>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sage">Ticket Line Items</h3>
          <div className="rounded-2xl border border-border dark:border-[#283a2d] divide-y divide-border/60 dark:divide-[#283a2d] overflow-hidden">
            {order.lineItems.map((li) => (
              <div key={li.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-forest dark:text-stone-200">{li.name}</p>
                  {li.notes && <p className="text-[11px] text-amber mt-0.5">Special Note: {li.notes}</p>}
                </div>
                <div className="text-right font-medium">
                  <span className="text-sage mr-3">{li.quantity}x @ {formatETB(li.unitPrice)}</span>
                  <span className="font-bold text-forest dark:text-white tabular-nums">{formatETB(li.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3 pt-4 border-t border-border/80 dark:border-[#283a2d]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sage">Audit History</h3>
          <div className="space-y-3">
            {order.timeline.map((evt, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-[#141f18]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
                  <span className="font-bold text-forest dark:text-white">{evt.status}</span>
                  <span className="text-sage">— by {evt.actor}</span>
                </div>
                <span className="text-sage text-[11px] tabular-nums">{formatDateTime(evt.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
