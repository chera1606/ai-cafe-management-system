"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type CustomerCreditAccount } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import { CreditCard, Eye, Mail, Phone, Plus, User, Users } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerCreditAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCreditAccount | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dashboardService.getCustomers();
        setCustomers(data);
      } catch (e) {
        toast.error("Failed to load customer profiles");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const columns: ColumnDef<CustomerCreditAccount>[] = useMemo(
    () => [
      {
        accessorKey: "customerId",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-sage">
            {row.original.customerId}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Name / Corporate Entity",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-forest dark:text-white block">
              {row.original.customerName}
            </span>
            <span className="text-[11px] text-sage">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact Phone",
        cell: ({ row }) => (
          <span className="text-xs text-forest dark:text-stone-300 tabular-nums">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: "creditLimit",
        header: "Credit Line",
        cell: ({ row }) => (
          <span className="font-bold tabular-nums text-forest dark:text-white">
            {formatETB(row.original.creditLimit)}
          </span>
        ),
      },
      {
        accessorKey: "currentBalance",
        header: "Balance Due",
        cell: ({ row }) => (
          <span
            className={`font-black tabular-nums ${
              row.original.currentBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-meadow-dark dark:text-emerald-400"
            }`}
          >
            {formatETB(row.original.currentBalance)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Credit Standing",
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href="/credit"
              className="px-2.5 py-1 rounded-lg border border-border dark:border-[#283a2d] text-xs font-bold text-meadow-dark dark:text-emerald-400 hover:bg-stone-50"
            >
              Credit Ledger &rarr;
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Customer & Corporate Directory
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Registered patrons, corporate invoicing relationships, and dining histories.
          </p>
        </div>

        <Link
          href="/credit"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold shadow-xs hover:bg-forest-2"
        >
          <CreditCard className="w-4 h-4 text-meadow dark:text-forest" />
          <span>Manage Credit Accounts</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customer name or phone..."
        searchColumn="customerName"
        onRowClick={(c) => setSelectedCustomer(c)}
        exportFileName="sable-cafe-customers"
        isLoading={isLoading}
      />

      <SideDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.customerName || "Customer Profile"}
        subtitle={`Account ID: ${selectedCustomer?.customerId}`}
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#141f18] border border-border dark:border-[#283a2d] space-y-2">
              <h3 className="font-bold text-forest dark:text-white">Contact & Billing</h3>
              <p>Email: <span className="font-semibold">{selectedCustomer.email}</span></p>
              <p>Phone: <span className="font-semibold">{selectedCustomer.phone}</span></p>
              <p>Payment Terms: <span className="font-semibold">{selectedCustomer.paymentTermsDays} Net Days</span></p>
              <p>Account Status: <StatusBadge status={selectedCustomer.status} size="sm" /></p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#141f18] border border-border dark:border-[#283a2d] space-y-2">
              <h3 className="font-bold text-forest dark:text-white">Credit Overview</h3>
              <div className="flex justify-between">
                <span>Total Approved Limit:</span>
                <span className="font-bold tabular-nums">{formatETB(selectedCustomer.creditLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Outstanding Due:</span>
                <span className="font-bold text-amber-600 tabular-nums">{formatETB(selectedCustomer.currentBalance)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Remaining Available:</span>
                <span className="text-meadow-dark tabular-nums">{formatETB(selectedCustomer.availableCredit)}</span>
              </div>
            </div>

            <Link href="/credit" className="block pt-2">
              <Button variant="primary" size="md" className="w-full">
                Open Full Financial Ledger
              </Button>
            </Link>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
