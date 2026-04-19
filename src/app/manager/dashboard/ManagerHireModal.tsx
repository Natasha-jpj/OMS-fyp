"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Lock, Briefcase, Users } from "lucide-react";
import { managerHireEmployee } from "../../actions/manager-employee";
import { useTransition } from "react";

export function ManagerHireModal({ isOpen, onClose, manager }: any) {
  const [isPending, startTransition] = useTransition();

  async function handleSiloEnrollment(formData: FormData) {
    if (!manager) return;
    // Only append departmentId if it's defined and not "undefined"
    if (manager.departmentId && manager.departmentId !== "undefined") {
      formData.append("departmentId", manager.departmentId);
    }
    formData.append("managerId", manager.id);
    startTransition(async () => {
      const result = await managerHireEmployee(formData);
      if (result.success) onClose();
      else alert(result.error);
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <UserPlus size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">Hire Team Member</h2>
                  <p className="text-xs text-slate-500">Add employee</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Content */}
            <form action={handleSiloEnrollment} className="p-5 space-y-2.5">
              
              {/* Full Name & Email Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="name" 
                      type="text"
                      className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                      placeholder="Sabin Sharma" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="email" 
                      type="email"
                      className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                      placeholder="user@company.com" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Position, Role, Password Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="position" 
                      type="text"
                      className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                      placeholder="Analyst" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="role" 
                    className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black/5 cursor-pointer appearance-none transition-all"
                    required
                  >
                    <option value="INTERN" className="text-black">Staff</option>
                    <option value="MANAGER" className="text-black">Lead</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="password" 
                      type="password"
                      className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Info Banner - Minimal */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-1.5">
                <p className="text-xs font-semibold text-green-900">✓ Auto-access enabled</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1.5">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-1.5 rounded-lg border border-slate-300 text-black font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isPending} 
                  type="submit" 
                  className="flex-1 py-1.5 rounded-lg bg-black text-white font-semibold text-xs hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding
                    </>
                  ) : (
                    "Add Employee"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}