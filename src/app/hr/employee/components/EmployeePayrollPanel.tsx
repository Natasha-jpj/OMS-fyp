"use client";

import React, { useEffect, useState } from "react";

type PayrollRecord = {
  id: string;
  employeeId: string;
  grossSalary: number;
  netSalary: number;
  totalTax: number;
  totalSSFEmployee: number;
  payrollRun?: { month: number; year: number; id: string } | null;
  createdAt?: string;
};

export default function EmployeePayrollPanel({
  employeeId,
  organizationId,
}: {
  employeeId: string;
  organizationId?: string;
}) {
  const [records, setRecords] = useState<PayrollRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const q = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    fetch(`/api/payroll/employee/${employeeId}/records${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.success) {
          setError(data?.error || "Failed to load payroll records");
          setRecords([]);
        } else {
          setRecords(data.data || []);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Failed to fetch payroll records");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, organizationId]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(v || 0);

  if (loading) return <div className="text-sm text-slate-500">Loading payroll...</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;
  if (!records || records.length === 0)
    return <div className="text-sm text-slate-500">No payroll records found.</div>;

  return (
    <div className="space-y-2">
      {records.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 bg-white">
          <div>
            <div className="text-sm font-medium text-slate-900">{r.payrollRun ? `${r.payrollRun.month}/${r.payrollRun.year}` : new Date(r.createdAt || "").toLocaleDateString()}</div>
            <div className="text-xs text-slate-500">Payslip ID: {r.id}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Gross</div>
              <div className="text-sm font-semibold text-slate-900">{fmt(r.grossSalary)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Tax</div>
              <div className="text-sm font-semibold text-slate-900">{fmt(r.totalTax)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Net</div>
              <div className="text-sm font-semibold text-emerald-600">{fmt(r.netSalary)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
