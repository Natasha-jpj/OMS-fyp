"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  salary?: number;
  department?: { id: string; name: string };
  lastAudit?: string;
  joinDate?: string | Date;
  contractEndDate?: string | Date;
  contractType?: string;
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
                <MetricCard label="Tenure" value={`${yearsInCompany} years`} />
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
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-[13px] font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Edit details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}