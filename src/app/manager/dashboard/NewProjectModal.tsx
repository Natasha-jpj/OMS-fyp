"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Target, Layers, AlignLeft } from "lucide-react";
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
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-[#0A0A0B]/90 backdrop-blur-3xl w-full max-w-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden text-left" >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FFD541] to-transparent opacity-50" />
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-[#FFD541]"><Layers size={20}/></div>
                <div><h2 className="text-2xl font-bold text-white uppercase leading-none mb-1">New Mission</h2><p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Operational Silo Expansion</p></div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-[#FFD541] transition-colors"><X size={18}/></button>
            </div>

            <form action={clientAction} className="space-y-5">
              <input type="hidden" name="departmentId" value={departmentId} />
              <ModalInput name="name" label="Mission Designation" placeholder="Operation AuraSync" icon={<Briefcase size={16}/>} />
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Context Briefing</label>
                <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/10 focus:border-[#FFD541]/40 rounded-2xl p-5 outline-none text-xs font-medium text-white transition-all resize-none" placeholder="Provide mission context..." />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Operational Status</label>
                <select name="status" className="w-full bg-white/5 border border-white/10 focus:border-[#FFD541]/40 rounded-2xl py-4 px-6 outline-none appearance-none font-medium text-xs text-white cursor-pointer">
                  <option value="PLANNING" className="bg-[#0A0A0B]">Planning Stage</option>
                  <option value="ORBIT" className="bg-[#0A0A0B]">Active in Orbit</option>
                  <option value="COMPLETED" className="bg-[#0A0A0B]">Mission Accomplished</option>
                </select>
              </div>
              <button disabled={isPending} type="submit" className="w-full py-5 bg-[#FFD541] text-black rounded-full font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-white transition-all mt-4">{isPending ? "Transmitting..." : "Initialize Project Silo"}</button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ModalInput({ label, placeholder, icon, name }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">{icon}</div>
        <input name={name} className="w-full bg-white/5 border border-white/10 focus:border-[#FFD541]/40 rounded-2xl py-4 pl-14 pr-6 outline-none text-xs font-medium text-white transition-all placeholder:text-white/10 backdrop-blur-sm" placeholder={placeholder} required />
      </div>
    </div>
  );
}