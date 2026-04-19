import React, { useState } from "react";
import { X, Check } from "lucide-react";

export default function AssignManagerModal({ open, onClose, employees, departments, onAssign }: { open: boolean; onClose: () => void; employees: any[]; departments: any[]; onAssign: (managerId: string, deptIds: string[]) => Promise<void> }) {
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeptToggle = (deptId: string) => {
    setSelectedDepts(prev =>
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const handleAssign = async () => {
    setLoading(true);
    await onAssign(selectedManager, selectedDepts);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setSelectedManager("");
      setSelectedDepts([]);
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg border border-slate-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
        <h2 className="text-2xl font-bold text-black mb-6">Assign Manager to Departments</h2>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 mb-2">Select Manager</label>
          <select
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value)}
            className="w-full bg-white border border-slate-300 text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            <option value="">Choose a manager...</option>
            {employees.filter((e: any ) => e.role === "MANAGER").map((e: any) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-600 mb-2">Select Departments</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {departments.map((d: any) => (
              <label key={d.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${selectedDepts.includes(d.id) ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                <input
                  type="checkbox"
                  checked={selectedDepts.includes(d.id)}
                  onChange={() => handleDeptToggle(d.id)}
                  className="accent-black"
                />
                <span className="text-black text-sm">{d.name}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleAssign}
          disabled={!selectedManager || selectedDepts.length === 0 || loading}
          className="w-full py-3 bg-black text-white font-bold rounded-lg text-sm uppercase tracking-widest shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? 'Assigning...' : 'Assign'}
          {success && <Check size={18} className="text-emerald-500 ml-2" />}
        </button>
      </div>
    </div>
  );
}
