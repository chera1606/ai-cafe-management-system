"use client";

import {
  CheckCircle2,
  Coffee,
  Edit,
  Key,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "ADMINISTRATOR" | "MANAGER" | "HEAD_BARISTA" | "KITCHEN_CHEF" | "CASHIER";
  station: "ALL" | "ESPRESSO_BAR" | "KITCHEN" | "CASHIER";
  status: "ON_SHIFT" | "OFF_DUTY" | "ON_BREAK";
  weeklyHours: number;
  phone: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "st-01",
    name: "Abebe Bikila",
    email: "admin@cafe.com",
    role: "ADMINISTRATOR",
    station: "ALL",
    status: "ON_SHIFT",
    weeklyHours: 38,
    phone: "+251 (91) 123-4567",
  },
  {
    id: "st-02",
    name: "Tadesse Gebre",
    email: "manager@cafe.com",
    role: "MANAGER",
    station: "ALL",
    status: "ON_SHIFT",
    weeklyHours: 42,
    phone: "+251 (91) 234-5678",
  },
  {
    id: "st-03",
    name: "Selamawit Kebede",
    email: "selam.k@cafe.com",
    role: "HEAD_BARISTA",
    station: "ESPRESSO_BAR",
    status: "ON_SHIFT",
    weeklyHours: 34,
    phone: "+251 (91) 345-6789",
  },
  {
    id: "st-04",
    name: "Dawit Wolde",
    email: "dawit.w@cafe.com",
    role: "KITCHEN_CHEF",
    station: "KITCHEN",
    status: "ON_SHIFT",
    weeklyHours: 40,
    phone: "+251 (91) 456-7890",
  },
  {
    id: "st-05",
    name: "Hanna Tesfaye",
    email: "hanna.t@cafe.com",
    role: "CASHIER",
    station: "CASHIER",
    status: "ON_BREAK",
    weeklyHours: 30,
    phone: "+251 (91) 567-8901",
  },
  {
    id: "st-06",
    name: "Yared Haile",
    email: "yared.h@cafe.com",
    role: "HEAD_BARISTA",
    station: "ESPRESSO_BAR",
    status: "OFF_DUTY",
    weeklyHours: 24,
    phone: "+251 (91) 678-9012",
  },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<StaffMember["role"]>("HEAD_BARISTA");
  const [newStation, setNewStation] = useState<StaffMember["station"]>("ESPRESSO_BAR");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember: StaffMember = {
      id: `st-${Date.now().toString(36)}`,
      name: newName,
      email: newEmail,
      phone: newPhone || "+251 (91) 000-0000",
      role: newRole,
      station: newStation,
      status: "OFF_DUTY",
      weeklyHours: 0,
    };

    setStaff([newMember, ...staff]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
  };

  const filteredStaff = staff.filter((m) => {
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.phone.includes(term);
    return matchesRole && matchesSearch;
  });

  const onShiftCount = staff.filter((s) => s.status === "ON_SHIFT").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              Team & Staff Management
            </h1>
            <p className="text-xs text-slate-500">
              Employee roster, operational roles, station dispatch assignments, and security permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add Team Member
          </Button>
        </div>
      </div>

      {/* KPI Roster Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Staff Members
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {staff.length}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Active employee profiles
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Currently On Shift
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {onShiftCount}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active on stations now
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Preparation Stations
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            3 Manned
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Espresso, Kitchen, POS
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Avg Shift Compliance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            98.5%
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Zero missed shifts this week
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="MANAGER">Manager</option>
            <option value="HEAD_BARISTA">Head Barista</option>
            <option value="KITCHEN_CHEF">Kitchen Chef</option>
            <option value="CASHIER">Cashier</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Team Member</th>
                <th className="py-3 px-4">Role & Access</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Weekly Hours</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Member Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          member.role === "ADMINISTRATOR"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : member.role === "MANAGER"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : member.role === "HEAD_BARISTA"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : member.role === "KITCHEN_CHEF"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{member.role.replace("_", " ")}</span>
                      </span>
                    </td>

                    {/* Station */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {member.station.replace("_", " ")}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {member.status === "ON_SHIFT" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          On Shift
                        </span>
                      ) : member.status === "ON_BREAK" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          On Break
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Off Duty
                        </span>
                      )}
                    </td>

                    {/* Hours */}
                    <td className="py-3.5 px-4 whitespace-nowrap tabular-nums text-slate-700">
                      {member.weeklyHours} hrs / wk
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 tabular-nums">
                      {member.phone}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Add Team Member
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a new staff login and station assignment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meron Bekele"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. meron@cafe.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+251 (91) 000-0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Role & Permissions
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="HEAD_BARISTA">Head Barista</option>
                    <option value="KITCHEN_CHEF">Kitchen Chef</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Primary Station
                  </label>
                  <select
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="ESPRESSO_BAR">Espresso Bar</option>
                    <option value="KITCHEN">Kitchen Hot Station</option>
                    <option value="CASHIER">Cashier Counter</option>
                    <option value="ALL">All Stations</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save & Invite Staff
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
