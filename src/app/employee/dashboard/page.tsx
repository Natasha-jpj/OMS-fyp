"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock, Zap, Activity, ShieldCheck,
  Camera, CheckCircle2, Target, Layers, Briefcase,
  MinusCircle, Bell, Search, TrendingUp, Calendar,
  FileText, BarChart2, ChevronRight, AlertCircle, X,
  ArrowUpRight, Users, ListChecks, Flame, Award, Focus,
  TrendingDown, Eye, Zap as Lightning,
  Megaphone, LogOut
} from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import { ChatWindow } from "../../components/ChatWindow";
import { ChatConnectButton } from "../../components/ChatConnectButton";
import CalendarWidget from "../../components/CalendarWidget";
import LeaveRequestModal from "../components/LeaveRequestModal";
import AttendanceModal from "../components/AttendanceModal";
import { useRealTimeGlobal } from "../../../hooks/useRealTime";

// ─── NAV TABS ────────────────────────────────────────────────────────────────
const TABS = ["Dashboard", "Task Board", "Leave Requests", "Workbook"];

// ─── STATUS COLORS ────────────────────────────────────────────────────────────
const statusStyle: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
};

// ─── CIRCULAR PROGRESS ────────────────────────────────────────────────────────
function CircularProgress({ percentage, size = 80, strokeWidth = 4, color = "from-emerald-400 to-emerald-600", label }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} stroke="#000" strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-black">{percentage}%</span>
        </div>
      </div>
      {label && <p className="text-[10px] text-slate-500 mt-2 font-medium text-center">{label}</p>}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = false, sub }: {
  label: string; value: string | number; icon: React.ReactNode; accent?: boolean; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border flex flex-col gap-3 ${accent ? "bg-black text-white border-black" : "bg-white border-slate-200"}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${accent ? "text-white/60" : "text-slate-500"}`}>{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-white/10" : "bg-slate-100"}`}>
          <span className={accent ? "text-white" : "text-slate-600"}>{icon}</span>
        </div>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${accent ? "text-white" : "text-black"}`}>{value}</div>
      {sub && <p className={`text-xs ${accent ? "text-white/50" : "text-slate-500"}`}>{sub}</p>}
    </motion.div>
  );
}

// ─── BROADCAST CARD ────────────────────────────────────────────────────────────
function BroadcastCard({ msg }: { msg: any }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white group">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Bell size={13} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 leading-relaxed">{msg.message}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(msg.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── TASK ROW ────────────────────────────────────────────────────────────────
const taskStatusStyle: Record<string, string> = {
  TODO:        "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  IN_REVIEW:   "bg-amber-50 text-amber-700",
  DONE:        "bg-emerald-50 text-emerald-700",
};

function TaskRow({ task }: { task: any }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === "DONE" ? "bg-emerald-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : task.status === "IN_REVIEW" ? "bg-amber-400" : "bg-slate-300"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black truncate">{task.title}</p>
        {task.description && <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>}
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${taskStatusStyle[task.status] || "bg-slate-100 text-slate-600"}`}>
        {task.status?.replace("_", " ") || "TODO"}
      </span>
      {task.dueDate && (
        <span className="text-[10px] text-slate-400 font-medium min-w-[72px] text-right">
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function EmployeeAuraPortal() {
  const router = useRouter();

  const [employee, setEmployee] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  const [myLeaveRequests, setMyLeaveRequests] = useState<any[]>([]);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSelectedDates, setLeaveSelectedDates] = useState<{ start: string; end?: string } | null>(null);

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [workbook, setWorkbook] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" 
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/choose-role");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCalendarDayClick = (dateStr: string) => {
    setLeaveSelectedDates({ start: dateStr });
    setLeaveModalOpen(true);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  useEffect(() => {
    fetch("/api/broadcasts?role=EMPLOYEE").then(r => r.json()).then(d => setBroadcasts(d.broadcasts || []));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return router.push("/choose-role");
    const parsed = JSON.parse(stored);
    setEmployee(parsed);

    async function fetchData() {
      try {
        const [taskRes, userRes, leaveRes] = await Promise.all([
          fetch(`/api/employee/tasks`),
          fetch(`/api/user`),
          fetch(`/api/leave`),
        ]);
        setTasks((await taskRes.json()).tasks || []);
        setAllEmployees((await userRes.json()).users || []);
        setMyLeaveRequests((await leaveRes.json()).leaveRequests || []);
      } catch {}
      finally { setLoading(false); }
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!employee?.id) return;
    fetch(`/api/employee/attendance?employeeId=${employee.id}`)
      .then(r => r.json())
      .then(data => {
        const records = data.records || [];
        const lastIn  = records.filter((r: any) => r.type === "CHECKIN").sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const lastOut = records.filter((r: any) => r.type === "CHECKOUT").sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        if (lastIn && (!lastOut || new Date(lastIn.timestamp) > new Date(lastOut.timestamp))) {
          setHasCheckedIn(true);
          setCheckInTime(new Date(lastIn.timestamp).toLocaleTimeString());
        } else { setHasCheckedIn(false); setCheckInTime(""); }
      });
  }, [employee?.id]);

  useRealTimeGlobal(() => {});

  const captureCheckIn = async (photoData?: string) => {
    if (!employee?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/employee/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          timestamp: new Date().toISOString(),
          photo: photoData || null
        }),
      });
      if (res.ok) { setHasCheckedIn(true); setCheckInTime(new Date().toLocaleTimeString()); setIsCheckInOpen(false); }
    } catch { setAttendanceError("Sync Failed"); } finally { setAttendanceLoading(false); }
  };

  const captureCheckOut = async (photoData?: string) => {
    if (!employee?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/employee/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          timestamp: new Date().toISOString(),
          photo: photoData || null
        }),
      });
      if (res.ok) { setHasCheckedIn(false); setIsCheckOutOpen(false); }
    } catch { setAttendanceError("Sync Failed"); } finally { setAttendanceLoading(false); }
  };

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const doneTasks     = tasks.filter(t => t.status === "DONE").length;
  const pendingTasks  = tasks.filter(t => t.status !== "DONE").length;
  const progressPct   = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center animate-pulse"><Activity size={18} className="text-white" /></div>
        <p className="text-xs text-slate-500 font-medium">Loading your workspace…</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#F8F9FB] text-black font-sans flex flex-col overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 z-50">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between">

          {/* Logo + Nav */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-black">AuraFlow</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative px-3.5 py-2 text-[11px] font-semibold tracking-wide rounded-lg transition-all
                    ${activeTab === tab ? "text-black bg-slate-100" : "text-slate-500 hover:text-black hover:bg-slate-50"}`}>
                  {tab}
                  {activeTab === tab && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-3 right-3 h-0.5 bg-black rounded-full" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            {/* Connect Button */}
            <ChatConnectButton onClick={() => setChatOpen(true)} isActive={chatOpen} />

            {/* Bell */}
            <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center relative hover:bg-slate-50 transition-colors">
              <Bell size={15} className="text-slate-500" />
              {broadcasts.length > 0 && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>

            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-40">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input placeholder="Search…" className="text-xs bg-transparent outline-none text-black placeholder:text-slate-400 w-full" />
            </div>

            {/* Logout Button */}
            <button onClick={handleLogout} title="Logout"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
              <LogOut size={15} className="text-slate-500" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {employee?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1750px] mx-auto px-6 py-6 space-y-6">

          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ─────────────────────────────────────────────── */}
            {activeTab === "Dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Header Section */}
                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
                  className="px-2">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={12} className="text-slate-400" />
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Dashboard • {employee?.name}</p>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-black">{greet()}, <span className="text-slate-600">{employee?.name?.split(" ")[0] || "there"}</span></h1>
                  <p className="text-sm text-slate-500 mt-2">You have {pendingTasks} active task{pendingTasks !== 1 ? 's' : ''} • {myLeaveRequests.filter(l => l.status === "PENDING").length} leave request{myLeaveRequests.filter(l => l.status === "PENDING").length !== 1 ? 's' : ''} pending</p>
                </motion.header>

                {/* 3-Column Grid Layout */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
                  className="grid grid-cols-12 gap-6">

                  {/* Left Column - Announcements */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="h-[310px] bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-slate-300 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell size={16} className="text-slate-600" />
                        <h3 className="text-sm font-bold text-black">Announcements</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Team Updates</p>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                        {broadcasts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
                            <Bell size={24} className="mb-2 opacity-30" />
                            <p className="text-xs text-center font-medium">No announcements yet</p>
                            <p className="text-[9px] text-slate-500 mt-1">Check back soon for updates</p>
                          </div>
                        ) : broadcasts.slice(0, 4).map((b, i) => (
                          <motion.div key={b.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors group cursor-pointer">
                            <div className="text-xs text-black line-clamp-2 font-medium">{b.message}</div>
                            <div className="text-[9px] text-slate-500 mt-1.5 group-hover:text-slate-600">{new Date(b.createdAt).toLocaleString()}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Operational Status */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="h-[310px] bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-black mb-1">Operational Status</h3>
                        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Today</p>
                        {/* Biometric */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${hasCheckedIn ? "bg-emerald-400 shadow-sm shadow-emerald-400/60" : "bg-amber-400 animate-pulse"}`} />
                          <div>
                            <p className="text-base font-bold text-black">{hasCheckedIn ? "Checked In" : "Not Checked In"}</p>
                            {hasCheckedIn && checkInTime && <p className="text-[10px] text-slate-400">Since {checkInTime}</p>}
                          </div>
                        </div>
                        <div className="h-px bg-slate-100 mb-4" />
                        {/* Mini stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Leave Bal.</p>
                            <p className="text-lg font-bold text-black mt-1">12 Days</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Work Week</p>
                            <p className="text-lg font-bold text-black mt-1">48.2h</p>
                          </div>
                        </div>
                      </div>
                      {/* Check-in / Check-out buttons */}
                      <div className="flex gap-2 mt-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setIsCheckInOpen(true)}
                          disabled={hasCheckedIn || attendanceLoading}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all
                            ${hasCheckedIn ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-black text-white hover:bg-slate-900"}`}>
                          <Camera size={13} /> {hasCheckedIn ? "✓ Checked In" : "Check In"}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setIsCheckOutOpen(true)}
                          disabled={!hasCheckedIn || attendanceLoading}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          <Clock size={13} /> Check Out
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Calendar */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="h-[310px] bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar size={16} className="text-slate-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave Calendar</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <CalendarWidget onDayClick={handleCalendarDayClick} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Lower Section - Additional Insights */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="grid grid-cols-12 gap-6">

                  {/* Performance Metrics */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Performance</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-6">This Week</p>
                      <div className="space-y-6">
                        {/* Circular Progress */}
                        <div className="flex justify-around items-start">
                          <div className="text-center">
                            <CircularProgress percentage={progressPct} size={70} color="from-emerald-400 to-emerald-600" label="Completion" />
                          </div>
                          <div className="text-center">
                            <CircularProgress 
                              percentage={tasks.length > 0 ? tasks.filter(t => t.status === "IN_PROGRESS").length / tasks.length * 100 : 0} 
                              size={70} 
                              color="from-blue-400 to-blue-600" 
                              label="In Progress" 
                            />
                          </div>
                          <div className="text-center">
                            <CircularProgress 
                              percentage={tasks.length > 0 ? tasks.filter(t => t.status === "IN_REVIEW").length / tasks.length * 100 : 0} 
                              size={70} 
                              color="from-amber-400 to-amber-600" 
                              label="Review" 
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-4 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 font-medium">Daily Average</span>
                              <TrendingUp size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-black">8.2h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 font-medium">Completion Rate</span>
                              <ArrowUpRight size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600">+12%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Recent Activity</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Last 7 Days</p>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto">
                        {tasks.length > 0 ? (
                          [
                            ...tasks.slice(0, 1).map(task => ({
                              icon: task.status === "DONE" ? <CheckCircle2 size={12} /> : task.status === "IN_REVIEW" ? <Eye size={12} /> : task.status === "IN_PROGRESS" ? <Lightning size={12} /> : <ListChecks size={12} />,
                              action: task.status === "DONE" ? "Task Completed" : task.status === "IN_REVIEW" ? "Pending Review" : task.status === "IN_PROGRESS" ? "In Progress" : "New Task",
                              desc: task.title,
                              time: "Recently",
                              color: task.status === "DONE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : task.status === "IN_REVIEW" ? "bg-amber-50 text-amber-700 border-amber-200" : task.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"
                            })),
                          ].map((act, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                              className={`p-3 rounded-lg border text-[10px] ${act.color}`}>
                              <div className="flex items-center gap-2 font-bold mb-1">
                                {act.icon}
                                {act.action}
                              </div>
                              <div className="opacity-75 truncate text-xs">{act.desc}</div>
                              <div className="opacity-60 text-[9px] mt-1">{act.time}</div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            <Activity size={20} className="mx-auto mb-2 opacity-30" />
                            <p>No activity yet</p>
                            <p className="text-[9px] mt-1">Get started with your first task</p>
                          </div>
                        )}
                        {myLeaveRequests.length > 0 && (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                            className="p-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[10px]">
                            <div className="font-bold flex items-center gap-2 mb-1">
                              <Calendar size={12} />
                              Leave Request
                            </div>
                            <div className="opacity-75">{myLeaveRequests[0].status} - {myLeaveRequests.length} request(s)</div>
                            <div className="opacity-60">Pending approval</div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Quick Actions</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Common Tasks</p>
                      <div className="space-y-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setLeaveModalOpen(true)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all flex items-center gap-2 group">
                          <Calendar size={13} className="group-hover:text-purple-600" /> Request Leave
                          <ChevronRight size={12} className="ml-auto text-slate-300" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("Task Board")}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all flex items-center gap-2 group">
                          <Layers size={13} className="group-hover:text-orange-600" /> Task Board
                          <ChevronRight size={12} className="ml-auto text-slate-300" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("Workbook")}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all flex items-center gap-2 group">
                          <FileText size={13} className="group-hover:text-indigo-600" /> Daily Workbook
                          <ChevronRight size={12} className="ml-auto text-slate-300" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all flex items-center gap-2 group relative">
                          <Focus size={13} className="group-hover:text-blue-600" /> Focus Mode
                          <span className="ml-auto flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span className="text-[9px] text-blue-500">Beta</span>
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>


                {/* Team Overview & Upcoming */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                  className="grid grid-cols-12 gap-6">

                  {/* Team Members */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Team Overview</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Total Members</p>
                      <div className="mb-6">
                        <div className="text-3xl font-bold text-black">{allEmployees.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Active collaborators</p>
                      </div>
                      
                      {/* Team Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-emerald-700 font-medium">Available</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-700">{Math.ceil(allEmployees.length * 0.75)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100 hover:border-amber-200 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs text-amber-700 font-medium">On Leave</span>
                          </div>
                          <span className="text-sm font-bold text-amber-700">{Math.ceil(allEmployees.length * 0.15)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span className="text-xs text-slate-700 font-medium">Offline</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{Math.ceil(allEmployees.length * 0.1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Upcoming Deadlines</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">Next 7 Days</p>
                      <div className="space-y-2">
                        {tasks.filter(t => t.dueDate).slice(0, 3).map((task, i) => {
                          const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          const isUrgent = daysUntilDue <= 1;
                          return (
                            <motion.div key={task.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                              className={`p-3 bg-slate-50 rounded-lg border transition-all hover:shadow-sm flex items-start gap-3 ${isUrgent ? "border-red-200 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}>
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isUrgent ? "bg-red-500" : "bg-slate-400"}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-black truncate">{task.title}</div>
                                <div className={`text-[9px] mt-1 font-medium ${isUrgent ? "text-red-600" : "text-slate-500"}`}>
                                  {daysUntilDue <= 0 ? "Today!" : daysUntilDue === 1 ? "Tomorrow" : `In ${daysUntilDue} days`}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        {tasks.filter(t => t.dueDate).length === 0 && (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            <Calendar size={20} className="mx-auto mb-2 opacity-20" />
                            <p>No upcoming deadlines</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Summary */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-1">Weekly Summary</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-4">This Week</p>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-600 font-medium">Hours Logged</span>
                            <span className="text-sm font-bold text-black">48.2h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 0.8, delay: 0.6 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                            </div>
                            <span className="text-[9px] text-emerald-600 font-bold whitespace-nowrap">On Target</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-2">8 hours/day average</div>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 font-medium">Tasks Completed</span>
                              <ArrowUpRight size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-black">{doneTasks}/{tasks.length}</span>
                          </div>
                          <div className="text-[9px] text-emerald-600 font-bold">{Math.round((doneTasks/tasks.length)*100) || 0}% complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                      
                    
              </motion.div>
            )}

            {/* ── LEAVE REQUESTS TAB ───────────────────────────────────── */}
            {activeTab === "Leave Requests" && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">🏖️ Leave Management</h2>
                    <p className="text-sm text-slate-500 mt-1">{myLeaveRequests.length} total requests</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setLeaveSelectedDates({ start: new Date().toISOString().split("T")[0] }); setLeaveModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors shadow-md">
                    <Calendar size={14} /> New Request
                  </motion.button>
                </div>

                {/* Leave Statistics */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <div className="grid grid-cols-3 gap-4">
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <StatCard label="Pending"  value={myLeaveRequests.filter(l => l.status === "PENDING").length}  icon={<AlertCircle size={15} />} sub="Awaiting review" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <StatCard label="Approved" value={myLeaveRequests.filter(l => l.status === "APPROVED").length} icon={<CheckCircle2 size={15} />} sub="Confirmed" />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <StatCard label="Rejected" value={myLeaveRequests.filter(l => l.status === "REJECTED").length} icon={<MinusCircle size={15} />} sub="Declined" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Leave Balance Card */}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="col-span-12 lg:col-span-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-emerald-900 mb-1">Annual Leave Balance</h3>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-4">2026</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-emerald-800 font-medium">Available Days</span>
                            <span className="text-lg font-bold text-emerald-700">12</span>
                          </div>
                          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 0.8, delay: 0.35 }}
                              className="h-full bg-emerald-600 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Requests Table */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all">
                  {myLeaveRequests.length === 0 ? (
                    <div className="py-24 flex flex-col items-center gap-4 text-slate-400">
                      <Calendar size={32} className="opacity-20" />
                      <div className="text-center">
                        <p className="text-sm font-medium">No leave requests submitted yet</p>
                        <p className="text-[10px] mt-1">Create your first leave request above</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {["Title", "Period", "Duration", "Reason", "Status"].map(h => (
                            <th key={h} className="px-6 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myLeaveRequests.map((req, idx) => (
                          <motion.tr key={req.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                            className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-black">{req.title}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                              {Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{req.reason || "—"}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wide inline-block ${statusStyle[req.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                {req.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </motion.div>

                {/* Calendar + Tips */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-4">📅 Select Dates</h3>
                      <CalendarWidget onDayClick={handleCalendarDayClick} />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-blue-900 mb-3">💡 Leave Policy</h3>
                      <ul className="space-y-2.5 text-[11px] text-blue-800 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="font-bold">•</span>
                          Max 3 days per request
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">•</span>
                          Approve within 24 hours
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">•</span>
                          Carry over 5 days/year
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold">•</span>
                          Holidays excluded
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── TASK BOARD TAB ───────────────────────────────────────── */}
            {activeTab === "Task Board" && (
              <motion.div key="taskboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">📌 Task Board</h2>
                    <p className="text-sm text-slate-500 mt-1">Drag tasks between columns to update status · {tasks.length} total tasks</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <KanbanBoard initialTasks={tasks} isManagerView={false} />
                </div>
              </motion.div>
            )}

            {/* ── WORKBOOK TAB ──────────────────────────────────────────── */}
            {activeTab === "Workbook" && (
              <motion.div key="workbook" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">📝 End-of-Day Workbook</h2>
                  <p className="text-sm text-slate-500 mt-1">Daily operational log for management review</p>
                </div>

                {/* Today's Summary */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-4">Today&apos;s Summary</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Tasks Completed</p>
                          <p className="text-3xl font-bold text-emerald-600 mt-2">{doneTasks}</p>
                          <p className="text-[10px] text-emerald-600 mt-1">of {tasks.length} total</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">In Progress</p>
                          <p className="text-3xl font-bold text-blue-600 mt-2">{tasks.filter(t => t.status === "IN_PROGRESS").length}</p>
                          <p className="text-[10px] text-blue-600 mt-1">actively working</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pending Review</p>
                          <p className="text-3xl font-bold text-amber-600 mt-2">{tasks.filter(t => t.status === "IN_REVIEW").length}</p>
                          <p className="text-[10px] text-amber-600 mt-1">awaiting feedback</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                      <h3 className="text-sm font-bold text-black mb-4">💡 Tips for Better Logs</h3>
                      <ul className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-emerge ld-600 font-bold">•</span>
                          Be specific about completed tasks and outcomes
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          Mention blockers and how you addressed them
                        </li>
                        <li className="flex gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          Include collaboration and team interactions
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-600 font-bold">•</span>
                          Note any upcoming priorities
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Workbook Entry */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl border border-slate-200 p-8 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                    <BarChart2 size={14} className="text-slate-500" />
                    <p className="text-xs text-slate-600 font-bold">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <textarea
                    value={workbook}
                    onChange={e => setWorkbook(e.target.value)}
                    placeholder="Summarise your progress, blockers, and completed tasks for today…"
                    className="w-full h-56 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-black outline-none focus:border-slate-400 focus:ring-2 focus:ring-black/5 transition-all resize-none placeholder:text-slate-400"
                  />
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setWorkbook("")}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                      Clear
                    </button>
                    <button className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                      <BarChart2 size={14} /> Submit to Team Lead
                    </button>
                  </div>
                </motion.div>

                {/* Previous Entries */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <h3 className="text-sm font-bold text-black mb-4">📋 Recent Entries</h3>
                  <div className="space-y-3">
                    {[
                      { date: "Apr 4, 2026", summary: "Completed design system overhaul. Fixed 3 bugs in production." },
                      { date: "Apr 3, 2026", summary: "Team meeting on Q2 roadmap. Updated documentation." },
                      { date: "Apr 2, 2026", summary: "Implemented new API endpoints. Code review with team." },
                    ].map((entry, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        <p className="text-xs font-bold text-slate-600 uppercase">{entry.date}</p>
                        <p className="text-sm text-slate-700 mt-2">{entry.summary}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── GLOBAL MESSENGER ──────────────────────────────────────────────── */}
      <ChatWindow currentUser={employee} userType="EMPLOYEE" isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {leaveModalOpen && (
          <LeaveRequestModal
            selectedDates={leaveSelectedDates}
            onClose={() => setLeaveModalOpen(false)}
            onSubmit={async data => {
              try {
                const res = await fetch("/api/leave", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                if (res.ok) { setLeaveModalOpen(false); const d = await fetch(`/api/leave`).then(r => r.json()); setMyLeaveRequests(d.leaveRequests || []); }
              } catch { alert("Failed to submit leave request"); }
            }}
          />
        )}
        <AttendanceModal title="Check In" isOpen={isCheckInOpen} onCancel={() => setIsCheckInOpen(false)} onConfirm={(photo) => captureCheckIn(photo)} loading={attendanceLoading} />
        <AttendanceModal title="Check Out" isOpen={isCheckOutOpen} onCancel={() => setIsCheckOutOpen(false)} onConfirm={(photo) => captureCheckOut(photo)} loading={attendanceLoading} />
      </AnimatePresence>
    </div>
  );
}