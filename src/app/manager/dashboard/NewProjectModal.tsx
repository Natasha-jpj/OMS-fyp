"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, FileText, AlertCircle } from "lucide-react";
import { createProject } from "../../actions/project";
import { useTransition } from "react";

export function NewProjectModal({ isOpen, onClose, departmentId }: any) {
  const [isPending, startTransition] = useTransition();

  async function clientAction(formData: FormData) {
    startTransition(async () => {
      const result = await createProject(formData);
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
                  <Briefcase size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">Create Project</h2>
                  <p className="text-xs text-slate-500">New initiative</p>
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
            <form action={clientAction} className="p-5 space-y-2.5">
              <input type="hidden" name="departmentId" value={departmentId} />
              
              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="name" 
                    type="text"
                    className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all" 
                    placeholder="Project Alpha" 
                    required 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-2 text-slate-400" />
                  <textarea 
                    name="description" 
                    rows={2} 
                    className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-black placeholder:text-slate-500 outline-none focus:border-black focus:ring-1 focus:ring-black/5 resize-none transition-all" 
                    placeholder="Details..." 
                    required 
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Status <span className="text-red-500">*</span>
                </label>
                <select 
                  name="status" 
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black/5 cursor-pointer appearance-none transition-all"
                  required
                >
                  <option value="PLANNING" className="text-black">Planning</option>
                  <option value="ORBIT" className="text-black">In Progress</option>
                  <option value="COMPLETED" className="text-black">Completed</option>
                </select>
              </div>

              {/* Info Banner - Minimal */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-1.5">
                <p className="text-xs font-semibold text-yellow-900">⚡ Track work & assign team</p>
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
                    "Create Project"
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