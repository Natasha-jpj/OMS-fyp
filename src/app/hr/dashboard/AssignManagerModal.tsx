import React, { useState } from "react";
import { X, Check } from "lucide-react";

export default function AssignManagerModal({ open, onClose, employees, departments, onAssign }: any) {
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#18181b] rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-white/10 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Assign Manager to Departments</h2>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 mb-2">Select Manager</label>
          <select
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value)}
            className="w-full bg-black border border-white/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD541]"
          >
            <option value="">Choose a manager...</option>
            {employees.filter((e: any) => e.role === "MANAGER").map((e: any) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 mb-2">Select Departments</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {departments.map((d: any) => (
              <label key={d.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border border-white/10 ${selectedDepts.includes(d.id) ? 'bg-[#FFD541]/10 border-[#FFD541]' : 'bg-white/5 hover:bg-white/10'}`}>
                <input
                  type="checkbox"
                  checked={selectedDepts.includes(d.id)}
                  onChange={() => handleDeptToggle(d.id)}
                  className="accent-[#FFD541]"
                />
                <span className="text-white text-sm">{d.name}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleAssign}
          disabled={!selectedManager || selectedDepts.length === 0 || loading}
          className="w-full py-3 bg-[#FFD541] text-black font-bold rounded-lg text-sm uppercase tracking-widest shadow-xl disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? 'Assigning...' : 'Assign'}
          {success && <Check size={18} className="text-emerald-500 ml-2" />}
        </button>
      </div>
    </div>
  );
}
