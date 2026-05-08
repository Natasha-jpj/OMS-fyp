"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DepartmentDetailPage from "./DepartmentDetailPage";
import AssignManagerModal from "./AssignManagerModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Building2, ShieldCheck,
  Clock, Activity, ChevronRight,
  X, Calendar, AlertCircle, CheckCircle, MinusCircle,
  ArrowDownCircle, LayoutDashboard, Settings,
  DollarSign, Send, MoreHorizontal, UserCheck,
  Briefcase, PieChart,
  UserPlus,
  Award, ListChecks, LogOut
} from "lucide-react";
// LeaveManagementSection import removed (unused)
import { SuperAdminProjects } from "./SuperAdminWidgets";
import { CreateDeptModal } from "./CreateDeptModal";
import { HireStaffModal } from "./HireStaffModal";
import { TaskKanban } from "../../manager/dashboard/TaskKanban";
import { ChatWindow } from "../../components/ChatWindow";
import { ChatConnectButton } from "../../components/ChatConnectButton";
import PayrollDashboard from "../payroll/components/PayrollDashboard";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Employee {
  id: string; name: string; email?: string; role?: string;
  position?: string; salary?: number;
  department?: { id: string; name: string };
  lastAudit?: string;
}
interface Department {
  id: string; name: string; head?: string; budget?: number; capacity?: number;
}
interface Project {
  description: string; id: string; name: string; status: string; departmentId?: string;
}
interface Broadcast { id: string; message: string; createdAt: string; }
interface LeaveRequest {
  id: string; title: string; status: string; startDate: string; endDate: string;
  employee?: { name: string; department?: { name: string } };
}
interface AuditLog {
  id: string; reason: string; oldSalary: number; newSalary: number; createdAt: string;
}
interface HrUser { id: string; name: string; email?: string; organization?: string; }
interface Props {
  initialDepts?: Department[]; existingEmployees?: Employee[];
  initialProjects?: Project[]; initialMessages?: unknown[]; hrUser?: HrUser | null;
}

const NAV = [
  { id: "Dashboard",    icon: LayoutDashboard },
  { id: "Organization", icon: Building2       },
  { id: "Workforce",    icon: Users           },
  { id: "Projects",     icon: Briefcase       },
  { id: "Payroll",      icon: DollarSign      },
  { id: "Leaves",       icon: Calendar        },
  { id: "Analytics",    icon: PieChart        },
];

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, px = 36 }: { name: string; px?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 bg-slate-200 text-black font-semibold"
      style={{ width: px, height: px, fontSize: px * 0.35 }}
    >
      {initials}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    MANAGER:  "bg-blue-100 text-blue-700",
    ADMIN:    "bg-purple-100 text-purple-700",
    EMPLOYEE: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${map[status] ?? map.EMPLOYEE}`}>
      {status}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, trend, trendUp = true, gold = false, onClick,
}: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode;
  trend?: string; trendUp?: boolean; gold?: boolean; onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all
        ${gold ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</p>
        {icon && <div className="text-black/60">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-black">{value}</p>
      {sub   && <p className="text-xs mt-1 text-slate-600">{sub}</p>}
      {trend && (
        <p className={`text-xs mt-2 font-medium ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
          {trend}
        </p>
      )}
    </motion.div>
  );
}

