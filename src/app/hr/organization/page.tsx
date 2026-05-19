"use client";

import React, { useState, useEffect } from "react";
import { Plus, Building2, Users, ArrowRight } from "lucide-react";
import { CreateDeptModal } from "../components/CreateDeptModal";
import DepartmentDetailPage from "../dashboard/DepartmentDetailPage";

interface Department {
  id: string;
  name: string;
  head?: string;
  budget?: number;
  capacity?: number;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  salary?: number;
  department?: { id: string; name: string };
}

export default function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          fetch("/api/hr/departments", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/hr/employees", { credentials: "include" }).then((r) => r.json()),
        ]);
        if (deptRes.departments) setDepartments(deptRes.departments);
        if (empRes.employees) setEmployees(empRes.employees);
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const syncData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        fetch("/api/hr/departments", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/hr/employees", { credentials: "include" }).then((r) => r.json()),
      ]);
      if (deptRes.departments) setDepartments(deptRes.departments);
      if (empRes.employees) setEmployees(empRes.employees);
    } catch (err) {
      console.error("Failed to sync organization data:", err);
    }
  };

  if (selectedDept) {
    const deptEmployees = employees.filter((e) => e.department?.id === selectedDept.id);
    return (
      <DepartmentDetailPage
        department={selectedDept}
        employees={deptEmployees}
        allDepartments={departments}
        onBack={() => setSelectedDept(null)}
        onShiftEmployee={async (employeeId, targetDeptId, role) => {
          try {
            await fetch(`/api/hr/employee/${employeeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ departmentId: targetDeptId, position: role }),
            });
            await syncData();
            setSelectedDept(null);
          } catch (err) {
            console.error("Failed to shift employee:", err);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Organization Management</h1>
          <p className="text-slate-500 mt-2">Manage departments and organizational structure</p>
        </div>
        <button
          onClick={() => setShowCreateDept(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900"
        >
          <Plus size={16} /> Create Department
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Building2 size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-black">No departments yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first department to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const deptEmpCount = employees.filter((e) => e.department?.id === dept.id).length;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:shadow-md hover:border-slate-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-black">{dept.name}</h3>
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                  <Users size={14} />
                  <span>{deptEmpCount} member{deptEmpCount !== 1 ? "s" : ""}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      <CreateDeptModal
        isOpen={showCreateDept}
        onClose={() => setShowCreateDept(false)}
        employees={employees}
        departments={departments}
        onSuccess={() => {
          setShowCreateDept(false);
          syncData();
        }}
      />
    </div>
  );
}
