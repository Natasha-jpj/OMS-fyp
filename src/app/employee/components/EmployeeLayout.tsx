"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-12 bg-white/40 backdrop-blur-md rounded-full px-8 py-3 border border-white/50 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FFD541] rounded-full shadow-lg" /> AuraFlow
          </div>
          <div className="hidden xl:flex items-center gap-8">
            <Link href="/employee/dashboard" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/dashboard" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Dashboard</Link>
            <Link href="/employee/tasks" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/tasks" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Tasks</Link>
            <Link href="/employee/leaves" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/leaves" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Leaves</Link>
            <Link href="/employee/broadcasts" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/broadcasts" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Broadcasts</Link>
            <Link href="/employee/kanban" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/kanban" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Kanban</Link>
            <Link href="/employee/chat" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${pathname === "/employee/chat" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-black"}`}>Chat</Link>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/choose-role'; }} className="p-2.5 bg-white rounded-full border border-gray-100 text-gray-400 hover:text-red-500 transition-all shadow-sm">
          <LogOut size={16} />
        </button>
      </nav>
      <main className="max-w-[1650px] mx-auto px-6">
        {children}
      </main>
    </div>
  );
}
