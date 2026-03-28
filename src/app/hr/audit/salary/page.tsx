"use client";

import React, { useEffect, useState } from "react";

export default function SalaryAuditPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [changedByFilter, setChangedByFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchAudits();
  }, []);

  async function fetchAudits() {
    setLoading(true);
    setError("");
    let url = "/api/hr/audit/salary?";
    if (employeeFilter) url += `employeeId=${employeeFilter}&`;
    if (changedByFilter) url += `changedById=${changedByFilter}&`;
    if (dateRange.start) url += `start=${dateRange.start}&`;
    if (dateRange.end) url += `end=${dateRange.end}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setAudits(data.audits || []);
    } catch (err) {
      setError("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Salary Audit Logs</h1>
      <div className="flex gap-4 mb-6">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Employee ID"
          value={employeeFilter}
          onChange={e => setEmployeeFilter(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="Changed By (HR) ID"
          value={changedByFilter}
          onChange={e => setChangedByFilter(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          type="date"
          value={dateRange.start}
          onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
        />
        <input
          className="border px-2 py-1 rounded"
          type="date"
          value={dateRange.end}
          onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={fetchAudits}
        >
          Filter
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Employee</th>
                <th className="border px-2 py-1">Old Salary</th>
                <th className="border px-2 py-1">New Salary</th>
                <th className="border px-2 py-1">Changed By</th>
                <th className="border px-2 py-1">Reason</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a: any) => (
                <tr key={a.id}>
                  <td className="border px-2 py-1">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">{a.employee?.name || a.employeeId}</td>
                  <td className="border px-2 py-1">{a.oldSalary}</td>
                  <td className="border px-2 py-1">{a.newSalary}</td>
                  <td className="border px-2 py-1">{a.changedBy?.name || a.changedById}</td>
                  <td className="border px-2 py-1">{a.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
