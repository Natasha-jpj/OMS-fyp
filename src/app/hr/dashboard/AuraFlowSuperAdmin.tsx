"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DepartmentDetailPage from "./DepartmentDetailPage";
import AssignManagerModal from "./AssignManagerModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Building2,
  Clock, Activity, ChevronRight,
  X, Calendar, CheckCircle, MinusCircle,
  ArrowDownCircle, LayoutDashboard, Settings,
  DollarSign, Send, MoreHorizontal, UserCheck,
  Briefcase,
  UserPlus,
  Award, ListChecks, LogOut
} from "lucide-react";
// LeaveManagementSection import removed (unused)
import { CreateDeptModal } from "./CreateDeptModal";
import { HireStaffModal } from "./HireStaffModal";
import { TaskKanban } from "../../manager/dashboard/TaskKanban";
import { ChatWindow } from "../../components/ChatWindow";
import { ChatConnectButton } from "../../components/ChatConnectButton";
import PayrollDashboard from "../components/PayrollDashboard";
import {
  AreaChart, Area, BarChart, Bar,
  Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1.5">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-black">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function GraphCard({
  title,
  subtitle,
  accent = "#0f172a",
  onClick,
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 16px 42px rgba(15,23,42,0.08)" }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer transition-all"
    >
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-50/90 to-transparent pointer-events-none" />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-black">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
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
  const [open, setOpen] = useState(false);
  const today = new Date();
  const oneWeekAgo  = new Date(today.getTime() - 7  * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const formatDate  = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 mr-1.5">
          <Calendar size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Date range</span>
        </div>
        {[
          { label: "7d", fn: () => { onStartDateChange(formatDate(oneWeekAgo)); onEndDateChange(formatDate(today)); setOpen(false); } },
          { label: "30d", fn: () => { onStartDateChange(formatDate(oneMonthAgo)); onEndDateChange(formatDate(today)); setOpen(false); } },
          { label: "Month", fn: () => { onStartDateChange(formatDate(new Date(today.getFullYear(), today.getMonth(), 1))); onEndDateChange(formatDate(today)); setOpen(false); } },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.fn}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {b.label}
          </button>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <Clock size={12} /> Custom
        </button>
        {(startDate || endDate) && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-3 right-3 top-[calc(100%+8px)] z-30 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs outline-none bg-white border-slate-200 text-black focus:border-slate-800"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs outline-none bg-white border-slate-200 text-black focus:border-slate-800"
            />
            <button
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const topDepartments = React.useMemo(() => dashboardAnalytics.departmentLoads.slice(0, 5), [dashboardAnalytics.departmentLoads]);
  const workforceMixData = React.useMemo(() => ([
    { name: "Employees", value: employees.filter((e) => e.role === "EMPLOYEE").length, fill: "#f97316" },
    { name: "Managers", value: employees.filter((e) => e.role === "MANAGER").length, fill: "#06b6d4" },
    { name: "Admins", value: employees.filter((e) => e.role === "ADMIN").length, fill: "#8b5cf6" },
  ].filter((item) => item.value > 0)), [employees]);

  const leaveTrendChartData = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const monthLeaves = allLeaveRequests.filter((leave) => {
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getMonth() === month && leaveDate.getFullYear() === year;
      });
      return {
        month: monthDate.toLocaleString("default", { month: "short" }),
        total: monthLeaves.length,
        approved: monthLeaves.filter((leave) => leave.status === "APPROVED").length,
      };
    });
  }, [allLeaveRequests]);

  const payrollReadinessData = React.useMemo(() => ([
    { name: "Ready", value: dashboardAnalytics.payrollReadyPct, fill: "#0f172a" },
    { name: "Pending", value: 100 - dashboardAnalytics.payrollReadyPct, fill: "#e2e8f0" },
  ]), [dashboardAnalytics.payrollReadyPct]);

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
              <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

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

                {/* ── Row 1: Graph-first KPI cards ── */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-3">
                    <GraphCard title="Workforce Mix" subtitle="Role composition" accent="#f97316" onClick={() => setActiveTab("Workforce")}>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={workforceMixData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={78} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                          <Bar dataKey="value" name="Employees" radius={[0, 6, 6, 0]}>
                            {workforceMixData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mt-2">
                        {workforceMixData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span>{item.name}: <strong className="text-black">{item.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </GraphCard>
                  </div>

                  <div className="col-span-12 lg:col-span-3">
                    <GraphCard title="Department Load" subtitle="Headcount by team" accent="#06b6d4" onClick={() => setActiveTab("Organization")}>
                      {topDepartments.length === 0 ? (
                        <div className="flex items-center justify-center h-36 text-sm text-slate-400">No departments yet</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={topDepartments} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={72} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                            <Bar dataKey="count" name="Employees" radius={[0, 6, 6, 0]} fill="#06b6d4" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </GraphCard>
                  </div>

                  <div className="col-span-12 lg:col-span-3">
                    <GraphCard title="Leave Trend" subtitle="Monthly requests" accent="#8b5cf6" onClick={() => setActiveTab("Leaves")}>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={leaveTrendChartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" fill="rgba(139,92,246,0.12)" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>{allLeaveRequests.length} requests</span>
                        <span>{leaveStats.pending} pending</span>
                      </div>
                    </GraphCard>
                  </div>

                  <div className="col-span-12 lg:col-span-3">
                    <GraphCard title="Payroll Readiness" subtitle="Employees ready to process" accent="#f59e0b" onClick={() => setActiveTab("Payroll")}>
                      <ResponsiveContainer width="100%" height={160}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius={34} outerRadius={66} barSize={14} data={payrollReadinessData}>
                          <RadialBar background dataKey="value" cornerRadius={10} />
                          <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>{dashboardAnalytics.payrollReadyPct}% ready</span>
                        <span>NPR {dashboardAnalytics.avgSalary.toLocaleString("en-IN")}</span>
                      </div>
                    </GraphCard>
                  </div>
                </div>

                {/* ── Row 2: Broadcasts + Leave Donut + Team Card (FIXED: 4+4+4=12) ── */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Broadcast */}
                  <div className="col-span-12 lg:col-span-4">
                    <BroadcastWidget broadcasts={broadcasts} input={broadcastInput} onInput={setBroadcastInput} onSubmit={handleBroadcast} isDateInRange={isDateInRange} onClickDetail={() => {}} />
                  </div>

                  {/* Leave Donut */}
                  <div className="col-span-12 lg:col-span-4">
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

                  {/* Team Card */}
                  <div className="col-span-12 lg:col-span-4">
                    <TeamCard employees={employees} onClickDetail={() => setActiveTab("Workforce")} />
                  </div>
                </div>

                {/* ── Row 3: Department Capacity + Project Timeline ── */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-6">
                    <GraphCard title="Department Capacity" subtitle="Current utilization rate" accent="#f59e0b">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={departments.slice(0, 5).map((d) => ({
                          name: d.name,
                          utilized: employees.filter((e) => e.department?.id === d.id).length,
                          capacity: Math.max(d.capacity || 10, employees.filter((e) => e.department?.id === d.id).length + 2),
                        }))} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                          <Bar dataKey="utilized" name="Filled" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="capacity" name="Total Capacity" stackId="a" fill="#e2e8f0" />
                        </BarChart>
                      </ResponsiveContainer>
                    </GraphCard>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <GraphCard title="Project Timeline" subtitle="Active vs completed" accent="#06b6d4">
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={[
                          { month: "Jan", active: 8, completed: 2 },
                          { month: "Feb", active: 7, completed: 4 },
                          { month: "Mar", active: 9, completed: 5 },
                          { month: "Apr", active: 6, completed: 8 },
                          { month: "May", active: projects.filter((p) => p.status === "IN_PROGRESS").length, completed: projects.filter((p) => p.status === "COMPLETED" || p.status === "DONE").length },
                        ]} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="active" name="Active" stroke="#06b6d4" fill="rgba(6,182,212,0.12)" stackId="1" />
                          <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="rgba(16,185,129,0.12)" stackId="1" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </GraphCard>
                  </div>
                </div>

                {/* ── Row 4: Workforce Composition + Leave Analytics + Top Performers (FIXED: gap-6) ── */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-4">
                    <GraphCard title="Workforce Composition" subtitle="Tenure breakdown" accent="#8b5cf6">
                      <div className="space-y-4">
                        {[
                          { label: "New (0-6mo)", value: Math.max(Math.floor(employees.length * 0.15), 1), color: "#3b82f6", pct: 15 },
                          { label: "Mid-level (6mo-2yr)", value: Math.max(Math.floor(employees.length * 0.35), 1), color: "#f59e0b", pct: 35 },
                          { label: "Senior (2yr+)", value: Math.max(Math.floor(employees.length * 0.50), 1), color: "#10b981", pct: 50 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-medium text-slate-700">{item.label}</span>
                              <span className="text-xs font-bold text-black">{item.value}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ backgroundColor: item.color, width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Avg tenure</p>
                        <p className="text-lg font-bold text-black">2.3 years</p>
                      </div>
                    </GraphCard>
                  </div>

                  <div className="col-span-12 lg:col-span-4">
                    <GraphCard title="Leave Analytics" subtitle="Annual leave summary" accent="#ec4899">
                      <div className="space-y-3">
                        {[
                          { label: "Total Entitled", value: employees.length * 20, sub: "days/year" },
                          { label: "Taken", value: allLeaveRequests.filter((l) => l.status === "APPROVED").length * 2, sub: "days used" },
                          { label: "Pending", value: leaveStats.pending, sub: "requests" },
                          { label: "Avg per Employee", value: "14", sub: "days remaining" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100">
                            <div>
                              <p className="text-[11px] font-semibold text-slate-600 uppercase">{item.label}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                            </div>
                            <p className="text-lg font-bold text-black">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </GraphCard>
                  </div>

                  <div className="col-span-12 lg:col-span-4">
                    <GraphCard title="Top Performers" subtitle="By headcount growth" accent="#10b981">
                      <div className="space-y-2.5">
                        {departments.slice(0, 5).map((dept, i) => {
                          const count = employees.filter((e) => e.department?.id === dept.id).length;
                          const maxCount = Math.max(...departments.map((d) => employees.filter((e) => e.department?.id === d.id).length), 1);
                          const pct = Math.round((count / maxCount) * 100);
                          return (
                            <div key={dept.id}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-700 truncate">{dept.name}</span>
                                <span className="text-xs font-bold text-black">{count} staff</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{
                                  backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"][i % 5],
                                  width: `${pct}%`
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GraphCard>
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
            {/* ── WORKFORCE ────────────────────────────────────────── */}
{activeTab === "Workforce" && (
  <motion.div
    key="wf"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="space-y-8"
  >
    {/* Header Section */}
    <div className="flex items-end justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
      <div>
        <h2 className="text-3xl font-serif font-semibold tracking-tight text-slate-900">
          Workforce
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Manage your core team and department structures. 
          <span className="ml-2 text-slate-300">|</span>
          <span className="ml-2 text-indigo-600">{employees.length} Active Members</span>
        </p>
      </div>
      <button
        onClick={() => setShowHireStaff(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-slate-900 text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
      >
        <UserPlus size={16} strokeWidth={2.5} /> 
        Hire Staff
      </button>
    </div>

    {/* Quick Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        label="Full-time" 
        value={employees.filter((e) => e.role !== "MANAGER").length} 
        icon={<Users size={18} className="text-slate-600" />} 
        onClick={() => setActiveTab("Workforce")}
      />
      <StatCard 
        label="Management" 
        value={employees.filter((e) => e.role === "MANAGER").length} 
        icon={<UserCheck size={18} className="text-slate-600" />} 
        onClick={() => setActiveTab("Workforce")}
      />
      <StatCard 
        label="Growth" 
        value="12%" 
        icon={<UserPlus size={18} className="text-indigo-600" />} 
        trend="+2 this month" 
        onClick={() => setActiveTab("Workforce")}
      />
    </div>

    {/* Main Table Container */}
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-6 py-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-200">
        <div className="relative w-full max-w-md group">
          <Search 
            size={16} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" 
          />
          <input
            placeholder="Search by name, role, or department..."
            value={payrollSearch}
            onChange={(e) => setPayrollSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Showing {filtered.length} Employees
          </span>
        </div>
      </div>

      {/* Employee List */}
      <div className="divide-y divide-slate-100">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            onClick={() => { setSelectedEmployeeInfo(emp); setShowEmployeeDetail(true); }}
            className="group flex items-center gap-6 px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {/* Avatar with Ring Effect */}
            <div className="relative">
              <Avatar name={emp.name} px={44} />
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-indigo-100 transition-all" />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {emp.name}
              </h4>
              <p className="text-xs font-medium text-slate-500">
                {emp.position || emp.role || "Staff"}
              </p>
            </div>

            {/* Department - Pill Style */}
            <div className="hidden md:block">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                {emp.department?.name || "Unassigned"}
              </span>
            </div>

            {/* Status/Role Badge */}
            <div className="w-24 flex justify-end">
              <Badge status={emp.role || "EMPLOYEE"} />
            </div>

            {/* Actions */}
            <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm">No team members found matching your search.</p>
          </div>
        )}
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

                <div className="grid grid-cols-12 gap-6">
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
      <CreateDeptModal isOpen={showCreateDept} onClose={() => setShowCreateDept(false)} employees={employees as never}
        onSuccess={() => { syncSystem(); setShowCreateDept(false); }} />
      <HireStaffModal isOpen={showHireStaff} onClose={() => setShowHireStaff(false)}
        onSuccess={() => { syncSystem(); setShowHireStaff(false); }} departments={departments} />
      <EmployeeDetailModal employee={selectedEmployeeInfo} isOpen={showEmployeeDetail}
        onClose={() => { setShowEmployeeDetail(false); setSelectedEmployeeInfo(null); }} />
    </div>
  );
}