// ─── DEPT CARD ────────────────────────────────────────────────────────────────
function DeptCard({ dept, count, onClick }: { dept: Department; count: number; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="rounded-2xl border p-4 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center mb-3">
        <Building2 size={16} className="text-white" />
      </div>
      <p className="text-sm font-semibold text-black truncate">{dept.name}</p>
      <p className="text-xs text-slate-600 mt-0.5">{count} member{count !== 1 ? "s" : ""}</p>
    </motion.div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
// BarChart removed (unused)

// ─── BROADCAST WIDGET ─────────────────────────────────────────────────────────
function BroadcastWidget({
  broadcasts, input, onInput, onSubmit, isDateInRange, onClickDetail,
}: {
  broadcasts: Broadcast[]; input: string;
  onInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDateInRange?: (d: string) => boolean;
  onClickDetail?: () => void;
}) {
  const filtered = broadcasts.filter((b) => isDateInRange?.(b.createdAt) ?? true);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <h3 className="text-sm font-semibold mb-4 text-black">Broadcasts</h3>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => onInput(e.target.value)}
          placeholder="Send a broadcast…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-black text-white text-sm hover:bg-slate-900 transition-colors"
        >
          <Send size={13} />
        </button>
      </form>
      <div className="space-y-2">
        {filtered.slice(0, 4).map((b) => (
          <div key={b.id} className="text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
            {b.message}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── LEAVE WIDGET ─────────────────────────────────────────────────────────────
// LeaveWidget removed (unused)

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────
function MiniCalendar({ onClickDetail }: { onClickDetail?: () => void }) {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long", year: "numeric" });
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <h3 className="text-sm font-semibold mb-3 text-black">{month}</h3>
      <p className="text-4xl font-bold text-black">{now.getDate()}</p>
      <p className="text-xs text-slate-600 mt-1">
        {now.toLocaleString("default", { weekday: "long" })}
      </p>
    </motion.div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed({
  isDateInRange, onClickDetail,
}: {
  isDateInRange?: (date: string) => boolean;
  onClickDetail?: () => void;
}) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/hr/audit", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setActivities(d.audit?.slice(0, 5) || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredActivities = activities.filter((a) => isDateInRange?.(a.time) ?? true);

  const getIcon = (action: string) => {
    if (action?.includes("hire") || action?.includes("employee")) return <UserPlus size={13} />;
    if (action?.includes("leave")) return <Calendar size={13} />;
    if (action?.includes("payroll") || action?.includes("salary")) return <DollarSign size={13} />;
    if (action?.includes("department")) return <Building2 size={13} />;
    return <ShieldCheck size={13} />;
  };

  const getTimeAgo = (date: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <h3 className="text-sm font-semibold mb-4 text-black">Recent Activity</h3>
      {loading ? (
        <div className="text-xs text-slate-700 text-center py-4">Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-xs text-slate-700 text-center py-4">No activities yet</div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-200 text-black/70">
                {getIcon(a.action || "")}
              </div>
              <div className="flex-1">
                <p className="text-sm text-black capitalize">{a.action || "System event"}</p>
                <p className="text-[11px] text-slate-600">{getTimeAgo(a.time || new Date().toISOString())}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────
function TeamCard({ employees, onClickDetail }: { employees: Employee[]; onClickDetail?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black">Team Members</h3>
        <Award size={14} className="text-black/70" />
      </div>
      <div className="space-y-3">
        {employees.slice(0, 5).length === 0 ? (
          <p className="text-sm text-center py-4 text-slate-700">No employees yet</p>
        ) : (
          employees.slice(0, 5).map((emp) => (
            <div key={emp.id} className="flex items-center gap-3">
              <Avatar name={emp.name} px={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black">{emp.name}</p>
                <p className="text-xs truncate text-slate-700">{emp.department?.name || "Unassigned"}</p>
              </div>
              <Badge status={emp.role || "EMPLOYEE"} />
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── DATE RANGE FILTER ────────────────────────────────────────────────────────
function DateRangeFilter({
  startDate, endDate, onStartDateChange, onEndDateChange, onClear,
}: {
  startDate: string; endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onClear: () => void;
}) {
  const today = new Date();
  const oneWeekAgo  = new Date(today.getTime() - 7  * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const formatDate  = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="rounded-xl border p-3 bg-slate-50 border-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-black">Filter by Date</h3>
          <p className="text-[10px] text-slate-600">Dashboard data by date range</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "7d",    fn: () => { onStartDateChange(formatDate(oneWeekAgo));  onEndDateChange(formatDate(today)); } },
            { label: "30d",   fn: () => { onStartDateChange(formatDate(oneMonthAgo)); onEndDateChange(formatDate(today)); } },
            { label: "Month", fn: () => { onStartDateChange(formatDate(new Date(today.getFullYear(), today.getMonth(), 1))); onEndDateChange(formatDate(today)); } },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2 mt-2.5">
        <div className="flex-1 w-full md:w-auto">
          <input
            type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900"
          />
        </div>
        <div className="flex-1 w-full md:w-auto">
          <input
            type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={onClear}
            className="text-[10px] mt-2 md:mt-0 px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AuraFlowSuperAdmin({
  initialDepts = [], existingEmployees = [], initialProjects = [], hrUser,
}: Props) {
  // Leave Management Filters State
  const [leaveEmployeeFilter,   setLeaveEmployeeFilter]   = useState("");
  const [leaveDepartmentFilter, setLeaveDepartmentFilter] = useState("");
  const [leaveStatusFilter,     setLeaveStatusFilter]     = useState("");
  const [leaveSearchFilter,     setLeaveSearchFilter]     = useState("");

  const [activeTab,    setActiveTab]    = useState("Dashboard");
  // salaryMode state removed (unused after payroll integration)
  const [collapsed,    setCollapsed]    = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate,   setFilterEndDate]   = useState("");

  // Audit states
  const [showAuditModal,   setShowAuditModal]   = useState(false);
  const selectedAuditEmpState = useState<Employee | null>(null);
  const selectedAuditEmp = selectedAuditEmpState[0];
  const [auditLogs,        setAuditLogs]        = useState<AuditLog[]>([]);
  const [auditLoading,     setAuditLoading]     = useState(false);

  // Fiscal modal
  const [fiscalOpen,   setFiscalOpen]   = useState(false);
  const fiscalTargetState = useState<Employee | null>(null);
  const fiscalTarget = fiscalTargetState[0];
  const [baseline,     setBaseline]     = useState("85000");
  const [deduction,    setDeduction]    = useState("0");
  const [authNote,     setAuthNote]     = useState("Mission/Attendance Sync Discrepancy");
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [duration,     setDuration]     = useState("12 Months");

  // Data
  const [departments,     setDepartments]     = useState<Department[]>(initialDepts);
  const [employees,       setEmployees]       = useState<Employee[]>(existingEmployees);
  const [projects,        setProjects]        = useState<Project[]>(initialProjects || []);
  const [tasks,           setTasks]           = useState<any[]>([]);
  const [broadcasts,      setBroadcasts]      = useState<Broadcast[]>([]);
  const [broadcastInput,  setBroadcastInput]  = useState("");
  const [leaveStats,      setLeaveStats]      = useState({ pending: 0, approved: 0, rejected: 0 });
  const setSalaryAudits = useState<AuditLog[]>([])[1];
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveCurrentPage, setLeaveCurrentPage] = useState(1);
  const [leaveAbsenceDateFilter, setLeaveAbsenceDateFilter] = useState("");
  const [leaveItemsPerPage] = useState(10);

  // UI
  const [showCreateDept,        setShowCreateDept]        = useState(false);
  const [showHireStaff,         setShowHireStaff]         = useState(false);
  const [selectedDeptId,        setSelectedDeptId]        = useState<string | null>(null);
  const [selectedProjectDeptId, setSelectedProjectDeptId] = useState<string | null>(null);
  const [showAssignMgr,         setShowAssignMgr]         = useState(false);
  const [payrollSearch,         setPayrollSearch]         = useState("");
  const [currentUser,           setCurrentUser]           = useState<HrUser | null>(hrUser || null);
  const [chatOpen,              setChatOpen]              = useState(false);

  // Employee Detail Modal
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState<Employee | null>(null);
  const [showEmployeeDetail,   setShowEmployeeDetail]   = useState(false);

  const router = useRouter();

  // Derived values
  const organizationId = currentUser?.organization || currentUser?.id || "default";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("hr");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/choose-role");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const syncSystem = useCallback(async () => {
    try {
      const [dR, eR, pR, lR, sR, tR] = await Promise.all([
        fetch("/api/hr/departments",  { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/employees",    { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/projects",     { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/leave",        { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/audit/salary", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/tasks",        { credentials: "include" }).then((r) => r.json()),
      ]);
      if (dR.departments) setDepartments(dR.departments);
      if (eR.employees)   setEmployees(eR.employees);
      if (pR.projects)    setProjects(pR.projects);
      if (lR.leaveRequests) {
        const stats = { pending: 0, approved: 0, rejected: 0 };
        lR.leaveRequests.forEach((l: LeaveRequest) => {
          if      (l.status === "PENDING")  stats.pending++;
          else if (l.status === "APPROVED") stats.approved++;
          else if (l.status === "REJECTED") stats.rejected++;
        });
        setLeaveStats(stats);
        setAllLeaveRequests(lR.leaveRequests);
      }
      if (sR.audits) setSalaryAudits(sR.audits);
      if (tR.tasks || Array.isArray(tR)) setTasks(Array.isArray(tR) ? tR : tR.tasks || []);
    } catch {}
    }, [setSalaryAudits]);

  useEffect(() => { setEmployees(existingEmployees); }, [existingEmployees]);

  useEffect(() => {
    if (!hrUser) {
      fetch("/api/hr/profile", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setCurrentUser(d.user || { id: "", name: "User", email: "" }))
        .catch(() => setCurrentUser({ id: "", name: "User", email: "" }));
    } else {
      setCurrentUser(hrUser);
    }
  }, [hrUser]);

  useEffect(() => {
    if (showAuditModal && selectedAuditEmp) {
      setAuditLoading(true);
      fetch(`/api/hr/audit/salary?employeeId=${selectedAuditEmp.id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setAuditLogs(d.audits || []))
        .catch(() => setAuditLogs([]))
        .finally(() => setAuditLoading(false));
    }
  }, [showAuditModal, selectedAuditEmp]);

  useEffect(() => {
    fetch("/api/broadcasts?role=HR", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBroadcasts(d.broadcasts || []));
    syncSystem();
  }, [syncSystem]);

  const calcTotal = () => {
    const base = Number(baseline) || 0;
    const ded  = Number(deduction) || 0;
    if (!startDate || !endDate) return base - ded;
    const diff = Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
    return (base / 30) * diff - ded;
  };

  const handleFiscalAudit = () => {
    if (!fiscalTarget) return;
    const final = Number(baseline) - Number(deduction);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === fiscalTarget.id ? { ...e, salary: final, lastAudit: new Date().toLocaleDateString() } : e
      )
    );
    setFiscalOpen(false);
    setDeduction("0");
  };

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastInput.trim() || !currentUser?.id) return;
    await fetch("/api/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUser.id, senderRole: "HR", message: broadcastInput }),
    });
    setBroadcastInput("");
    fetch("/api/broadcasts?role=HR", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBroadcasts(d.broadcasts || []));
  }

  const isDateInRange = (dateStr: string) => {
    if (!dateStr || (!filterStartDate && !filterEndDate)) return true;
    const date = new Date(dateStr);
    if (filterStartDate && date < new Date(filterStartDate)) return false;
    if (filterEndDate   && date > new Date(filterEndDate))   return false;
    return true;
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(payrollSearch.toLowerCase()) ||
      (e.role || "").toLowerCase().includes(payrollSearch.toLowerCase())
  );

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  // ─── MODAL HELPER ───────────────────────────────────────────────────────────
  const ModalWrap = ({
    children, onClose, maxW = "max-w-4xl",
  }: {
    children: React.ReactNode; onClose: () => void; maxW?: string;
  }) => (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        className={`relative w-full ${maxW} rounded-xl shadow-2xl overflow-hidden border bg-white border-slate-300`}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-black to-transparent" />
        {children}
      </motion.div>
    </div>
  );

  const roleDistribution = React.useMemo(() => {
    if (!employees.length) return { employees: 0, managers: 0, admins: 0 };
    const empCount = employees.filter((e) => e.role === "EMPLOYEE").length || 1;
    const mgrCount = employees.filter((e) => e.role === "MANAGER").length || 1;
    const admCount = employees.filter((e) => e.role === "ADMIN").length    || 1;
    const total = empCount + mgrCount + admCount;
    return {
      employees: Math.round((empCount / total) * 100),
      managers:  Math.round((mgrCount / total) * 100),
      admins:    Math.round((admCount / total) * 100),
    };
  }, [employees]);

  const budgetMetrics = React.useMemo(() => {
    const monthlyPayroll = employees.length * 85000;
    const formattedBudget =
      monthlyPayroll >= 1_000_000
        ? `Rs. ${(monthlyPayroll / 1_000_000).toFixed(1)}M`
        : `Rs. ${(monthlyPayroll / 100_000).toFixed(1)}L`;
    const trend =
      employees.length > 10 ? "+8% growth" :
      employees.length > 5  ? "+5% growth" : "+2% growth";
    return { budget: formattedBudget, trend };
  }, [employees]);

  const dashboardAnalytics = React.useMemo(() => {
    const salaryValues = employees.map((e) => Number(e.salary) || 0).filter((salary) => salary > 0);
    const salarySum = salaryValues.reduce((acc, salary) => acc + salary, 0);
    const avgSalary = salaryValues.length ? Math.round(salarySum / salaryValues.length) : 0;
    const salaryStructuredCount = employees.filter((e) => Number(e.salary) > 0).length;
    const payrollReadyPct = employees.length ? Math.round((salaryStructuredCount / employees.length) * 100) : 0;

    const departmentLoads = departments
      .map((dept) => ({
        id: dept.id,
        name: dept.name,
        count: employees.filter((emp) => emp.department?.id === dept.id).length,
      }))
      .sort((a, b) => b.count - a.count);

    const topDepartment = departmentLoads[0] || { name: "N/A", count: 0 };
    const approvalRate = allLeaveRequests.length
      ? Math.round((allLeaveRequests.filter((leave) => leave.status === "APPROVED").length / allLeaveRequests.length) * 100)
      : 0;

    return {
      avgSalary,
      salaryStructuredCount,
      payrollReadyPct,
      departmentLoads: departmentLoads.slice(0, 5),
      topDepartment,
      approvalRate,
      pendingLeaves: leaveStats.pending,
    };
  }, [employees, departments, allLeaveRequests, leaveStats.pending]);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className={`relative z-20 flex-shrink-0 flex flex-col border-r transition-all duration-300
        ${collapsed ? "w-[60px]" : "w-[220px]"} bg-white border-gray-200`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-[18px] border-b border-slate-200 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
            <Activity size={16} className="text-white" />
          </div>
          {!collapsed && <span className="text-[15px] font-bold tracking-tight text-black">AuraFlow</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon }) => (
            <button
              key={id} onClick={() => setActiveTab(id)} title={collapsed ? id : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all pointer-events-auto
                ${collapsed ? "justify-center" : ""}
                ${activeTab === id
                  ? "bg-black text-white font-semibold"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"}`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && id}
            </button>
          ))}
        </nav>

        {/* Quick actions */}
        {!collapsed && (
          <div className="px-2 py-3 border-t border-slate-200">
            <p className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 text-slate-600">Quick Actions</p>
            {[
              { label: "Hire Staff",     icon: <UserPlus size={14} />,  fn: () => setShowHireStaff(true)  },
              { label: "New Department", icon: <Plus size={14} />,      fn: () => setShowCreateDept(true) },
              { label: "Assign Manager", icon: <UserCheck size={14} />, fn: () => setShowAssignMgr(true)  },
            ].map((a) => (
              <button
                key={a.label} onClick={a.fn}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-slate-700 hover:text-black hover:bg-slate-100"
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        )}

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-200">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Avatar name={currentUser?.name || "User"} px={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-black">{currentUser?.name || "User"}</p>
                <p className="text-[11px] truncate text-slate-700">{currentUser?.email || "HR Manager"}</p>
              </div>
              <button onClick={() => setCollapsed(true)} className="p-1 rounded-lg opacity-60 hover:bg-slate-100 transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={currentUser?.name || "User"} px={32} />
              <button onClick={() => setCollapsed(false)} className="p-1 rounded-lg opacity-60 hover:bg-slate-100 transition-colors">
                <ChevronRight size={13} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 border-b px-6 py-3 flex items-center justify-between bg-white border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700">HR Portal</span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-sm font-semibold text-black">{activeTab}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative hidden lg:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
              <input
                placeholder="Search…"
                className="pl-8 pr-4 py-2 text-sm border rounded-xl outline-none w-44 bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors"
              />
            </div>
            <ChatConnectButton onClick={() => setChatOpen(true)} isActive={chatOpen} />
            <button
              onClick={handleLogout} title="Logout"
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100"
            >
              <LogOut size={15} strokeWidth={2.5} className="text-slate-600" />
            </button>
            <button className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
              <Settings size={15} strokeWidth={2.5} className="text-slate-600" />
            </button>
            <Avatar name={currentUser?.name || "User"} px={36} />
          </div>
        </header>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ────────────────────────────────────────── */}
            {activeTab === "Dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* ── Header ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">{greet()}, {currentUser?.name?.split(" ")[0] || "User"}</h2>
                    <p className="text-sm mt-0.5 text-slate-600">
                      {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowHireStaff(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                      <UserPlus size={14} /> Hire Staff
                    </button>
                    <button onClick={() => setShowCreateDept(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100">
                      <Building2 size={14} /> New Dept
                    </button>
                  </div>
                </div>

                {/* ── Date Filter ── */}
                <DateRangeFilter
                  startDate={filterStartDate} endDate={filterEndDate}
                  onStartDateChange={setFilterStartDate} onEndDateChange={setFilterEndDate}
                  onClear={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                />

                {/* ── Row 1: KPI Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Employees" value={employees.length}                                     sub="Across all departments" icon={<Users size={15} />}      trend="+2 this month"   onClick={() => setActiveTab("Workforce")}    />
                  <StatCard label="Departments"      value={departments.length}                                  sub="Active units"           icon={<Building2 size={15} />}                           onClick={() => setActiveTab("Organization")} />
                  <StatCard label="Active Projects"  value={projects.filter((p) => p.status !== "DONE").length} sub="In progress"            icon={<Briefcase size={15} />}  trend="3 due this week" trendUp={false} onClick={() => setActiveTab("Projects")} />
                  <StatCard label="Budget Ledger"    value={budgetMetrics.budget}                                sub="Monthly payroll"        icon={<DollarSign size={15} />} gold trend={budgetMetrics.trend} onClick={() => setActiveTab("Payroll")} />
                </div>

                {/* ── Analytics Snapshot ── */}
                <div
                  onClick={() => setActiveTab("Analytics")}
                  className="rounded-2xl border p-5 bg-slate-50 border-slate-200 space-y-5 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-sm font-semibold text-black">Analytics Snapshot</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Fast operational view of payroll, people, and leave health</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("Analytics");
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-black transition-colors"
                    >
                      Open full analytics →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Payroll"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avg Salary</p>
                      <p className="mt-2 text-2xl font-bold text-black">NPR {dashboardAnalytics.avgSalary.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-500 mt-1">Employees with salary set: {dashboardAnalytics.salaryStructuredCount}</p>
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Payroll"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll Ready</p>
                      <p className="mt-2 text-2xl font-bold text-black">{dashboardAnalytics.payrollReadyPct}%</p>
                      <p className="text-xs text-slate-500 mt-1">Employees prepared for payroll processing</p>
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Leaves"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Leave Approval</p>
                      <p className="mt-2 text-2xl font-bold text-black">{dashboardAnalytics.approvalRate}%</p>
                      <p className="text-xs text-slate-500 mt-1">Approved out of total leave requests</p>
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Organization"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Top Department</p>
                      <p className="mt-2 text-2xl font-bold text-black truncate">{dashboardAnalytics.topDepartment.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{dashboardAnalytics.topDepartment.count} employees</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Organization"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-black">Department Load</p>
                          <p className="text-xs text-slate-500">Top five teams by headcount</p>
                        </div>
                        <span className="text-xs text-slate-500">Live</span>
                      </div>
                      <div className="space-y-3">
                        {dashboardAnalytics.departmentLoads.length === 0 ? (
                          <div className="py-6 text-center text-sm text-slate-500">No departments yet</div>
                        ) : (
                          dashboardAnalytics.departmentLoads.map((dept) => {
                            const maxCount = Math.max(...dashboardAnalytics.departmentLoads.map((item) => item.count), 1);
                            const pct = Math.max((dept.count / maxCount) * 100, 4);
                            return (
                              <div key={dept.id}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-600 truncate">{dept.name}</span>
                                  <span className="text-xs font-semibold text-black">{dept.count}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div onClick={(e) => { e.stopPropagation(); setActiveTab("Leaves"); }} className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-black">Operational Notes</p>
                          <p className="text-xs text-slate-500">Quick reading for HR review</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Pending leaves</span>
                          <span className="font-semibold text-amber-600">{dashboardAnalytics.pendingLeaves}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Payroll module</span>
                          <span className="font-semibold text-emerald-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Current focus</span>
                          <span className="font-semibold text-slate-900">Salary processing</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Recommended action</span>
                          <span className="font-semibold text-blue-600">Review payroll records</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Row 2: Broadcasts (left) + Analytics charts (right) ── */}
                <div className="grid grid-cols-12 gap-4">

                  {/* Broadcast — left col */}
                  <div className="col-span-12 lg:col-span-4">
                    <BroadcastWidget broadcasts={broadcasts} input={broadcastInput} onInput={setBroadcastInput} onSubmit={handleBroadcast} isDateInRange={isDateInRange} onClickDetail={() => {}} />
                  </div>

                  {/* Leave Donut — single, clean */}
                  <div className="col-span-12 lg:col-span-3">
                    <motion.div whileHover={{ y: -2 }} onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all h-full">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-black">Leave Status</h3>
                        {leaveStats.pending > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{leaveStats.pending} pending</span>
                        )}
                      </div>
                      {(() => {
                        const total = Math.max(leaveStats.pending + leaveStats.approved + leaveStats.rejected, 1);
                        const r = 40; const cx = 52; const cy = 52; const circ = 2 * Math.PI * r;
                        const slices = [
                          { val: leaveStats.approved, color: "#10b981", label: "Approved" },
                          { val: leaveStats.pending,  color: "#f59e0b", label: "Pending"  },
                          { val: leaveStats.rejected, color: "#ef4444", label: "Rejected" },
                        ];
                        let off = 0;
                        return (
                          <div className="flex flex-col items-center gap-3">
                            <svg width="104" height="104" viewBox="0 0 104 104">
                              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
                              {slices.map((s, i) => {
                                const dash = (s.val / total) * circ; const gap = circ - dash;
                                const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14"
                                  strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off}
                                  style={{ transform: "rotate(-90deg)", transformOrigin: "52px 52px" }} />;
                                off += dash; return el;
                              })}
                              <text x={cx} y={cy - 4}  textAnchor="middle" style={{ fontSize: 15, fontWeight: 700, fill: "#000" }}>{total - 1 || 0}</text>
                              <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 7, fill: "#64748b", fontWeight: 600 }}>TOTAL</text>
                            </svg>
                            <div className="w-full space-y-1.5">
                              {slices.map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                    <span className="text-xs text-slate-600">{s.label}</span>
                                  </div>
                                  <span className="text-xs font-bold text-black">{s.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </div>

                  {/* Leave 6-month trend line */}
                  <div className="col-span-12 lg:col-span-3">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 hover:shadow-md transition-all cursor-pointer h-full" onClick={() => setActiveTab("Leaves")}>
                      <h3 className="text-sm font-semibold mb-1 text-black">Leave Trend</h3>
                      <p className="text-xs text-slate-500 mb-3">Monthly requests (6 mo.)</p>
                      {(() => {
                        const now = new Date();
                        const months = Array.from({ length: 6 }, (_, i) => {
                          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                          return { label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
                        });
                        const counts = months.map(m => allLeaveRequests.filter(l => {
                          const d = new Date(l.startDate);
                          return d.getMonth() === m.month && d.getFullYear() === m.year;
                        }).length);
                        const maxC = Math.max(...counts, 1);
                        const W = 200; const H = 70; const pad = 8;
                        const pts = counts.map((c, i) => [
                          pad + (i / Math.max(counts.length - 1, 1)) * (W - pad * 2),
                          H - pad - (c / maxC) * (H - pad * 2),
                        ]);
                        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
                        const areaD = `${pathD} L${pts[pts.length-1][0].toFixed(1)},${(H-pad).toFixed(1)} L${pts[0][0].toFixed(1)},${(H-pad).toFixed(1)} Z`;
                        return (
                          <div>
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                              <defs>
                                <linearGradient id="ltGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.1" />
                                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path d={areaD} fill="url(#ltGrad)" />
                              <path d={pathD} fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="white" stroke="#1e293b" strokeWidth="1.5" />)}
                            </svg>
                            <div className="flex justify-between mt-1">
                              {months.map((m, i) => (
                                <div key={i} className="flex flex-col items-center">
                                  <span className="text-[8px] text-slate-500">{m.label}</span>
                                  <span className="text-[8px] font-bold text-black">{counts[i]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="col-span-12 lg:col-span-2">
                    <MiniCalendar onClickDetail={() => {}} />
                  </div>
                </div>

                {/* ── Row 3: Headcount bar chart (wide) + Role split + Activity ── */}
                <div className="grid grid-cols-12 gap-4">

                  {/* Headcount by dept — vertical bar chart */}
                  <div className="col-span-12 lg:col-span-5">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 hover:shadow-md transition-all cursor-pointer h-full" onClick={() => setActiveTab("Organization")}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-black">Headcount by Department</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Staff distribution across teams</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab("Organization"); }} className="text-[10px] text-slate-500 hover:text-black transition-colors">View all →</button>
                      </div>
                      {(() => {
                        const data = departments.map(d => ({
                          name: d.name.length > 9 ? d.name.slice(0, 9) + "…" : d.name,
                          count: employees.filter(e => e.department?.id === d.id).length,
                        })).slice(0, 7);
                        const maxVal = Math.max(...data.map(d => d.count), 1);
                        return data.length === 0 ? (
                          <div className="flex items-center justify-center h-28 text-sm text-slate-400 italic">No departments yet</div>
                        ) : (
                          <div className="flex items-end gap-3 h-28">
                            {data.map((d, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                <span className="text-[9px] font-bold text-black group-hover:text-blue-600 transition-colors">{d.count}</span>
                                <div className="w-full rounded-t-md bg-slate-300 group-hover:bg-black transition-colors duration-200"
                                  style={{ height: `${Math.max((d.count / maxVal) * 80, 4)}px` }} />
                                <span className="text-[8px] text-slate-500 text-center leading-tight mt-0.5">{d.name}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Role Distribution — progress bars */}
                  <div className="col-span-12 lg:col-span-3">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 hover:shadow-md transition-all cursor-pointer h-full" onClick={() => setActiveTab("Workforce")}>
                      <h3 className="text-sm font-semibold mb-1 text-black">Role Split</h3>
                      <p className="text-xs text-slate-500 mb-5">Workforce composition</p>
                      <div className="space-y-4">
                        {[
                          { label: "Employees", count: employees.filter(e => e.role === "EMPLOYEE").length, pct: roleDistribution.employees, color: "bg-slate-800"    },
                          { label: "Managers",  count: employees.filter(e => e.role === "MANAGER").length,  pct: roleDistribution.managers,  color: "bg-blue-600"    },
                          { label: "Admins",    count: employees.filter(e => e.role === "ADMIN").length,    pct: roleDistribution.admins,    color: "bg-emerald-500" },
                        ].map((r) => (
                          <div key={r.label}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs text-slate-700">{r.label}</span>
                              <span className="text-xs font-bold text-black">{r.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${r.color}`} style={{ width: `${Math.max(r.pct, 2)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Total</span>
                        <span className="text-base font-bold text-black">{employees.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="col-span-12 lg:col-span-4">
                    <ActivityFeed isDateInRange={isDateInRange} onClickDetail={() => {}} />
                  </div>
                </div>

                {/* ── Row 4: Team members + Departments ── */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-4">
                    <TeamCard employees={employees} onClickDetail={() => setActiveTab("Workforce")} />
                  </div>
                  <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all h-full" onClick={() => setActiveTab("Organization")}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-black">Departments</h3>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab("Organization"); }} className="text-xs flex items-center gap-1 text-slate-600 hover:text-black transition-colors">
                          View all <ChevronRight size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {departments.slice(0, 6).map((d) => (
                          <DeptCard key={d.id} dept={d} count={employees.filter((e) => e.department?.id === d.id).length}
                            onClick={() => { setSelectedDeptId(d.id); setActiveTab("Organization"); }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Projects ── */}
                <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("Projects")}>
                  <h3 className="text-sm font-semibold mb-4 text-black">Strategic Mission Board</h3>
                  <SuperAdminProjects projects={projects} />
                </div>

              </motion.div>
            )}

            {/* ── ANALYTICS ────────────────────────────────────────── */}
            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Analytics & Insights</h2>
                    <p className="text-sm mt-0.5 text-slate-600">Real-time workforce and leave intelligence</p>
                  </div>
                  <button
                    onClick={syncSystem}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100"
                  >
                    <Activity size={14} /> Refresh Data
                  </button>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Workforce"  value={employees.length}        icon={<Users size={15} />}      sub="Active headcount"       trend="+2 this month"  onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="Leave Approval Rate" value={`${allLeaveRequests.length ? Math.round((allLeaveRequests.filter(l => l.status === "APPROVED").length / allLeaveRequests.length) * 100) : 0}%`} icon={<CheckCircle size={15} />} sub="Of all requests" trend="Approval efficiency" onClick={() => setActiveTab("Leaves")} />
                  <StatCard label="Pending Leaves"   value={leaveStats.pending}      icon={<Clock size={15} />}      sub="Awaiting action"         trendUp={false} trend={leaveStats.pending > 3 ? "Needs attention" : "Under control"} onClick={() => setActiveTab("Leaves")} />
                  <StatCard label="Dept Coverage"    value={`${Math.round((departments.length / Math.max(employees.length, 1)) * 100)}%`} icon={<Building2 size={15} />} sub={`${departments.length} departments`} trend="Org structure" onClick={() => setActiveTab("Organization")} />
                </div>

                {/* Leave Analytics + Donut Chart */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Leave Status Donut */}
                  <div className="col-span-12 lg:col-span-4">
                    <div
                      onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 h-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-1 text-black">Leave Status Breakdown</h3>
                      <p className="text-xs text-slate-500 mb-4">All-time distribution</p>
                      {(() => {
                        const total = allLeaveRequests.length || 1;
                        const pending  = allLeaveRequests.filter(l => l.status === "PENDING").length;
                        const approved = allLeaveRequests.filter(l => l.status === "APPROVED").length;
                        const rejected = allLeaveRequests.filter(l => l.status === "REJECTED").length;
                        const r = 54; const cx = 80; const cy = 80;
                        const circ = 2 * Math.PI * r;
                        const slices = [
                          { val: approved, color: "#10b981", label: "Approved" },
                          { val: pending,  color: "#f59e0b", label: "Pending"  },
                          { val: rejected, color: "#ef4444", label: "Rejected" },
                        ];
                        let offset = 0;
                        return (
                          <div className="flex flex-col items-center gap-4">
                            <svg width="160" height="160" viewBox="0 0 160 160">
                              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="20" />
                              {slices.map((s, i) => {
                                const pct  = s.val / total;
                                const dash = pct * circ;
                                const gap  = circ - dash;
                                const el = (
                                  <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                                    stroke={s.color} strokeWidth="20"
                                    strokeDasharray={`${dash} ${gap}`}
                                    strokeDashoffset={-offset}
                                    style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px", transition: "stroke-dasharray 0.6s ease" }}
                                  />
                                );
                                offset += dash;
                                return el;
                              })}
                              <text x={cx} y={cy - 6}  textAnchor="middle" className="text-black" style={{ fontSize: 22, fontWeight: 700, fill: "#000" }}>{total}</text>
                              <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 9, fill: "#64748b", fontWeight: 600, letterSpacing: 1 }}>TOTAL</text>
                            </svg>
                            <div className="w-full space-y-2">
                              {slices.map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                    <span className="text-xs text-slate-700">{s.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-black">{s.val}</span>
                                    <span className="text-[10px] text-slate-500">({total > 0 ? Math.round((s.val/total)*100) : 0}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Leave by Department Bar Chart */}
                  <div className="col-span-12 lg:col-span-8">
                    <div
                      onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 h-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-1 text-black">Leave Requests by Department</h3>
                      <p className="text-xs text-slate-500 mb-5">Pending · Approved · Rejected</p>
                      {(() => {
                        const deptData = departments.map(d => {
                          const deptEmps = employees.filter(e => e.department?.id === d.id).map(e => e.name);
                          const deptLeaves = allLeaveRequests.filter(l => deptEmps.includes(l.employee?.name || ""));
                          return {
                            name: d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name,
                            pending:  deptLeaves.filter(l => l.status === "PENDING").length,
                            approved: deptLeaves.filter(l => l.status === "APPROVED").length,
                            rejected: deptLeaves.filter(l => l.status === "REJECTED").length,
                          };
                        });
                        const maxVal = Math.max(...deptData.flatMap(d => [d.pending + d.approved + d.rejected]), 1);
                        const barH = 120;
                        return deptData.length === 0 ? (
                          <div className="flex items-center justify-center h-32 text-sm text-slate-500">No department data</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <div className="flex items-end gap-4 min-w-0 h-36 pb-6 px-2">
                              {deptData.map((d, i) => {
                                const total = d.pending + d.approved + d.rejected;
                                const totalH = (total / maxVal) * barH;
                                const approvedH = (d.approved / Math.max(total, 1)) * totalH;
                                const pendingH  = (d.pending  / Math.max(total, 1)) * totalH;
                                const rejectedH = (d.rejected / Math.max(total, 1)) * totalH;
                                return (
                                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
                                    <span className="text-[10px] font-bold text-black mb-1">{total > 0 ? total : ""}</span>
                                    <div className="w-full flex flex-col-reverse rounded-t-md overflow-hidden" style={{ height: Math.max(totalH, 4) }}>
                                      <div style={{ height: approvedH, backgroundColor: "#10b981" }} title={`Approved: ${d.approved}`} />
                                      <div style={{ height: pendingH,  backgroundColor: "#f59e0b" }} title={`Pending: ${d.pending}`} />
                                      <div style={{ height: rejectedH, backgroundColor: "#ef4444" }} title={`Rejected: ${d.rejected}`} />
                                    </div>
                                    <span className="text-[9px] text-slate-600 text-center mt-1 leading-tight">{d.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex gap-4 pt-2 border-t border-slate-200 mt-1">
                              {[["#10b981","Approved"],["#f59e0b","Pending"],["#ef4444","Rejected"]].map(([c,l]) => (
                                <div key={l} className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                                  <span className="text-[10px] text-slate-600">{l}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Role Distribution + Dept Headcount + Leave Monthly Trend */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Role Distribution Bars */}
                  <div className="col-span-12 lg:col-span-4">
                    <div
                      onClick={() => setActiveTab("Workforce")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 h-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-1 text-black">Role Distribution</h3>
                      <p className="text-xs text-slate-500 mb-5">Workforce breakdown by role</p>
                      <div className="space-y-4">
                        {[
                          { label: "Employees", count: employees.filter((e) => e.role === "EMPLOYEE").length, pct: roleDistribution.employees, color: "bg-slate-800" },
                          { label: "Managers",  count: employees.filter((e) => e.role === "MANAGER").length,  pct: roleDistribution.managers,  color: "bg-blue-600"  },
                          { label: "Admins",    count: employees.filter((e) => e.role === "ADMIN").length,    pct: roleDistribution.admins,    color: "bg-emerald-500" },
                        ].map((r) => (
                          <div key={r.label}>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs font-medium text-black">{r.label}</span>
                              <span className="text-xs font-bold text-slate-700">{r.count} <span className="font-normal text-slate-500">({r.pct}%)</span></span>
                            </div>
                            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${r.color}`} style={{ width: `${Math.max(r.pct, 2)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Total Workforce</span>
                          <span className="text-lg font-bold text-black">{employees.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department Headcount horizontal bars */}
                  <div className="col-span-12 lg:col-span-4">
                    <div
                      onClick={() => setActiveTab("Organization")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 h-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-1 text-black">Headcount by Department</h3>
                      <p className="text-xs text-slate-500 mb-5">Employee distribution</p>
                      <div className="space-y-3">
                        {departments.slice(0, 6).map((d, i) => {
                          const count = employees.filter(e => e.department?.id === d.id).length;
                          const pct   = employees.length ? Math.round((count / employees.length) * 100) : 0;
                          const colors = ["bg-slate-800","bg-blue-600","bg-emerald-500","bg-amber-500","bg-purple-500","bg-rose-500"];
                          return (
                            <div key={d.id}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-black truncate max-w-[120px]">{d.name}</span>
                                <span className="text-xs font-bold text-slate-700">{count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        {departments.length === 0 && <div className="text-xs text-slate-500 text-center py-6">No departments yet</div>}
                      </div>
                    </div>
                  </div>

                  {/* Leave Monthly Trend Line Chart */}
                  <div className="col-span-12 lg:col-span-4">
                    <div
                      onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 h-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-1 text-black">Leave Monthly Trend</h3>
                      <p className="text-xs text-slate-500 mb-4">Requests over last 6 months</p>
                      {(() => {
                        const now = new Date();
                        const months = Array.from({ length: 6 }, (_, i) => {
                          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                          return { label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
                        });
                        const counts = months.map(m =>
                          allLeaveRequests.filter(l => {
                            const d = new Date(l.startDate);
                            return d.getMonth() === m.month && d.getFullYear() === m.year;
                          }).length
                        );
                        const maxC = Math.max(...counts, 1);
                        const W = 220; const H = 80; const pad = 10;
                        const pts = counts.map((c, i) => {
                          const x = pad + (i / (counts.length - 1)) * (W - pad * 2);
                          const y = H - pad - (c / maxC) * (H - pad * 2);
                          return [x, y];
                        });
                        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
                        const areaD = `${pathD} L${pts[pts.length-1][0].toFixed(1)},${(H-pad).toFixed(1)} L${pts[0][0].toFixed(1)},${(H-pad).toFixed(1)} Z`;
                        return (
                          <div>
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                              <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.15" />
                                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path d={areaD} fill="url(#lineGrad)" />
                              <path d={pathD} fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, i) => (
                                <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#1e293b" />
                              ))}
                            </svg>
                            <div className="flex justify-between mt-2">
                              {months.map((m, i) => (
                                <div key={i} className="flex flex-col items-center">
                                  <span className="text-[9px] text-slate-500">{m.label}</span>
                                  <span className="text-[9px] font-bold text-black">{counts[i]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Leave Type Table + Activity */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Recent Leave Requests Summary */}
                  <div className="col-span-12 lg:col-span-8">
                    <div
                      onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border bg-slate-50 border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between p-5 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-black">Recent Leave Requests</h3>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab("Leaves"); }} className="text-xs flex items-center gap-1 text-slate-600 hover:text-black transition-colors">
                          View all <ChevronRight size={12} />
                        </button>
                      </div>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-white">
                            {["Employee","Department","Period","Status"].map(h => (
                              <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {allLeaveRequests.slice(0, 6).map((req) => (
                            <tr key={req.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                              <td className="px-5 py-3 text-sm font-medium text-black">{req.employee?.name || "—"}</td>
                              <td className="px-5 py-3 text-xs text-slate-600">{req.employee?.department?.name || "Unassigned"}</td>
                              <td className="px-5 py-3 text-xs text-slate-600">
                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                                  ${req.status === "PENDING" ? "bg-amber-100 text-amber-700" : req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {allLeaveRequests.length === 0 && (
                            <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No leave requests found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Stats Panel */}
                  <div className="col-span-12 lg:col-span-4 space-y-3">
                    <div
                      onClick={() => setActiveTab("Workforce")}
                      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all"
                    >
                      <h3 className="text-sm font-semibold mb-4 text-black">Workforce Metrics</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Manager Ratio",     value: `1 : ${Math.max(1, Math.round(employees.filter(e=>e.role==="EMPLOYEE").length / Math.max(employees.filter(e=>e.role==="MANAGER").length,1)))}` },
                          { label: "Avg per Dept",      value: departments.length ? Math.round(employees.length / departments.length) : 0 },
                          { label: "Leave Rate",        value: `${employees.length ? Math.round((allLeaveRequests.filter(l=>l.status==="APPROVED").length / Math.max(employees.length,1)) * 100) : 0}%` },
                          { label: "Total Leave Days",  value: allLeaveRequests.filter(l=>l.status==="APPROVED").reduce((acc, l) => {
                            const diff = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;
                            return acc + diff;
                          }, 0) },
                        ].map((m) => (
                          <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <span className="text-xs text-slate-600">{m.label}</span>
                            <span className="text-sm font-bold text-black">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      onClick={() => setActiveTab("Leaves")}
                      className="rounded-2xl border p-5 bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={14} className="text-amber-600" />
                        <h3 className="text-sm font-semibold text-amber-800">Action Required</h3>
                      </div>
                      <p className="text-2xl font-bold text-amber-900 mb-1">{leaveStats.pending}</p>
                      <p className="text-xs text-amber-700">Leave requests pending your review</p>
                      <button
                        onClick={() => setActiveTab("Leaves")}
                        className="mt-3 w-full py-2 rounded-lg text-xs font-semibold bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors"
                      >
                        Review Now →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ORGANIZATION ─────────────────────────────────────── */}
            {activeTab === "Organization" && (
              <motion.div key="org" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {!selectedDeptId ? (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-black">Organization</h2>
                        <p className="text-sm mt-0.5 text-slate-700">{departments.length} departments · {employees.length} employees</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setShowAssignMgr(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100"
                        >
                          <UserCheck size={14} /> Assign Manager
                        </button>
                        <button
                          onClick={() => setShowCreateDept(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900"
                        >
                          <Plus size={14} /> New Department
                        </button>
                      </div>
                    </div>
                    <AssignManagerModal
                      open={showAssignMgr}
                      onClose={() => setShowAssignMgr(false)}
                      employees={employees}
                      departments={departments}
                      onAssign={async (managerId: string, departmentIds: string[]) => {
                        await fetch("/api/hr/manager/assign", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ managerId, departmentIds }),
                        });
                        setShowAssignMgr(false);
                        await syncSystem();
                      }}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {departments.map((d) => (
                        <DeptCard key={d.id} dept={d} count={employees.filter((e) => e.department?.id === d.id).length} onClick={() => setSelectedDeptId(d.id)} />
                      ))}
                    </div>
                  </>
                ) : (() => {
                  const dept     = departments.find((d) => d.id === selectedDeptId);
                  const deptEmps = employees.filter((e) => e.department?.id === selectedDeptId);
                  return (
                    <DepartmentDetailPage
                      department={{ id: dept!.id, name: dept!.name, head: dept?.head || "" }}
                      employees={deptEmps}
                      allDepartments={departments}
                      onBack={() => setSelectedDeptId(null)}
                      onShiftEmployee={async (empId, newDeptId, newRole) => {
                        await fetch("/api/hr/employee/shift", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ employeeId: empId, departmentId: newDeptId, role: newRole }),
                        });
                        await syncSystem();
                      }}
                    />
                  );
                })()}
              </motion.div>
            )}

            {/* ── WORKFORCE ────────────────────────────────────────── */}
            {activeTab === "Workforce" && (
              <motion.div key="wf" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-black">Workforce</h2>
                    <p className="text-sm mt-0.5 text-slate-700">{employees.length} team members</p>
                  </div>
                  <button
                    onClick={() => setShowHireStaff(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900"
                  >
                    <UserPlus size={14} /> Hire Staff
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Full-time"      value={employees.filter((e) => e.role !== "MANAGER").length} icon={<Users size={15} />}     onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="Managers"       value={employees.filter((e) => e.role === "MANAGER").length} icon={<UserCheck size={15} />}  onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="New this month" value={2}                                                    icon={<UserPlus size={15} />}   trend="+2 hired" onClick={() => setActiveTab("Workforce")} />
                </div>
                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <div className="p-4 border-b flex items-center gap-4 border-slate-200">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                      <input
                        placeholder="Search employees…" value={payrollSearch} onChange={(e) => setPayrollSearch(e.target.value)}
                        className="pl-8 pr-4 py-2 text-sm border rounded-xl outline-none w-full bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors"
                      />
                    </div>
                    <span className="text-xs text-slate-700">{filtered.length} results</span>
                  </div>
                  <div>
                    {filtered.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-all border-slate-200 hover:bg-slate-100 cursor-pointer group"
                        onClick={() => { setSelectedEmployeeInfo(emp); setShowEmployeeDetail(true); }}
                      >
                        <Avatar name={emp.name} px={36} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black group-hover:text-blue-600 transition-colors">{emp.name}</p>
                          <p className="text-xs text-slate-700">{emp.position || emp.role || "Staff"}</p>
                        </div>
                        <div className="text-xs w-28 truncate text-slate-700">{emp.department?.name || "Unassigned"}</div>
                        <Badge status={emp.role || "EMPLOYEE"} />
                        <button className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 text-slate-700"><MoreHorizontal size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PROJECTS ──────────────────────────────────────────── */}
            {activeTab === "Projects" && (
              <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {!selectedProjectDeptId ? (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-black">Projects & Tasks</h2>
                        <p className="text-sm mt-0.5 text-slate-700">{projects.length} projects · {tasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black">Projects by Department</h3>
                      {departments.length === 0 ? (
                        <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 border-slate-200">
                          <Briefcase size={32} className="text-slate-400" />
                          <p className="text-sm text-slate-700">No departments yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {departments.map((dept) => {
                            const deptProjects    = projects.filter((p) => p.departmentId === dept.id);
                            const deptTasks       = tasks.filter((t) => t.departmentId === dept.id);
                            const planningCount   = deptProjects.filter((p) => p.status === "PLANNING").length;
                            const inProgressCount = deptProjects.filter((p) => p.status === "IN_PROGRESS").length;
                            const completedCount  = deptProjects.filter((p) => p.status === "COMPLETED").length;
                            return (
                              <motion.div
                                key={dept.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedProjectDeptId(dept.id)}
                                className="rounded-2xl border p-5 bg-slate-50 border-slate-200 hover:border-slate-400 transition-all cursor-pointer hover:shadow-md"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-black">{dept.name}</h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                      {deptProjects.length} project{deptProjects.length !== 1 ? "s" : ""} • {deptTasks.length} task{deptTasks.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
                                    <Briefcase size={14} className="text-black" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{planningCount}</p>
                                    <p className="text-[10px] text-slate-600">Planning</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
                                    <p className="text-[10px] text-slate-600">Active</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                                    <p className="text-[10px] text-slate-600">Done</p>
                                  </div>
                                </div>
                                {deptProjects.length > 0 && (
                                  <div className="space-y-2 pt-3 border-t border-slate-200">
                                    {deptProjects.slice(0, 3).map((proj) => (
                                      <div key={proj.id} className="text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-slate-700 font-medium truncate">{proj.name}</span>
                                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                            ${proj.status === "COMPLETED"  ? "bg-emerald-100 text-emerald-700" :
                                              proj.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700"    :
                                              "bg-blue-100 text-blue-700"}`}>
                                            {proj.status.replace("_", " ")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    {deptProjects.length > 3 && (
                                      <p className="text-[11px] text-slate-500 pt-2">+{deptProjects.length - 3} more</p>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (() => {
                  const dept        = departments.find((d) => d.id === selectedProjectDeptId);
                  const deptProjects = projects.filter((p) => p.departmentId === selectedProjectDeptId);
                  const deptTasks   = tasks.filter((t) => t.departmentId === selectedProjectDeptId);
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedProjectDeptId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <ChevronRight size={18} className="text-black rotate-180" />
                          </button>
                          <div>
                            <h2 className="text-xl font-bold text-black">{dept?.name}</h2>
                            <p className="text-sm mt-0.5 text-slate-700">
                              {deptProjects.length} project{deptProjects.length !== 1 ? "s" : ""} • {deptTasks.length} task{deptTasks.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      {deptProjects.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-black">Projects</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {deptProjects.map((proj) => (
                              <div key={proj.id} className="rounded-lg border p-4 bg-slate-50 border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-black">{proj.name}</h4>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                    ${proj.status === "COMPLETED"  ? "bg-emerald-100 text-emerald-700" :
                                      proj.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700"    :
                                      "bg-blue-100 text-blue-700"}`}>
                                    {proj.status.replace("_", " ")}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">{proj.description || "No description"}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {deptTasks.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-black">Tasks</h3>
                          <TaskKanban tasks={deptTasks} onAddTask={() => {}} />
                        </div>
                      ) : (
                        <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 border-slate-200">
                          <ListChecks size={32} className="text-slate-400" />
                          <p className="text-sm text-slate-700">No tasks assigned yet</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ── PAYROLL ──────────────────────────────────────────── */}
            {activeTab === "Payroll" && (
              <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <PayrollDashboard organizationId={organizationId} />
              </motion.div>
            )}

            {/* ── LEAVES ───────────────────────────────────────────── */}
            {activeTab === "Leaves" && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Leave Management</h2>
                    <p className="text-sm mt-0.5 text-slate-700">Track and approve employee leave requests by department</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-xl border p-4 bg-slate-50 border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <input
                          type="date" value={leaveAbsenceDateFilter}
                          onChange={(e) => { setLeaveAbsenceDateFilter(e.target.value); setLeaveCurrentPage(1); }}
                          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full"
                        />
                        <select
                          value={leaveEmployeeFilter}
                          onChange={(e) => { setLeaveEmployeeFilter(e.target.value); setLeaveCurrentPage(1); }}
                          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full"
                        >
                          <option value="">All Employees</option>
                          {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                        </select>
                        <select
                          value={leaveDepartmentFilter}
                          onChange={(e) => { setLeaveDepartmentFilter(e.target.value); setLeaveCurrentPage(1); }}
                          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full"
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                        </select>
                        <select
                          value={leaveStatusFilter}
                          onChange={(e) => { setLeaveStatusFilter(e.target.value); setLeaveCurrentPage(1); }}
                          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full"
                        >
                          <option value="">All Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <input
                          type="text" value={leaveSearchFilter}
                          onChange={(e) => { setLeaveSearchFilter(e.target.value); setLeaveCurrentPage(1); }}
                          placeholder="Search by name or reason..."
                          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full"
                        />
                        <button
                          onClick={() => {
                            setLeaveAbsenceDateFilter(""); setLeaveEmployeeFilter("");
                            setLeaveDepartmentFilter(""); setLeaveStatusFilter("");
                            setLeaveSearchFilter(""); setLeaveCurrentPage(1);
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 w-full"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border p-3 bg-amber-50 border-amber-200">
                      <div className="flex items-center gap-2 mb-1"><Clock size={13} className="text-amber-600" /><p className="text-[10px] font-semibold text-amber-700 uppercase">Pending</p></div>
                      <p className="text-2xl font-bold text-amber-900">{leaveStats.pending}</p>
                    </div>
                    <div className="rounded-xl border p-3 bg-emerald-50 border-emerald-200">
                      <div className="flex items-center gap-2 mb-1"><CheckCircle size={13} className="text-emerald-600" /><p className="text-[10px] font-semibold text-emerald-700 uppercase">Approved</p></div>
                      <p className="text-2xl font-bold text-emerald-900">{leaveStats.approved}</p>
                    </div>
                    <div className="rounded-xl border p-3 bg-red-50 border-red-200">
                      <div className="flex items-center gap-2 mb-1"><MinusCircle size={13} className="text-red-600" /><p className="text-[10px] font-semibold text-red-700 uppercase">Rejected</p></div>
                      <p className="text-2xl font-bold text-red-900">{leaveStats.rejected}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["Employee", "Type", "Department", "Period", "Reason", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let rows = allLeaveRequests;
                        if (leaveAbsenceDateFilter) {
                          const fd = new Date(leaveAbsenceDateFilter);
                          rows = rows.filter((req) => fd >= new Date(req.startDate) && fd <= new Date(req.endDate));
                        }
                        if (leaveEmployeeFilter)   rows = rows.filter((req) => req.employee?.name === leaveEmployeeFilter);
                        if (leaveDepartmentFilter) rows = rows.filter((req) => req.employee?.department?.name === leaveDepartmentFilter);
                        if (leaveStatusFilter)     rows = rows.filter((req) => req.status === leaveStatusFilter);
                        if (leaveSearchFilter) {
                          const s = leaveSearchFilter.toLowerCase();
                          rows = rows.filter((req) =>
                            req.employee?.name?.toLowerCase().includes(s) ||
                            req.title?.toLowerCase().includes(s)
                          );
                        }
                        const startIdx  = (leaveCurrentPage - 1) * leaveItemsPerPage;
                        const paginated = rows.slice(startIdx, startIdx + leaveItemsPerPage);

                        return paginated.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                              {leaveAbsenceDateFilter ? "No employees absent on this date" : "No leave requests found"}
                            </td>
                          </tr>
                        ) : paginated.map((req) => (
                          <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={req.employee?.name || "?"} px={30} />
                                <span className="text-sm font-semibold text-black">{req.employee?.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                                ${employees.find((e) => e.name === req.employee?.name)?.role === "MANAGER"
                                  ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                                {employees.find((e) => e.name === req.employee?.name)?.role === "MANAGER" ? "Manager" : "Employee"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-700">{req.employee?.department?.name || "Unassigned"}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-700">
                              {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{req.title || "-"}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                                ${req.status === "PENDING"  ? "bg-amber-100 text-amber-700"   :
                                  req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                  "bg-red-100 text-red-700"}`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {req.status === "PENDING" && employees.find((e) => e.name === req.employee?.name)?.role === "MANAGER" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      const res = await fetch("/api/hr/leave", {
                                        method: "PATCH", headers: { "Content-Type": "application/json" },
                                        credentials: "include",
                                        body: JSON.stringify({ leaveRequestId: req.id, status: "APPROVED" }),
                                      });
                                      if (res.ok) await syncSystem();
                                    }}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-emerald-700 hover:bg-emerald-100"
                                  >Approve</button>
                                  <button
                                    onClick={async () => {
                                      const res = await fetch("/api/hr/leave", {
                                        method: "PATCH", headers: { "Content-Type": "application/json" },
                                        credentials: "include",
                                        body: JSON.stringify({ leaveRequestId: req.id, status: "REJECTED" }),
                                      });
                                      if (res.ok) await syncSystem();
                                    }}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-red-700 hover:bg-red-100"
                                  >Reject</button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {(() => {
                  let rows = allLeaveRequests;
                  if (leaveAbsenceDateFilter) {
                    const fd = new Date(leaveAbsenceDateFilter);
                    rows = rows.filter((req) => fd >= new Date(req.startDate) && fd <= new Date(req.endDate) && req.status === "APPROVED");
                  }
                  const totalPages = Math.ceil(rows.length / leaveItemsPerPage);
                  return totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Page {leaveCurrentPage} of {totalPages} ({rows.length} total)</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setLeaveCurrentPage((p) => Math.max(1, p - 1))} disabled={leaveCurrentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                          ← Prev
                        </button>
                        <button onClick={() => setLeaveCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={leaveCurrentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                          Next →
                        </button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── FISCAL AUDIT MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {fiscalOpen && (
          <ModalWrap onClose={() => setFiscalOpen(false)}>
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-black">Contract Audit</h2>
                <p className="text-xs mt-0.5 opacity-60 text-slate-600">Ref: {fiscalTarget?.id?.slice(0, 8)}</p>
              </div>
              <button onClick={() => setFiscalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"><X size={15} /></button>
            </div>
            <div className="flex min-h-[420px]">
              <div className="w-5/12 p-7 border-r space-y-5 border-slate-200 bg-slate-100">
                {fiscalTarget && <Avatar name={fiscalTarget.name} px={48} />}
                <div>
                  <h3 className="text-xl font-bold text-black">{fiscalTarget?.name}</h3>
                  <p className="text-sm mt-0.5 text-slate-700">{fiscalTarget?.department?.name || "Corporate"} · {fiscalTarget?.role || "Staff"}</p>
                </div>
                <div className="pt-4 border-t space-y-4 border-slate-200">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5 text-slate-600">Monthly Baseline (NPR)</label>
                    <input type="number" value={baseline} onChange={(e) => setBaseline(e.target.value)}
                      className="w-full border-b py-2 text-2xl font-bold outline-none bg-transparent transition-colors border-slate-300 focus:border-blue-900 text-black" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1 text-slate-600">Duration</label>
                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="w-full py-1 text-sm outline-none bg-transparent opacity-60 border-b text-black border-slate-300" />
                  </div>
                </div>
              </div>
              <div className="w-7/12 p-7 flex flex-col justify-between bg-slate-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2 text-slate-600">
                      <Calendar size={11} /> Audit Cycle Period
                    </label>
                    <div className="flex gap-2">
                      {[startDate, endDate].map((v, idx) => (
                        <input key={idx} type="date" value={v}
                          onChange={(e) => idx === 0 ? setStartDate(e.target.value) : setEndDate(e.target.value)}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
                      ))}
                    </div>
                    {startDate && endDate && (
                      <p className="text-xs font-medium mt-1.5 text-black/70">
                        {Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1} day cycle
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2 text-black/70">
                      <MinusCircle size={11} /> Manual Deduction (NPR)
                    </label>
                    <input type="number" value={deduction} onChange={(e) => setDeduction(e.target.value)} placeholder="0.00"
                      className="w-full border rounded-lg px-4 py-3 text-xl font-bold outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2 text-slate-600">Audit Note</label>
                    <textarea value={authNote} onChange={(e) => setAuthNote(e.target.value)} placeholder="Reason for adjustment…"
                      className="w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none h-20 transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
                  </div>
                </div>
                <div className="pt-5 border-t flex items-end justify-between border-slate-200">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-60 text-slate-600">Total Payable</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm opacity-70 text-slate-700">NPR</span>
                      <span className="text-4xl font-bold text-black">
                        {calcTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleFiscalAudit}
                    className="px-7 py-3 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                    Confirm Audit
                  </button>
                </div>
              </div>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* ── AUDIT HISTORY MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuditModal && (
          <ModalWrap onClose={() => setShowAuditModal(false)} maxW="max-w-2xl">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-black">Fiscal History</h2>
                <p className="text-xs mt-0.5 text-slate-700">{selectedAuditEmp?.name}</p>
              </div>
              <button onClick={() => setShowAuditModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors opacity-60 hover:bg-slate-100"><X size={15} /></button>
            </div>
            <div className="p-7 overflow-y-auto max-h-[460px]">
              {auditLoading ? (
                <div className="py-14 text-center text-sm text-slate-700">Loading audit logs…</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-14 text-center text-sm text-slate-700">No adjustment history found.</div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-5 rounded-lg border bg-slate-100 border-slate-300">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm text-black">{log.reason}</p>
                        <p className="text-xs text-slate-600">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
                        <div>
                          <p className="text-[11px] text-slate-600">Previous</p>
                          <p className="text-sm font-semibold text-slate-700">Rs. {log.oldSalary.toLocaleString()}</p>
                        </div>
                        <ArrowDownCircle size={15} className="text-red-400" />
                        <div>
                          <p className="text-[11px] text-slate-600">Adjusted</p>
                          <p className="text-sm font-bold text-black">Rs. {log.newSalary.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* ── INTEGRATED TOOLS ────────────────────────────────────────────── */}
      <ChatWindow currentUser={currentUser} userType="HR" isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <CreateDeptModal isOpen={showCreateDept} onClose={() => setShowCreateDept(false)} employees={employees}
        onSuccess={() => { syncSystem(); setShowCreateDept(false); }} />
      <HireStaffModal isOpen={showHireStaff} onClose={() => setShowHireStaff(false)}
        onSuccess={() => { syncSystem(); setShowHireStaff(false); }} />
      <EmployeeDetailModal employee={selectedEmployeeInfo} isOpen={showEmployeeDetail}
        onClose={() => { setShowEmployeeDetail(false); setSelectedEmployeeInfo(null); }} />
    </div>
  );
}