"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, Search, Plus, Clock, TrendingUp, Zap, MessageSquare, 
  ChevronRight, X, Send, Activity, ShieldCheck, Layers,
  Calendar as CalendarIcon, AlertCircle, CheckCircle, Play, Square, Briefcase,
  Target, ArrowUpRight, Landmark
} from "lucide-react";
import { ManagerHireModal } from "./ManagerHireModal";
import { NewDirectiveModal } from "./NewDirectiveModal";
import { NewProjectModal } from "./NewProjectModal";
import { useRealTimeGlobal } from "../../../hooks/useRealTime"; 
import { sendMessage } from "../../actions/messaging";
import OfficeMessenger from "../../components/OfficeMessenger";
import KanbanBoard from "../../employee/dashboard/KanbanBoard";

// --- SUB-COMPONENTS ---

const IntelligenceMetric = ({ label, value, icon, color = "text-white" }: any) => (
  <div className="flex flex-col gap-1 min-w-[110px] text-left font-sans">
    <div className="flex items-center gap-2 text-white/30">
      {icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className={`text-2xl font-semibold ${color}`}>{value}</div>
  </div>
);

const DirectiveBtn = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick} 
    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 transition-all group w-full backdrop-blur-md font-sans"
  >
    <div className="text-[#FFD541] group-hover:scale-105 transition-transform">{icon}</div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white">{label}</span>
  </button>
);

