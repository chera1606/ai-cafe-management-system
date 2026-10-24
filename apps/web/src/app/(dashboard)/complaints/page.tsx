"use client";

import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type Complaint } from "@/services/mock-data";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getComplaints();
      setComplaints(data);
    } catch (e) {
      toast.error("Failed to load customer tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: Complaint["status"],
    notes?: string
  ) => {
    try {
      const updated = await dashboardService.updateComplaintStatus(id, newStatus, notes);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedComplaint?.id === updated.id) {
        setSelectedComplaint(updated);
      }
      toast.success(`Ticket ${updated.ticketNumber} moved to ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update ticket status");
    }
  };

  const handleSendResponse = () => {
    if (!selectedComplaint || !responseText.trim()) return;
    handleUpdateStatus(
      selectedComplaint.id,
      "RESOLVED",
      `Resolution: ${responseText.trim()}`
    );
    setResponseText("");
  };

  const columns: Complaint["status"][] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
          Customer Service & Feedback Tickets
        </h1>
        <p className="text-xs text-sage dark:text-stone-400 mt-1">
          Guest incident tracking, delayed service escalations, and resolution audit notes.
        </p>
      </div>

      {/* 4 Status Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((colStatus) => {
          const colItems = complaints.filter((c) => c.status === colStatus);

          return (
            <div key={colStatus} className="space-y-3">
              <div className="p-3 rounded-2xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      colStatus === "OPEN"
                        ? "bg-rose-500"
                        : colStatus === "IN_PROGRESS"
                        ? "bg-amber-500"
                        : "bg-meadow"
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-white">
                    {colStatus.replace("_", " ")}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-bold tabular-nums">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-3">
                {colItems.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedComplaint(ticket)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] hover:border-meadow shadow-xs transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-forest dark:text-white">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ticket.severity === "HIGH" || ticket.severity === "URGENT"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {ticket.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-forest dark:text-stone-200 leading-snug">
                      {ticket.subject}
                    </h4>

                    <p className="text-[11px] text-sage line-clamp-2 leading-relaxed">
                      {ticket.details}
                    </p>

                    <div className="pt-2 border-t border-border/60 dark:border-[#283a2d] flex items-center justify-between text-[11px] text-sage">
                      <span>{ticket.customerName}</span>
                      {ticket.orderNumber && (
                        <span className="font-mono font-semibold text-forest dark:text-white">
                          {ticket.orderNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complaint Detail & Resolution Drawer */}
      <SideDrawer
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint ? `Ticket ${selectedComplaint.ticketNumber}` : "Incident Detail"}
        subtitle={selectedComplaint?.subject}
      >
        {selectedComplaint && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-[#141f18] border border-border dark:border-[#283a2d]">
              <div>
                <span className="text-[10px] text-sage uppercase font-bold block">Status</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-sage uppercase font-bold block">Severity</span>
                <span className="font-bold text-rose-600">{selectedComplaint.severity}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border dark:border-[#283a2d] space-y-2">
              <h3 className="font-bold text-forest dark:text-white">Patron Description</h3>
              <p className="text-sage leading-relaxed">{selectedComplaint.details}</p>
              <div className="pt-2 text-[11px] text-stone-400">
                Filed by: {selectedComplaint.customerName} ({selectedComplaint.customerContact})
                {selectedComplaint.orderNumber && ` · Linked to Order #${selectedComplaint.orderNumber}`}
              </div>
            </div>

            {selectedComplaint.resolutionNotes && (
              <div className="p-4 rounded-2xl bg-meadow-tint/30 border border-meadow/30 space-y-1">
                <span className="font-bold text-meadow-dark block">Resolution Audit Record:</span>
                <p className="text-forest dark:text-stone-200">{selectedComplaint.resolutionNotes}</p>
              </div>
            )}

            {/* Resolution Composer */}
            {selectedComplaint.status !== "RESOLVED" && selectedComplaint.status !== "CLOSED" && (
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-forest dark:text-white">
                  Compose Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Record corrective actions taken (e.g. dish remade, credit refund processed)..."
                  className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]"
                />
                <button
                  type="button"
                  onClick={handleSendResponse}
                  disabled={!responseText.trim()}
                  className="w-full py-2.5 rounded-xl bg-meadow hover:bg-meadow-alt text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Mark Resolved with Note</span>
                </button>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
