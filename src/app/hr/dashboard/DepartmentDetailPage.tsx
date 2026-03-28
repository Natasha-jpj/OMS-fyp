"use client";
import React, { useState } from "react";
import { ArrowLeft, ArrowRightLeft, Check, X } from "lucide-react"; // Assuming Lucide for icons

export default function DepartmentDetailPage({ 
  department, 
  employees, 
  allDepartments, 
  onBack, 
  onShiftEmployee 
}: { 
  department: { id: string; name: string; head: string }; 
  employees: any[]; 
  allDepartments: any[]; 
  onBack: () => void; 
  onShiftEmployee: (employeeId: string, departmentId: string, role: string) => void 
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [targetDept, setTargetDept] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");

  return (
    <div className="w-full p-6 min-h-screen text-slate-200 font-sans">
      {/* Header Navigation */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 mb-8 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Department Hero Section (no global HR Dashboard/Executive Terminal header here) */}
      {/* Department Hero Section - Only show department name and manager, no global HR Dashboard/Executive Terminal header */}
      <div className="mb-10">
        <div className="flex items-baseline gap-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-white">{department.name}</h2>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Department
          </span>
        </div>
        <p className="mt-2 text-slate-400">
          Managed by <span className="text-white font-medium">{department.head}</span>
        </p>
      </div>

      {/* Employee List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
          <span className="text-sm text-slate-500">{employees.length} total</span>
        </div>

        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-2xl text-slate-500">
            <p className="italic text-sm">No team members assigned to this department yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {employees.map((emp: any) => (
              <div 
                key={emp.id} 
                className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  selectedEmployee === emp.id 
                  ? "bg-white/10 border-white/20 ring-1 ring-white/10" 
                  : "bg-white/5 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                  <span className="text-sm font-bold text-white">{emp.name.charAt(0)}</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-medium text-white leading-tight">{emp.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.role || 'Staff Member'}</p>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-2">
                  {selectedEmployee !== emp.id ? (
                    <button
                      onClick={() => setSelectedEmployee(emp.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-all border border-white/5"
                    >
                      <ArrowRightLeft size={14} />
                      Shift
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                      <select
                        value={targetDept}
                        onChange={e => setTargetDept(e.target.value)}
                        className="bg-slate-900 border border-white/20 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30"
                      >
                        <option value="">Move to...</option>
                        {allDepartments
                          .filter((d: any) => d.id !== department.id)
                          .map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))
                        }
                      </select>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                        placeholder="Assign role..."
                        className="bg-slate-900 border border-white/20 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                      <button
                        onClick={() => {
                          onShiftEmployee(emp.id, targetDept, targetRole);
                          setSelectedEmployee(null);
                          setTargetDept("");
                          setTargetRole("");
                        }}
                        disabled={!targetDept || !targetRole}
                        className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Check size={16} />
                      </button>
                      
                      <button
                        onClick={() => setSelectedEmployee(null)}
                        className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}