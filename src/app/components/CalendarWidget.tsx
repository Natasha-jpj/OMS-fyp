"use client";
import React, { useEffect, useState } from "react";
import LeaveRequestModal from "../../../components/LeaveRequestModal";
import { CalendarIcon } from "lucide-react";

export default function CalendarWidget({ holidays = [], events = [], onDayClick }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // Remove local modal state and handler
  // const [selectedDates, setSelectedDates] = useState<{start: string, end?: string} | null>(null);
  // const [showModal, setShowModal] = useState(false);
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (onDayClick) onDayClick(dateStr);
  };

  // Generate days for the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to check if a day is a holiday/event
  const getDayType = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (holidays.some((h: any) => h.date === dateStr)) return "holiday";
    if (events.some((e: any) => e.date === dateStr)) return "event";
    return "normal";
  };

  return (
    <div className="w-full">
      {/* Modal is now handled globally in the dashboard page */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} className="px-2 py-1 text-xs">Prev</button>
        <span className="font-bold text-lg">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} className="px-2 py-1 text-xs">Next</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {["S","M","T","W","T","F","S"].map((d, i) => <span key={d + i} className="text-[9px] font-black text-gray-400">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array(firstDay).fill(null).map((_, i) => <div key={i} />)}
        {days.map(day => {
          const type = getDayType(day);
          return (
            <div
              key={day}
              className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all
                ${type === "holiday" ? "bg-[#FFD541] text-black border-yellow-400 shadow-lg" :
                  type === "event" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  "bg-white text-gray-400 border-gray-100"}`}
              onClick={() => handleDayClick(day)}
              style={{ cursor: "pointer" }}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2"><CalendarIcon size={16} className="text-[#FFD541]" /><span className="text-xs font-bold">Holidays</span></div>
        <ul className="text-xs">
          {holidays.map((h: any) => <li key={h.date} className="mb-1">{h.name} - {h.date}</li>)}
        </ul>
        <div className="flex items-center gap-2 mt-2 mb-2"><CalendarIcon size={16} className="text-emerald-400" /><span className="text-xs font-bold">Events</span></div>
        <ul className="text-xs">
          {events.map((e: any) => <li key={e.date} className="mb-1">{e.name} - {e.date}</li>)}
        </ul>
      </div>
    </div>
  );
}
