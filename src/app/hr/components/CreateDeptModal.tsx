"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, UserPlus, Calendar, Hash, Layers, MapPin, Users } from "lucide-react";
import { useState } from "react";

interface Department {
  id: string;
  name: string;
  code?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  email?: string;
}

interface CreateDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: Employee[];
  departments?: Department[];
  onSuccess: () => void;
}

export function CreateDeptModal({
  isOpen,
  onClose,
  employees = [],
  departments = [],
  onSuccess,
}: CreateDeptModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const suggestedDeptId = (() => {
    const nextNum = (departments.length + 1).toString().padStart(3, "0");
    return `DEPT-${nextNum}`;
  })();

  async function clientAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      departmentId: formData.get("departmentId"),
      name: formData.get("name"),
      parentDeptId: formData.get("parentDeptId") || null,
      managerId: formData.get("managerId") || null,
      startDate: formData.get("startDate"),
      staffCapacity: parseInt(formData.get("staffCapacity") as string) || null,
      location: formData.get("location") || null,
    };

    try {
      const manager = payload.managerId
        ? employees.find((e) => e.id === payload.managerId)
        : null;

      const response = await fetch("/api/hr/departments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          managerName: manager?.name || "",
          managerEmail: manager?.email || "",
          managerPassword: "ChangeMe@2024",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create department");

      if (onSuccess) onSuccess();
      else onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 text-left">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-black">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Create department</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Add a new organisational unit</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={clientAction} className="p-6 pt-5 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Row 1: Department ID + Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Hash size={14} /> Department ID
                  </label>
                  <input
                    name="departmentId"
                    type="text"
                    defaultValue={suggestedDeptId}
                    placeholder="e.g. DEPT-001"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                  <p className="text-xs text-slate-500">Unique identifier, auto‑suggested but editable</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Building2 size={14} /> Department name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Product Design"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Parent Department */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Layers size={14} /> Parent department
                </label>
                <select
                  name="parentDeptId"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                >
                  <option value="">None (Top‑level department)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Defines hierarchy & reporting lines</p>
              </div>

              

              {/* Row 4: Department Head + Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <UserPlus size={14} /> Department head
                  </label>
                  <select
                    name="managerId"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="">Select a person (optional)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.position}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">Will be set as manager for this department</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} /> Start date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                  <p className="text-xs text-slate-500">Date when department becomes active</p>
                </div>
              </div>

              {/* Row 5: Default Work Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} /> Default work location
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder="e.g. New York HQ, Remote, London Office"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isPending}
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-black rounded-lg text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Creating..." : "Create department"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}