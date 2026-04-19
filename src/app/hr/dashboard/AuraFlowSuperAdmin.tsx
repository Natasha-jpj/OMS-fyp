"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DepartmentDetailPage from "./DepartmentDetailPage";
import AssignManagerModal from "./AssignManagerModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Building2, ShieldCheck,
  TrendingUp, Clock, Activity, ChevronRight,
  X, Calendar, Landmark, AlertCircle, CheckCircle, MinusCircle,
  ArrowDownCircle, LayoutDashboard, Bell, Settings,
  DollarSign, Send, MoreHorizontal, UserCheck,
  ArrowUpRight, Briefcase, FileText, PieChart,
  UserPlus,
  MessageSquare, TrendingDown, Award, ListChecks, Square, Zap, LogOut
} from "lucide-react";
import { SuperAdminProjects } from "./SuperAdminWidgets";
import { CreateDeptModal } from "./CreateDeptModal";
import { HireStaffModal } from "./HireStaffModal";
import { TaskKanban } from "../../manager/dashboard/TaskKanban";
import { ChatWindow } from "../../components/ChatWindow";
import { ChatConnectButton } from "../../components/ChatConnectButton";

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
  const colors = ["#001a4d","#1a3a66","#003d99","#0052cc","#1a47a0","#0040bf","#004da6"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: px, height: px, background: bg, fontSize: px * 0.38 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:  "bg-slate-300 text-slate-900",
    APPROVED: "bg-slate-200 text-black",
    REJECTED: "bg-slate-400 text-white",
    DONE:     "bg-slate-200 text-black",
    MANAGER:  "bg-blue-950 text-white border border-blue-800",
    ADMIN:    "bg-black text-white",
    EMPLOYEE: "bg-slate-300 text-slate-900",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${map[status] || "bg-slate-300 text-slate-700"}`}>
      {status}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, trend, trendUp = true, gold = false, onClick }:
  { label: string; value: string | number; sub?: string; icon: React.ReactNode; trend?: string; trendUp?: boolean; gold?: boolean; onClick?: () => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} onClick={onClick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border flex flex-col gap-3 transition-colors cursor-pointer
        ${gold
          ? "bg-black text-white border-black hover:shadow-lg"
          : "bg-slate-50 border-slate-200 hover:shadow-md hover:border-slate-300"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${gold ? "text-white" : "text-slate-700"}`}>{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${gold ? "bg-black" : "bg-slate-200"}`}>
          <span className={gold ? "text-white" : "text-slate-700"}>{icon}</span>
        </div>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${gold ? "text-white" : "text-black"}`}>{value}</div>
      {sub && <p className={`text-xs ${gold ? "text-slate-300" : "text-slate-700"}`}>{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1">
          {trendUp
            ? <ArrowUpRight size={12} className={gold ? "text-white/70" : "text-black/70"} />
            : <TrendingDown size={12} className={gold ? "text-white/70" : "text-black/70"} />}
          <span className={`text-xs font-medium ${gold ? "text-white/70" : "text-black/70"}`}>{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── LEAVE WIDGET ─────────────────────────────────────────────────────────────
function LeaveWidget({ onRefresh, isDateInRange, onClickDetail }: { onRefresh?: () => void; isDateInRange?: (date: string) => boolean; onClickDetail?: () => void }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/leave", { credentials: "include" });
      const data = await res.json();
      setLeaves(data.leaveRequests || []);
    } catch (e) {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (leaveId: string) => {
    setApproving(leaveId);
    try {
      const res = await fetch("/api/hr/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveRequestId: leaveId, status: "APPROVED" })
      });
      if (res.ok) {
        await fetchLeaves();
        onRefresh?.();
      }
    } catch (e) {
      console.error("Approval failed", e);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (leaveId: string) => {
    setApproving(leaveId);
    try {
      const res = await fetch("/api/hr/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveRequestId: leaveId, status: "REJECTED" })
      });
      if (res.ok) {
        await fetchLeaves();
        onRefresh?.();
      }
    } catch (e) {
      console.error("Rejection failed", e);
    } finally {
      setApproving(null);
    }
  };

  const filteredLeaves = leaves.filter(l => 
    (isDateInRange?.(l.startDate) ?? true) && (isDateInRange?.(l.endDate) ?? true)
  );

  const pending = filteredLeaves.filter(l => l.status === 'PENDING').length;
  const approved = filteredLeaves.filter(l => l.status === 'APPROVED').length;
  const rejected = filteredLeaves.filter(l => l.status === 'REJECTED').length;

  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 flex flex-col h-full bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-black">Leave Management</h3>
          <p className="text-[11px] text-slate-600 mt-0.5">{pending} pending • {approved} approved • {rejected} rejected</p>
        </div>
        <span className="text-xs font-semibold bg-black text-white px-2.5 py-1 rounded-full group-hover:bg-slate-900 transition-colors">{filteredLeaves.length}</span>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-700">Loading…</div>
      ) : filteredLeaves.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-700">
          <Calendar size={26} className="opacity-30" />
          <span className="text-sm">No leave requests</span>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {filteredLeaves.slice(0, 1).map(l => (
            <div key={l.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors
              ${l.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200' : 
                l.status === 'REJECTED' ? 'bg-red-50 border-red-200' : 
                'bg-slate-150 border-slate-300'}`}>
              <Avatar name={l.employee?.name || "?"} px={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate text-black block">{l.employee?.name || "Unknown"}</span>
                    <span className="text-xs text-slate-600 truncate block">{l.employee?.department?.name || "Unassigned"}</span>
                  </div>
                  <Badge status={l.status} />
                </div>
                <p className="text-xs mt-1 truncate text-slate-700">{l.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-slate-600">
                    {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                  </p>
                  {l.status === 'PENDING' && (
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(l.id); }} disabled={approving === l.id}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-all bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                        {approving === l.id ? "..." : "Approve"}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleReject(l.id); }} disabled={approving === l.id}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-all bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                        {approving === l.id ? "..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── BROADCAST ────────────────────────────────────────────────────────────────
function BroadcastWidget({ broadcasts, input, onInput, onSubmit, isDateInRange, onClickDetail }:
  { broadcasts: Broadcast[]; input: string; onInput: (v: string) => void; onSubmit: (e: React.FormEvent) => void; isDateInRange?: (date: string) => boolean; onClickDetail?: () => void }) {
  const filteredBroadcasts = broadcasts.filter(b => isDateInRange?.(b.createdAt) ?? true);
  
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 flex flex-col h-full bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black">Announcements</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-500 font-medium">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 min-h-[120px]">
        {filteredBroadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-700">
            <MessageSquare size={24} className="opacity-30" /><span className="text-sm">No announcements yet</span>
          </div>
        ) : filteredBroadcasts.map(b => (
          <div key={b.id} className="p-3 rounded-xl border bg-slate-150 border-slate-300">
            <p className="text-sm text-black">{b.message}</p>
            <p className="text-[11px] mt-1 text-slate-600">{new Date(b.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.stopPropagation(); onSubmit(e); }} className="flex gap-2">
        <input value={input} onChange={e => onInput(e.target.value)}
          className="flex-1 text-sm border rounded-xl px-4 py-2.5 outline-none transition-colors bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900"
          placeholder="Write an announcement…" />
        <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors bg-black text-white hover:bg-slate-900">
          <Send size={13} /> Post
        </button>
      </form>
    </motion.div>
  );
}

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────
function MiniCalendar({ onClickDetail }: { onClickDetail?: () => void }) {
  const today = new Date();
  const todayDate = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" });
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-black">{monthName}</h3>
        <Calendar size={14} className="text-slate-700" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[10px] font-semibold py-1 text-slate-600">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {days.map(d => (
          <div key={d} className={`text-[11px] py-1.5 rounded-lg cursor-pointer transition-colors
            ${d === todayDate ? "bg-black text-white font-bold" : "text-slate-700 hover:bg-slate-100"}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-[11px] font-medium text-slate-600">Audit cycles active</span>
      </div>
    </motion.div>
  );
}

// ─── DEPT CARD ────────────────────────────────────────────────────────────────
function DeptCard({ dept, count, onClick }: { dept: Department; count: number; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="rounded-2xl border p-4 cursor-pointer transition-all group flex flex-col gap-3 bg-slate-50 border-slate-200 hover:border-slate-400 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all bg-slate-200 border-slate-300 group-hover:bg-black group-hover:border-black">
          <Building2 size={16} className="text-slate-600 group-hover:text-white" />
        </div>
        <ChevronRight size={13} className="mt-0.5 text-slate-600" />
      </div>
      <div>
        <h4 className="text-sm font-semibold leading-tight text-black">{dept.name}</h4>
        {dept.head && <p className="text-xs mt-0.5 text-slate-700">{dept.head}</p>}
      </div>
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">{count} members</span>
        {dept.budget && <span className="text-[11px] font-medium text-slate-600">Rs. {Number(dept.budget).toLocaleString()}</span>}
      </div>
    </motion.div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart({ data, label, months, onClickDetail }: { data: number[]; label: string; months?: string[]; onClickDetail?: () => void }) {
  const max = Math.max(...data);
  const labels = months || ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all">
      <h3 className="text-sm font-semibold mb-4 text-black">{label}</h3>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md transition-all bg-slate-300 hover:bg-black"
              style={{ height: `${(v / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-slate-600">
        {labels.map(m => <span key={m}>{m}</span>)}
      </div>
    </motion.div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed({ isDateInRange, onClickDetail }: { isDateInRange?: (date: string) => boolean; onClickDetail?: () => void }) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetch("/api/hr/audit", { credentials: "include" })
      .then(r => r.json())
      .then(d => setActivities(d.audit?.slice(0, 5) || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredActivities = activities.filter(a => isDateInRange?.(a.time) ?? true);

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
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all">
      <h3 className="text-sm font-semibold mb-4 text-black">Recent Activity</h3>
      {loading ? (
        <div className="text-xs text-slate-700 text-center py-4">Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-xs text-slate-700 text-center py-4">No activities yet</div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-200 text-black/70">{getIcon(a.action || "")}</div>
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
    <motion.div whileHover={{ y: -2 }} onClick={onClickDetail}
      className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black">Team Members</h3>
        <Award size={14} className="text-black/70" />
      </div>
      <div className="space-y-3">
        {employees.slice(0, 5).length === 0 ? (
          <p className="text-sm text-center py-4 text-slate-700">No employees yet</p>
        ) : employees.slice(0, 5).map(emp => (
          <div key={emp.id} className="flex items-center gap-3">
            <Avatar name={emp.name} px={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-black">{emp.name}</p>
              <p className="text-xs truncate text-slate-700">{emp.department?.name || "Unassigned"}</p>
            </div>
            <Badge status={emp.role || "EMPLOYEE"} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── DATE RANGE FILTER ────────────────────────────────────────────────────────
function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }: 
  { startDate: string; endDate: string; onStartDateChange: (d: string) => void; onEndDateChange: (d: string) => void; onClear: () => void }) {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return (
    <div className="rounded-xl border p-3 bg-slate-50 border-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-black">Filter by Date</h3>
          <p className="text-[10px] text-slate-600">Dashboard data by date range</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => { onStartDateChange(formatDate(oneWeekAgo)); onEndDateChange(formatDate(today)); }}
            className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">
            7d
          </button>
          <button onClick={() => { onStartDateChange(formatDate(oneMonthAgo)); onEndDateChange(formatDate(today)); }}
            className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">
            30d
          </button>
          <button onClick={() => { onStartDateChange(formatDate(new Date(today.getFullYear(), today.getMonth(), 1))); onEndDateChange(formatDate(today)); }}
            className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">
            Month
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2 mt-2.5">
        <div className="flex-1 w-full md:w-auto">
          <input type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
        </div>
        <div className="flex-1 w-full md:w-auto">
          <input type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
        </div>
        {(startDate || endDate) && (
          <button onClick={onClear}
            className="text-[10px] mt-2 md:mt-0 px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 whitespace-nowrap">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AuraFlowSuperAdmin({ initialDepts = [], existingEmployees = [], initialProjects = [], hrUser }: Props) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [salaryMode, setSalaryMode] = useState<"HOUR" | "DAY" | "MONTH">("MONTH");
  const [collapsed, setCollapsed] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Audit states
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditEmp, setSelectedAuditEmp] = useState<Employee | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Fiscal modal
  const [fiscalOpen, setFiscalOpen] = useState(false);
  const [fiscalTarget, setFiscalTarget] = useState<Employee | null>(null);
  const [baseline, setBaseline] = useState("85000");
  const [deduction, setDeduction] = useState("0");
  const [authNote, setAuthNote] = useState("Mission/Attendance Sync Discrepancy");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("12 Months");

  // Data
  const [departments, setDepartments] = useState<Department[]>(initialDepts);
  const [employees, setEmployees] = useState<Employee[]>(existingEmployees);
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [tasks, setTasks] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [broadcastInput, setBroadcastInput] = useState("");
  const [leaveStats, setLeaveStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [salaryAudits, setSalaryAudits] = useState<AuditLog[]>([]);

  // UI
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [showHireStaff, setShowHireStaff] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedProjectDeptId, setSelectedProjectDeptId] = useState<string | null>(null);
  const [showAssignMgr, setShowAssignMgr] = useState(false);
  const [payrollSearch, setPayrollSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<HrUser | null>(hrUser || null);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Employee Detail Modal
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState<Employee | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" 
      });
      localStorage.removeItem("hr");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/choose-role");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const syncSystem = async () => {
    try {
      const [dR, eR, pR, lR, sR, tR] = await Promise.all([
        fetch("/api/hr/departments", { credentials: "include" }).then(r => r.json()),
        fetch("/api/hr/employees", { credentials: "include" }).then(r => r.json()),
        fetch("/api/hr/projects", { credentials: "include" }).then(r => r.json()),
        fetch("/api/hr/leave", { credentials: "include" }).then(r => r.json()),
        fetch("/api/hr/audit/salary", { credentials: "include" }).then(r => r.json()),
        fetch("/api/hr/tasks", { credentials: "include" }).then(r => r.json()),
      ]);
      if (dR.departments) setDepartments(dR.departments);
      if (eR.employees) setEmployees(eR.employees);
      if (pR.projects) setProjects(pR.projects);
      if (lR.leaveRequests) {
        const stats = { pending: 0, approved: 0, rejected: 0 };
        lR.leaveRequests.forEach((l: LeaveRequest) => {
          if (l.status === 'PENDING') stats.pending++;
          else if (l.status === 'APPROVED') stats.approved++;
          else if (l.status === 'REJECTED') stats.rejected++;
        });
        setLeaveStats(stats);
      }
      if (sR.audits) setSalaryAudits(sR.audits);
      if (tR.tasks || Array.isArray(tR)) setTasks(Array.isArray(tR) ? tR : tR.tasks || []);
    } catch { }
  };

  useEffect(() => { setEmployees(existingEmployees); }, [existingEmployees]);

  useEffect(() => {
    if (!hrUser) {
      fetch("/api/hr/profile", { credentials: "include" }).then(r => r.json()).then(d => setCurrentUser(d.user || { id: "", name: "User", email: "" }))
        .catch(() => setCurrentUser({ id: "", name: "User", email: "" }));
    } else {
      setCurrentUser(hrUser);
    }
  }, [hrUser]);

  useEffect(() => {
    if (showAuditModal && selectedAuditEmp) {
      setAuditLoading(true);
      fetch(`/api/hr/audit/salary?employeeId=${selectedAuditEmp.id}`, { credentials: "include" })
        .then(r => r.json()).then(d => setAuditLogs(d.audits || []))
        .catch(() => setAuditLogs([])).finally(() => setAuditLoading(false));
    }
  }, [showAuditModal, selectedAuditEmp]);

  useEffect(() => {
    fetch("/api/broadcasts?role=HR", { credentials: "include" }).then(r => r.json()).then(d => setBroadcasts(d.broadcasts || []));
    syncSystem();
  }, []);

  const calcTotal = () => {
    const base = Number(baseline) || 0;
    const ded = Number(deduction) || 0;
    if (!startDate || !endDate) return base - ded;
    const diff = Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
    return (base / 30) * diff - ded;
  };

  const handleFiscalAudit = () => {
    if (!fiscalTarget) return;
    const final = Number(baseline) - Number(deduction);
    setEmployees(prev => prev.map(e => e.id === fiscalTarget.id ? { ...e, salary: final, lastAudit: new Date().toLocaleDateString() } : e));
    setFiscalOpen(false);
    setDeduction("0");
  };

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastInput.trim() || !currentUser?.id) return;
    await fetch("/api/broadcasts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUser.id, senderRole: "HR", message: broadcastInput }),
    });
    setBroadcastInput("");
    fetch("/api/broadcasts?role=HR", { credentials: "include" }).then(r => r.json()).then(d => setBroadcasts(d.broadcasts || []));
  }

  // Helper function to check if a date falls within the filter range
  const isDateInRange = (dateStr: string) => {
    if (!dateStr || (!filterStartDate && !filterEndDate)) return true;
    const date = new Date(dateStr);
    if (filterStartDate && date < new Date(filterStartDate)) return false;
    if (filterEndDate && date > new Date(filterEndDate)) return false;
    return true;
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(payrollSearch.toLowerCase()) ||
    (e.role || "").toLowerCase().includes(payrollSearch.toLowerCase())
  );

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  // ─── MODAL HELPER ───────────────────────────────────────────────────────────
  const ModalWrap = ({ children, onClose, maxW = "max-w-4xl" }: { children: React.ReactNode; onClose: () => void; maxW?: string }) => (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.97, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        className={`relative w-full ${maxW} rounded-xl shadow-2xl overflow-hidden border bg-white border-slate-300`}>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-black to-transparent" />
        {children}
      </motion.div>
    </div>
  );

  const roleDistribution = React.useMemo(() => {
    if (!employees.length) return { employees: 0, managers: 0, admins: 0 };
    const empCount = employees.filter(e => e.role === "EMPLOYEE").length || 1;
    const mgrCount = employees.filter(e => e.role === "MANAGER").length || 1;
    const admCount = employees.filter(e => e.role === "ADMIN").length || 1;
    const total = empCount + mgrCount + admCount;
    return {
      employees: Math.round((empCount / total) * 100),
      managers: Math.round((mgrCount / total) * 100),
      admins: Math.round((admCount / total) * 100)
    };
  }, [employees]);

  const budgetMetrics = React.useMemo(() => {
    const monthlyPayroll = employees.length * 85000; // Estimate Rs. 85k per employee
    const formattedBudget = monthlyPayroll >= 1000000 
      ? `Rs. ${(monthlyPayroll / 1000000).toFixed(1)}M`
      : `Rs. ${(monthlyPayroll / 100000).toFixed(1)}L`;
    
    // Estimate trend based on employee count
    const trend = employees.length > 10 ? "+8% growth" : employees.length > 5 ? "+5% growth" : "+2% growth";
    
    return { budget: formattedBudget, trend };
  }, [employees]);
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
            <button key={id} onClick={() => setActiveTab(id)} title={collapsed ? id : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all pointer-events-auto
                ${collapsed ? "justify-center" : ""}
                ${activeTab === id
                  ? "bg-black text-white font-semibold"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"}`}>
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
            ].map(a => (
              <button key={a.label} onClick={a.fn}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-slate-700 hover:text-black hover:bg-slate-100">
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

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700">HR Portal</span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-sm font-semibold text-black">{activeTab}</span>
          </div>

          {/* Center pill */}
          <div className="hidden xl:flex items-center gap-6 px-6 py-2 rounded-full border bg-slate-50 border-slate-200 backdrop-blur-sm">
            {[
              { icon: <Users size={12} />,      val: employees.length,   label: "Personnel",   color: "text-black"       },
              { icon: <Landmark size={12} />,   val: `Rs. ${(employees.length * 85000).toLocaleString()}`,        label: "Est. Payroll",      color: "text-black"       },
              { icon: <ShieldCheck size={12} />,val: "Root",             label: "Access",      color: "text-emerald-600" },
              { icon: <Building2 size={12} />,  val: departments.length, label: "Departments", color: "text-black"       },
            ].map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-3 bg-slate-300" />}
                <div className="flex items-center gap-1.5">
                  <span className={m.color}>{m.icon}</span>
                  <span className={`text-xs font-medium ${m.color}`}>{m.val}</span>
                  <span className="text-xs text-slate-600 opacity-70">{m.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <div className="relative hidden lg:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
              <input placeholder="Search…"
                className="pl-8 pr-4 py-2 text-sm border rounded-xl outline-none w-44 bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors" />
            </div>

            {/* Connect Button */}
            <ChatConnectButton onClick={() => setChatOpen(true)} isActive={chatOpen} />

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)}
                className="w-9 h-9 rounded-lg border flex items-center justify-center relative transition-colors bg-slate-50 border-slate-200 opacity-100 hover:bg-slate-100">
                <Bell size={15} strokeWidth={2.5} className="text-slate-600" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>

            {/* Logout Button */}
            <button onClick={handleLogout} title="Logout"
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
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
                {/* Greeting */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">{greet()}, {currentUser?.name?.split(" ")[0] || "User"}</h2>
                    <p className="text-sm mt-0.5 text-slate-700">{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowHireStaff(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                      <UserPlus size={14} /> Hire Staff
                    </button>
                    <button onClick={() => setShowCreateDept(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100">
                      <Building2 size={14} /> New Dept
                    </button>
                  </div>
                </div>

                {/* Date Filter */}
                <DateRangeFilter 
                  startDate={filterStartDate} 
                  endDate={filterEndDate} 
                  onStartDateChange={setFilterStartDate}
                  onEndDateChange={setFilterEndDate}
                  onClear={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                />

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Employees" value={employees.length} sub="Across all departments" icon={<Users size={15} />} trend="+2 this month" onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="Departments"     value={departments.length} sub="Active units"         icon={<Building2 size={15} />} onClick={() => setActiveTab("Organization")} />
                  <StatCard label="Active Projects"  value={projects.filter(p => p.status !== "DONE").length} sub="In progress" icon={<Briefcase size={15} />} trend="3 due this week" trendUp={false} onClick={() => setActiveTab("Projects")} />
                  <StatCard label="Budget Ledger"   value={budgetMetrics.budget} sub="Monthly payroll"            icon={<DollarSign size={15} />} gold trend={budgetMetrics.trend} onClick={() => setActiveTab("Payroll")} />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-5"><BroadcastWidget broadcasts={broadcasts} input={broadcastInput} onInput={setBroadcastInput} onSubmit={handleBroadcast} isDateInRange={isDateInRange} onClickDetail={() => setActiveTab("Dashboard")} /></div>
                  <div className="col-span-12 lg:col-span-4"><LeaveWidget onRefresh={syncSystem} isDateInRange={isDateInRange} onClickDetail={() => setActiveTab("Leaves")} /></div>
                  <div className="col-span-12 lg:col-span-3"><MiniCalendar onClickDetail={() => {}} /></div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-4"><ActivityFeed isDateInRange={isDateInRange} onClickDetail={() => {}} /></div>
                  <div className="col-span-12 lg:col-span-4"><TeamCard employees={employees} onClickDetail={() => setActiveTab("Workforce")} /></div>
                  <div className="col-span-12 lg:col-span-4"><BarChart data={[40,70,45,90,65,80,85]} label="Workforce Trend" onClickDetail={() => setActiveTab("Analytics")} /></div>
                </div>

                {/* Departments */}
                <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("Organization")}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-black">Departments</h3>
                    <button onClick={() => setActiveTab("Organization")} className="text-xs flex items-center gap-1 text-slate-700 hover:text-black transition-colors">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {departments.slice(0, 6).map(d => (
                      <DeptCard key={d.id} dept={d} count={employees.filter(e => e.department?.id === d.id).length}
                        onClick={() => { setSelectedDeptId(d.id); setActiveTab("Organization"); }} />
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("Projects")}>
                  <h3 className="text-sm font-semibold mb-4 text-black">Strategic Mission Board</h3>
                  <SuperAdminProjects projects={projects} />
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ────────────────────────────────────────── */}
            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <h2 className="text-xl font-bold text-black">Analytics</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Retention Rate"  value="94.2%"   icon={<TrendingUp size={15} />}  trend="Above 90% target" onClick={() => {}} />
                  <StatCard label="Avg Tenure"       value="2.4 yrs" icon={<Clock size={15} />}       sub="Per employee" onClick={() => {}} />
                  <StatCard label="Hiring Rate"      value={`+${Math.max(1, Math.floor(employees.length / 10))}%`}    icon={<UserPlus size={15} />}    trend="Recent hires" onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="Departments"      value={departments.length} icon={<AlertCircle size={15} />} trend={`${Math.round((departments.length / employees.length) * 100)}% coverage`}   trendUp={true} onClick={() => setActiveTab("Organization")} />
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-6"><BarChart data={[55,80,60,95,70,85,90]} label="Monthly Headcount" /></div>
                  <div className="col-span-12 lg:col-span-6"><BarChart data={[30,50,40,70,60,75,80]} label="Department Growth" /></div>
                  <div className="col-span-12 lg:col-span-4"><ActivityFeed /></div>
                  <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
                      <h3 className="text-sm font-semibold mb-4 text-black">Role Distribution</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Employees", count: employees.filter(e => e.role === "EMPLOYEE").length, pct: roleDistribution.employees, color: "bg-indigo-500" },
                          { label: "Managers",  count: employees.filter(e => e.role === "MANAGER").length,  pct: roleDistribution.managers, color: "bg-blue-800"  },
                          { label: "Admins",    count: employees.filter(e => e.role === "ADMIN").length,    pct: roleDistribution.admins, color: "bg-emerald-500"},
                        ].map(r => (
                          <div key={r.label}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs font-medium text-black">{r.label}</span>
                              <span className="text-xs text-slate-700">{r.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-300">
                              <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4"><TeamCard employees={employees} /></div>
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
                        <button onClick={() => setShowAssignMgr(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100">
                          <UserCheck size={14} /> Assign Manager
                        </button>
                        <button onClick={() => setShowCreateDept(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                          <Plus size={14} /> New Department
                        </button>
                      </div>
                    </div>
                    <AssignManagerModal open={showAssignMgr} onClose={() => setShowAssignMgr(false)} employees={employees} departments={departments}
                      onAssign={async (managerId: string, departmentIds: string[]) => {
                        await fetch("/api/hr/manager/assign", { 
                          method: "POST", 
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ managerId, departmentIds }) 
                        });
                        setShowAssignMgr(false); await syncSystem();
                      }} />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {departments.map(d => (
                        <DeptCard key={d.id} dept={d} count={employees.filter(e => e.department?.id === d.id).length} onClick={() => setSelectedDeptId(d.id)} />
                      ))}
                    </div>
                  </>
                ) : (
                  (() => {
                    const dept = departments.find(d => d.id === selectedDeptId);
                    const deptEmps = employees.filter(e => e.department?.id === selectedDeptId);
                    return (
                      <DepartmentDetailPage department={{id: dept!.id, name: dept!.name, head: dept?.head || ""}} employees={deptEmps} allDepartments={departments}
                        onBack={() => setSelectedDeptId(null)}
                        onShiftEmployee={async (empId, newDeptId, newRole) => {
                          await fetch("/api/hr/employee/shift", { 
                            method: "POST", 
                            headers: { "Content-Type": "application/json" }, 
                            body: JSON.stringify({ 
                              employeeId: empId, 
                              departmentId: newDeptId, 
                              role: newRole 
                            }) 
                          });
                          await syncSystem();
                        }} />
                    );
                  })()
                )}
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
                  <button onClick={() => setShowHireStaff(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                    <UserPlus size={14} /> Hire Staff
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Full-time"      value={employees.filter(e => e.role !== "MANAGER").length} icon={<Users size={15} />} onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="Managers"       value={employees.filter(e => e.role === "MANAGER").length} icon={<UserCheck size={15} />} onClick={() => setActiveTab("Workforce")} />
                  <StatCard label="New this month" value={2} icon={<UserPlus size={15} />} trend="+2 hired" onClick={() => setActiveTab("Workforce")} />
                </div>
                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <div className="p-4 border-b flex items-center gap-4 border-slate-200">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                      <input placeholder="Search employees…" value={payrollSearch} onChange={e => setPayrollSearch(e.target.value)}
                        className="pl-8 pr-4 py-2 text-sm border rounded-xl outline-none w-full bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors" />
                    </div>
                    <span className="text-xs text-slate-700">{filtered.length} results</span>
                  </div>
                  <div>
                    {filtered.map((emp) => (
                      <div key={emp.id} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-all border-slate-200 hover:bg-slate-100 cursor-pointer group" onClick={() => { setSelectedEmployeeInfo(emp); setShowEmployeeDetail(true); }}>
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

            {/* ── PROJECTS ──────────────────────────────────────────– */}
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
                    
                    {/* Projects by Department */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black">Projects by Department</h3>
                      {departments.length === 0 ? (
                        <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 border-slate-200">
                          <Briefcase size={32} className="text-slate-400" />
                          <p className="text-sm text-slate-700">No departments yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {departments.map(dept => {
                            const deptProjects = projects.filter(p => p.departmentId === dept.id);
                            const deptTasks = tasks.filter(t => t.departmentId === dept.id);
                            const planningCount = deptProjects.filter(p => p.status === "PLANNING").length;
                            const inProgressCount = deptProjects.filter(p => p.status === "IN_PROGRESS").length;
                            const completedCount = deptProjects.filter(p => p.status === "COMPLETED").length;
                            
                            return (
                              <motion.div key={dept.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedProjectDeptId(dept.id)}
                                className="rounded-2xl border p-5 bg-slate-50 border-slate-200 hover:border-slate-400 transition-all cursor-pointer hover:shadow-md">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-black">{dept.name}</h4>
                                    <p className="text-xs text-slate-600 mt-0.5">{deptProjects.length} project{deptProjects.length !== 1 ? 's' : ''} • {deptTasks.length} task{deptTasks.length !== 1 ? 's' : ''}</p>
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
                                    {deptProjects.slice(0, 3).map(proj => (
                                      <div key={proj.id} className="text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-slate-700 font-medium truncate">{proj.name}</span>
                                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                            ${proj.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                              proj.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                              'bg-blue-100 text-blue-700'}`}>
                                            {proj.status.replace('_', ' ')}
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
                ) : (
                  <>
                    {(() => {
                      const dept = departments.find(d => d.id === selectedProjectDeptId);
                      const deptProjects = projects.filter(p => p.departmentId === selectedProjectDeptId);
                      const deptTasks = tasks.filter(t => t.departmentId === selectedProjectDeptId);
                      
                      return (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedProjectDeptId(null)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                  <ChevronRight size={18} className="text-black rotate-180" />
                                </button>
                                <div>
                                  <h2 className="text-xl font-bold text-black">{dept?.name}</h2>
                                  <p className="text-sm mt-0.5 text-slate-700">{deptProjects.length} project{deptProjects.length !== 1 ? 's' : ''} • {deptTasks.length} task{deptTasks.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Projects List */}
                          {deptProjects.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-black">Projects</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {deptProjects.map(proj => (
                                  <div key={proj.id} className="rounded-lg border p-4 bg-slate-50 border-slate-200">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-black">{proj.name}</h4>
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                        ${proj.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                          proj.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                          'bg-blue-100 text-blue-700'}`}>
                                        {proj.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600">{proj.description || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Task Kanban */}
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
                  </>
                )}
              </motion.div>
            )}

            {/* ── PAYROLL ──────────────────────────────────────────── */}
            {activeTab === "Payroll" && (
              <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-black">Payroll</h2>
                    <p className="text-sm mt-0.5 text-slate-700">Salary management & contract audits</p>
                  </div>
                  <div className="flex gap-2">
                    {(["MONTH","DAY","HOUR"] as const).map(m => (
                      <button key={m} onClick={() => setSalaryMode(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                          ${salaryMode === m
                            ? "bg-black text-white border-black"
                            : "bg-slate-50 border-slate-200 text-black hover:bg-slate-100"}`}>
                        {m === "MONTH" ? "Monthly" : m === "DAY" ? "Daily" : "Hourly"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Total Payroll"  value={budgetMetrics.budget} icon={<DollarSign size={15} />} gold trend={budgetMetrics.trend} onClick={() => {}} />
                  <StatCard label="Avg Salary"     value={`Rs. ${Math.round(employees.reduce((s,e) => s+(e.salary||0),0)/Math.max(employees.length,1)).toLocaleString()}`} icon={<TrendingUp size={15} />} onClick={() => {}} />
                  <StatCard label="Pending Audits" value={salaryAudits.length}          icon={<FileText size={15} />}   sub="Require review" onClick={() => {}} />
                </div>
                <div className="rounded-2xl border p-4 flex items-center gap-4 bg-slate-50 border-slate-200">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                    <input placeholder="Search by name or role…" value={payrollSearch} onChange={e => setPayrollSearch(e.target.value)}
                      className="pl-8 pr-4 py-2 text-sm border rounded-xl outline-none w-full bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors" />
                  </div>
                  <span className="text-xs ml-auto text-slate-700">{filtered.length} of {employees.length}</span>
                </div>
                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-black">Contract Ledger</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["Employee","Department","Role","Rate","Last Audit","Actions"].map(h => (
                          <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(emp => {
                        const base = emp.salary || 0;
                        const div  = salaryMode === "HOUR" ? 160 : salaryMode === "DAY" ? 22 : 1;
                        const rate = (base / div).toLocaleString("en-IN");
                        return (
                          <tr key={emp.id} className="border-b last:border-0 transition-all border-slate-200 hover:bg-slate-100 cursor-pointer group" onClick={() => { setSelectedEmployeeInfo(emp); setShowEmployeeDetail(true); }}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={emp.name} px={30} />
                                <span className="text-sm font-semibold text-black group-hover:text-blue-600 transition-colors">{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-700">{emp.department?.name || "—"}</td>
                            <td className="px-5 py-3.5"><Badge status={emp.role || "EMPLOYEE"} /></td>
                            <td className="px-5 py-3.5 text-sm font-semibold text-black">
                              Rs. {rate} <span className="text-xs font-normal text-slate-600">/{salaryMode.toLowerCase()}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-700">{emp.lastAudit || "Never"}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex gap-1">
                                <button onClick={() => { setFiscalTarget(emp); setBaseline(emp.salary?.toString() || "0"); setFiscalOpen(true); }}
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-black hover:bg-slate-200">Audit</button>
                                <button onClick={() => { setSelectedAuditEmp(emp); setShowAuditModal(true); }}
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-slate-700 hover:bg-slate-100">History</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Pending"  value={leaveStats.pending} icon={<Clock size={15} />} sub="Awaiting review" onClick={() => {}} />
                  <StatCard label="Approved" value={leaveStats.approved} icon={<CheckCircle size={15} />} trend="This month" onClick={() => {}} />
                  <StatCard label="Rejected" value={leaveStats.rejected} icon={<MinusCircle size={15} />} trendUp={false} onClick={() => {}} />
                </div>
                
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12"><LeaveWidget onRefresh={syncSystem} /></div>
                </div>
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
                    <input type="number" value={baseline} onChange={e => setBaseline(e.target.value)}
                      className="w-full border-b py-2 text-2xl font-bold outline-none bg-transparent transition-colors border-slate-300 focus:border-blue-900 text-black" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1 text-slate-600">Duration</label>
                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                      className="w-full py-1 text-sm outline-none bg-transparent opacity-60 border-b text-black border-slate-300" />
                  </div>
                </div>
              </div>
              <div className="w-7/12 p-7 flex flex-col justify-between bg-slate-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2 text-slate-600"><Calendar size={11} /> Audit Cycle Period</label>
                    <div className="flex gap-2">
                      {[startDate, endDate].map((v, idx) => (
                        <input key={idx} type="date" value={v} onChange={e => idx === 0 ? setStartDate(e.target.value) : setEndDate(e.target.value)}
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
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2 text-black/70"><MinusCircle size={11} /> Manual Deduction (NPR)</label>
                    <input type="number" value={deduction} onChange={e => setDeduction(e.target.value)} placeholder="0.00"
                      className="w-full border rounded-lg px-4 py-3 text-xl font-bold outline-none transition-colors bg-white border-slate-300 text-black focus:border-blue-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2 text-slate-600">Audit Note</label>
                    <textarea value={authNote} onChange={e => setAuthNote(e.target.value)} placeholder="Reason for adjustment…"
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
                  {auditLogs.map(log => (
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
      <EmployeeDetailModal employee={selectedEmployeeInfo} isOpen={showEmployeeDetail} onClose={() => { setShowEmployeeDetail(false); setSelectedEmployeeInfo(null); }} />
    </div>
  );
}