"use client";

import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

interface LeaveRequest {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  employee?: { name: string; department?: { name: string } };
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch("/api/hr/leave", { credentials: "include" }).then((r) => r.json());
        if (res.leaveRequests) setLeaves(res.leaveRequests);
      } catch (err) {
        console.error("Failed to fetch leaves:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const filteredLeaves =
    filterStatus === "all" ? leaves : leaves.filter((l) => l.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "REJECTED":
        return <XCircle size={16} className="text-red-600" />;
      case "PENDING":
        return <Clock size={16} className="text-amber-600" />;
      default:
        return <Calendar size={16} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      case "PENDING":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const stats = {
    total: leaves.length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Leave Management</h1>
        <p className="text-slate-500 mt-2">Manage employee leaves and time off</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Requests</p>
          <p className="text-2xl font-bold text-black mt-2">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold text-red-600 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All Requests" },
          { value: "PENDING", label: "Pending" },
          { value: "APPROVED", label: "Approved" },
          { value: "REJECTED", label: "Rejected" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterStatus(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === option.value
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Leaves List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading leave requests...</div>
      ) : filteredLeaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Calendar size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-black">No leave requests found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Employee</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Department</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Start Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">End Date</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-black">{leave.employee?.name || "N/A"}</td>
                    <td className="px-6 py-3 text-slate-600">{leave.employee?.department?.name || "-"}</td>
                    <td className="px-6 py-3 text-slate-600">{leave.title}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(leave.status)}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
