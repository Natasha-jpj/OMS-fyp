"use client";
import React, { useState } from "react";
import { ArrowLeft, ArrowRightLeft, Check, X } from "lucide-react";
import { EmployeeDetailModal } from "./EmployeeDetailModal";

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
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<any | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);

  return (
    <div className="w-full p-6 min-h-screen text-slate-900 font-sans">
      {/* Header Navigation */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 mb-8 text-sm font-medium text-slate-600 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Department Hero Section (no global HR Dashboard/Executive Terminal header here) */}
      {/* Department Hero Section - Only show department name and manager, no global HR Dashboard/Executive Terminal header */}
      <div className="mb-10">
        <div className="flex items-baseline gap-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-black">{department.name}</h2>
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            Department
          </span>
        </div>
        <p className="mt-2 text-slate-600">
          Managed by <span className="text-black font-medium">{department.head}</span>
        </p>
      </div>

      {/* Employee List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Team Members</h3>
          <span className="text-sm text-slate-600">{employees.length} total</span>
        </div>

        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-600">
            <p className="italic text-sm">No team members assigned to this department yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {employees.map((emp: any) => (
              <div 
                key={emp.id} 
                className={`group relative flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedEmployee === emp.id 
                  ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" 
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
                onClick={() => { setSelectedEmployeeDetail(emp); setShowEmployeeDetail(true); }}
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-300 shadow-sm">
                  <span className="text-sm font-bold text-black">{emp.name.charAt(0)}</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-medium text-black leading-tight group-hover:text-blue-600 transition-colors">{emp.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{emp.role || 'Staff Member'}</p>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {selectedEmployee !== emp.id ? (
                    <button
                      onClick={() => setSelectedEmployee(emp.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black rounded-lg text-xs font-semibold transition-all border border-slate-300"
                    >
                      <ArrowRightLeft size={14} />
                      Shift
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                      <select
                        value={targetDept}
                        onChange={e => setTargetDept(e.target.value)}
                        className="bg-white border border-slate-300 text-xs text-black px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                      >
                        <option value="">Move to...</option>
                        {allDepartments
                          .filter((d: any) => d.id !== department.id)
                          .map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))
                        }
                      </select>
                      <select
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                        className="bg-white border border-slate-300 text-xs text-black px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                      >
                        <option value="">Assign role...</option>
                        <option value="Manager">Manager</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Staff Member">Staff Member</option>
                        <option value="Intern">Intern</option>
                        <option value="Contractor">Contractor</option>
                      </select>
                      <button
                        onClick={() => {
                          onShiftEmployee(emp.id, targetDept, targetRole);
                          setSelectedEmployee(null);
                          setTargetDept("");
                          setTargetRole("");
                        }}
                        disabled={!targetDept || !targetRole}
                        className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Check size={16} />
                      </button>
                      
                      <button
                        onClick={() => setSelectedEmployee(null)}
                        className="p-1.5 bg-slate-100 text-slate-600 hover:text-black rounded-lg"
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

      <EmployeeDetailModal employee={selectedEmployeeDetail} isOpen={showEmployeeDetail} onClose={() => { setShowEmployeeDetail(false); setSelectedEmployeeDetail(null); }} />
    </div>
  );
}