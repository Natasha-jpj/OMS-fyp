"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Key, Users, Briefcase, Calendar, Phone, MapPin, Home, FileText, Upload, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

interface HireStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departments?: { id: string; name: string }[]; // optional for safety, but UI enforces selection when available
}

export function HireStaffModal({ isOpen, onClose, onSuccess, departments = [] }: HireStaffModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function clientAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.append("contract", selectedFile);
    }

    try {
      const response = await fetch("/api/hr/employees/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to hire employee");
      }

      // Show temp password if email not sent (dev mode)
      if (data.tempPassword) {
        alert(`Personnel successfully onboarded!\nID: ${data.newEmployee?.id || data.id}\nTemp Password: ${data.tempPassword}`);
      } else {
        alert(`Personnel successfully onboarded! ID: ${data.id || data.newEmployee?.id}`);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      if (file) alert("Please select a PDF file.");
    }
  };

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

          {/* Modal Container - Wider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-black">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Onboard personnel</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Add a new employee with full details & contract</p>
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
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row 1: Full name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Users size={14} /> Full legal name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Sabin Sharma"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Mail size={14} /> Corporate email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="sabin@auraflow.io"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Password + Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Key size={14} /> System access key *
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                  <p className="text-xs text-slate-500">Minimum 8 characters, include a number</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Briefcase size={14} /> Job position *
                  </label>
                  <input
                    name="position"
                    type="text"
                    placeholder="e.g. Senior Engineer"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Employee role + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <UserPlus size={14} /> Employee role *
                  </label>
                  <select
                    name="role"
                    defaultValue="EMPLOYEE"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Briefcase size={14} /> Department *
                  </label>
                  {departments.length === 0 ? (
                    <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                      No departments available. Create a department first.
                    </div>
                  ) : (
                    <select
                      name="departmentId"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 4: Phone + Join Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone size={14} /> Phone number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+977 9812345678"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} /> Join date *
                  </label>
                  <input
                    name="joinDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 5: Residential address + Emergency contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin size={14} /> Residential address
                  </label>
                  <input
                    name="address"
                    type="text"
                    placeholder="Street, city, postal code"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Home size={14} /> Emergency contact
                  </label>
                  <input
                    name="emergencyContact"
                    type="text"
                    placeholder="Name and phone number"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 6: Contract Type + Contract PDF Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Briefcase size={14} /> Contract type *
                  </label>
                  <select
                    name="contractType"
                    defaultValue="Full-time"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="Full-time">Full-time (Permanent)</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract (1 year)</option>
                    <option value="Intern">Internship (6 months)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText size={14} /> Employment contract (PDF)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {selectedFile ? "Change file" : "Upload PDF"}
                    </button>
                    <span className="text-sm text-slate-500">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                    <input
                      ref={fileInputRef}
                      name="contract"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Max 10MB, PDF only</p>
                </div>
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
                  disabled={isPending || departments.length === 0}
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-black rounded-lg text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? "Onboarding..." : "Complete onboarding"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}