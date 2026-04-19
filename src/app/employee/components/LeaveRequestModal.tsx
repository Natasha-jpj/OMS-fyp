"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Bookmark, ClipboardCheck, AlertCircle } from "lucide-react";

interface LeaveRequestModalProps {
  selectedDates: { start: string; end?: string } | null;
  onClose: () => void;
  onSubmit: (data: { title: string; startDate: string; endDate?: string; reason: string }) => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ selectedDates, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState(selectedDates?.end || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedDates) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSubmit({
        title,
        startDate: selectedDates.start,
        endDate: endDate || selectedDates.start,
        reason,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate duration
  const startDate = new Date(selectedDates.start);
  const end = new Date(endDate || selectedDates.start);
  const durationDays = Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 font-sans">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        />

        {/* Modern Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-slate-900 px-5 py-3 flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <ClipboardCheck size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Leave Request</h2>
                <p className="text-xs text-white/70 mt-0.5">Submit absence authorization</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <form className="p-5 space-y-3.5" onSubmit={handleSubmit}>
            
            {/* Duration Preview */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-start gap-2">
              <Calendar size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-black mt-0.5">
                  {durationDays} {durationDays === 1 ? "day" : "days"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                  {" → "}
                  {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Leave Type / Title */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Leave Type
              </label>
              <div className="relative">
                <Bookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="e.g., Vacation, Sick Leave"
                  className="w-full bg-white border border-slate-300 focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg py-2 pl-10 pr-3 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-500"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Start
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none cursor-not-allowed opacity-75"
                    value={selectedDates.start}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  End
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-300 focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg py-2 pl-10 pr-3 text-sm font-medium text-black outline-none transition-all"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={selectedDates.start}
                  />
                </div>
              </div>
            </div>

            {/* Reason / Description */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                Reason
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <textarea
                  placeholder="Briefly explain..."
                  className="w-full bg-white border border-slate-300 focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg p-2.5 pl-10 text-sm font-medium text-black outline-none resize-none h-16 transition-all placeholder:text-slate-500"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Validation Info */}
            {(!title || !reason) && (
              <div className="bg-blue-50 rounded-lg p-2 flex gap-2 border border-blue-200">
                <AlertCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">All fields required</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button 
                type="button" 
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 px-3 bg-black hover:bg-slate-900 text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !title || !reason}
              >
                {isSubmitting ? "..." : "Submit"}
              </button>
            </div>

            {/* Info Footer */}
            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 border border-slate-200">
              <p className="leading-relaxed">✓ Your request will be reviewed by your manager and you&apos;ll get email updates</p>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeaveRequestModal;