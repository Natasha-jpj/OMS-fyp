"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Upload,
  Loader,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Calendar,
  Building2,
  UserCircle,
} from "lucide-react";
import EmployeePayrollPanel from "../employee/components/EmployeePayrollPanel";

interface Employee {
  id: string;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  salary?: number;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  department?: { id: string; name: string };
  lastAudit?: string;
  joinDate?: string | Date;
  contractEndDate?: string | Date;
  contractType?: string;
  employmentStatus?: string;
  contractUrl?: string;
  managerId?: string;
}

function InfoRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          {badge}
          <span className="text-sm font-medium text-slate-900 text-right">
            {value}
          </span>
        </div>
      </div>
      <div className="border-t border-slate-100 last:hidden" />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
      {children}
    </p>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function EmployeeDetailModal({
  employee: initialEmployee,
  isOpen,
  onClose,
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<any>({});

  // Fetch employee details when modal opens
  useEffect(() => {
    if (!isOpen || !initialEmployee) return;

    const employeeId = initialEmployee.id;
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/hr/employee/${employeeId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch employee details");
        const data = await res.json();
        setEmployee(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          position: data.position || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          departmentId: data.department?.id || "",
          salary: data.salary || "",
          joinDate: data.joinDate
            ? new Date(data.joinDate).toISOString().split("T")[0]
            : "",
          contractType: data.contractType || "Full-time",
          contractEndDate: data.contractEndDate
            ? new Date(data.contractEndDate).toISOString().split("T")[0]
            : "",
          employmentStatus: data.employmentStatus || "Active",
          contractUrl: data.contractUrl || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [isOpen, initialEmployee?.id]);

  const parsedJoinDate = useMemo(
    () => (employee?.joinDate ? new Date(employee.joinDate) : new Date()),
    [employee?.joinDate]
  );
  const parsedContractEndDate = useMemo(
    () =>
      employee?.contractEndDate
        ? new Date(employee.contractEndDate)
        : null,
    [employee?.contractEndDate]
  );

  const { daysInCompany } = useMemo(() => {
    const days = Math.floor(
      (Date.now() - parsedJoinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { daysInCompany: days };
  }, [parsedJoinDate]);

  const handleSave = async () => {
    if (!employee) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hr/employee/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Employee details updated successfully");
        setIsEditing(false);
        // Refresh employee data
        const updatedRes = await fetch(`/api/hr/employee/${employee.id}`, {
          credentials: "include",
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setEmployee(updatedData);
          setFormData({
            name: updatedData.name || "",
            email: updatedData.email || "",
            phone: updatedData.phone || "",
            position: updatedData.position || "",
            address: updatedData.address || "",
            emergencyContact: updatedData.emergencyContact || "",
            departmentId: updatedData.department?.id || "",
            salary: updatedData.salary || "",
            joinDate: updatedData.joinDate
              ? new Date(updatedData.joinDate).toISOString().split("T")[0]
              : "",
            contractType: updatedData.contractType || "Full-time",
            contractEndDate: updatedData.contractEndDate
              ? new Date(updatedData.contractEndDate).toISOString().split("T")[0]
              : "",
            employmentStatus: updatedData.employmentStatus || "Active",
            contractUrl: updatedData.contractUrl || "",
          });
        }
      } else {
        alert("Failed to update employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating employee");
    } finally {
      setSaving(false);
    }
  };

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!employee || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }

    setUploadingContract(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("employeeId", employee.id);

      const res = await fetch("/api/hr/employee/upload-contract", {
        method: "POST",
        credentials: "include",
        body: formDataObj,
      });

      if (res.ok) {
        alert("Contract uploaded successfully");
        const data = await res.json();
        setFormData((prev: any) => ({ ...prev, contractUrl: data.contractUrl }));
        // Refresh employee to show updated contract URL
        const refreshRes = await fetch(`/api/hr/employee/${employee.id}`, {
          credentials: "include",
        });
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          setEmployee(refreshed);
        }
      } else {
        alert("Failed to upload contract");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading contract");
    } finally {
      setUploadingContract(false);
    }
  };

  if (!isOpen) return null;

  const roleBadgeStyles: Record<string, string> = {
    ADMIN: "bg-slate-900 text-white",
    MANAGER: "bg-blue-50 text-blue-600",
    EMPLOYEE: "bg-slate-100 text-slate-600",
  };
  const roleKey = (employee?.role || "EMPLOYEE").toUpperCase();
  const badgeClass = roleBadgeStyles[roleKey] || "bg-slate-100 text-slate-600";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 bg-white pointer-events-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-black">
                  <UserCircle size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Employee details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">View and manage employee information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Loading / Error states */}
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader className="animate-spin text-slate-400" size={32} />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            ) : !employee ? (
              <div className="p-6 text-center text-slate-500">No employee data</div>
            ) : (
              <>
                {/* Body */}
                <div className="flex flex-col sm:flex-row h-[70vh] overflow-hidden">
                  {/* Sidebar */}
                  <div className="sm:w-52 flex-shrink-0 flex flex-col items-center gap-3 px-5 py-6 bg-white border-b sm:border-b-0 sm:border-r border-slate-100">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-700 select-none">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">
                        {employee.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {employee.position || employee.role || "Staff member"}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide ${badgeClass}`}
                    >
                      {employee.role || "Employee"}
                    </span>
                    <div className="w-full border-t border-slate-100 my-1" />
                    {employee.salary && (
                      <MetricCard
                        label="Monthly salary"
                        value={`Rs. ${employee.salary.toLocaleString()}`}
                      />
                    )}
                    <MetricCard
                      label="Days in company"
                      value={daysInCompany.toLocaleString()}
                    />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {!isEditing ? (
                      <>
                        {/* View mode */}
                        <section>
                          <SectionLabel>Basic information</SectionLabel>
                          <div>
                            {employee.email && (
                              <InfoRow
                                label="Email"
                                value={
                                  <div className="flex items-center gap-1.5">
                                    <Mail size={14} className="text-slate-400" />
                                    <span>{employee.email}</span>
                                  </div>
                                }
                              />
                            )}
                            {employee.phone && (
                              <InfoRow
                                label="Phone"
                                value={
                                  <div className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-slate-400" />
                                    <span>{employee.phone}</span>
                                  </div>
                                }
                              />
                            )}
                            {employee.address && (
                              <InfoRow
                                label="Address"
                                value={
                                  <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span>{employee.address}</span>
                                  </div>
                                }
                              />
                            )}
                            {employee.emergencyContact && (
                              <InfoRow
                                label="Emergency contact"
                                value={
                                  <div className="flex items-center gap-1.5">
                                    <Home size={14} className="text-slate-400" />
                                    <span>{employee.emergencyContact}</span>
                                  </div>
                                }
                              />
                            )}
                            {employee.department && (
                              <InfoRow
                                label="Department"
                                value={
                                  <div className="flex items-center gap-1.5">
                                    <Building2 size={14} className="text-slate-400" />
                                    <span>{employee.department.name}</span>
                                  </div>
                                }
                              />
                            )}
                            <InfoRow
                              label="Position"
                              value={
                                <div className="flex items-center gap-1.5">
                                  <Briefcase size={14} className="text-slate-400" />
                                  <span>{employee.position || employee.role || "Staff member"}</span>
                                </div>
                              }
                            />
                            {employee.salary && (
                              <InfoRow
                                label="Salary"
                                value={`Rs. ${employee.salary.toLocaleString()}`}
                              />
                            )}
                          </div>
                        </section>

                        <section>
                          <SectionLabel>Employment</SectionLabel>
                          <div>
                            <InfoRow
                              label="Join date"
                              value={
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={14} className="text-slate-400" />
                                  <span>
                                    {parsedJoinDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              }
                            />
                            <InfoRow
                              label="Employment status"
                              value={employee.employmentStatus || "Active"}
                            />
                            <InfoRow
                              label="Contract type"
                              value={employee.contractType || "Full-time permanent"}
                            />
                            <InfoRow
                              label="Contract end"
                              value={
                                parsedContractEndDate
                                  ? parsedContractEndDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Permanent (No end date)"
                              }
                              badge={
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                  Active
                                </span>
                              }
                            />
                            {employee.contractUrl && (
                              <InfoRow
                                label="Contract"
                                value={
                                  <button
                                    onClick={() => setViewingPdf(true)}
                                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                                  >
                                    <FileText size={14} /> View PDF
                                  </button>
                                }
                              />
                            )}
                            {employee.lastAudit && (
                              <InfoRow
                                label="Last audit"
                                value={new Date(employee.lastAudit).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              />
                            )}
                          </div>
                        </section>

                        {/* Payroll section */}
                        <section>
                          <SectionLabel>Payroll</SectionLabel>
                          <div>
                            <React.Suspense
                              fallback={
                                <div className="text-sm text-slate-500">Loading payroll...</div>
                              }
                            >
                              <EmployeePayrollPanel employeeId={employee.id} />
                            </React.Suspense>
                          </div>
                        </section>
                      </>
                    ) : (
                      <>
                        {/* Edit mode */}
                        <section>
                          <SectionLabel>Basic information</SectionLabel>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Email
                              </label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Address
                              </label>
                              <input
                                type="text"
                                value={formData.address}
                                onChange={(e) =>
                                  setFormData({ ...formData, address: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Emergency contact
                              </label>
                              <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) =>
                                  setFormData({ ...formData, emergencyContact: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Position
                              </label>
                              <input
                                type="text"
                                value={formData.position}
                                onChange={(e) =>
                                  setFormData({ ...formData, position: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Salary (Rs.)
                              </label>
                              <input
                                type="number"
                                value={formData.salary}
                                onChange={(e) =>
                                  setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                          </div>
                        </section>

                        <section>
                          <SectionLabel>Employment details</SectionLabel>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Join date
                              </label>
                              <input
                                type="date"
                                value={formData.joinDate}
                                onChange={(e) =>
                                  setFormData({ ...formData, joinDate: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Employment status
                              </label>
                              <select
                                value={formData.employmentStatus}
                                onChange={(e) =>
                                  setFormData({ ...formData, employmentStatus: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                              >
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Terminated">Terminated</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Contract type
                              </label>
                              <select
                                value={formData.contractType}
                                onChange={(e) =>
                                  setFormData({ ...formData, contractType: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                              >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Intern">Intern</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                Contract end date
                              </label>
                              <input
                                type="date"
                                value={formData.contractEndDate}
                                onChange={(e) =>
                                  setFormData({ ...formData, contractEndDate: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                              />
                            </div>
                          </div>
                        </section>

                        <section>
                          <SectionLabel>Contract document</SectionLabel>
                          <div className="border-2 border-dashed border-slate-200 rounded-lg p-5">
                            <label className="flex flex-col items-center gap-2 cursor-pointer">
                              <Upload size={20} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">
                                {uploadingContract ? "Uploading..." : "Upload PDF contract"}
                              </span>
                              <span className="text-xs text-slate-500">Click to select PDF file</span>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleContractUpload}
                                disabled={uploadingContract}
                                className="hidden"
                              />
                            </label>
                            {formData.contractUrl && (
                              <div className="mt-4 p-2 bg-emerald-50 rounded-lg flex items-center justify-between">
                                <span className="text-xs text-emerald-700">✓ Contract uploaded</span>
                                <a
                                  href={formData.contractUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              </div>
                            )}
                          </div>
                        </section>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        Edit details
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      >
                        {saving && <Loader size={14} className="animate-spin" />}
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && employee?.contractUrl && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingPdf(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <span className="text-sm font-semibold text-slate-900">
                {employee.name}&apos;s contract
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={employee.contractUrl}
                  download={`${employee.name}-contract.pdf`}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <FileText size={13} /> Download
                </a>
                <button
                  onClick={() => setViewingPdf(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="w-full h-[calc(80vh-65px)] overflow-auto bg-slate-50 flex items-center justify-center">
              <iframe
                src={employee.contractUrl}
                className="w-full h-full border-none"
                title="Contract PDF"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}