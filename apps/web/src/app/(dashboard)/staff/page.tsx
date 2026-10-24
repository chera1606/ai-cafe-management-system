"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/auth-context";
import { formatDate, formatETB } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type StaffMember } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Plus,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function StaffPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "MATRIX">("DIRECTORY");

  // Suspend Dialog
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [memberToSuspend, setMemberToSuspend] = useState<StaffMember | null>(null);

  // Invite Drawer
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("+251 91 ");
  const [inviteRole, setInviteRole] = useState<StaffMember["role"]>("BARISTA");
  const [inviteDepartment, setInviteDepartment] = useState("Beverage");

  const userRoles = user?.roles?.map((r) => r.toUpperCase()) || ["ADMINISTRATOR"];
  const canViewCompensation = userRoles.some((r) =>
    ["OWNER", "MANAGER", "ADMINISTRATOR", "ADMIN"].includes(r)
  );

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getStaff();
      setStaffList(data);
    } catch (e) {
      toast.error("Failed to load staff roster");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleConfirmSuspend = async (reason?: string) => {
    if (!memberToSuspend || !reason) return;
    try {
      const updated = await dashboardService.toggleStaffStatus(memberToSuspend.id, reason);
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setIsSuspendModalOpen(false);
      setMemberToSuspend(null);
      toast.success(`Staff status changed for ${updated.name}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update staff status");
    }
  };

  const handleInviteStaff = () => {
    const newMember: StaffMember = {
      id: `st-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone,
      role: inviteRole,
      department: inviteDepartment,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0]!,
      monthlySalary: 18000,
    };
    setStaffList((prev) => [newMember, ...prev]);
    setIsInviteDrawerOpen(false);
    toast.success(`Invitation dispatched to ${inviteEmail}`);
  };

  const columns: ColumnDef<StaffMember, any>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Staff Member",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-forest dark:text-white block">
              {row.original.name}
            </span>
            <span className="text-[11px] text-sage">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Assigned Role",
        cell: ({ row }) => (
          <span className="px-2.5 py-0.5 rounded-full bg-forest dark:bg-meadow text-white dark:text-forest text-[10px] font-bold">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-xs text-sage font-medium">{row.original.department}</span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <span className="text-xs text-sage tabular-nums">{row.original.startDate}</span>
        ),
      },
      ...(canViewCompensation
        ? [
            {
              accessorKey: "monthlySalary",
              header: "Base Salary",
              cell: ({ row }: any) => (
                <span className="font-bold tabular-nums text-forest dark:text-white">
                  {row.original.monthlySalary ? formatETB(row.original.monthlySalary) : "—"}
                </span>
              ),
            },
          ]
        : []),
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setMemberToSuspend(row.original);
              setIsSuspendModalOpen(true);
            }}
            className="p-1 text-xs font-bold text-stone-500 hover:text-rose-600 cursor-pointer"
          >
            {row.original.status === "ACTIVE" ? "Suspend" : "Reactivate"}
          </button>
        ),
      },
    ],
    [canViewCompensation]
  );

  // Permission Matrix Schema
  const permissionsList = [
    { key: "orders:pos", name: "Create & Tender POS Tickets" },
    { key: "kitchen:kds", name: "Kitchen KDS Bump & Expediting" },
    { key: "menu:manage", name: "Modify Menu & BOM Pricing" },
    { key: "inventory:manage", name: "Adjust Stock & Purchase Entry" },
    { key: "credit:manage", name: "Approve & Adjust Credit Limits" },
    { key: "staff:manage", name: "Invite & Terminate Staff Members" },
    { key: "reports:view", name: "View Financial & Salary Reports" },
    { key: "audit:view", name: "Inspect Immutable Audit Logs" },
  ];

  const roleMatrixData: Record<string, string[]> = {
    ADMINISTRATOR: permissionsList.map((p) => p.key),
    OWNER: permissionsList.map((p) => p.key),
    MANAGER: ["orders:pos", "kitchen:kds", "menu:manage", "inventory:manage", "credit:manage", "reports:view"],
    CASHIER: ["orders:pos", "kitchen:kds"],
    BARISTA: ["kitchen:kds"],
    KITCHEN_STAFF: ["kitchen:kds"],
    WAITER: ["orders:pos"],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Staff Directory & Role Authorization
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Role permission matrices, employee roster, and security suspension controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820]">
            {(["DIRECTORY", "MATRIX"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer ${
                  activeTab === tab
                    ? "bg-forest dark:bg-meadow text-white dark:text-forest"
                    : "text-sage"
                }`}
              >
                {tab === "DIRECTORY" ? "Team Roster" : "Permission Matrix"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsInviteDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold shadow-xs hover:bg-forest-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-meadow dark:text-forest" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {activeTab === "DIRECTORY" ? (
        <DataTable
          columns={columns}
          data={staffList}
          searchPlaceholder="Search staff member by name or email..."
          searchColumn="name"
          exportFileName="sable-cafe-staff"
          isLoading={isLoading}
        />
      ) : (
        /* Permission Matrix View */
        <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold font-display text-forest dark:text-white">
                Role Permission Assignment Matrix
              </h2>
              <p className="text-xs text-sage mt-0.5">
                Read-only reference (Pending dynamic IAM schema update per SRS Section 11).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18]">
                  <th className="p-3 font-bold text-sage">Capability / Permission</th>
                  {Object.keys(roleMatrixData).map((r) => (
                    <th key={r} className="p-3 font-bold text-center text-forest dark:text-white">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-[#283a2d]">
                {permissionsList.map((perm) => (
                  <tr key={perm.key} className="hover:bg-stone-50/50">
                    <td className="p-3 font-semibold text-forest dark:text-stone-200">
                      {perm.name}
                    </td>
                    {Object.entries(roleMatrixData).map(([roleName, perms]) => {
                      const hasPerm = perms.includes(perm.key);
                      return (
                        <td key={roleName} className="p-3 text-center">
                          {hasPerm ? (
                            <span className="inline-flex w-5 h-5 rounded-full bg-meadow-tint text-meadow-dark items-center justify-center font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-stone-300 dark:text-stone-700 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      <ConfirmDialog
        isOpen={isSuspendModalOpen}
        onClose={() => {
          setIsSuspendModalOpen(false);
          setMemberToSuspend(null);
        }}
        title={`Change Status for ${memberToSuspend?.name}`}
        description="Suspending a team member revokes active session JWT tokens and blocks POS and KDS access immediately. An audit justification is required."
        confirmLabel="Apply Status Change"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Disciplinary investigation / approved leave period..."
        minReasonLength={6}
        onConfirm={handleConfirmSuspend}
      />

      {/* Invite Member Drawer */}
      <SideDrawer
        isOpen={isInviteDrawerOpen}
        onClose={() => setIsInviteDrawerOpen(false)}
        title="Invite Team Member"
        subtitle="Provision email invitation and role credentials"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteDrawerOpen(false)}
              className="px-4 py-2 text-xs font-bold text-sage"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInviteStaff}
              className="px-4 py-2 text-xs font-bold bg-meadow text-white rounded-xl"
            >
              Send Staff Invite
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Full Legal Name</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Bethlehem Desta"
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d]"
            />
          </div>

          <div>
            <label className="block font-bold text-forest dark:text-white mb-1">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="b.desta@sablecafe.com"
              className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              >
                <option value="BARISTA">BARISTA</option>
                <option value="CASHIER">CASHIER</option>
                <option value="KITCHEN_STAFF">KITCHEN_STAFF</option>
                <option value="WAITER">WAITER</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-forest dark:text-white mb-1">Department</label>
              <select
                value={inviteDepartment}
                onChange={(e) => setInviteDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border dark:border-[#283a2d] font-bold"
              >
                <option value="Beverage">Beverage</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Service Floor">Service Floor</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
