import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, MinusCircle } from "lucide-react";

export default function LeaveManagementSection({
  employees,
  departments,
  allLeaveRequests,
  leaveStats,
  leaveAbsenceDateFilter,
  setLeaveAbsenceDateFilter,
  leaveEmployeeFilter,
  setLeaveEmployeeFilter,
  leaveDepartmentFilter,
  setLeaveDepartmentFilter,
  leaveStatusFilter,
  setLeaveStatusFilter,
  leaveSearchFilter,
  setLeaveSearchFilter,
  leaveCurrentPage,
  setLeaveCurrentPage,
  leaveItemsPerPage,
  syncSystem,
}) {
  return (
    <motion.div key="leaves" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Leave Management</h2>
          <p className="text-sm mt-0.5 text-slate-700">Track and approve employee leave requests by department</p>
        </div>
      </div>

      {/* Advanced Filters and Stats Section */}
      <div className="grid grid-cols-12 gap-4">
        {/* Filters */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border p-4 bg-slate-50 border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <input type="date" value={leaveAbsenceDateFilter} onChange={e => { setLeaveAbsenceDateFilter(e.target.value); setLeaveCurrentPage(1); }}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full" />
              <select value={leaveEmployeeFilter} onChange={e => { setLeaveEmployeeFilter(e.target.value); setLeaveCurrentPage(1); }}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full">
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
              <select value={leaveDepartmentFilter} onChange={e => { setLeaveDepartmentFilter(e.target.value); setLeaveCurrentPage(1); }}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full">
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <select value={leaveStatusFilter} onChange={e => { setLeaveStatusFilter(e.target.value); setLeaveCurrentPage(1); }}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <input type="text" value={leaveSearchFilter} onChange={e => { setLeaveSearchFilter(e.target.value); setLeaveCurrentPage(1); }}
                placeholder="Search by name or reason..."
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-900 w-full" />
              <button onClick={() => {
                setLeaveAbsenceDateFilter("");
                setLeaveEmployeeFilter("");
                setLeaveDepartmentFilter("");
                setLeaveStatusFilter("");
                setLeaveSearchFilter("");
                setLeaveCurrentPage(1);
              }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 w-full">
                Reset
              </button>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border p-3 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} className="text-amber-600" />
              <p className="text-[10px] font-semibold text-amber-700 uppercase">Pending</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">{leaveStats.pending}</p>
          </div>
          <div className="rounded-xl border p-3 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={13} className="text-emerald-600" />
              <p className="text-[10px] font-semibold text-emerald-700 uppercase">Approved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{leaveStats.approved}</p>
          </div>
          <div className="rounded-xl border p-3 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <MinusCircle size={13} className="text-red-600" />
              <p className="text-[10px] font-semibold text-red-700 uppercase">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-red-900">{leaveStats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-slate-50 border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              {["Employee", "Type", "Department", "Period", "Reason", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let filtered = allLeaveRequests;
              if (leaveAbsenceDateFilter) {
                const filterDate = new Date(leaveAbsenceDateFilter);
                filtered = filtered.filter(req => {
                  const start = new Date(req.startDate);
                  const end = new Date(req.endDate);
                  return filterDate >= start && filterDate <= end;
                });
              }
              if (leaveEmployeeFilter) {
                filtered = filtered.filter(req => req.employee?.name === leaveEmployeeFilter);
              }
              if (leaveDepartmentFilter) {
                filtered = filtered.filter(req => req.employee?.department?.name === leaveDepartmentFilter);
              }
              if (leaveStatusFilter) {
                filtered = filtered.filter(req => req.status === leaveStatusFilter);
              }
              if (leaveSearchFilter) {
                const search = leaveSearchFilter.toLowerCase();
                filtered = filtered.filter(req =>
                  req.employee?.name?.toLowerCase().includes(search) ||
                  req.title?.toLowerCase().includes(search)
                );
              }
              const startIdx = (leaveCurrentPage - 1) * leaveItemsPerPage;
              const endIdx = startIdx + leaveItemsPerPage;
              const paginatedLeaves = filtered.slice(startIdx, endIdx);

              return paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                    {leaveAbsenceDateFilter ? "No employees absent on this date" : "No leave requests found"}
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map(req => (
                  <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar is expected to be globally available or can be replaced */}
                        <span className="text-sm font-semibold text-black">{req.employee?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                        ${(employees.find(e => e.name === req.employee?.name)?.role === "MANAGER") ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {(employees.find(e => e.name === req.employee?.name)?.role === "MANAGER") ? "Manager" : "Employee"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {req.employee?.department?.name || "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{req.title || "-"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                        ${req.status === "PENDING" ? "bg-amber-100 text-amber-700" : req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {req.status === "PENDING" && (employees.find(e => e.name === req.employee?.name)?.role === "MANAGER") ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/hr/leave", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({ leaveRequestId: req.id, status: "APPROVED" }),
                                });
                                if (res.ok) {
                                  await syncSystem();
                                }
                              } catch (err) {
                                console.error("Failed to approve:", err);
                              }
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-emerald-700 hover:bg-emerald-100">Approve</button>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/hr/leave", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({ leaveRequestId: req.id, status: "REJECTED" }),
                                });
                                if (res.ok) {
                                  await syncSystem();
                                }
                              } catch (err) {
                                console.error("Failed to reject:", err);
                              }
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-red-700 hover:bg-red-100">Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(() => {
        let filtered = allLeaveRequests;
        if (leaveAbsenceDateFilter) {
          const filterDate = new Date(leaveAbsenceDateFilter);
          filtered = filtered.filter(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            return filterDate >= start && filterDate <= end && req.status === 'APPROVED';
          });
        }
        const totalPages = Math.ceil(filtered.length / leaveItemsPerPage);
        return totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Page {leaveCurrentPage} of {totalPages} ({filtered.length} total)</span>
            <div className="flex gap-1.5">
              <button onClick={() => setLeaveCurrentPage(p => Math.max(1, p - 1))} disabled={leaveCurrentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                ← Prev
              </button>
              <button onClick={() => setLeaveCurrentPage(p => Math.min(totalPages, p + 1))} disabled={leaveCurrentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        ) : null;
      })()}
    </motion.div>
  );
}
