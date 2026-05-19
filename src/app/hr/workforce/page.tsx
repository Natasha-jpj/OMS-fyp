"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Search, Eye } from "lucide-react";
import { HireStaffModal } from "../components/HireStaffModal";
import { EmployeeDetailModal } from "../components/EmployeeDetailModal";

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  salary?: number;
  phone?: string;
  department?: { id: string; name: string };
}

export default function WorkforcePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          fetch("/api/hr/employees", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/hr/departments", { credentials: "include" }).then((r) => r.json()),
        ]);
        if (empRes.employees) setEmployees(empRes.employees);
        if (deptRes.departments) setDepartments(deptRes.departments);
      } catch (err) {
        console.error("Failed to fetch workforce data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const syncData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        fetch("/api/hr/employees", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/departments", { credentials: "include" }).then((r) => r.json()),
      ]);
      if (empRes.employees) setEmployees(empRes.employees);
      if (deptRes.departments) setDepartments(deptRes.departments);
    } catch (err) {
      console.error("Failed to sync workforce data:", err);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      (emp.email || "").toLowerCase().includes(query) ||
      (emp.position || "").toLowerCase().includes(query) ||
      (emp.department?.name || "").toLowerCase().includes(query)
    );
  });

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "MANAGER":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Workforce Management</h1>
          <p className="text-slate-500 mt-2">Manage employees and team members</p>
        </div>
        <button
          onClick={() => setShowHireModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900"
        >
          <Plus size={16} /> Hire Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, position, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-slate-400"
        />
      </div>

      {/* Employees List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Users size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-black">No employees found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? "Try adjusting your search" : "Hire your first employee to get started"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Position</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Department</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Salary</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-black">{emp.name}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.email || "-"}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.position || "-"}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.department?.name || "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getRoleBadgeColor(emp.role)}`}>
                        {emp.role || "EMPLOYEE"}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-black">
                      {emp.salary ? `NPR ${emp.salary.toLocaleString("en-IN")}` : "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <HireStaffModal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        onSuccess={() => {
          setShowHireModal(false);
          syncData();
        }}
        departments={departments}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
}
