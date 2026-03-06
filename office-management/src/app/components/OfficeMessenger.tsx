"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealTimeGlobal } from "../../hooks/useRealTime";
import { MessageSquare, X, Send, Search, ChevronLeft, Activity, ShieldCheck } from "lucide-react";

export default function OfficeMessenger({ currentUser, allEmployees }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"contacts" | "chat">("contacts");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch persistent chat history
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?user1=${currentUser.id}&user2=${selectedUser.id}`);
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser.id]);

  // Listen for real-time messages on the global channel
  useRealTimeGlobal((newMsg: any) => {
    if (
      selectedUser &&
      ((newMsg.senderId === currentUser.id && newMsg.receiverId === selectedUser.id) ||
        (newMsg.senderId === selectedUser.id && newMsg.receiverId === currentUser.id))
    ) {
      setMessages((prev) => [...prev, newMsg]);
    }
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const body = {
      content: input,
      senderType: currentUser.role,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (res.ok) {
      setInput("");
    }
  };

  const filteredEmployees = allEmployees.filter((emp: any) => 
    emp.id !== currentUser.id && 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-8 right-8 z-[300] flex flex-col items-end gap-4 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#0A0A0B]/95 backdrop-blur-3xl w-[380px] h-[600px] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col mb-4 text-left"
          >
            {/* --- HEADER --- */}
            <div className="bg-white/[0.02] p-6 flex justify-between items-center border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                {view === "chat" && (
                  <button onClick={() => setView("contacts")} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-[#FFD541] transition-all">
                    <ChevronLeft size={20}/>
                  </button>
                )}
                <div className="w-10 h-10 rounded-xl bg-[#FFD541] flex items-center justify-center text-black shadow-lg">
                  {view === "chat" ? (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.name}`} alt="avatar" className="w-full h-full rounded-xl" />
                  ) : (
                    <Activity size={20} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-tight text-white uppercase leading-none mb-1">
                    {view === "chat" ? selectedUser?.name : "Workforce Terminal"}
                  </p>
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">
                    {view === "chat" ? selectedUser?.position : "Secure Internal Line"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* --- VIEW: DIRECTORY --- */}
            {view === "contacts" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
                <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[11px] outline-none text-white focus:border-[#FFD541]/40 transition-all placeholder:text-white/10" 
                      placeholder="Identify Personnel..." 
                    />
                  </div>
                </div>
                {/* overflow-y-auto combined with no-scrollbar for clean scrolling */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                  {filteredEmployees.map((emp: any) => (
                    <div 
                      key={emp.id} 
                      onClick={() => { setSelectedUser(emp); setView("chat"); }}
                      className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl cursor-pointer group transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/40 group-hover:bg-[#FFD541] group-hover:text-black transition-all">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white leading-tight">{emp.name}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider mt-0.5">{emp.position}</p>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* --- VIEW: CHAT --- */}
            {view === "chat" && (
              <>
                {/* FIXED: overflow-x-hidden strictly prevents horizontal scroll */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-black/40 no-scrollbar relative">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <ShieldCheck size={40} className="mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex w-full ${msg.senderId === currentUser.id ? 'justify-end pr-1' : 'justify-start'}`}>
                        {/* FIXED: max-w-[80%] ensures bubbles stay clear of edges */}
                        <div 
                          className={`max-w-[80%] px-5 py-3 rounded-2xl text-[11px] font-medium shadow-xl break-words leading-relaxed ${
                            msg.senderId === currentUser.id 
                              ? 'bg-[#FFD541] text-black rounded-tr-none' 
                              : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSend} className="p-5 bg-white/[0.02] border-t border-white/5 flex items-center gap-3 flex-shrink-0">
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    className="flex-1 bg-white/5 border border-white/5 rounded-full py-3.5 px-6 text-[11px] text-white outline-none focus:border-[#FFD541]/40 transition-all placeholder:text-white/10" 
                    placeholder="Enter transmission..." 
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className="w-11 h-11 bg-[#FFD541] text-black rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/10 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all flex-shrink-0"
                  >
                    <Send size={18}/>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING TRIGGER --- */}
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen 
            ? 'bg-white text-black' 
            : 'bg-[#FFD541] text-black shadow-yellow-500/20'
        }`}
      >
        {isOpen ? <X size={28}/> : <MessageSquare size={28} fill="currentColor" />}
      </motion.button>
    </div>
  );
}