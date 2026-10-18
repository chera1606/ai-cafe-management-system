"use client";

import { useState } from "react";
import { PosCatalog } from "@/components/pos/pos-catalog";
import { PosHeader } from "@/components/pos/pos-header";
import { PosSuccessDialog } from "@/components/pos/pos-success-dialog";
import { PosTenderModal } from "@/components/pos/pos-tender-modal";
import { type PosLineItem, PosTicket } from "@/components/pos/pos-ticket";
import type { MenuItem } from "@/data/types";
import {
  type CreateOrderPayload,
  MENU_ITEM_UUID_MAP,
  type OrderType,
  createOrder,
  recordPlacedOrderId,
} from "@/lib/orders-api";
import {
  type PaymentMethod,
  initiatePayment,
  verifyPayment,
} from "@/lib/payments-api";

export default function PosRegisterPage() {
  const [items, setItems] = useState<PosLineItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [tableNumber, setTableNumber] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("");

  const [isTenderOpen, setIsTenderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successState, setSuccessState] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    totalPaid: number;
    changeDue: number;
  }>({
    isOpen: false,
    orderId: "",
    orderNumber: "",
    totalPaid: 0,
    changeDue: 0,
  });

  const handleSelectItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it.menuItemId === item.id && !it.specialInstruction,
      );
      if (existing) {
        return prev.map((it) =>
          it.id === existing.id ? { ...it, quantity: it.quantity + 1 } : it,
        );
      }
      const newLine: PosLineItem = {
        id: `pos-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity: 1,
      };
      return [...prev, newLine];
    });
  };

  const handleUpdateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(lineId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => (it.id === lineId ? { ...it, quantity } : it)),
    );
  };

  const handleUpdateNote = (lineId: string, note: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === lineId ? { ...it, specialInstruction: note || undefined } : it,
      ),
    );
  };

  const handleRemoveItem = (lineId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== lineId));
  };

  const handleClearTicket = () => {
    setItems([]);
    setTableNumber("1");
    setCustomerName("");
  };

  // Ticket totals
  const subtotal = items.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );
  const vatAmount = Number((subtotal * 0.15).toFixed(2));
  const totalAmount = Number((subtotal + vatAmount).toFixed(2));

  const handleConfirmTender = async (
    method: PaymentMethod,
    tenderedAmount: number,
    providerRef?: string,
  ) => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Create order
      const payload: CreateOrderPayload = {
        orderType,
        tableNumber: orderType === "DINE_IN" ? tableNumber || "1" : undefined,
        notes: `POS Register 1 Tender (${method})`,
        items: items.map((it) => {
          const resolvedId = MENU_ITEM_UUID_MAP[it.menuItemId] || it.menuItemId;
          return {
            menuItemId: resolvedId,
            quantity: it.quantity,
            specialInstruction: it.specialInstruction,
          };
        }),
        guestCustomer: {
          name: customerName.trim() || "Walk-in Guest",
        },
      };

      const createdOrder = await createOrder(payload);
      recordPlacedOrderId(createdOrder.id);

      // 2. Initiate Payment
      const payment = await initiatePayment({
        orderId: createdOrder.id,
        paymentMethod: method,
        amount: totalAmount,
        providerReference: providerRef,
        notes: `Tendered: $${tenderedAmount.toFixed(2)}, Method: ${method}`,
      });

      // 3. Complete payment verification immediately
      await verifyPayment(payment.id, {
        status: "PAID",
        providerReference: providerRef || payment.providerReference || undefined,
      });

      const changeDue = Math.max(0, Number((tenderedAmount - totalAmount).toFixed(2)));

      setIsTenderOpen(false);
      setSuccessState({
        isOpen: true,
        orderId: createdOrder.id,
        orderNumber:
          createdOrder.orderNumber || createdOrder.id.slice(0, 6).toUpperCase(),
        totalPaid: totalAmount,
        changeDue,
      });

      // Clear ticket for next sale
      handleClearTicket();
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to process sale. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setSuccessState({
      isOpen: false,
      orderId: "",
      orderNumber: "",
      totalPaid: 0,
      changeDue: 0,
    });
    handleClearTicket();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-100 dark:bg-stone-950 overflow-hidden font-sans">
      {/* Top POS Kiosk Header */}
      <PosHeader
        cashierName="Counter Station 1"
        onClearTicket={handleClearTicket}
        ticketItemCount={items.length}
      />

      {/* Main Register Body: Catalog Grid (Left) + Active Ticket (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Quick Touch Catalog */}
        <div className="flex-1 h-full overflow-hidden">
          <PosCatalog onSelectItem={handleSelectItem} />
        </div>

        {/* Right: Active Ticket Sidebar */}
        <PosTicket
          items={items}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateNote={handleUpdateNote}
          onRemoveItem={handleRemoveItem}
          onOpenTender={() => setIsTenderOpen(true)}
        />
      </div>

      {/* Payment Tender Modal */}
      <PosTenderModal
        isOpen={isTenderOpen}
        onClose={() => setIsTenderOpen(false)}
        totalAmount={totalAmount}
        onConfirmTender={handleConfirmTender}
        isSubmitting={isSubmitting}
      />

      {/* Success Dialog */}
      <PosSuccessDialog
        isOpen={successState.isOpen}
        orderNumber={successState.orderNumber}
        orderId={successState.orderId}
        totalPaid={successState.totalPaid}
        changeDue={successState.changeDue}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
