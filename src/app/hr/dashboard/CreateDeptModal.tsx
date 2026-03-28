"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, DollarSign, Target, UserPlus } from "lucide-react";
import { createDepartment } from "../../actions/department";
import { useTransition } from "react";

export function CreateDeptModal({ isOpen, onClose, employees, onSuccess }: any) {
  const [isPending, startTransition] = useTransition();

  async function clientAction(formData: FormData) {
    startTransition(async () => {
      const result = await createDepartment(formData);
      if (result.success) {
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        alert(result.error);
      }
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
          {/* Enhanced Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          />
          
          {/* Modal Container: Transparent Dark Glass */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-[#0A0A0B]/90 backdrop-blur-3xl w-full max-w-xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Animated Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FFD541] to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-[#FFD541]">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Initialize Unit</h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Infrastructure Expansion Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FFD541] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form action={clientAction} className="space-y-5">
              <ModalInput name="name" label="Department Designation" placeholder="e.g. Strategic Operations" icon={<Building2 size={16}/>} />
              
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Assign Silo Head</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
                    <UserPlus size={16} />
                  </div>
                  <select 
                    name="managerId" 
                    className="w-full bg-white/5 border border-white/10 focus:border-[#FFD541]/40 rounded-2xl py-4 pl-14 pr-6 outline-none appearance-none font-medium text-xs text-white transition-all backdrop-blur-sm cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#0A0A0B]">Select Personnel Identity...</option>
                    {employees?.map((emp: any) => (
                      <option key={emp.id} value={emp.id} className="bg-[#0A0A0B]">{emp.name} — {emp.position}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <ModalInput name="budget" label="Monthly Ledger (Rs)" placeholder="0.00" icon={<Landmark size={16}/>} />
                <ModalInput name="capacity" label="Personnel Cap" placeholder="50" icon={<Target size={16}/>} />
              </div>

              {/* Primary Action Button */}
              <button 
                disabled={isPending} 
                type="submit" 
                className="w-full py-5 bg-[#FFD541] text-black rounded-full font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-yellow-500/10 active:scale-95 disabled:opacity-50 mt-4"
              >
                {isPending ? "Synchronizing..." : "Establish Infrastructure Unit"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Reusable Condensed Input
function ModalInput({ label, placeholder, icon, name }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">{icon}</div>
        <input 
          name={name} 
          autoComplete="off"
          className="w-full bg-white/5 border border-white/10 focus:border-[#FFD541]/40 rounded-2xl py-4 pl-14 pr-6 outline-none text-xs font-medium text-white transition-all placeholder:text-white/10" 
          placeholder={placeholder} 
          required 
        />
      </div>
    </div>
  );
}

// Add this import to the top of the file
import { Landmark } from "lucide-react";