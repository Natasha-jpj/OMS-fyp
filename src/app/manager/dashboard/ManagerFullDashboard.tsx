"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users, Search, Plus, Clock, TrendingUp, Zap, MessageSquare,
  ChevronRight, X, Send, Activity, ShieldCheck, Layers,
  Calendar as CalendarIcon, AlertCircle, CheckCircle, Play, Square, Briefcase,
  Target, ArrowUpRight, Landmark, BarChart2, ListChecks, Calendar, Building2,
  Settings, Bell, FileText, PieChart, TrendingDown, Award, MoreHorizontal,
  Briefcase as BriefcaseIcon, DollarSign, LayoutDashboard, UserCheck, MinusCircle, ArrowDownCircle, LogOut
} from "lucide-react";
import { NewDirectiveModal } from "./NewDirectiveModal";
import { NewProjectModal } from "./NewProjectModal";
import { useRealTimeGlobal } from "../../../hooks/useRealTime";
import { sendMessage } from "../../actions/messaging";
import { ChatWindow } from "../../components/ChatWindow";
import { ChatConnectButton } from "../../components/ChatConnectButton";
import KanbanBoard from "../../employee/dashboard/KanbanBoard";
import CalendarWidget from "../../components/CalendarWidget";
import LeaveRequestModal from "../../employee/components/LeaveRequestModal";

