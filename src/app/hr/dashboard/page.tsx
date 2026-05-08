"use client";
import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import AuraFlowSuperAdmin from "./AuraFlowSuperAdmin";

export default function DashboardPage() {
  const [initialDepts, setInitialDepts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [initialMessages, setInitialMessages] = useState([]);
  const [hrUser, setHrUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
  setLoading(true);
  try {
    // 1. Wrap each fetch in its own handler to prevent one crash from killing everything
    const fetchSafe = async (url) => {
      try {
        const r = await fetch(url, { credentials: "include" });
        return r.ok ? await r.json() : null;
      } catch (e) {
        return null;
      }
    };

    const [deptsRes, empRes, msgRes, hrRes] = await Promise.all([
      fetchSafe("/api/hr/departments"),
      fetchSafe("/api/hr/employees"),
      fetchSafe("/api/hr/messages"),
      fetchSafe("/api/hr/profile"),
    ]);

    // 2. Safely assign data only if the response was successful
    if (deptsRes) setInitialDepts(deptsRes.departments || []);
    if (empRes) setEmployees(empRes.employees || []);
    if (msgRes) setInitialMessages(msgRes.messages || []);
    if (hrRes) setHrUser(hrRes.hr || null);

  } catch (err) {
    // Error handled silently
  } finally {
    setLoading(false);
  }
}
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center animate-pulse"><Activity size={18} className="text-white" /></div>
        <p className="text-xs text-slate-500 font-medium">Loading your workspace…</p>
      </div>
    </div>
  );

  return (
    <AuraFlowSuperAdmin
      initialDepts={initialDepts}
      existingEmployees={employees}
      initialMessages={initialMessages}
      hrUser={hrUser}
    />
  );
}