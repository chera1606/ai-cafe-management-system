"use client";

import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { formatDateTime } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type AuditRecord } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import { Code, Eye, FileText, Lock, Shield, Terminal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await dashboardService.getAuditLogs();
        setLogs(data);
      } catch (e) {
        toast.error("Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const columns: ColumnDef<AuditRecord>[] = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-sage tabular-nums">
            {formatDateTime(row.original.timestamp)}
          </span>
        ),
      },
      {
        accessorKey: "actor",
        header: "Operator / Actor",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-forest dark:text-white block">
              {row.original.actor}
            </span>
            <span className="text-[10px] font-bold text-meadow-dark dark:text-emerald-400">
              {row.original.role}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Audited Action",
        cell: ({ row }) => (
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-[11px] font-bold text-forest dark:text-stone-300">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: "entityType",
        header: "Target Entity",
        cell: ({ row }) => (
          <span className="text-xs text-sage font-medium">
            {row.original.entityType} ({row.original.entityId})
          </span>
        ),
      },
      {
        accessorKey: "requestId",
        header: "Request ID",
        cell: ({ row }) => (
          <span className="font-mono text-[10px] text-stone-400">
            {row.original.requestId}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecord(row.original);
            }}
            className="p-1.5 rounded-lg border border-border dark:border-[#283a2d] hover:bg-stone-50 text-sage hover:text-forest"
            title="Inspect Diff"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
              System Audit Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-mono font-bold text-sage">
              IMMUTABLE WORM
            </span>
          </div>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            SRS Section 14: Comprehensive, tamper-evident audit ledger tracking all financial and operational adjustments.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search actor, action, or entity..."
        searchColumn="action"
        onRowClick={(log) => setSelectedRecord(log)}
        exportFileName="sable-cafe-audit-log"
        isLoading={isLoading}
      />

      {/* Side Drawer: Before / After Diff Viewer */}
      <SideDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.action || "Audit Event Detail"}
        subtitle={`Request ID: ${selectedRecord?.requestId} · ${selectedRecord ? formatDateTime(selectedRecord.timestamp) : ""}`}
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#141f18] border border-border dark:border-[#283a2d] space-y-1">
              <div>Actor: <span className="font-bold text-forest dark:text-white">{selectedRecord.actor}</span> ({selectedRecord.role})</div>
              <div>Entity: {selectedRecord.entityType} ({selectedRecord.entityId})</div>
            </div>

            {selectedRecord.diff ? (
              <div className="space-y-3">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-sage">
                  State Mutation Diff (JSON)
                </h3>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                    − BEFORE STATE:
                  </span>
                  <pre className="text-[11px] overflow-x-auto text-rose-900 dark:text-rose-200">
                    {JSON.stringify(selectedRecord.diff.before, null, 2)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl bg-meadow-tint/40 border border-meadow/30">
                  <span className="font-bold text-meadow-dark dark:text-emerald-400 block mb-1">
                    + AFTER STATE:
                  </span>
                  <pre className="text-[11px] overflow-x-auto text-forest dark:text-emerald-100">
                    {JSON.stringify(selectedRecord.diff.after, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-sage italic font-sans">No state mutations recorded for this event.</p>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