// ─── AVATAR ─────────────────────────────────────────────────────────────
function Avatar({ name, px = 36 }: { name: string; px?: number }) {
  const colors = ["#001a4d", "#1a3a66", "#003d99", "#0052cc", "#1a47a0", "#0040bf", "#004da6"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: px, height: px, background: bg, fontSize: px * 0.38 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── STAT CARD ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, trend, trendUp = true, gold = false }:
  { label: string; value: string | number; sub?: string; icon: React.ReactNode; trend?: string; trendUp?: boolean; gold?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border flex flex-col gap-3 transition-colors
        ${gold
          ? "bg-black text-white border-black"
          : "bg-slate-50 border-slate-200"}`}>
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

// ─── BROADCAST WIDGET ───────────────────────────────────────────────────
function BroadcastWidget({ broadcasts, input, onInput, onSubmit }:
  { broadcasts: any[]; input: string; onInput: (v: string) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col h-full bg-slate-50 border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-black">Announcements</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-500 font-medium">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 min-h-[120px]">
        {broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-700">
            <MessageSquare size={24} className="opacity-30" /><span className="text-sm">No announcements</span>
          </div>
        ) : broadcasts.map(b => (
          <div key={b.id} className="p-3 rounded-xl border bg-slate-150 border-slate-300">
            <p className="text-sm text-black">{b.message}</p>
            <p className="text-[11px] mt-1 text-slate-600">{new Date(b.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={input} onChange={e => onInput(e.target.value)}
          className="flex-1 text-sm border rounded-xl px-4 py-2.5 outline-none transition-colors bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900"
          placeholder="Send announcement…" />
        <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors bg-black text-white hover:bg-slate-900">
          <Send size={13} /> Post
        </button>
      </form>
    </div>
  );
}

// ─── MINI CALENDAR ──────────────────────────────────────────────────────
function MiniCalendar() {
  const today = new Date();
  const todayDate = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" });
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-black">{monthName}</h3>
        <Calendar size={14} className="text-slate-700" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
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
        <span className="text-[11px] font-medium text-slate-600">Team tracking active</span>
      </div>
    </div>
  );
}

// ─── TEAM CARD ──────────────────────────────────────────────────────────
function TeamCard({ employees }: { employees: any[] }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col h-full bg-slate-50 border-slate-200">
      <h3 className="text-sm font-semibold text-black mb-4">Team ({employees.length})</h3>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {employees.slice(0, 5).map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border bg-slate-150 border-slate-300 hover:border-slate-400 transition-colors">
            <Avatar name={e.name} px={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-black">{e.name}</p>
              <p className="text-[11px] truncate text-slate-600">{e.position || e.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function ManagerFullDashboard({ allEmployees = [] }: any) {
  const router = useRouter();
  const NAV = [
    { id: "Dashboard", icon: LayoutDashboard },
    { id: "Analytics", icon: PieChart },
    { id: "Team", icon: Users },
    { id: "Operations", icon: Layers },
    { id: "Leave Requests", icon: Calendar },
    { id: "Attendance", icon: UserCheck }
  ];

  // States
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [manager, setManager] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastInput, setBroadcastInput] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSelectedDates, setLeaveSelectedDates] = useState<{ start: string; end?: string }>({ start: "" });
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [teamSearch, setTeamSearch] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoData, setSelectedPhotoData] = useState<string | null>(null);
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

  useRealTimeGlobal((newMsg: any) => {});

  const fetchData = useCallback(async (deptId: string) => {
    setLoading(true);
    try {
      const [empRes, taskRes, projRes] = await Promise.all([
        fetch(`/api/manager/employees?deptId=${deptId}`, { credentials: "include" }),
        fetch(`/api/manager/tasks`, { credentials: "include" }),
        fetch(`/api/manager/projects?deptId=${deptId}`, { credentials: "include" })
      ]);
      
      // Handle tasks response
      if (!taskRes.ok) {
        const text = await taskRes.text();
        console.error("Task API error response:", taskRes.status, text);
        setTasks([]);
      } else {
        try {
          const taskData = await taskRes.json();
          console.log("Raw Task API response:", taskData);
          console.log("Task array:", taskData.tasks);
          console.log("Tasks count:", taskData.tasks?.length || 0);
          setTasks(taskData.tasks || []);
        } catch (e) {
          console.error("Failed to parse task response:", e);
          setTasks([]);
        }
      }
      
      // Handle employees response
      if (empRes.ok) {
        try {
          const empData = await empRes.json();
          console.log("Employees:", empData.employees?.length || 0);
          setEmployees(empData.employees || empData || []);
        } catch (e) {
          console.error("Failed to parse employees response:", e);
          setEmployees([]);
        }
      } else {
        console.error("Employees API error:", empRes.status);
        setEmployees([]);
      }
      
      // Handle projects response
      if (projRes.ok) {
        try {
          const projData = await projRes.json();
          console.log("Projects:", projData.projects?.length || 0);
          setProjects(projData.projects || projData || []);
        } catch (e) {
          console.error("Failed to parse projects response:", e);
          setProjects([]);
        }
      } else {
        console.error("Projects API error:", projRes.status);
        setProjects([]);
      }
    } catch (error) {
      console.error("Fetch Promise.all Error:", error);
      setTasks([]);
      setEmployees([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return router.push("/choose-role");
    const parsed = JSON.parse(savedUser);
    if (parsed.role !== "MANAGER") return router.push("/choose-role");

    // Fetch fresh manager profile to get updated departmentId (in case they were assigned to a department)
    fetch("/api/manager/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.manager) {
          const manager = data.manager;
          // Update localStorage if departmentId changed
          if (manager.departmentId !== parsed.departmentId) {
            parsed.departmentId = manager.departmentId;
            localStorage.setItem("user", JSON.stringify(parsed));
          }
          setManager(manager);
          
          // Load data if manager now has a department
          if (manager.departmentId) {
            fetchData(manager.departmentId);
            fetch(`/api/manager/attendance?deptId=${manager.departmentId}`, { credentials: "include" })
              .then(res => {
                console.log("Attendance fetch response:", res.status);
                if (!res.ok) {
                  console.error("Attendance fetch failed with status:", res.status);
                  return { error: `HTTP ${res.status}` };
                }
                return res.json();
              })
              .then(data => {
                console.log("Attendance data:", data);
                setAttendanceRecords(data.records || []);
              })
              .catch(err => console.error("Attendance fetch error:", err));
            fetch(`/api/leave?type=manager`, { credentials: "include" })
              .then(res => res.json())
              .then(data => setLeaveRequests(data.leaveRequests || []))
              .catch(err => console.error("Leave fetch error:", err));
          } else {
            // No department assigned yet, allow dashboard to load
            setLoading(false);
          }
        }
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        // Fallback to localStorage data
        setManager(parsed);
        if (parsed.departmentId) {
          fetchData(parsed.departmentId);
        } else {
          setLoading(false);
        }
      });

    fetch('/api/broadcasts?role=MANAGER', { credentials: "include" })
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []))
      .catch(err => console.error("Broadcasts fetch error:", err));
  }, [router, fetchData]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-white text-black"><Zap className="animate-pulse" /></div>;

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const today = new Date().toDateString();
  const checkedInToday = attendanceRecords.filter((r) => r.type === "CHECKIN" && new Date(r.timestamp).toDateString() === today).length;
  const attendanceRate = employees.length ? Math.round((checkedInToday / employees.length) * 100) : 0;
  const taskCompletionRate = tasks.length ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100) : 0;
  const projectCompletionRate = projects.length ? Math.round((projects.filter((p) => p.status === "COMPLETED").length / projects.length) * 100) : 0;
  const leavePending = leaveRequests.filter((l) => l.status === "PENDING").length;
  const filteredTeam = employees.filter((e) => {
    const q = teamSearch.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      (e.role || "").toLowerCase().includes(q) ||
      (e.position || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className={`relative z-20 flex-shrink-0 flex flex-col border-r transition-all duration-300
        ${collapsed ? "w-[60px]" : "w-[220px]"} bg-white border-gray-200`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-[18px] border-b border-slate-200 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
            <Layers size={16} className="text-white" />
          </div>
          {!collapsed && <span className="text-[15px] font-bold tracking-tight text-black">AuraFlow</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} title={collapsed ? id : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
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
              { label: "New Task", icon: <BriefcaseIcon size={14} />, fn: () => setIsTaskModalOpen(true) },
              { label: "Team Overview", icon: <Users size={14} />, fn: () => setActiveTab("Team") },
              { label: "New Project", icon: <Plus size={14} />, fn: () => setIsProjectModalOpen(true) },
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
              <Avatar name={manager?.name || "Manager"} px={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-black">{manager?.name || "Manager"}</p>
                <p className="text-[11px] truncate text-slate-700">Manager</p>
              </div>
              <button onClick={() => setCollapsed(true)} className="p-1 rounded-lg opacity-60 hover:bg-slate-100 transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={manager?.name || "Manager"} px={32} />
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
            <span className="text-xs text-slate-700">Manager Portal</span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-sm font-semibold text-black">{activeTab}</span>
          </div>

         

          <div className="flex items-center gap-1.5">
            <ChatConnectButton onClick={() => setChatOpen(true)} isActive={chatOpen} />
            {/* Logout Button */}
            <button onClick={handleLogout} title="Logout"
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
              <LogOut size={15} strokeWidth={2.5} className="text-slate-600" />
            </button>
            <button className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
              <Settings size={15} strokeWidth={2.5} className="text-slate-600" />
            </button>
            <Avatar name={manager?.name || "Manager"} px={36} />
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
                    <h2 className="text-2xl font-bold text-black">{greet()}, {manager?.name?.split(" ")[0] || "Manager"}</h2>
                    <p className="text-sm mt-0.5 text-slate-700">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIsTaskModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                      <Plus size={14} /> New Task
                    </button>
                    <button onClick={() => setIsProjectModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors bg-slate-50 border-slate-200 text-black hover:bg-slate-100">
                      <Briefcase size={14} /> New Project
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Team Size" value={employees.length} sub="Department members" icon={<Users size={15} />} trend="+2 this month" />
                  <StatCard label="Active Projects" value={projects.length} sub="In progress" icon={<Briefcase size={15} />} trend="3 due this week" />
                  <StatCard label="Pending Tasks" value={tasks.filter(t => t.status !== "DONE").length} sub="Awaiting completion" icon={<ListChecks size={15} />} trend="Attention needed" trendUp={false} />
                  <StatCard label="Team Attendance" value={`${attendanceRate}%`} sub="Present today" icon={<Activity size={15} />} gold trend="Live attendance" />
                </div>

                <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-black">Performance Snapshot</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Manager intelligence for tasks, projects, and attendance</p>
                    </div>
                    <button onClick={() => setActiveTab("Analytics")} className="text-xs font-medium text-slate-700 hover:text-black transition-colors">
                      Open analytics →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Task Completion</p>
                      <p className="mt-2 text-2xl font-bold text-black">{taskCompletionRate}%</p>
                      <p className="text-xs text-slate-500 mt-1">Completed vs total tasks</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Project Completion</p>
                      <p className="mt-2 text-2xl font-bold text-black">{projectCompletionRate}%</p>
                      <p className="text-xs text-slate-500 mt-1">Projects marked completed</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pending Leaves</p>
                      <p className="mt-2 text-2xl font-bold text-amber-600">{leavePending}</p>
                      <p className="text-xs text-slate-500 mt-1">Requests awaiting action</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Checked In Today</p>
                      <p className="mt-2 text-2xl font-bold text-black">{checkedInToday}</p>
                      <p className="text-xs text-slate-500 mt-1">From {employees.length} team members</p>
                    </div>
                  </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-5">
                    <BroadcastWidget broadcasts={broadcasts} input={broadcastInput} onInput={setBroadcastInput}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!broadcastInput.trim() || !manager) return;
                        await fetch('/api/broadcasts', { credentials: "include",
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ senderId: manager.id, senderRole: 'MANAGER', message: broadcastInput })
                        });
                        setBroadcastInput('');
                        fetch('/api/broadcasts?role=MANAGER', { credentials: "include" }).then(res => res.json()).then(data => setBroadcasts(data.broadcasts || []));
                      }} />
                  </div>
                  <div className="col-span-12 lg:col-span-4"><TeamCard employees={employees} /></div>
                  <div className="col-span-12 lg:col-span-3"><MiniCalendar /></div>
                </div>

                {/* Projects & Task Overview */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-7">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-black">Active Projects</h3>
                        <button onClick={() => setIsProjectModalOpen(true)} className="text-xs flex items-center gap-1 text-slate-700 hover:text-black transition-colors">
                          <Plus size={12} /> Add Project
                        </button>
                      </div>
                      <div className="space-y-3">
                        {projects.slice(0, 5).map((proj, idx) => {
                          const progress = Math.floor(Math.random() * (100 - 30) + 30);
                          return (
                            <div key={proj.id} className="flex items-center gap-4 p-4 rounded-xl border bg-slate-150 border-slate-300 hover:border-slate-400 transition-colors">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-black">{proj.name}</p>
                                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-black" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-black">{progress}%</p>
                                <p className="text-[10px] text-slate-600">{proj.status}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-5">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
                      <h3 className="text-sm font-semibold mb-4 text-black">Pending Tasks</h3>
                      <div className="space-y-2">
                        {tasks.filter(t => t.status !== "DONE").slice(0, 6).map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border bg-slate-150 border-slate-300 hover:border-slate-400 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-black truncate">{task.title}</p>
                              <p className="text-xs text-slate-600 truncate">{task.assignedTo?.name || "Unassigned"}</p>
                            </div>
                            <span className="text-xs text-slate-600 flex-shrink-0">{task.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ───────────────────────────────────────── */}
            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Team Analytics</h2>
                    <p className="text-sm mt-0.5 text-slate-700">Operational insights for manager decisions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Task Completion" value={`${taskCompletionRate}%`} sub={`${tasks.filter((t) => t.status === "DONE").length}/${tasks.length} done`} icon={<ListChecks size={15} />} />
                  <StatCard label="Project Completion" value={`${projectCompletionRate}%`} sub={`${projects.filter((p) => p.status === "COMPLETED").length}/${projects.length} closed`} icon={<Target size={15} />} />
                  <StatCard label="Attendance Rate" value={`${attendanceRate}%`} sub={`${checkedInToday}/${employees.length} checked in`} icon={<Activity size={15} />} />
                  <StatCard label="Leave Pending" value={leavePending} sub="Needs review" icon={<Clock size={15} />} trendUp={false} trend={leavePending > 3 ? "Action required" : "Under control"} />
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-6 rounded-2xl border p-5 bg-slate-50 border-slate-200">
                    <h3 className="text-sm font-semibold text-black mb-3">Task Status Breakdown</h3>
                    {[
                      { label: "To Do", value: tasks.filter((t) => t.status === "TODO").length, color: "bg-slate-500" },
                      { label: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS").length, color: "bg-blue-600" },
                      { label: "Done", value: tasks.filter((t) => t.status === "DONE").length, color: "bg-emerald-600" },
                    ].map((item) => {
                      const max = Math.max(tasks.length, 1);
                      const pct = Math.max(Math.round((item.value / max) * 100), item.value > 0 ? 4 : 0);
                      return (
                        <div key={item.label} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-700">{item.label}</span>
                            <span className="text-xs font-semibold text-black">{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="col-span-12 lg:col-span-6 rounded-2xl border p-5 bg-slate-50 border-slate-200">
                    <h3 className="text-sm font-semibold text-black mb-3">Project Status Breakdown</h3>
                    {[
                      { label: "Planning", value: projects.filter((p) => p.status === "PLANNING").length, color: "bg-indigo-600" },
                      { label: "In Progress", value: projects.filter((p) => p.status === "IN_PROGRESS").length, color: "bg-amber-500" },
                      { label: "Completed", value: projects.filter((p) => p.status === "COMPLETED").length, color: "bg-emerald-600" },
                    ].map((item) => {
                      const max = Math.max(projects.length, 1);
                      const pct = Math.max(Math.round((item.value / max) * 100), item.value > 0 ? 4 : 0);
                      return (
                        <div key={item.label} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-700">{item.label}</span>
                            <span className="text-xs font-semibold text-black">{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TEAM ────────────────────────────────────────────── */}
            {activeTab === "Team" && (
              <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Team</h2>
                    <p className="text-sm mt-0.5 text-slate-700">{employees.length} team members</p>
                  </div>
                  <button onClick={() => setActiveTab("Analytics")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
                    <PieChart size={14} /> Team Analytics
                  </button>
                </div>
                <div className="rounded-2xl border p-4 bg-slate-50 border-slate-200">
                  <div className="relative max-w-md">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search team by name, role, or position..."
                      className="w-full pl-8 pr-4 py-2 text-sm border rounded-xl outline-none bg-white border-slate-300 text-black placeholder:text-slate-500 focus:border-blue-900 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{filteredTeam.length} result(s)</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Team Size" value={employees.length} icon={<Users size={15} />} />
                  <StatCard label="Present Today" value={checkedInToday} icon={<Activity size={15} />} sub={`${attendanceRate}% attendance`} />
                  <StatCard label="On Leave" value={leaveRequests.filter(l => l.status === "APPROVED").length} icon={<Calendar size={15} />} />
                </div>
                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {filteredTeam.map(emp => (
                      <div key={emp.id} className="p-4 rounded-xl border bg-slate-150 border-slate-300 hover:border-slate-400 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.name} px={40} />
                            <div>
                              <p className="text-sm font-semibold text-black">{emp.name}</p>
                              <p className="text-xs text-slate-600">{emp.position || emp.role}</p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-xs">
                          <span className="font-medium text-black">{emp.role}</span>
                          <span className="text-slate-600">Present</span>
                        </div>
                      </div>
                    ))}
                    {filteredTeam.length === 0 && (
                      <div className="col-span-full text-center text-sm text-slate-500 py-8">No team members match your search.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── OPERATIONS ──────────────────────────────────────── */}
            {activeTab === "Operations" && (
              <motion.div key="ops" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <h2 className="text-2xl font-bold text-black">Operations</h2>
                <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
                  <h3 className="text-sm font-semibold mb-4 text-black">Department Kanban</h3>
                  <KanbanBoard initialTasks={tasks} employees={employees} isManagerView={true} />
                </div>
              </motion.div>
            )}

            {/* ── LEAVE REQUESTS ──────────────────────────────────– */}
            {activeTab === "Leave Requests" && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Leave Management</h2>
                    <p className="text-sm mt-0.5 text-slate-700">Request your leave or manage team requests</p>
                  </div>
                </div>

                {/* Manager's Own Leave + Team Requests */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Calendar - Left Side */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-2xl border p-5 bg-slate-50 border-slate-200">
                      <h3 className="text-sm font-semibold text-black mb-4">Request Your Leave</h3>
                      <CalendarWidget onDayClick={handleCalendarDayClick} />
                      <p className="text-xs text-slate-600 mt-4">Click a date to request leave</p>
                    </div>
                  </div>

                  {/* Team Leave Requests - Right Side */}
                  <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <StatCard label="Pending" value={leaveRequests.filter(l => l.status === "PENDING").length} icon={<Clock size={15} />} sub="Awaiting review" />
                      <StatCard label="Approved" value={leaveRequests.filter(l => l.status === "APPROVED").length} icon={<CheckCircle size={15} />} trend="This month" />
                      <StatCard label="Rejected" value={leaveRequests.filter(l => l.status === "REJECTED").length} icon={<MinusCircle size={15} />} trendUp={false} />
                    </div>
                    <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {["Employee", "Department", "Period", "Reason", "Status", "Actions"].map(h => (
                              <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {leaveRequests.map(req => (
                            <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <Avatar name={req.employee?.name || "?"} px={30} />
                                  <span className="text-sm font-semibold text-black">{req.employee?.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-700">
                                {req.employee?.department?.name || "Unassigned"}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-700">
                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-600">{req.title || "-"}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                                  ${req.status === "PENDING" ? "bg-amber-100 text-amber-700" : req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                {req.status === "PENDING" && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const res = await fetch("/api/leave", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            credentials: "include",
                                            body: JSON.stringify({ leaveRequestId: req.id, status: "APPROVED" }),
                                          });
                                          if (res.ok) {
                                            const updated = await fetch(`/api/leave?type=manager`, { credentials: "include" }).then(r => r.json());
                                            setLeaveRequests(updated.leaveRequests || []);
                                          }
                                        } catch (err) {
                                          console.error("Failed to approve:", err);
                                        }
                                      }}
                                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-emerald-700 hover:bg-emerald-100">Approve</button>
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const res = await fetch("/api/leave", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            credentials: "include",
                                            body: JSON.stringify({ leaveRequestId: req.id, status: "REJECTED" }),
                                          });
                                          if (res.ok) {
                                            const updated = await fetch(`/api/leave?type=manager`, { credentials: "include" }).then(r => r.json());
                                            setLeaveRequests(updated.leaveRequests || []);
                                          }
                                        } catch (err) {
                                          console.error("Failed to reject:", err);
                                        }
                                      }}
                                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-red-700 hover:bg-red-100">Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ATTENDANCE ──────────────────────────────────– */}
            {activeTab === "Attendance" && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Team Attendance</h2>
                    <p className="text-sm mt-0.5 text-slate-700">{attendanceRecords.length} records</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Check-Ins" value={attendanceRecords.filter(r => r.type === "CHECKIN").length} icon={<CheckCircle size={15} />} />
                  <StatCard label="Check-Outs" value={attendanceRecords.filter(r => r.type === "CHECKOUT").length} icon={<Clock size={15} />} />
                  <StatCard label="Today" value={attendanceRecords.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length} icon={<Activity size={15} />} />
                  <StatCard label="With Photos" value={attendanceRecords.filter(r => r.photo).length} icon={<ShieldCheck size={15} />} />
                </div>
                <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["Employee", "Type", "Time", "Photo", "Actions"].map(h => (
                          <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">No attendance records yet</td>
                        </tr>
                      ) : (
                        attendanceRecords.slice(0, 50).map(record => (
                          <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={record.employee?.name || "?"} px={30} />
                                <div>
                                  <span className="text-sm font-semibold text-black block">{record.employee?.name}</span>
                                  <span className="text-xs text-slate-500">{record.employee?.position}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                                record.type === "CHECKIN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {record.type}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-700">
                              {new Date(record.timestamp).toLocaleString()}
                            </td>\n                            <td className="px-5 py-3.5">
                              {record.photo ? (
                                <button 
                                  onClick={() => {
                                    setSelectedPhotoData(record.photo);
                                    setIsPhotoModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                  <ShieldCheck size={12} /> View
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors">
                                Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <NewDirectiveModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} employees={employees} manager={manager} />
      <NewProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} departmentId={manager?.departmentId} />
      
      {/* Leave Request Modal */}
      <AnimatePresence>
        {leaveModalOpen && (
          <LeaveRequestModal
            selectedDates={leaveSelectedDates}
            onClose={() => setLeaveModalOpen(false)}
            onSubmit={async data => {
              try {
                const res = await fetch("/api/leave", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                if (res.ok) {
                  setLeaveModalOpen(false);
                  const d = await fetch(`/api/leave?type=manager`, { credentials: "include" }).then(r => r.json());
                  setLeaveRequests(d.leaveRequests || []);
                }
              } catch {
                alert("Failed to submit leave request");
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && selectedPhotoData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsPhotoModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Attendance Photo</h2>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-auto">
                <img 
                  src={selectedPhotoData} 
                  alt="Attendance photo" 
                  className="max-w-full max-h-full object-contain rounded-lg"/>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT SYSTEM ─────────────────────────────────────────────────── */}
      <ChatWindow currentUser={manager} userType="MANAGER" isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
