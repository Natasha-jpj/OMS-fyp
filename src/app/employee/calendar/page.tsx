"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Sidebar = () => (
  <aside className="w-16 bg-white/80 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col items-center py-4 border-r border-white/40 shadow-2xl z-50">
    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] rounded-xl flex items-center justify-center mb-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 13V10a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-2a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <nav className="flex flex-col gap-2 flex-1">
      <Link href="/employee/dashboard" className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Dashboard</span>
      </Link>
      <Link href="/employee/calendar" className="group w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border border-white/40 relative">
        <CalendarIcon />
        <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Calendar</span>
      </Link>
    </nav>
    <div className="mt-auto">
      <div className="group relative">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
          EM
        </div>
        <span className="absolute left-10 bottom-0 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
          Profile
        </span>
      </div>
    </div>
  </aside>
);

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EmployeeCalendarPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [holidays, setHolidays] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("Leave Request");
  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emp = localStorage.getItem("employee");
    if (emp) {
      const parsed = JSON.parse(emp);
      setEmployeeId(parsed?.id || "");
    }
  }, []);

  useEffect(() => {
    if (employeeId) fetchHolidays();
  }, [employeeId]);

  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employee/holidays?employeeId=${employeeId}`);
      const data = await res.json();
      if (res.ok) {
        setHolidays(data.holidays || []);
      } else {
        setError(data.error || "Failed to load holidays");
      }
    } catch (e) {
      setError("Network error while loading holidays");
    } finally {
      setLoading(false);
    }
  };

  const daysInGrid = useMemo(() => {
    const start = new Date(currentMonth);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = start.getDay();
    const totalDays = end.getDate();
    const grid: (Date | null)[] = Array(startDay).fill(null);
    for (let i = 1; i <= totalDays; i++) {
      grid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [currentMonth]);

  const isHoliday = (day: Date) =>
    holidays.some((h) => new Date(h.date).toDateString() === day.toDateString());

  const holidayTitle = (day: Date) => {
    const match = holidays.find(
      (h) => new Date(h.date).toDateString() === day.toDateString()
    );
    return match?.title;
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !selectedDate || !endDate || !title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/employee/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          title,
          reason,
          startDate: selectedDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReason("");
        setTitle("Leave Request");
        setSelectedDate(null);
        setEndDate("");
        alert("Leave request submitted");
      } else {
        alert(data.error || "Failed to submit leave request");
      }
    } catch (err) {
      alert("Network error while submitting leave");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B35]/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF6B35]/5 rounded-full blur-xl"></div>
      </div>

      <Sidebar />

      <div className="ml-16 flex flex-col min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-lg sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 h-full">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Calendar & Leave</h1>
              <div className="text-xs text-slate-500">View holidays and submit a leave request</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
                <CalendarIcon />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <section className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Holiday Calendar</h2>
                  <p className="text-sm text-slate-500">Company holidays set by HR</p>
                </div>
                <div className="flex items-center gap-2 bg-white/80 border border-white/60 rounded-lg px-3 py-2 text-sm text-slate-700">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-white/60"
                  >
                    ←
                  </button>
                  <span className="font-semibold">{monthLabel(currentMonth)}</span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-white/60"
                  >
                    →
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
                  <div className="grid grid-cols-7 text-xs font-semibold text-slate-500 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-center py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {daysInGrid.map((day, idx) => {
                      if (!day) return <div key={idx} />;
                      const selected = selectedDate && day.toDateString() === selectedDate.toDateString();
                      const holiday = isHoliday(day);
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`min-h-[70px] rounded-xl border text-sm flex flex-col items-start p-2 transition hover:-translate-y-0.5 hover:shadow-md ${
                            selected
                              ? "border-[#FF6B35] bg-[#FF6B35]/10"
                              : "border-white/60 bg-white/80"
                          }`}
                        >
                          <span className="text-slate-700 font-semibold">{day.getDate()}</span>
                          {holiday && (
                            <span className="mt-1 text-[11px] text-[#FF6B35] font-semibold truncate">{holidayTitle(day)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {loading && (
                    <div className="text-xs text-slate-600 mt-3">Loading holidays…</div>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Leave application</h3>
                  <form onSubmit={submitLeave} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-sm"
                        placeholder="Medical leave"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Reason</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-sm"
                        placeholder="Add details"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Start date</label>
                        <input
                          type="date"
                          value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                          onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                          required
                          className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">End date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!selectedDate || !endDate || submitting}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FF5A1F] text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 text-sm"
                    >
                      {submitting ? "Submitting..." : "Submit Leave"}
                    </button>
                  </form>
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-1">Upcoming holidays</h4>
                    <div className="space-y-2 max-h-48 overflow-auto pr-1">
                      {holidays.length === 0 && (
                        <div className="text-xs text-slate-500">No holidays yet</div>
                      )}
                      {holidays.map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs bg-white/60 border border-white/50 rounded-lg px-3 py-2">
                          <span className="font-semibold text-slate-800">{h.title}</span>
                          <span className="text-slate-500">{new Date(h.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