const CalendarWidget = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-full flex flex-col justify-between font-sans text-left">
      <div>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Operational Pulse</h3>
           <span className="text-[10px] font-bold text-[#FFD541]">FEB 26</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-6">
          {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[8px] font-bold text-white/10">{d}</span>)}
          {days.map(d => (
            <div key={d} className={`text-[10px] py-1.5 rounded-lg transition-colors cursor-pointer ${d === 8 ? 'bg-[#FFD541] text-black font-bold' : 'text-white/40 hover:bg-white/5'}`}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD541] animate-pulse" />
        <p className="text-[10px] font-bold text-white/60">Internal Unit Audit Cycle</p>
      </div>
    </div>
  );
};

const PersonnelTracker = ({ employee }: any) => (
  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-[#FFD541]/30 transition-all group font-sans">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} alt="avatar" />
        </div>
        <div className="text-left">
          <p className="font-bold text-sm text-white">{employee.name}</p>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{employee.position}</p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${employee.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#FFD541]/10 text-[#FFD541]'}`}>
        {employee.role}
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-white/40 uppercase">Sync Level</span>
        <span className="text-[10px] font-bold text-emerald-400">85%</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function ManagerFullDashboard({ allEmployees = [] }: any) {
  const router = useRouter();
  // --- States ---
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [manager, setManager] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastInput, setBroadcastInput] = useState("");

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Real-time Chat
  useRealTimeGlobal((newMsg: any) => {
    // Chat logic is handled within the OfficeMessenger component usually, 
    // but we can track global state here if needed.
  });

  const fetchSiloIntelligence = useCallback(async (deptId: string) => {
    setLoading(true);
    try {
      const [empRes, taskRes, projRes] = await Promise.all([
        fetch(`/api/manager/employees?deptId=${deptId}`),
        fetch(`/api/manager/tasks?deptId=${deptId}`),
        fetch(`/api/manager/projects?deptId=${deptId}`)
      ]);
      const empData = await empRes.json();
      const taskData = await taskRes.json();
      const projData = await projRes.json();
      
      const empList = empData.employees || empData || [];
      setEmployees(empList);
      setDepartmentEmployees(empList);
      setTasks(taskData.tasks || taskData || []);
      setProjects(projData.projects || projData || []);
    } catch (error) { 
      console.error("Sync Error:", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return router.push("/choose-role");
    const parsed = JSON.parse(savedUser);
    if (parsed.role !== "MANAGER") return router.push("/choose-role");
    setManager(parsed);

    if (parsed.departmentId) {
      fetchSiloIntelligence(parsed.departmentId);
      
      // Attendance
      setAttendanceLoading(true);
      fetch(`/api/manager/attendance?deptId=${parsed.departmentId}`)
        .then(res => res.json())
        .then(data => setAttendanceRecords(data.records || []))
        .catch(() => setAttendanceError("Failed to load records"))
        .finally(() => setAttendanceLoading(false));

      // Leaves
      setLeaveLoading(true);
      fetch(`/api/leave?managerId=${parsed.id}`)
        .then(res => res.json())
        .then(data => setLeaveRequests(data.leaveRequests || []))
        .catch(() => setLeaveError("Failed to load leaves"))
        .finally(() => setLeaveLoading(false));
    } else {
      setLoading(false);
    }

    // Broadcasts
    fetch('/api/broadcasts?role=MANAGER')
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []));
  }, [router, fetchSiloIntelligence]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-[#FFD541]"><Zap className="animate-pulse" /></div>;

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden selection:bg-[#FFD541] selection:text-black uppercase">
      
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale">
          <source src="/intel-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505] to-[#050505]" />
      </div>

      {/* --- FIXED NAVBAR --- */}
      <div className="relative z-[100] flex-shrink-0 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-8 py-4">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFD541] rounded-lg flex items-center justify-center shadow-lg"><Activity size={18} className="text-black" /></div>
              <span className="text-xl font-bold tracking-tight">AuraFlow</span>
            </div>
            <div className="flex gap-8">
              {['Overview', 'Attendance', 'Operations', 'Missions', 'Leave Requests'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} 
                  className={`text-[11px] font-bold tracking-widest transition-all relative py-1 ${activeTab === tab ? 'text-[#FFD541]' : 'text-white/30 hover:text-white'}`}>
                  {tab}{activeTab === tab && <motion.div layoutId="nav" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD541]" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <IntelligenceMetric label="Unit Staff" value={employees.length} icon={<Users size={14}/>} />
            <div className="flex bg-white/5 rounded-xl border border-white/5 p-1">
               <button onClick={() => setCheckedIn(true)} className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${checkedIn ? 'bg-emerald-500 text-white' : 'text-white/40 hover:text-white'}`}>
                  <Play size={12} /> Check In
               </button>
               <button onClick={() => setCheckedIn(false)} className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${!checkedIn ? 'bg-rose-500 text-white' : 'text-white/40 hover:text-white'}`}>
                  <Square size={12} /> Check Out
               </button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 overflow-hidden p-0.5"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${manager?.name}`} alt="manager" className="rounded-lg" /></div>
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1750px] mx-auto space-y-8">
          
          <header className="px-2 text-left flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={12} className="text-[#FFD541]" />
                <p className="text-[10px] font-bold tracking-widest text-white/20">Operational Terminal • {manager?.name || "Manager"}</p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white ">Manager Dashboard</h1>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {/* TAB: OVERVIEW */}
            {activeTab === 'Overview' && (
                  <motion.div key="over" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-12 gap-8 text-left">
                  
                <div className="col-span-12 lg:col-span-3">
                  <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-[360px] flex flex-col justify-between">
                    <h3 className="text-[11px] font-bold tracking-widest text-white/20">Silo Directives</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DirectiveBtn icon={<Briefcase size={20}/>} label="MISSION" onClick={() => setIsProjectModalOpen(true)} />
                      <DirectiveBtn icon={<Users size={20}/>} label="ONBOARD" onClick={() => setIsHireModalOpen(true)} />
                      <DirectiveBtn icon={<Target size={20}/>} label="DIRECTIVE" onClick={() => setIsTaskModalOpen(true)} />
                      <DirectiveBtn icon={<Activity size={20}/>} label="SYNC" />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 h-[360px] flex flex-col justify-between">
                      <div>
                         <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Executive Broadcast</h3>
                         <p className="text-[10px] font-bold text-white/20 tracking-widest mb-6">Internal Unit Transmission</p>
                         <div className="space-y-3 mb-4 max-h-[120px] overflow-y-auto no-scrollbar">
                           {broadcasts.map(b => (
                             <div key={b.id} className="p-3 bg-white/10 rounded-xl">
                               <div className="text-xs text-white/60">{b.message}</div>
                               <div className="text-[9px] text-white/30">{new Date(b.createdAt).toLocaleString()}</div>
                             </div>
                           ))}
                         </div>
                      </div>
                      <form className="relative mt-auto" onSubmit={async (e) => {
                        e.preventDefault();
                        if (!broadcastInput.trim() || !manager) return;
                        await fetch('/api/broadcasts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ senderId: manager.id, senderRole: 'MANAGER', message: broadcastInput })
                        });
                        setBroadcastInput('');
                        fetch('/api/broadcasts?role=MANAGER').then(res => res.json()).then(data => setBroadcasts(data.broadcasts || []));
                      }}>
                        <textarea value={broadcastInput} onChange={e => setBroadcastInput(e.target.value)} className="w-full h-36 bg-white/5 border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-[#FFD541]/40 transition-all resize-none text-white backdrop-blur-md" placeholder="Enter universal silo directive..." />
                        <button type="submit" className="absolute bottom-5 right-5 bg-[#FFD541] text-black px-8 py-2.5 rounded-full font-bold text-[10px] tracking-widest shadow-xl transition-transform active:scale-95">Transmit</button>
                      </form>
                   </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                  <CalendarWidget />
                </div>

                <div className="col-span-12 lg:col-span-9">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5">
                      <h3 className="text-xl font-bold tracking-widest text-white mb-8">Workforce Unit Stability</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {employees.map((emp) => (
                          <PersonnelTracker key={emp.id} employee={emp} />
                        ))}
                      </div>
                   </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-full flex flex-col">
                      <h3 className="text-[11px] font-bold tracking-widest text-white/20 mb-8">Active Missions</h3>
                      <div className="space-y-4">
                        {projects.map((proj: any) => (
                          <div key={proj.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-[#FFD541] transition-all">
                             <div><p className="text-xs font-bold text-white group-hover:text-black">{proj.name}</p><p className="text-[8px] font-black text-[#FFD541] group-hover:text-black/60 tracking-widest">{proj.status}</p></div>
                             <ArrowUpRight size={14} className="text-white/20 group-hover:text-black" />
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'Attendance' && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5 w-full text-left">
                <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-tight">Attendance Records</h2>
                <div className="flex flex-wrap gap-4 mb-6">
                  <select className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                    <option value="">All Employees</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  <input type="date" className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" value={dateRange.start} onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} />
                  <span className="text-white/30">to</span>
                  <input type="date" className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" value={dateRange.end} onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} />
                  <button
                    className="bg-[#FFD541] text-black px-4 py-2 rounded-lg text-xs font-bold"
                    onClick={async () => {
                      setAttendanceLoading(true);
                      let url = `/api/manager/attendance?deptId=${manager?.departmentId}`;
                      const params = [];
                      if (selectedEmployee) params.push(`employeeId=${selectedEmployee}`);
                      if (dateRange.start) params.push(`start=${dateRange.start}`);
                      if (dateRange.end) params.push(`end=${dateRange.end}`);
                      if (params.length) url += `&${params.join("&")}`;
                      fetch(url)
                        .then(res => res.json())
                        .then(data => setAttendanceRecords(data.records || []))
                        .catch(() => setAttendanceError("Failed to load records"))
                        .finally(() => setAttendanceLoading(false));
                    }}
                  >Filter</button>
                  <button
                    className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/10"
                    onClick={() => {
                      setSelectedEmployee("");
                      setDateRange({ start: "", end: "" });
                      setAttendanceLoading(true);
                      fetch(`/api/manager/attendance?deptId=${manager?.departmentId}`)
                        .then(res => res.json())
                        .then(data => setAttendanceRecords(data.records || []))
                        .catch(() => setAttendanceError("Failed to load records"))
                        .finally(() => setAttendanceLoading(false));
                    }}
                  >Reset</button>
                </div>
                {attendanceLoading ? (
                  <div className="text-white/40 text-sm">Loading attendance...</div>
                ) : (
                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="text-white/40 uppercase tracking-widest">
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Photo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {attendanceRecords.map((rec: any) => (
                          <tr key={rec.id} className="hover:bg-white/5 transition-all">
                            <td className="py-2 px-4"><img src={rec.employee?.image} alt={rec.employee?.name} className="w-8 h-8 rounded-lg" /></td>
                            <td className="py-2 px-4 font-bold text-white">{rec.employee?.name}</td>
                            <td className="py-2 px-4 font-bold text-emerald-400">{rec.type}</td>
                            <td className="py-2 px-4 text-white/40">{new Date(rec.timestamp).toLocaleString()}</td>
                            <td className="py-2 px-4">
                              {rec.photo ? (
                                <button className="bg-[#FFD541] text-black px-3 py-1 rounded text-xs font-bold" onClick={() => setViewImage(rec.photo)}>View Image</button>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Image Modal */}
                {viewImage && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" onClick={() => setViewImage(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                      <img src={viewImage} alt="Attendance" className="max-h-[60vh] w-auto rounded-xl mb-4" />
                      <button className="bg-[#FFD541] text-black px-6 py-2 rounded-lg font-bold" onClick={() => setViewImage(null)}>Close</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
         
            

            {/* TAB: LEAVE REQUESTS */}
            {activeTab === 'Leave Requests' && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5 w-full max-w-7xl mx-auto text-left">
                <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-tight">Silo Leave Ledger</h2>
                {leaveLoading ? (
                  <div className="text-white/40 text-sm">Synchronizing leave data...</div>
                ) : (
                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="py-4 px-4">Employee</th>
                          <th className="py-4 px-4">Title</th>
                          <th className="py-4 px-4">Timeline</th>
                          <th className="py-4 px-4">Reason</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaveRequests.map((req: any) => (
                          <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 font-bold text-white">{req.employee?.name}</td>
                            <td className="py-4 px-4 text-white/60">{req.title}</td>
                            <td className="py-4 px-4 text-white/40">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                            <td className="py-4 px-4 text-white/40 max-w-xs truncate">{req.reason || '-'}</td>
                            <td className="py-4 px-4 font-bold text-amber-400">{req.status}</td>
                            <td className="py-4 px-4 text-right">
                              {req.status === 'PENDING' && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch('/api/leave', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ leaveRequestId: req.id, status: 'APPROVED' })
                                        });
                                        if (res.ok) {
                                          // Refresh leave requests
                                          const refreshed = await fetch(`/api/leave?managerId=${manager.id}`);
                                          const data = await refreshed.json();
                                          setLeaveRequests(data.leaveRequests || []);
                                        } else {
                                          alert('Failed to approve leave request');
                                        }
                                      } catch (err) {
                                        alert('Error approving leave request: ' + (err instanceof Error ? err.message : String(err)));
                                      }
                                    }}
                                    className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
                                  >Approve</button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch('/api/leave', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ leaveRequestId: req.id, status: 'REJECTED' })
                                        });
                                        if (res.ok) {
                                          // Refresh leave requests
                                          const refreshed = await fetch(`/api/leave?managerId=${manager.id}`);
                                          const data = await refreshed.json();
                                          setLeaveRequests(data.leaveRequests || []);
                                        } else {
                                          alert('Failed to reject leave request');
                                        }
                                      } catch (err) {
                                        alert('Error rejecting leave request: ' + (err instanceof Error ? err.message : String(err)));
                                      }
                                    }}
                                    className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all"
                                  >Reject</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: OPERATIONS */}
            {activeTab === 'Operations' && (
              <motion.div key="ops" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5">
                <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-tight">Department Kanban Board</h2>
                <KanbanBoard initialTasks={tasks} employees={employees} isManagerView={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- MODALS --- */}
        <NewDirectiveModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} employees={departmentEmployees} manager={manager} />
        <ManagerHireModal isOpen={isHireModalOpen} onClose={() => setIsHireModalOpen(false)} manager={manager} />
        <NewProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} departmentId={manager?.departmentId} />
      </main>

      {/* --- GLOBAL CHAT SYSTEM --- */}
      {manager && <OfficeMessenger currentUser={manager} allEmployees={allEmployees} />}
    </div>
  );
}