"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare, ChevronLeft } from "lucide-react";
import { sendMessage } from "../../actions/messaging";

// FIX: Ensure this is explicitly exported to resolve image_08b969.png error
export function SuperAdminChat({ hrUser, employees = [] }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"directory" | "chat">("directory");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !selectedUser) return;
    const formData = new FormData();
    formData.append("content", chatInput);
    formData.append("senderId", hrUser.id);
    formData.append("receiverId", selectedUser.id);
    formData.append("role", "ADMIN");
    const res = await sendMessage(formData);
    if (res.success) setChatInput("");
  }

  return (
    <div className="fixed bottom-10 right-10 z-[500] flex flex-col items-end gap-5">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
  initial={{ opacity: 0, scale: 0.9, y: 30 }} 
  animate={{ opacity: 1, scale:0.8, y: 0 }} 
  exit={{ opacity: 0, scale: 0.9, y: 30 }}
  className="bg-[#121212] w-[400px] h-[80vh] min-h-[400px] max-h-[700px] rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col mb-4 text-left"
>
            {/* HEADER: flex-shrink-0 prevents it from getting cut off */}
            <div className="bg-[#1A1A1E] p-8 text-white flex justify-between items-center border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                {view === "chat" && (
                  <button onClick={() => setView("directory")} className="hover:text-[#FFD541] transition-colors">
                    <ChevronLeft size={22}/>
                  </button>
                )}
                <div className="w-11 h-11 rounded-2xl bg-[#FFD541] flex items-center justify-center text-black font-black text-lg">M</div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-tight">
                    {view === "chat" ? selectedUser?.name : "Office Sync"}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Live Portal</p>
                </div>
              </div>
              <X size={20} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => setIsOpen(false)} />
            </div>

            {/* BODY: flex-1 ensures this area takes all remaining space and scrolls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#0F0F12] no-scrollbar">
              {view === "directory" ? (
                employees.map((emp: any) => (
                  <div key={emp.id} onClick={() => { setSelectedUser(emp); setView("chat"); }} 
                    className="flex items-center justify-between p-4 hover:bg-white/5 rounded-[1.5rem] cursor-pointer group transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-gray-500 group-hover:bg-[#FFD541] group-hover:text-black transition-all">{emp.name.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-bold text-white">{emp.name}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">{emp.position}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-[11px] italic p-10 text-center">
                  Secure tunnel established. Transmissions are encrypted.
                </div>
              )}
            </div>

            {/* FOOTER: flex-shrink-0 ensures input is always visible at the bottom */}
            {view === "chat" && (
              <form onSubmit={handleSend} className="p-8 bg-[#1A1A1E] border-t border-white/5 flex items-center gap-4 flex-shrink-0">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} 
                  className="flex-1 bg-white/5 border border-white/5 rounded-full py-4 px-8 text-xs text-white outline-none focus:border-[#FFD541]/40" 
                  placeholder="Issue transmission..." />
                <button type="submit" className="w-12 h-12 bg-[#FFD541] text-black rounded-full flex items-center justify-center shadow-lg">
                  <Send size={20}/>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsOpen(!isOpen)} 
        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-white text-black' : 'bg-[#121212] text-[#FFD541]'}`}>
        {isOpen ? <X size={28}/> : <MessageSquare size={28} fill="currentColor" />}
      </motion.button>
    </div>
  );
}

// FIX: Explicitly export this to resolve image_08b969.png
export function SuperAdminProjects({ projects = [] }: any) {
    return (
        <div className="p-8">
            {/* Your Project UI Implementation */}
        </div>
    );
}