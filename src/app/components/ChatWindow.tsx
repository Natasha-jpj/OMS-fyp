"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealTimeGlobal } from "../../hooks/useRealTime";
import { X, Send, Search, ChevronLeft, Activity, ShieldCheck } from "lucide-react";

interface ChatWindowProps {
  currentUser: any;
  userType: "HR" | "EMPLOYEE" | "MANAGER";
  allEmployees?: any[];
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ currentUser, userType, allEmployees = [], isOpen, onClose }: ChatWindowProps) {
  const [view, setView] = useState<"contacts" | "chat">("contacts");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<any[]>(allEmployees);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all available contacts on mount (universal chat)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts");
        const data = await res.json();
        if (Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        // Fallback to allEmployees if provided
        if (allEmployees.length > 0) {
          setContacts(allEmployees);
        }
      }
    };
    fetchContacts();
  }, [allEmployees]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch persistent chat history
  useEffect(() => {
    if (!selectedUser || !currentUser?.id) return;
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
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser?.id]);

  // Listen for real-time messages - memoized callback to avoid re-subscriptions
  const memoizedMessageHandler = useCallback((newMsg: any) => {
    setMessages((prevMessages) => {
      // Check if message should be added
      if (
        selectedUser &&
        currentUser &&
        currentUser.id &&
        !newMsg.id.toString().startsWith('pending-') &&
        ((newMsg.senderId === currentUser.id && newMsg.receiverId === selectedUser.id) ||
          (newMsg.senderId === selectedUser.id && newMsg.receiverId === currentUser.id))
      ) {
        // Check if message already exists to avoid duplicates
        if (!prevMessages.find(m => m.id === newMsg.id)) {
          return [...prevMessages, newMsg];
        }
      }
      return prevMessages;
    });
  }, [selectedUser, currentUser]);

  // Subscribe to real-time messages (called at top level, callback is memoized)
  useRealTimeGlobal(memoizedMessageHandler);

  // Guard: Don't render if no current user
  if (!currentUser) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !currentUser?.id) return;

    // Save the message content before clearing
    const messageContent = input.trim();

    // Create unique ID for this pending message
    const pendingId = `${Date.now()}-${Math.random()}`;

    // Create message object
    const newMsg = {
      id: pendingId,
      content: messageContent,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      sentAt: Date.now(),
      senderType: userType,
    };

    // 1. Optimistic update - add to local state immediately
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // 2. Broadcast via Pusher to all users in real-time
    try {
      await fetch("/api/pusher/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "global-office",
          event: "new-message",
          data: newMsg,
        }),
      }).catch(err => console.error("Pusher broadcast failed:", err));
    } catch (err) {
      console.error("Failed to broadcast message:", err);
    }

    // 3. Async DB save (non-blocking, happens in background)
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: messageContent,
        senderType: userType,
        senderId: currentUser.id,
        receiverId: selectedUser.id,
      }),
    }).catch(err => console.error("Failed to persist message:", err));
  };

  const filteredEmployees = contacts.filter((emp: any) => 
    emp.id !== currentUser.id && 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setView("contacts");
    setSelectedUser(null);
    setMessages([]);
    setInput("");
    setSearchQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-20 right-8 w-[380px] h-[600px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col bg-white z-[300] text-left"
        >
          {/* --- HEADER --- */}
          <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              {view === "chat" && (
                <button onClick={() => { setView("contacts"); setSelectedUser(null); }} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-black transition-all">
                  <ChevronLeft size={20}/>
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white shadow-md">
                {view === "chat" ? (
                  <span className="text-xs font-bold">{selectedUser?.name.charAt(0)}</span>
                ) : (
                  <Activity size={20} />
                )}
              </div>
              <div>
                <p className="text-xs font-bold tracking-tight text-black uppercase leading-none mb-1">
                  {view === "chat" ? selectedUser?.name : "Connect"}
                </p>
                <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">
                  {view === "chat" ? (selectedUser?.position || "Team Member") : "Secure Chat"}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 hover:text-black transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* --- VIEW: DIRECTORY --- */}
          {view === "contacts" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-11 pr-4 text-[11px] outline-none text-black focus:border-blue-900 transition-all placeholder:text-slate-400" 
                    placeholder="Search contacts..." 
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredEmployees.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-xs text-slate-500">No contacts available</p>
                  </div>
                ) : (
                  filteredEmployees.map((emp: any) => (
                    <div 
                      key={emp.id} 
                      onClick={() => { setSelectedUser(emp); setView("chat"); }}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg cursor-pointer group transition-all border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 group-hover:bg-black group-hover:text-white transition-all">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-black leading-tight">{emp.name}</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{emp.position || "Team Member"}</p>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* --- VIEW: CHAT --- */}
          {view === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <ShieldCheck size={40} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">End-to-End Encrypted</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex w-full ${msg.senderId === currentUser?.id ? 'justify-end pr-1' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] px-5 py-3 rounded-lg text-[11px] font-medium shadow-md break-words leading-relaxed ${
                          msg.senderId === currentUser?.id 
                            ? 'bg-black text-white rounded-br-none' 
                            : 'bg-white text-black border border-slate-300 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSend} className="p-5 bg-slate-50 border-t border-slate-200 flex items-center gap-3 flex-shrink-0">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  className="flex-1 bg-white border border-slate-300 rounded-full py-3.5 px-6 text-[11px] text-black outline-none focus:border-blue-900 transition-all placeholder:text-slate-400" 
                  placeholder="Type your message..." 
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-900 active:scale-95 disabled:opacity-20 transition-all flex-shrink-0"
                >
                  <Send size={18}/>
                </button>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
