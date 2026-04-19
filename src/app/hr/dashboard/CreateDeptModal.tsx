"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, DollarSign, Target, UserPlus, } from "lucide-react";
import { useState } from "react";

export function CreateDeptModal({ isOpen, onClose, employees, onSuccess }: { isOpen: boolean; onClose: () => void; employees: any[]; onSuccess: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function clientAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const managerId = formData.get("managerId");

    try {
      const manager = managerId ? employees.find((e: any) => e.id === managerId) : null;
      const response = await fetch("/api/hr/departments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          managerName: manager?.name || "",
          managerEmail: manager?.email || "",
          managerPassword: "ChangeMe@2024",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create department");
      }

      if (onSuccess) onSuccess();
      else onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-2xl p-8 border border-slate-200 shadow-lg overflow-hidden"
          >
            {/* Animated Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-30" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-black">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-black uppercase">Create Department</h2>
                  <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Add new organizational unit</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={clientAction} className="space-y-5">
              <ModalInput name="name" label="Department Name" placeholder="e.g. Sales & Marketing" icon={<Building2 size={16}/>} />
              
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 ml-1">Department Head</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserPlus size={16} />
                  </div>
                  <select 
                    name="managerId" 
                    className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:outline-none rounded-lg py-3 pl-12 pr-4 appearance-none font-medium text-sm text-black transition-all cursor-pointer"
                  >
                    <option value="">Select Personnel (Optional)</option>
                    {employees?.map((emp: { id: string; name: string; position: string }) => (
                      <option key={emp.id} value={emp.id}>{emp.name} — {emp.position}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModalInput name="budget" label="Monthly Budget (Rs)" placeholder="0.00" icon={<Landmark size={16}/>} />
                <ModalInput name="capacity" label="Staff Capacity" placeholder="50" icon={<Target size={16}/>} />
              </div>

              {/* Primary Action Button */}
              <button 
                disabled={isPending} 
                type="submit" 
                className="w-full py-3 bg-black text-white rounded-lg font-semibold uppercase text-sm tracking-wide hover:bg-slate-900 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-6"
              >
                {isPending ? "Creating..." : "Create Department"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Reusable Condensed Input
function ModalInput({ label, placeholder, icon, name }: { label: string; placeholder: string; icon: React.ReactNode; name: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input 
          name={name} 
          autoComplete="off"
          className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:outline-none rounded-lg py-3 pl-12 pr-4 text-sm font-medium text-black transition-all placeholder:text-slate-400" 
          placeholder={placeholder} 
          required 
        />
      </div>
    </div>
  );
}

// Add this import to the top of the file
import { Landmark } from "lucide-react";