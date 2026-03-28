"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Key, Target, Users } from "lucide-react";
import { managerHireEmployee } from "../../actions/manager-employee";
import { useTransition } from "react";

export function ManagerHireModal({ isOpen, onClose, manager }: any) {
  const [isPending, startTransition] = useTransition();

  async function handleSiloEnrollment(formData: FormData) {
    if (!manager) return;
    formData.append("departmentId", manager.departmentId);
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
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative bg-[#0F0F12] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <UserPlus size={16} className="text-[#FFD541]" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Enroll Personnel</h2>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            <form action={handleSiloEnrollment} className="space-y-4">
              <MiniInput name="name" label="Legal Name" placeholder="Sabin Sharma" icon={<Users size={14}/>} />
              <MiniInput name="email" label="Email" placeholder="sabin@aura.io" icon={<Mail size={14}/>} type="email" />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Access</label>
                  <select name="role" className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#FFD541]/30 appearance-none cursor-pointer transition-all">
                    <option value="INTERN" className="bg-[#0F0F12]">Staff</option>
                    <option value="MANAGER" className="bg-[#0F0F12]">Lead</option>
                  </select>
                </div>
                <MiniInput name="position" label="Role" placeholder="Analyst" icon={<Target size={14}/>} />
              </div>

              <MiniInput name="password" label="Passkey" placeholder="••••••••" icon={<Key size={14}/>} type="password" />

              <button disabled={isPending} type="submit" className="w-full py-3.5 bg-[#FFD541] text-black rounded-lg font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all mt-2">
                {isPending ? "Syncing..." : "Authorize Entry"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MiniInput({ label, placeholder, icon, name, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{icon}</div>
        <input name={name} type={type} className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-lg py-2.5 pl-9 pr-3 text-[10px] font-bold text-white outline-none transition-all placeholder:text-white/10" placeholder={placeholder} required />
      </div>
    </div>
  );
}