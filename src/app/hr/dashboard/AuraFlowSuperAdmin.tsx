"use client";

import React, { useState, useEffect } from "react";
import DepartmentDetailPage from "./DepartmentDetailPage";
import AssignManagerModal from "./AssignManagerModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Plus, Building2, Zap, ShieldCheck, 
  TrendingUp, Clock, Globe, ShieldAlert, Activity, ChevronRight,
  CheckCircle2, ShieldQuestion, X, Calendar, Landmark, AlertCircle,
  CheckCircle, MinusCircle, Wallet, LayoutDashboard, BarChart3,
  History, ArrowDownCircle, Banknote, FileSignature, Send, FileText
} from "lucide-react";
// import { sendBroadcast } from "../../actions/messaging";
import { SuperAdminProjects } from "../../../../components/SuperAdminWidgets";

// HR Leave Overview Widget
const LeaveOverviewWidget = ({ fullWidth = false }: { fullWidth?: boolean }) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/hr/leave')
      .then(res => res.json())
      .then(data => setLeaves(data.leaveRequests || []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div
      className={
        fullWidth
          ? "bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-full w-full max-w-full"
          : "bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-full"
      }
    >
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20 mb-4">Leaves Overview</h3>
      {loading ? (
        <div className="text-xs text-white/40">Loading...</div>
      ) : leaves.length === 0 ? (
        <div className="text-xs text-white/40">No active leaves</div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
          {leaves.map((leave: any) => (
            <div key={leave.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">{leave.employee?.name || 'Unknown'}</span>
                <span className="text-[10px] text-white/40 font-bold">{leave.employee?.department?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/30">
                <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                <span className="uppercase font-bold text-amber-400">{leave.status}</span>
              </div>
              <div className="text-[10px] text-white/40 italic">{leave.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import OfficeMessenger from "../../components/OfficeMessenger";
import { CreateDeptModal } from "./CreateDeptModal";
import { HireStaffModal } from "./HireStaffModal";

// --- SUB-COMPONENTS (High-Density & Professional) ---

const IntelligenceMetric = ({ label, value, icon, color = "text-white" }: any) => (
  <div className="flex flex-col gap-1 min-w-[110px] text-left">
    <div className="flex items-center gap-2 text-white/30">
      {icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className={`text-2xl font-semibold ${color}`}>{value}</div>
  </div>
);

const DirectiveBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 transition-all group w-full backdrop-blur-md">
    <div className="text-[#FFD541] group-hover:scale-105 transition-transform">{icon}</div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white">{label}</span>
  </button>
);

const ProjectDistributionWidget = ({ departments, projects }: any) => (
  <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-full text-left flex flex-col">
    <div className="flex justify-between items-center mb-6 flex-shrink-0">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20">Mission Distribution</h3>
      <div className="px-3 py-1 bg-[#FFD541]/10 rounded-lg text-[9px] font-bold text-[#FFD541]">Live Sync</div>
    </div>
    <div className="space-y-4 overflow-y-auto no-scrollbar flex-1">
      {departments.map((dept: any) => (
        <div key={dept.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-white">{dept.name}</span>
            <span className="text-[10px] text-white/40 font-bold">{projects.filter((p: any) => p.departmentId === dept.id).length} Active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {projects.filter((p: any) => p.departmentId === dept.id).map((p: any) => (
              <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 group hover:border-[#FFD541]/40 transition-colors">
                <div className={`w-1 h-1 rounded-full ${p.status === 'DONE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <p className="text-[9px] text-white/60 font-medium uppercase tracking-tighter">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CalendarWidget = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-[360px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20 text-left">Operational Calendar</h3>
          <span className="text-[10px] font-bold text-[#FFD541]">JAN 26</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-[8px] font-bold text-white/10">{d}</span>)}
          {days.map(d => (
            <div key={d} className={`text-[9px] py-1.5 rounded-lg transition-colors cursor-pointer ${d === 18 ? 'bg-[#FFD541] text-black font-bold shadow-lg' : 'text-white/30 hover:bg-white/5'}`}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[9px] font-bold text-white/60 text-left">System Audit Cycles Active</p>
      </div>
    </div>
  );
};

const StabilityWidget = () => (
  <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between h-full">
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20 mb-6 text-left">Workforce Stability</h3>
      <div className="flex items-end gap-2 h-20 mb-4">
        {[40, 70, 45, 90, 65, 80, 85].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/10 rounded-t-sm hover:bg-[#FFD541] transition-all" />
        ))}
      </div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-white/5">
      <span className="text-[10px] font-bold text-white/40">Retention Rate</span>
      <span className="text-lg font-bold text-emerald-400">94.2%</span>
    </div>
  </div>
);

// --- MAIN SUPER ADMIN COMPONENT ---

export default function AuraFlowSuperAdmin({ initialDepts = [], existingEmployees = [], initialProjects = [], hrUser }: any) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [salaryMode, setSalaryMode] = useState<"HOUR" | "DAY" | "MONTH">("MONTH");

  // Robust Salary Audit States
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditEmployee, setSelectedAuditEmployee] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Fiscal Trigger Modal States (Replacing browser prompts)
  const [isFiscalTriggerOpen, setIsFiscalTriggerOpen] = useState(false);
  const [fiscalTarget, setFiscalTarget] = useState<any>(null);
  const [contractBaseline, setContractBaseline] = useState("85000");
  const [performanceDeduction, setPerformanceDeduction] = useState("0");
  const [authNote, setAuthNote] = useState("Mission/Attendance Sync Discrepancy");

  useEffect(() => {
    if (showAuditModal && selectedAuditEmployee) {
      setAuditLoading(true);
      fetch(`/api/hr/audit/salary?employeeId=${selectedAuditEmployee.id}`)
        .then(res => res.json())
        .then(data => setAuditLogs(data.audits || []))
        .catch(() => setAuditLogs([]))
        .finally(() => setAuditLoading(false));
    }
  }, [showAuditModal, selectedAuditEmployee]);

  const [departments, setDepartments] = useState<any[]>(initialDepts);
  const [employees, setEmployees] = useState<any[]>(existingEmployees);

  useEffect(() => {
    setEmployees(existingEmployees);
  }, [existingEmployees]);
  
  const [projects, setProjects] = useState<any[]>(initialProjects || []);
  const [broadcastInput, setBroadcastInput] = useState("");
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  const [showCreateDept, setShowCreateDept] = useState(false);
  const [showHireStaff, setShowHireStaff] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [showAssignManager, setShowAssignManager] = useState(false);
const [payrollSearch, setPayrollSearch] = useState("");
  const [contractDuration, setContractDuration] = useState("12 Months"); // New State
  
  // Filtered employees for the search bar
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(payrollSearch.toLowerCase()) ||
    emp.role?.toLowerCase().includes(payrollSearch.toLowerCase())
  );
  useEffect(() => {
    fetch('/api/broadcasts?role=HR')
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []));
  }, []);

  async function syncSystem() {
    try {
      const [deptRes, empRes, projRes] = await Promise.all([
        fetch('/api/hr/departments').then(r => r.json()),
        fetch('/api/hr/employees').then(r => r.json()),
        fetch('/api/hr/projects').then(r => r.json())
      ]);
      if (deptRes.departments) setDepartments(deptRes.departments);
      if (empRes.employees && Array.isArray(empRes.employees)) {
        setEmployees(empRes.employees);
      }
      if (projRes.projects) setProjects(projRes.projects);
    } catch (err) { console.error("Sync Failed", err); }
  }

  const calculateRate = (base: number) => {
    const divisor = salaryMode === "HOUR" ? 160 : salaryMode === "DAY" ? 22 : 1;
    return (base / divisor).toLocaleString('en-IN');
  };

  // const handleFiscalAudit = async () => {
  //   if (!fiscalTarget || !hrUser?.id) return;
  //   const base = Number(contractBaseline);
  //   const deduct = Number(performanceDeduction);
    
  //   await fetch("/api/hr/audit/salary", {
  //     method: "POST",
  //     headers: {"Content-Type": "application/json"},
  //     body: JSON.stringify({ 
  //       employeeId: fiscalTarget.id, 
  //       oldSalary: base, 
  //       newSalary: base - deduct,
  //       changedById: hrUser.id,
  //       reason: authNote
  //     })
  //   });

  //   setIsFiscalTriggerOpen(false);
  //   setPerformanceDeduction("0");
  //   syncSystem();
  // };

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastInput.trim() || !hrUser?.id) return;
    await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: hrUser.id,
        senderRole: 'HR',
        message: broadcastInput
      })
    });
    setBroadcastInput('');
    fetch('/api/broadcasts?role=HR')
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []));
  }
const handleFiscalAudit = () => {
  if (!fiscalTarget) return;

  const finalPayout = Number(contractBaseline) - Number(performanceDeduction);

  // 1. Update the local employees state so the list reflects the change immediately
  setEmployees((prevEmployees: any[]) =>
    prevEmployees.map((emp) =>
      emp.id === fiscalTarget.id 
        ? { ...emp, salary: finalPayout, lastAudit: new Date().toLocaleDateString() } 
        : emp
    )
  );

  // 2. Simulate a "Success" feedback (You can add a toast here later)
  console.log(`Audit Committed for ${fiscalTarget.name}. Final Payout: Rs. ${finalPayout}`);

  // 3. Close the modal and reset deduction
  setIsFiscalTriggerOpen(false);
  setPerformanceDeduction("0");
};
// Inside AuraFlowSuperAdmin component
const [auditStartDate, setAuditStartDate] = useState("");
const [auditEndDate, setAuditEndDate] = useState("");

const calculateTotalWithDates = () => {
  const base = Number(contractBaseline) || 0;
  const deduct = Number(performanceDeduction) || 0;

  // If dates aren't selected, show the full month minus deduction
  if (!auditStartDate || !auditEndDate) return base - deduct;

  const start = new Date(auditStartDate);
  const end = new Date(auditEndDate);
  
  // Calculate difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start/end days

  // Logic: (Monthly Salary / 30 days) * selected days - deduction
  const dailyRate = base / 30;
  return (dailyRate * diffDays) - deduct;
};

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden selection:bg-[#FFD541] selection:text-black">
      
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale">
          <source src="/intel-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505] to-[#050505]" />
      </div>

      {/* --- FIXED NAVBAR --- */}
      <div className="relative z-[100] flex-shrink-0 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-8 py-4">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFD541] rounded-lg flex items-center justify-center shadow-lg"><Activity size={18} className="text-black" /></div>
              <span className="text-xl font-bold tracking-tight uppercase">AuraFlow</span>
            </div>
            <div className="flex gap-8">
              {['Dashboard', 'Organization', 'Workforce', 'Payroll', 'Leaves'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} 
                  className={`text-[11px] font-bold uppercase tracking-widest transition-all relative py-1 ${activeTab === t ? 'text-[#FFD541]' : 'text-white/30 hover:text-white'}`}>
                  {t}{activeTab === t && <motion.div layoutId="nav" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD541]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <IntelligenceMetric label="Personnel" value={employees.length} icon={<Users size={14}/>} />
            <IntelligenceMetric label="Budget Ledger" value="Rs. 12.4M" icon={<Landmark size={14}/>} color="text-amber-400" />
            <IntelligenceMetric label="Security" value="Root" icon={<ShieldCheck size={14}/>} color="text-emerald-400" />
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 overflow-hidden p-0.5 ml-4"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hrUser?.name || 'Admin'}`} alt="admin" className="rounded-lg" /></div>
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1750px] mx-auto space-y-8">
          
          {/* Removed Executive Terminal and HR Dashboard header as requested */}

          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-12 gap-8 text-left">
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 h-[360px] flex flex-col justify-between">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20">Directives</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DirectiveBtn icon={<Plus size={20}/>} label="NEW UNIT" onClick={() => setShowCreateDept(true)} />
                                <DirectiveBtn icon={<Users size={20}/>} label="HIRE STAFF" onClick={() => setShowHireStaff(true)} />
                                <DirectiveBtn icon={<ShieldAlert size={20}/>} label="AUDIT" />
                                <DirectiveBtn icon={<Globe size={20}/>} label="REGIONS" />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 h-[360px] flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">Executive Broadcast</h3>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Encrypted Communication</p>
                          <div className="space-y-3 mb-4">
                            {broadcasts.map(b => (
                            <div key={b.id} className="p-3 bg-white/10 rounded-xl">
                              <div className="text-xs text-white/60">{b.message}</div>
                              <div className="text-[9px] text-white/30">{new Date(b.createdAt).toLocaleString()}</div>
                            </div>
                            ))}
                          </div>
                        </div>
                        <form onSubmit={handleBroadcast} className="relative mt-auto">
                          <textarea value={broadcastInput} onChange={(e) => setBroadcastInput(e.target.value)} className="w-full h-36 bg-white/5 border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-[#FFD541]/40 transition-all resize-none text-white backdrop-blur-md" placeholder="Enter universal organization directive..." />
                          <button type="submit" className="absolute bottom-5 right-5 bg-[#FFD541] text-black px-8 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl transition-transform active:scale-95">Transmit</button>
                        </form>
                      </div>
                    </div>
                    <div className="col-span-12 lg:col-span-3">
                        <CalendarWidget />
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-8 text-left">
                    <div className="col-span-12 lg:col-span-8">
                        <ProjectDistributionWidget departments={departments} projects={projects} />
                    </div>
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                      <StabilityWidget />
                      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 flex-1">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/20">Fiscal Integrity</h3>
                          <AlertCircle size={14} className="text-amber-400" />
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                          <MinusCircle size={20} className="text-red-400" />
                          <div><p className="text-[10px] font-bold text-white uppercase tracking-wider">Manual Deductions</p><p className="text-[9px] text-white/30 font-bold">Authorized Access Only</p></div>
                        </div>
                      </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 text-left">
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-8 px-2 uppercase">Strategic Mission Board</h3>
                    <SuperAdminProjects projects={projects} />
                </div>
              </motion.div>
            )}

            {/* TAB: LEAVES */}
            {activeTab === "Leaves" && (
              <motion.div key="leaves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="w-full max-w-full">
                  <LeaveOverviewWidget fullWidth />
                </div>
              </motion.div>
            )}
            {/* TAB: PAYROLL */}
            {activeTab === "Payroll" && (
              <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* SEARCH HEADER */}
                <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text"
                      placeholder="Search identity, role, or branch..."
                      value={payrollSearch}
                      onChange={(e) => setPayrollSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/40 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Total Workforce: {employees.length}
                    </div>
                  </div>
                </div>

                {/* TABLE VIEW */}
                <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden text-left">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">Personnel Contract Ledger</h3>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="px-6 py-4">Full Identity</th>
                          <th className="px-6 py-4">Branch / Dept</th>
                          <th className="px-6 py-4">Position</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px] font-medium text-white/70">
                        {filteredEmployees.map((emp, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#FFD541]">
                                  {emp.name.charAt(0)}
                                </div>
                                <span className="font-bold text-white">{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 uppercase text-[10px] tracking-wider text-white/40">
                              {emp.department?.name || "Unassigned"}
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold uppercase tracking-tighter text-[#FFD541]">
                                {emp.role || "Specialist"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <button onClick={() => {
                                  setFiscalTarget(emp);
                                  setContractBaseline(emp.salary?.toString() || "0");
                                  setIsFiscalTriggerOpen(true);
                               }} className="px-5 py-2 bg-[#FFD541]/10 text-[#FFD541] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD541] hover:text-black transition-all border border-[#FFD541]/20">
                                 Manage Contract
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ORGANIZATION */}
            {activeTab === "Organization" && (
              <motion.div key="org" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
                {!selectedDeptId ? (
                  <>
                    <div className="flex justify-between items-center px-2">
                      <h3 className="text-3xl font-bold tracking-tight text-white uppercase">Infrastructure Map</h3>
                      <div className="flex gap-4">
                        <button onClick={() => setShowAssignManager(true)} className="px-6 py-2.5 bg-emerald-500 text-white rounded-full font-bold text-[11px] uppercase tracking-widest shadow-xl">Assign Manager</button>
                        <button onClick={() => setShowCreateDept(true)} className="px-6 py-2.5 bg-[#FFD541] text-black rounded-full font-bold text-[11px] uppercase tracking-widest shadow-xl">Establish Unit</button>
                      </div>
                    </div>
                                        <AssignManagerModal
                                          open={showAssignManager}
                                          onClose={() => setShowAssignManager(false)}
                                          employees={employees}
                                          departments={departments}
                                          onAssign={async (managerId: string, departmentIds: string[]) => {
                                            await fetch("/api/hr/manager/assign", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ managerId, departmentIds })
                                            });
                                            setShowAssignManager(false);
                                            await syncSystem();
                                          }}
                                        />
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {departments.map((dept: any) => {
                        const deptEmployees = employees.filter((emp: any) => emp.department?.id === dept.id);
                        return (
                          <div key={dept.id} onClick={() => setSelectedDeptId(dept.id)} className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 hover:border-[#FFD541]/40 cursor-pointer transition-all group">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-[#FFD541] group-hover:text-black transition-all"><Building2 size={18}/></div>
                            <h4 className="text-lg font-bold text-white mb-0.5">{dept.name}</h4>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">{dept.head}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mb-2">
                              <span className="text-[10px] font-bold text-white/40">{deptEmployees.length} Personnel</span>
                              <ChevronRight size={14} className="text-white/10 group-hover:text-[#FFD541] transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  (() => {
                    const dept = departments.find((d: any) => d.id === selectedDeptId);
                    const deptEmployees = employees.filter((emp: any) => emp.department?.id === selectedDeptId);
                    return (
                      <DepartmentDetailPage
                        department={dept}
                        employees={deptEmployees}
                        allDepartments={departments}
                        onBack={() => setSelectedDeptId(null)}
                        onShiftEmployee={async (empId: string, newDeptId: string, newRole: string) => {
                          // Call API to update employee's department and role
                          await fetch(`/api/hr/employee/shift`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ employeeId: empId, departmentId: newDeptId, role: newRole })
                          });
                          await syncSystem();
                        }}
                      />
                    );
                  })()
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>


<AnimatePresence>
  {isFiscalTriggerOpen && (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 text-left">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setIsFiscalTriggerOpen(false)} 
        className="absolute inset-0 bg-black/95" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
        className="relative bg-[#0A0A0B] w-full max-w-5xl rounded-sm border border-white/10 shadow-2xl flex flex-col font-sans"
      >
        {/* TOP UTILITY BAR */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Executive Audit Terminal // Ref: {fiscalTarget?.id?.slice(0,8)}</span>
          <button onClick={() => setIsFiscalTriggerOpen(false)} className="text-white/20 hover:text-white"><X size={16} /></button>
        </div>

        <div className="flex flex-1 min-h-[480px]">
          {/* LEFT: FIXED CONTRACT DATA */}
          <div className="w-5/12 p-12 border-r border-white/5 space-y-10">
            <div>
              <h2 className="text-3xl font-light text-white tracking-tight">{fiscalTarget?.name}</h2>
              <p className="text-[10px] font-bold text-[#FFD541] uppercase tracking-[0.2em] mt-1">{fiscalTarget?.department?.name || "Corporate"} • {fiscalTarget?.role || "Manager"}</p>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/20">Monthly Baseline (NPR)</label>
                <input 
                  type="number" 
                  value={contractBaseline} 
                  onChange={e => setContractBaseline(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#FFD541] py-2 text-2xl text-white outline-none font-mono transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/20">Duration</label>
                <input 
                  type="text" 
                  value={contractDuration} 
                  onChange={e => setContractDuration(e.target.value)}
                  className="w-full bg-transparent border-b border-white/5 py-1 text-xs text-white/40 outline-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: VARIABLE AUDIT MODIFIERS */}
          <div className="w-7/12 p-12 bg-white/[0.01] flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-10">
              {/* DATE RANGE - PRO-RATA TRIGGER */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/20"><Calendar size={14} /> Audit Cycle Period</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={auditStartDate}
                    onChange={e => setAuditStartDate(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/5 p-3 text-[10px] text-white outline-none focus:border-[#FFD541]/40 font-mono" 
                  />
                  <input 
                    type="date" 
                    value={auditEndDate}
                    onChange={e => setAuditEndDate(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/5 p-3 text-[10px] text-white outline-none focus:border-[#FFD541]/40 font-mono" 
                  />
                </div>
                {auditStartDate && auditEndDate && (
                  <p className="text-[9px] font-bold text-[#FFD541]/60 uppercase tracking-tighter">
                    Cycle Duration: {Math.ceil(Math.abs(new Date(auditEndDate).getTime() - new Date(auditStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                  </p>
                )}
              </div>

              {/* DEDUCTION */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-500/40"><MinusCircle size={14} /> Manual Deduction</label>
                <input 
                  type="number" 
                  value={performanceDeduction}
                  onChange={e => setPerformanceDeduction(e.target.value)}
                  className="w-full bg-red-500/5 border border-red-500/10 p-3 text-lg text-red-400 outline-none font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* AUTHORIZATION */}
            <div className="mt-8 space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/20">Audit Note</label>
              <textarea 
                value={authNote}
                onChange={e => setAuthNote(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-4 text-xs text-white/40 outline-none h-24 resize-none italic" 
                placeholder="Reason for adjustment..."
              />
            </div>

            {/* TOTAL CALCULATION LINE */}
            <div className="mt-10 pt-8 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-1">Total Payable Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-white/20">NPR</span>
                  <span className="text-5xl font-mono font-light text-[#FFD541]">
                    {calculateTotalWithDates().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleFiscalAudit}
                className="px-12 py-4 bg-[#FFD541] text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl"
              >
                Confirm Audit
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* --- SALARY AUDIT HISTORY MODAL --- */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuditModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#0A0A0B]/90 backdrop-blur-3xl w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FFD541] to-transparent opacity-50" />
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-[#FFD541] shadow-lg shadow-yellow-500/5"><History size={24} /></div>
                  <div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight leading-none mb-1">Fiscal History</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Historical Adjustment Logs: {selectedAuditEmployee?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all"><X size={20} /></button>
              </div>

              {auditLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Zap className="animate-pulse text-[#FFD541]" />
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Decrypting Audit Logs...</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[400px] no-scrollbar space-y-4">
                  {auditLogs.length === 0 ? (
                    <div className="py-20 text-center text-white/20 font-bold uppercase text-[11px] tracking-widest">No manual adjustments detected for this personnel.</div>
                  ) : (
                    auditLogs.map((log: any) => (
                      <div key={log.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#FFD541]/20 transition-all">
                        <div className="flex justify-between items-start mb-4 text-left">
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Authorization Note</p>
                            <p className="text-sm font-medium text-white/80">{log.reason}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Audit Timestamp</p>
                             <p className="text-[10px] font-bold text-emerald-400">{new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                           <div className="text-left">
                             <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">Contract Base</p>
                             <p className="text-xs font-bold text-white/40">Rs. {log.oldSalary.toLocaleString()}</p>
                           </div>
                           <div className="flex items-center justify-center">
                              <ArrowDownCircle className="text-red-500/40" size={14} />
                           </div>
                           <div className="text-right">
                             <p className="text-[9px] font-black text-[#FFD541]/40 uppercase tracking-widest">Final Payout</p>
                             <p className="text-xs font-bold text-[#FFD541]">Rs. {log.newSalary.toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- INTEGRATED WIDGETS --- */}
      {hrUser && <OfficeMessenger currentUser={hrUser} allEmployees={employees} />}
      <CreateDeptModal isOpen={showCreateDept} onClose={() => setShowCreateDept(false)} employees={employees} onSuccess={() => { syncSystem(); }} />
      <HireStaffModal isOpen={showHireStaff} onClose={() => setShowHireStaff(false)} onSuccess={() => { syncSystem(); }} />
    </div>
  );
}