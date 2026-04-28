"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Briefcase,
  Building2,
  Mail,
  FileText,
  Clock,
  ShieldCheck,
  Upload,
  Loader,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  salary?: number;
  phone?: string;
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
      <div className="flex items-center justify-between py-2.5">
        <span className="text-[13px] text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          {badge}
          <span className="text-[13px] text-slate-900 font-medium text-right">
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
    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
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
      <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<any>({});

  // Sync form data when employee changes
  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        departmentId: employee.department?.id || "",
        salary: employee.salary || "",
        contractType: employee.contractType || "Full-time",
        contractEndDate: employee.contractEndDate ? new Date(employee.contractEndDate).toISOString().split("T")[0] : "",
        employmentStatus: employee.employmentStatus || "Active",
      });
    }
  }, [employee, isOpen]);
  const parsedJoinDate = useMemo(
    () => employee?.joinDate ? new Date(employee.joinDate) : new Date(2022, 0, 15),
    [employee?.joinDate]
  );
  const parsedContractEndDate = useMemo(
    () => employee?.contractEndDate ? new Date(employee.contractEndDate) : new Date(2025, 11, 31),
    [employee?.contractEndDate]
  );

  const { daysInCompany, yearsInCompany } = useMemo(() => {
    const days = Math.floor(
      (Date.now() - parsedJoinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = (days / 365).toFixed(1);
    return { daysInCompany: days, yearsInCompany: years };
  }, [parsedJoinDate]);

  const handleSave = async () => {
    if (!employee) return;
    setLoading(true);
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
        // Optionally refresh data
      } else {
        alert("Failed to update employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating employee");
    } finally {
      setLoading(false);
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
        setFormData(prev => ({ ...prev, contractUrl: data.contractUrl }));
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

  if (!employee) return null;

  const roleBadgeStyles: Record<string, string> = {
    ADMIN: "bg-slate-900 text-white",
    MANAGER: "bg-blue-50 text-blue-600",
    EMPLOYEE: "bg-slate-100 text-slate-600",
  };

  const roleKey = (employee.role || "EMPLOYEE").toUpperCase();
  const badgeClass =
    roleBadgeStyles[roleKey] || "bg-slate-100 text-slate-600";

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
            className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[15px] font-semibold text-slate-900">
                Employee details
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col sm:flex-row max-h-[78vh] overflow-hidden">
              {/* Sidebar */}
              <div className="sm:w-52 flex-shrink-0 flex flex-col items-center gap-3 px-5 py-6 bg-white border-b sm:border-b-0 sm:border-r border-slate-100">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-semibold text-blue-500 select-none">
                  {employee.name.charAt(0)}
                </div>

                {/* Name + position */}
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-900 leading-tight">
                    {employee.name}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {employee.position || employee.role || "Staff member"}
                  </p>
                </div>

                {/* Role badge */}
                <span
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide ${badgeClass}`}
                >
                  {employee.role || "Employee"}
                </span>

                <div className="w-full border-t border-slate-200 my-1" />

                {/* Metric cards */}
                {employee.salary && (
                  <MetricCard
                    label="Monthly salary"
                    value={`Rs. ${employee.salary.toLocaleString()}`}
                  />
                )}
                <MetricCard label="Days in company" value={daysInCompany.toLocaleString()} />
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {!isEditing ? (
                  <>
                    {/* View mode */}
                    {/* Basic information */}
                    <section>
                      <SectionLabel>Basic information</SectionLabel>
                      <div>
                        {employee.email && (
                          <InfoRow
                            label="Email"
                            value={employee.email}
                          />
                        )}
                        {employee.phone && (
                          <InfoRow
                            label="Phone"
                            value={employee.phone}
                          />
                        )}
                        {employee.department && (
                          <InfoRow
                            label="Department"
                            value={employee.department.name}
                          />
                        )}
                        <InfoRow
                          label="Position"
                          value={
                            employee.position || employee.role || "Staff member"
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

                    {/* Employment */}
                    <section>
                      <SectionLabel>Employment</SectionLabel>
                      <div>
                        <InfoRow
                          label="Join date"
                          value={parsedJoinDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        />
                        <InfoRow
                          label="Employment Status"
                          value={employee.employmentStatus || "Active"}
                        />
                        <InfoRow
                          label="Contract type"
                          value={employee.contractType || "Full-time permanent"}
                        />
                        <InfoRow
                          label="Contract end"
                          value={parsedContractEndDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          badge={
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              Active
                            </span>
                          }
                        />
                        {employee.contractUrl && (
                          <InfoRow
                            label="Contract"
                            value={
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewingPdf(true)}
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <FileText size={13} /> View PDF
                                </button>
                              </div>
                            }
                          />
                        )}
                        {employee.lastAudit && (
                          <InfoRow
                            label="Last audit"
                            value={new Date(employee.lastAudit).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          />
                        )}
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    {/* Edit mode */}
                    <section>
                      <SectionLabel>Basic Information</SectionLabel>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Position</label>
                          <input
                            type="text"
                            value={formData.position}
                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Salary (Rs.)</label>
                          <input
                            type="number"
                            value={formData.salary}
                            onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </section>

                    <section>
                      <SectionLabel>Employment Details</SectionLabel>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Employment Status</label>
                          <select
                            value={formData.employmentStatus}
                            onChange={e => setFormData({ ...formData, employmentStatus: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Terminated">Terminated</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Contract Type</label>
                          <select
                            value={formData.contractType}
                            onChange={e => setFormData({ ...formData, contractType: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Intern">Intern</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Contract End Date</label>
                          <input
                            type="date"
                            value={formData.contractEndDate}
                            onChange={e => setFormData({ ...formData, contractEndDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white border-slate-300 text-black focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </section>

                    <section>
                      <SectionLabel>Contract Document</SectionLabel>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload size={20} className="text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">
                            {uploadingContract ? "Uploading..." : "Upload PDF Contract"}
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
                          <div className="mt-3 p-2 bg-emerald-50 rounded-lg flex items-center justify-between">
                            <span className="text-xs text-emerald-700">✓ Contract uploaded</span>
                            <a href={formData.contractUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
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
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white">
              {!isEditing ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    Edit details
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader size={13} className="animate-spin" />}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && employee?.contractUrl && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingPdf(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <span className="text-[15px] font-semibold text-slate-900">
                {employee.name}'s Contract
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={employee.contractUrl}
                  download={`${employee.name}-contract.pdf`}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <FileText size={13} /> Download
                </a>
                <button
                  onClick={() => setViewingPdf(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="w-full h-[calc(80vh-65px)] overflow-auto bg-slate-100 flex items-center justify-center">
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