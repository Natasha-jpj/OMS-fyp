"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, History, DollarSign, Calendar, TrendingUp } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email?: string;
  position?: string;
  department?: { id: string; name: string };
  salary?: number;
}

interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  ssfEmployee: number;
  ssfEmployer: number;
  incomeTax: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
}

interface SalaryStructure {
  id: string;
  basicSalary: number;
  allowances: Record<string, number>;
  effectiveFromDate: string;
}

interface Props {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onRefreshEmployees?: () => void;
}

function fmt(n: number | string | null | undefined): string {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return `NPR ${(isNaN(num) ? 0 : num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PayrollEmployeeModal({
  employee,
  isOpen,
  onClose,
  organizationId,
  onRefreshEmployees,
}: Props) {
  const [activeTab, setActiveTab] = useState<"payroll" | "history">("payroll");
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    basicSalary: "",
    hra: "",
    dearness: "",
    transport: "",
    medical: "",
    effectiveFromDate: new Date().toISOString().split("T")[0],
  });

  // Fetch salary structure on mount or employee change
  useEffect(() => {
    console.log('PayrollEmployeeModal: isOpen=', isOpen, 'employee=', employee?.id);
    if (!isOpen || !employee) return;

    const fetchSalaryStructure = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/payroll/salary-structure/${employee.id}?organizationId=${organizationId}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          const salary = data.data;
          setSalaryStructure(salary);
          setForm({
            basicSalary: salary.basicSalary?.toString() || "",
            hra: salary.allowances?.hra?.toString() || "",
            dearness: salary.allowances?.dearness?.toString() || "",
            transport: salary.allowances?.transport?.toString() || "",
            medical: salary.allowances?.medical?.toString() || "",
            effectiveFromDate: salary.effectiveFromDate
              ? new Date(salary.effectiveFromDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
        }
      } catch (err) {
        console.error("Failed to fetch salary structure:", err);
        setMessage("❌ Failed to load salary structure.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryStructure();
  }, [isOpen, employee, organizationId]);

  // Fetch payroll history when History tab is clicked
  useEffect(() => {
    if (!isOpen || !employee || activeTab !== "history") return;

    const fetchPayrollRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/payroll/employee/${employee.id}/records?organizationId=${organizationId}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          setPayrollRecords(data.records);
        }
      } catch (err) {
        console.error("Failed to fetch payroll records:", err);
        setMessage("❌ Failed to load payroll history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollRecords();
  }, [isOpen, employee, activeTab, organizationId]);

  const handleSave = async () => {
    if (!employee || !form.basicSalary) {
      setMessage("❌ Please enter basic salary.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const allowances: Record<string, number> = {};
      if (form.hra) allowances.hra = parseFloat(form.hra);
      if (form.dearness) allowances.dearness = parseFloat(form.dearness);
      if (form.transport) allowances.transport = parseFloat(form.transport);
      if (form.medical) allowances.medical = parseFloat(form.medical);

      const res = await fetch(`/api/payroll/salary-structure/${employee.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          basicSalary: parseFloat(form.basicSalary),
          allowances,
          effectiveFromDate: form.effectiveFromDate,
          department: employee.department?.name,
        }),
      });

      const data = await res.json();
      setMessage(data.success ? "✅ Salary structure updated!" : `❌ ${data.error}`);

      if (data.success) {
        onRefreshEmployees?.();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
      }}
      className="backdrop-blur-sm"
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '56rem',
          height: '75vh',
          pointerEvents: 'auto',
        }}
        className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{employee.name}</h2>
            <p className="text-sm text-slate-500">
              {employee.position} · {employee.department?.name || "No dept"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 bg-slate-50 px-6 py-2">
          <button
            onClick={() => setActiveTab("payroll")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "payroll"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <DollarSign size={15} />
            Payroll
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History size={15} />
            History
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Payroll Tab */}
          {activeTab === "payroll" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading salary structure...</div>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Basic Salary (NPR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={form.basicSalary}
                      onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      SSF: 11% employee, 20% employer
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "hra", label: "HRA (House Rent)" },
                      { key: "dearness", label: "Dearness Allowance" },
                      { key: "transport", label: "Transport Allowance" },
                      { key: "medical", label: "Medical Allowance" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          {label}
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Effective From
                    </label>
                    <input
                      type="date"
                      value={form.effectiveFromDate}
                      onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Quick Preview */}
                  {form.basicSalary && (
                    <div className="rounded-lg bg-slate-50 p-4 text-sm">
                      <p className="mb-2 font-semibold text-slate-700">Quick Preview</p>
                      {(() => {
                        const basic = parseFloat(form.basicSalary) || 0;
                        const allowanceTotal =
                          [form.hra, form.dearness, form.transport, form.medical]
                            .map((v) => parseFloat(v) || 0)
                            .reduce((a, b) => a + b, 0);
                        const gross = basic + allowanceTotal;
                        const ssfEE = basic * 0.11;
                        const ssfER = basic * 0.2;
                        return (
                          <div className="space-y-1 text-slate-600 text-xs">
                            <div className="flex justify-between">
                              <span>Gross Salary</span>
                              <span className="font-medium">{fmt(gross)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Employee SSF (11%)</span>
                              <span>- {fmt(ssfEE)}</span>
                            </div>
                            <div className="flex justify-between text-amber-700">
                              <span>Employer SSF (20%)</span>
                              <span>{fmt(ssfER)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {message && (
                    <p
                      className={`text-sm font-medium ${
                        message.startsWith("✅") ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading payroll history...</div>
              ) : payrollRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No payroll records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-left font-semibold text-slate-700">
                      <tr>
                        <th className="px-3 py-2">Month/Year</th>
                        <th className="px-3 py-2">Gross</th>
                        <th className="px-3 py-2">SSF (EE)</th>
                        <th className="px-3 py-2">Tax</th>
                        <th className="px-3 py-2">Deductions</th>
                        <th className="px-3 py-2">Net</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRecords.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2">
                            {record.month}/{record.year}
                          </td>
                          <td className="px-3 py-2 font-medium">{fmt(record.grossSalary)}</td>
                          <td className="px-3 py-2 text-red-600">{fmt(record.ssfEmployee)}</td>
                          <td className="px-3 py-2 text-amber-600">{fmt(record.incomeTax)}</td>
                          <td className="px-3 py-2 text-slate-600">{fmt(record.totalDeductions)}</td>
                          <td className="px-3 py-2 font-bold text-emerald-600">
                            {fmt(record.netSalary)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                record.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : record.status === "CALCULATED"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex gap-2 justify-end">
          {activeTab === "payroll" && (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
          {activeTab === "history" && (
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
