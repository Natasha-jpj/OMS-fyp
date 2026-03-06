"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Sidebar and TopBar copied from HR Dashboard to preserve layout/navigation
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
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Dashboard</span>
        </Link>
        <button className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Reports</span>
        </button>
        <Link href="/hr/calendar" className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Calendar</span>
        </Link>
        <Link href="/hr/attendance" className="group w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border border-white/40 relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Attendance</span>
        </Link>
        <button className="group w-10 h-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 shadow-lg border border-white/40 relative">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span className="absolute left-12 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Settings</span>
        </button>
      </nav>
      <div className="mt-auto">
        <div className="group relative">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">NJ</div>
          <span className="absolute left-10 bottom-0 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">Profile</span>
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
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </button>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg relative">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.5 1 1 0 00-.68-1.21.978.978 0 00-1.21.68A7.97 7.97 0 008.24 10.5 1 1 0 0010 11.06a.933.933 0 00.24-2.5z"/></svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
          </button>
          <div className="w-px h-5 bg-white/30 mx-1"></div>
          <button className="w-9 h-9 bg-white/60 text-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:text-[#FF6B35] hover:scale-110 border border-white/40 shadow-lg">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ title, value, trend, icon }: { title: string; value: React.ReactNode; trend?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</div>
        {icon && (
          <div className="text-[#FF6B35] group-hover:scale-110 transition-transform duration-300 p-1.5 bg-white/50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full border ${
            trend.includes('+') 
              ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' 
              : 'bg-blue-500/20 text-blue-700 border-blue-500/30'
          }`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HRAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hrId, setHrId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CHECKIN' | 'CHECKOUT'>("ALL");
  const [preview, setPreview] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    const hr = localStorage.getItem("hr");
    if (hr) {
      const parsed = JSON.parse(hr);
      setHrId(parsed?.id);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!hrId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/hr/attendance?hrId=${hrId}`);
        const data = await res.json();
        if (res.ok) setRecords(data.records || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hrId]);

  const filtered = useMemo(() => {
    let result = records;
    
    // Filter by type
    if (typeFilter !== 'ALL') {
      result = result.filter((r) => r.type === typeFilter);
    }
    
    // Filter by date
    if (dateFilter) {
      result = result.filter((r) => {
        const recordDate = new Date(r.timestamp).toISOString().split('T')[0];
        return recordDate === dateFilter;
      });
    }
    
    return result;
  }, [records, typeFilter, dateFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => 
      new Date(r.timestamp).toISOString().split('T')[0] === today
    );
    
    return {
      total: records.length,
      today: todayRecords.length,
      checkIns: records.filter(r => r.type === 'CHECKIN').length,
      checkOuts: records.filter(r => r.type === 'CHECKOUT').length,
    };
  }, [records]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Modern background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B35]/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF6B35]/5 rounded-full blur-xl"></div>
      </div>

      <Sidebar />

      {/* Main content with proper scrolling */}
      <div className="ml-16 flex flex-col min-h-screen">
        <TopBar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <section className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Attendance Report</h2>
                  <p className="text-sm text-slate-500">Monitor employee check-ins with photo verification</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                  title="Total Records" 
                  value={stats.total}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  }
                />
                <StatCard 
                  title="Today's Activity" 
                  value={stats.today}
                  trend={stats.today > 0 ? "+" + stats.today : "0"}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  }
                />
                <StatCard 
                  title="Check-ins" 
                  value={stats.checkIns}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  }
                />
                <StatCard 
                  title="Check-outs" 
                  value={stats.checkOuts}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  }
                />
              </div>

              {/* Filters */}
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/60 border border-white/40 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-transparent"
                    >
                      <option value="ALL">All Types</option>
                      <option value="CHECKIN">Check-ins Only</option>
                      <option value="CHECKOUT">Check-outs Only</option>
                    </select>
                    
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2 bg-white/60 border border-white/40 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="text-sm text-slate-600 bg-white/60 px-3 py-2 rounded-lg border border-white/40">
                    {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              {loading ? (
                <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 border border-white/40 shadow-lg text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-600 mt-2 text-sm">Loading attendance records...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((record, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-xs font-medium px-2 py-1 rounded-full border ${
                          record.type === 'CHECKIN' 
                            ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-700 border-blue-500/30'
                        }`}>
                          {record.type}
                        </div>
                        <div className="text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-lg border border-white/40">
                          {formatTime(record.timestamp)}
                        </div>
                      </div>
                      
                      {record.photo ? (
                        <button 
                          onClick={() => setPreview(record)} 
                          className="block w-full mb-3 group/photo"
                        >
                          <div className="relative overflow-hidden rounded-lg border border-white/40">
                            <img 
                              src={record.photo} 
                              alt="Attendance photo" 
                              className="w-full h-40 object-cover transition-transform duration-300 group-hover/photo:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-all duration-300 flex items-center justify-center">
                              <svg width="20" height="20" fill="none" stroke="white" className="opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m0 0l3-3m-3 3l-3-3"/>
                              </svg>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-white/40 mb-3">
                          No Photo Available
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-900 text-sm truncate">
                          {record.employeeName || 'Unknown Employee'}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {record.email || 'No email'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500 bg-white/60 px-2 py-1 rounded border border-white/40">
                            {record.department || 'No Department'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(record.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filtered.length === 0 && (
                    <div className="col-span-full bg-white/80 backdrop-blur-lg rounded-xl p-8 border border-white/40 shadow-lg text-center">
                      <svg width="48" height="48" fill="none" stroke="currentColor" className="text-slate-400 mx-auto mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <p className="text-slate-600 text-sm">No attendance records found</p>
                      <p className="text-slate-500 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Photo Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/40 p-6 max-w-4xl w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{preview.employeeName}</h3>
                <p className="text-sm text-slate-600">
                  {preview.department} • {formatDate(preview.timestamp)} at {formatTime(preview.timestamp)}
                </p>
              </div>
              <button 
                onClick={() => setPreview(null)} 
                className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-white/60 rounded-lg"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="bg-black rounded-xl overflow-hidden">
              <img 
                src={preview.photo} 
                alt="Full size attendance photo" 
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/40">
              <div className="text-xs text-slate-500">
                {preview.type} • Verified with facial recognition
              </div>
              <button 
                onClick={() => setPreview(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}