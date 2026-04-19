"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ListTodo, AlertCircle } from "lucide-react";
import { useTransition } from "react";

export function NewDirectiveModal({ isOpen, onClose, employees, manager }: { isOpen: boolean; onClose: () => void; employees: { id: string; name: string; role: string }[]; manager: { departmentId: string; hrId: string | null } }) {
  const [isPending, startTransition] = useTransition();

  async function handleDirectiveSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);
    startTransition(async () => {
      const res = await fetch("/api/manager/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: data.title,
          description: data.description,
          employeeId: data.employeeId,
          departmentId: manager.departmentId
        })
      });
      if (res.ok) {
        onClose();
      }
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
                  <ListTodo size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">Create Task</h2>
                  <p className="text-xs text-slate-500">Assign work</p>
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
            <form action={handleDirectiveSubmit} className="p-5 space-y-2.5">
              
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input 
                  name="title" 
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                  placeholder="Monthly Report" 
                  required 
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description" 
                  rows={2} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 resize-none transition-all" 
                  placeholder="What needs to be done..." 
                  required 
                />
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select 
                  name="employeeId" 
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black/5 cursor-pointer appearance-none transition-all" 
                  required
                  defaultValue=""
                >
                  <option value="">Select team member...</option>
                  {employees.length > 0 ? (
                    employees.map((emp: { id: string; name: string; role: string }) => (
                      <option key={emp.id} value={emp.id} className="text-black">
                        {emp.name} {emp.role === "INTERN" ? "(S)" : ""}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-slate-500">No members</option>
                  )}
                </select>
              </div>

              {/* Info Banner - Minimal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-1.5">
                <p className="text-xs font-semibold text-blue-900">ℹ Tasks start in TO DO</p>
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
                      Creating
                    </>
                  ) : (
                    "Create Task"
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