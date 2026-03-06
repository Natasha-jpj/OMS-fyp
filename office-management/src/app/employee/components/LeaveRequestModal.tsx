"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Bookmark, ClipboardCheck } from "lucide-react";

interface LeaveRequestModalProps {
  selectedDates: { start: string; end?: string } | null;
  onClose: () => void;
  onSubmit: (data: { title: string; startDate: string; endDate?: string; reason: string }) => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ selectedDates, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState(selectedDates?.end || "");

  if (!selectedDates) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 font-sans text-left">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        />

        {/* Tactical Modal Container */}
        <motion.div 
          initial={{ scale: 0.98, opacity: 0, y: 10 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          className="relative bg-[#0F0F12] w-full max-w-sm rounded-[2rem] p-8 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Executive Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD541] to-transparent opacity-50" />

          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FFD541]/10 rounded-xl flex items-center justify-center text-[#FFD541] shadow-lg shadow-yellow-500/5">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none mb-1">Leave Application</h2>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Absence Authorization Request</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Application Form */}
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              onSubmit({
                title,
                startDate: selectedDates.start,
                endDate: endDate || selectedDates.start,
                reason,
              });
            }}
          >
            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Directive Title</label>
              <div className="relative">
                <Bookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  type="text"
                  placeholder="e.g. Personal Sabbatical"
                  className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-xl py-3 pl-9 pr-4 text-[10px] font-bold text-white outline-none transition-all placeholder:text-white/10"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date Configuration Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD541]/40" size={14} />
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-9 pr-3 text-[10px] font-bold text-white/40 outline-none cursor-not-allowed"
                    value={selectedDates.start}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD541]" size={14} />
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-xl py-3 pl-9 pr-3 text-[10px] font-bold text-white outline-none transition-all"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Operational Reason</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-white/20" size={14} />
                <textarea
                  placeholder="Detail context for administrative review..."
                  className="w-full bg-white/5 border border-white/5 focus:border-[#FFD541]/30 rounded-2xl p-4 pl-10 text-[10px] font-bold text-white outline-none resize-none h-24 transition-all placeholder:text-white/10"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                className="flex-1 py-3.5 bg-white/5 text-white/40 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all" 
                onClick={onClose}
              >
                Abort
              </button>
              <button 
                type="submit" 
                className="flex-[2] py-3.5 bg-[#FFD541] text-black rounded-full font-black uppercase text-[9px] tracking-widest shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Submit Authorization
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeaveRequestModal;