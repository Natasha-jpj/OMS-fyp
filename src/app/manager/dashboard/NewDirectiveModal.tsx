"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Target, User, Calendar, Clock } from "lucide-react";
import { useTransition } from "react";

export function NewDirectiveModal({ isOpen, onClose, employees, manager }: any) {
  const [isPending, startTransition] = useTransition();

  async function handleDirectiveSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);
    startTransition(async () => {
      const res = await fetch("/api/manager/tasks", {
        method: "POST",
        body: JSON.stringify({ ...data, departmentId: manager.departmentId, hrId: manager.hrId || null })
      });
      if (res.ok) onClose();
    });
  }

  console.log('NewDirectiveModal employees:', employees);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative bg-[#0F0F12] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ClipboardList size={16} className="text-[#FFD541]" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Issue Directive</h2>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            <form action={handleDirectiveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Mission</label>
                <input name="title" className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-lg py-2.5 px-4 text-[10px] font-bold text-white outline-none transition-all" placeholder="Project Name..." required />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Assignee</label>
                <select name="employeeId" className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#FFD541]/30 appearance-none cursor-pointer transition-all" required>
                  <option value="" className="bg-[#0F0F12]">Select Member...</option>
                            {employees.filter((emp: any) => emp.role === "INTERN").map((emp: any) => (
                              <option key={emp.id} value={emp.id} className="bg-[#0F0F12]">{emp.name}</option>
                            ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Context</label>
                <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-lg p-3 text-[10px] font-bold text-white outline-none resize-none transition-all" placeholder="Mission details..." required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                   <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Deadline</label>
                   <input name="dueDate" type="date" className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-[10px] font-bold text-white outline-none" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Intensity</label>
                   <input name="estimate" className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-[10px] font-bold text-white outline-none" placeholder="e.g. 24H" />
                 </div>
              </div>

              <button disabled={isPending} type="submit" className="w-full py-3.5 bg-[#FFD541] text-black rounded-lg font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all mt-2">
                {isPending ? "Syncing..." : "Activate Directive"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}