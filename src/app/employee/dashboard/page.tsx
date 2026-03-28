"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, Search, Clock, Zap, MessageSquare, 
  ChevronRight, X, Send, Activity, ShieldCheck, 
  Calendar as CalendarIcon, Camera, CheckCircle2, 
  Target, Layers, Briefcase, MinusCircle, LayoutDashboard
} from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import OfficeMessenger from "../../components/OfficeMessenger";
import CalendarWidget from "../../components/CalendarWidget";
import LeaveRequestModal from "../../../../components/LeaveRequestModal";
import { useRealTimeGlobal } from "../../../hooks/useRealTime";

export default function EmployeeAuraPortal() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // --- CORE STATE ---
  const [employee, setEmployee] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  // --- LEAVE REQUESTS STATE ---
  const [myLeaveRequests, setMyLeaveRequests] = useState<any[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSelectedDates, setLeaveSelectedDates] = useState<{ start: string; end?: string } | null>(null);

  // --- ATTENDANCE & WORKBOOK ---
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [workbook, setWorkbook] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  // --- HANDLERS ---
  const handleCalendarDayClick = (dateStr: string) => {
    setLeaveSelectedDates({ start: dateStr });
    setLeaveModalOpen(true);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // --- SYNC EFFECTS ---
  useEffect(() => {
    fetch('/api/broadcasts?role=EMPLOYEE')
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return router.push("/choose-role");
    const parsed = JSON.parse(stored);
    setEmployee(parsed);

    async function fetchPortalData() {
      try {
        const [taskRes, userRes, leaveRes] = await Promise.all([
          fetch(`/api/employee/tasks?employeeId=${parsed.id}`),
          fetch(`/api/user`),
          fetch(`/api/leave?employeeId=${parsed.id}`)
        ]);
        const taskData = await taskRes.json();
        const userData = await userRes.json();
        const leaveData = await leaveRes.json();

        setTasks(taskData.tasks || []);
        setAllEmployees(userData.users || []);
        setMyLeaveRequests(leaveData.leaveRequests || []);
      } catch (err) { 
        console.error("Sync Error:", err); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchPortalData();
  }, [router]);

  useEffect(() => {
    if (!employee?.id) return;
    fetch(`/api/employee/attendance?employeeId=${employee.id}`)
      .then(res => res.json())
      .then(data => {
        const records = data.records || [];
        const lastCheckIn = records.filter((r:any) => r.type === "CHECKIN").sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const lastCheckOut = records.filter((r:any) => r.type === "CHECKOUT").sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        if (lastCheckIn && (!lastCheckOut || new Date(lastCheckIn.timestamp) > new Date(lastCheckOut.timestamp))) {
          setHasCheckedIn(true);
          setCheckInTime(new Date(lastCheckIn.timestamp).toLocaleTimeString());
        } else {
          setHasCheckedIn(false);
          setCheckInTime("");
        }
      });
  }, [employee?.id]);

  useRealTimeGlobal((newMsg: any) => {
    setChatMessages((prev) => [...prev, newMsg]);
  });

  const captureCheckIn = async () => {
    if (!employee?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/employee/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, timestamp: new Date().toISOString() })
      });
      if (res.ok) {
        setHasCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString());
        setIsCheckInOpen(false);
      }
    } catch (err) { setAttendanceError("Sync Failed"); } finally { setAttendanceLoading(false); }
  };

  const captureCheckOut = async () => {
    if (!employee?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/employee/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, timestamp: new Date().toISOString() })
      });
      if (res.ok) {
        setHasCheckedIn(false);
        setIsCheckOutOpen(false);
      }
    } catch (err) { setAttendanceError("Sync Failed"); } finally { setAttendanceLoading(false); }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-[#FFD541]"><Zap className="animate-pulse" /></div>;

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden selection:bg-[#FFD541] selection:text-black uppercase">
      
      {/* FIXED VIDEO BACKGROUND */}
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
              {['Dashboard', 'Tasks', 'Missions', 'Leave Requests', 'Workbook'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} 
                  className={`text-[11px] font-bold tracking-widest transition-all relative py-1 ${activeTab === tab ? 'text-[#FFD541]' : 'text-white/30 hover:text-white'}`}>
                  {tab}{activeTab === tab && <motion.div layoutId="nav" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD541]" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex bg-white/5 rounded-xl border border-white/5 p-1">
              <button onClick={() => setIsCheckInOpen(true)} disabled={hasCheckedIn || attendanceLoading} className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${hasCheckedIn ? 'bg-emerald-500/20 text-emerald-400 opacity-50' : 'bg-emerald-500 text-white shadow-lg'}`}>
                <Camera size={12} /> {hasCheckedIn ? "Verified" : attendanceLoading ? "Syncing..." : "Check In"}
              </button>
              <button onClick={() => setIsCheckOutOpen(true)} disabled={!hasCheckedIn || attendanceLoading} className="px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-white transition-all disabled:opacity-20">
                <Clock size={12} /> Check Out
              </button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 overflow-hidden p-0.5"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.name}`} alt="user" className="rounded-lg" /></div>
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE MAIN CONTENT --- */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1750px] mx-auto space-y-8">
          
          <header className="px-2 text-left flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={12} className="text-[#FFD541]" />
                <p className="text-[10px] font-bold tracking-widest text-white/20">Authorized Workforce Hub • {employee?.name}</p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white ">Employee <span className="not-italic font-black text-transparent bg-clip-text bg-white">Dashboard</span></h1>
            </div>
            <div className="flex gap-12">
               <IntelligenceMetric label="Active Tasks" value={tasks.filter(t => t.status !== "DONE").length} icon={<Target size={14}/>} color="text-amber-400" />
               <IntelligenceMetric label="Check-In" value={hasCheckedIn ? checkInTime : "Pending"} icon={<Clock size={14}/>} color={hasCheckedIn ? "text-emerald-400" : "text-amber-500"} />
               <IntelligenceMetric label="Output Sync" value="10%" icon={<Zap size={14}/>} color="text-emerald-400" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-12 gap-8 text-left">
                
                {/* Operational Pulse */}
                <div className="col-span-12 lg:col-span-3">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-[400px] flex flex-col justify-between">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20">Operational Pulse</h3>
                      <div className="space-y-6">
                         <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Biometric Status</span>
                            <div className="flex items-center gap-3">
                               <div className={`w-3 h-3 rounded-full ${hasCheckedIn ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400 animate-pulse'}`} />
                               <span className="text-lg font-bold">{hasCheckedIn ? "Authorized" : "Sync Required"}</span>
                            </div>
                         </div>
                         <div className="h-px bg-white/5 w-full" />
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                               <Layers size={20} className="text-[#FFD541] mb-2" />
                               <span className="text-[10px] font-bold">12 Days</span>
                               <span className="text-[8px] text-white/20">Leave Bal.</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                               <Briefcase size={20} className="text-[#FFD541] mb-2" />
                               <span className="text-[10px] font-bold">48.2h</span>
                               <span className="text-[8px] text-white/20">Work Week</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                 {/* Mission Briefing */}
                 <div className="col-span-12 lg:col-span-6">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 h-[400px] flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Mission Briefing</h3>
                     <p className="text-[10px] font-bold text-white/20 tracking-widest mb-8 uppercase">Broadcast Feed from Management</p>
                     <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                        {broadcasts.map(b => (
                          <div key={b.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="text-sm text-white/70">{b.message}</div>
                           <div className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-widest">{new Date(b.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                     </div>
                   </div>
                 </div>

                <div className="col-span-12 lg:col-span-3">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-[400px]">
                      <CalendarWidget onDayClick={handleCalendarDayClick} />
                   </div>
                </div>

                {/* Directive Kanban */}
                <div className="col-span-12">
                   <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5">
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Directive Kanban</h3>
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                           <CheckCircle2 size={14} /> System Synchronized
                        </div>
                      </div>
                      <KanbanBoard initialTasks={tasks} onTaskStatusChange={handleTaskStatusChange} />
                   </div>
                </div>
              </motion.div>
            )}

            {/* TAB: LEAVE REQUESTS */}
            {activeTab === 'Leave Requests' && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5 w-full max-w-6xl mx-auto text-left">
                <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-tight">Absence Authorization Ledger</h2>
                <div className="overflow-x-auto min-h-[300px]">
                   <table className="min-w-full text-left text-xs">
                     <thead>
                       <tr className="text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                         <th className="py-4 px-4">Mission Title</th><th className="py-4 px-4">Timeline</th><th className="py-4 px-4">Context</th><th className="py-4 px-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {myLeaveRequests.map((req: any) => (
                         <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="py-5 px-4 font-bold text-white">{req.title}</td>
                           <td className="py-5 px-4 text-white/60">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                           <td className="py-5 px-4 text-white/40 max-w-xs truncate">{req.reason || '-'}</td>
                           <td className={`py-5 px-4 font-black ${req.status === 'APPROVED' ? 'text-emerald-400' : req.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>{req.status}</td>
                         </tr>
                       ))}
                       {myLeaveRequests.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-20 text-white/20 font-bold uppercase tracking-widest">No authorization logs found.</td></tr>
                       )}
                     </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {/* TAB: WORKBOOK */}
            {activeTab === 'Workbook' && (
              <motion.div key="workbook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto text-left">
                <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5 space-y-8">
                   <div>
                     <h3 className="text-3xl font-bold text-white uppercase tracking-tight">End-of-Day Workbook</h3>
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Operational Log for Management Review</p>
                   </div>
                   <textarea 
                     value={workbook} 
                     onChange={(e) => setWorkbook(e.target.value)} 
                     className="w-full h-64 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-sm text-white outline-none focus:border-[#FFD541]/40 transition-all resize-none" 
                     placeholder="Detail your mission progress and departmental syncs today..." 
                   />
                   <button className="w-full py-5 bg-[#FFD541] text-black rounded-full font-bold uppercase text-xs tracking-[0.2em] hover:scale-[1.01] transition-all shadow-xl shadow-yellow-500/10">Submit Log to Silo Lead</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* --- GLOBAL CHAT HUB --- */}
      <div className="fixed bottom-8 right-8 z-[200]">
        <OfficeMessenger currentUser={employee} allEmployees={allEmployees} />
      </div>

      {/* --- CENTERALIZED MODALS (FIXED INSET-0) --- */}
      <AnimatePresence>
        {leaveModalOpen && (
          <LeaveRequestModal 
            selectedDates={leaveSelectedDates} 
            onClose={() => setLeaveModalOpen(false)} 
            onSubmit={async (data) => {
              try {
                const res = await fetch("/api/leave", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...data, employeeId: employee.id })
                });
                if (res.ok) setLeaveModalOpen(false);
              } catch (err) { alert("Authorization Sync Failed"); }
            }} 
          />
        )}
        {isCheckInOpen && (
          <BiometricCameraModal 
            title="Biometric Sync" 
            onCancel={() => setIsCheckInOpen(false)} 
            onConfirm={captureCheckIn} 
            videoRef={videoRef} 
          />
        )}
        {isCheckOutOpen && (
          <BiometricCameraModal 
            title="Silo Check Out" 
            onCancel={() => setIsCheckOutOpen(false)} 
            onConfirm={captureCheckOut} 
            videoRef={videoRef} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function BiometricCameraModal({ title, onCancel, onConfirm, videoRef }: any) {
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error(err); }
    }
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#0A0A0B]/90 backdrop-blur-3xl w-full max-w-2xl rounded-[3rem] p-12 border border-white/10 shadow-2xl text-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FFD541] opacity-50" />
        <h2 className="text-4xl font-bold text-white uppercase tracking-tighter mb-4">{title}</h2>
        <div className="aspect-video bg-black rounded-[3rem] overflow-hidden relative border-4 border-white/5 mb-10">
          <video ref={videoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute inset-x-0 bottom-12 flex justify-center">
             <div className="w-24 h-24 border-2 border-dashed border-[#FFD541]/50 rounded-full animate-pulse flex items-center justify-center"><ShieldCheck className="text-[#FFD541]/20" size={32} /></div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-5 bg-white/5 text-white/40 rounded-full font-bold uppercase text-[10px] tracking-widest">Abort Sync</button>
          <button onClick={onConfirm} className="flex-[2] py-5 bg-[#FFD541] text-black rounded-full font-bold uppercase text-[10px] tracking-widest shadow-xl">Authorize</button>
        </div>
      </motion.div>
    </div>
  );
}

function IntelligenceMetric({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="flex flex-col gap-1 min-w-[110px] text-left">
      <div className="flex items-center gap-2 text-white/30">
        {icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}