"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Reuse icons from dashboard
const HomeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

function Sidebar() {
  return (
    <aside className="w-16 bg-white/80 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col items-center py-4 border-r border-white/40 shadow-2xl z-50">
      <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] rounded-xl flex items-center justify-center mb-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 13V10a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20h16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20v-2a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/hr/dashboard" className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <HomeIcon />
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Dashboard
          </span>
        </Link>
        <Link href="/hr/reports" className="group w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg relative">
          <ClipboardIcon />
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Reports
          </span>
        </Link>
        <Link href="/hr/attendance" className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Attendance
          </span>
        </Link>
        <Link href="/hr/calendar" className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <CalendarIcon />
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Calendar
          </span>
        </Link>
        <button className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <SettingsIcon />
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Settings
          </span>
        </button>
      </nav>
      <div className="mt-auto">
        <div className="group relative">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            NJ
          </div>
          <span className="absolute left-10 bottom-0 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            Profile
          </span>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Welcome Natasha,</h1>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Last logged in Sep 25, 2024
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
            <SearchIcon />
          </button>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
            <UserIcon />
          </button>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg relative">
            <BellIcon />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
          </button>
          <div className="w-px h-5 bg-white/30 mx-1"></div>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
            <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ title, value, subtitle, trend, color = "emerald" }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    blue: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    red: "bg-red-500/20 text-red-700 border-red-500/30",
  };
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full border ${colorMap[color]}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HRReportsPage() {
  const [hrId, setHrId] = useState("");
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const hr = localStorage.getItem("hr");
    if (hr) {
      const parsed = JSON.parse(hr);
      setHrId(parsed?.id);
    }
  }, []);

  useEffect(() => {
    if (!hrId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [deptRes, attRes] = await Promise.all([
          fetch(`/api/hr/departments?hrId=${hrId}`),
          fetch(`/api/hr/attendance?hrId=${hrId}`),
        ]);
        const deptData = await deptRes.json();
        const attData = await attRes.json();

        if (deptRes.ok) setDepartments(deptData.departments || []);
        if (attRes.ok) setAttendance(attData.records || []);

        // Flatten employees from departments
        const allEmps = (deptData.departments || []).flatMap((d: any) =>
          (d.employees || []).map((e: any) => ({ ...e, deptName: d.name }))
        );
        setEmployees(allEmps);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [hrId]);

  const today = new Date().toDateString();
  const todayCheckIns = attendance.filter(
    (r) => r.type === "CHECKIN" && new Date(r.timestamp).toDateString() === today
  );
  const todayCheckOuts = attendance.filter(
    (r) => r.type === "CHECKOUT" && new Date(r.timestamp).toDateString() === today
  );

  const uniqueEmpsToday = new Set(todayCheckIns.map((r) => r.employeeId));
  const presentCount = uniqueEmpsToday.size;
  const absentCount = employees.length - presentCount;

  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B35]/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF6B35]/5 rounded-full blur-xl"></div>
      </div>

      <Sidebar />

      <div className="ml-16 flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <section className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Reports & Analytics</h2>
                <p className="text-sm text-slate-500">Comprehensive view of departments, employees, and attendance</p>
              </div>

              {loading ? (
                <div className="text-slate-600">Loading reports...</div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Departments" value={departments.length} color="blue" />
                    <StatCard title="Total Employees" value={employees.length} color="orange" />
                    <StatCard title="Present Today" value={presentCount} trend={`${attendanceRate}%`} color="emerald" />
                    <StatCard title="Absent Today" value={absentCount} color="red" />
                  </div>

                  {/* Departments Section */}
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-5 border border-white/40 shadow-lg mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Departments Overview</h3>
                      <span className="text-xs text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-white/40">
                        {departments.length} departments
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Department Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Employees</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {departments.map((dept) => (
                            <tr key={dept.id} className="border-b border-slate-100 hover:bg-white/60 transition">
                              <td className="py-3 px-4 font-medium text-slate-900">{dept.name}</td>
                              <td className="py-3 px-4 text-slate-600">{dept._count?.employees || 0}</td>
                              <td className="py-3 px-4 text-slate-500 text-xs">{new Date(dept.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {departments.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-4 text-center text-slate-500">
                                No departments found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Employees Section */}
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-5 border border-white/40 shadow-lg mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Employees Directory</h3>
                      <span className="text-xs text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-white/40">
                        {employees.length} employees
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((emp) => {
                            const present = uniqueEmpsToday.has(emp.id);
                            return (
                              <tr key={emp.id} className="border-b border-slate-100 hover:bg-white/60 transition">
                                <td className="py-3 px-4 font-medium text-slate-900">{emp.name}</td>
                                <td className="py-3 px-4 text-slate-600">{emp.email}</td>
                                <td className="py-3 px-4 text-slate-500">{emp.deptName || "-"}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border ${
                                      present
                                        ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                        : "bg-red-500/20 text-red-700 border-red-500/30"
                                    }`}
                                  >
                                    {present ? "Present" : "Absent"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {employees.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-500">
                                No employees found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Today's Attendance */}
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-5 border border-white/40 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Today's Attendance Log</h3>
                      <span className="text-xs text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-white/40">
                        {todayCheckIns.length + todayCheckOuts.length} entries
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Time</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...todayCheckIns, ...todayCheckOuts]
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((record, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-white/60 transition">
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-900">{record.employeeName}</div>
                                  <div className="text-xs text-slate-500">{record.department || "-"}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border ${
                                      record.type === "CHECKIN"
                                        ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                        : "bg-slate-500/20 text-slate-700 border-slate-500/30"
                                    }`}
                                  >
                                    {record.type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600">{new Date(record.timestamp).toLocaleTimeString()}</td>
                                <td className="py-3 px-4">
                                  {record.photo ? (
                                    <img src={record.photo} alt="Check-in" className="w-10 h-10 object-cover rounded-lg border border-white/40" />
                                  ) : (
                                    <span className="text-xs text-slate-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          {todayCheckIns.length + todayCheckOuts.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-500">
                                No attendance records for today
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
