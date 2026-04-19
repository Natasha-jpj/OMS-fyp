"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Key, Target, Users, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function HireStaffModal({ isOpen, onClose, onSuccess }: any) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function clientAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const position = formData.get("position");
    const role = formData.get("role");

    try {
      const response = await fetch("/api/hr/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, position, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to hire employee");
      }

      alert(`Personnel Successfully Onboarded! ID: ${data.id || data.newEmployee?.id}`);
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
            className="relative bg-white w-full max-w-xl rounded-2xl p-8 border border-slate-200 shadow-md overflow-hidden"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-black to-transparent" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-black">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-black uppercase leading-none mb-1">Onboard Personnel</h2>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">New Workforce Identity Protocol</p>
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
              <div className="grid grid-cols-1 gap-5">
                <HireInput name="name" label="Full Legal Name" placeholder="e.g. Sabin Sharma" icon={<Users size={16}/>} />
                <HireInput name="email" label="Corporate Email Address" placeholder="sabin@auraflow.io" icon={<Mail size={16}/>} type="email" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <HireInput name="password" label="System Access Key" placeholder="••••••••" icon={<Key size={16}/>} type="password" />
                <HireInput name="position" label="Operational Designation" placeholder="e.g. Lead Gemologist" icon={<ShieldCheck size={16}/>} />
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 ml-1">Employee Role</label>
                <select 
                  name="role"
                  defaultValue="EMPLOYEE"
                  className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:outline-none rounded-lg py-3 px-4 text-sm font-medium text-black transition-all"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              {/* Primary Action Button */}
              <button 
                disabled={isPending} 
                type="submit" 
                className="w-full py-3 bg-black text-white rounded-lg font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {isPending ? "Validating Identity..." : "Complete System Onboarding"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Reusable Condensed Input for Onboarding
function HireInput({ label, placeholder, icon, name, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input 
          name={name} 
          type={type} 
          autoComplete="off"
          className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:outline-none rounded-lg py-3 pl-12 pr-4 text-sm font-medium text-black transition-all placeholder:text-slate-400" 
          placeholder={placeholder} 
          required 
        />
      </div>
    </div>
  );
}