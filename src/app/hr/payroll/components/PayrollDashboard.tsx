"use client";

// ============================================================
// FILE: src/components/payroll/PayrollDashboard.tsx
// ============================================================
//
// Simplified Payroll Dashboard:
//   - Employees tab: list all employees, search, view details + payroll history
//   - Salary Setup tab: assign salary structures to employees
//   - Configuration tab: set SSF rates and minimum wage

import React, { useState, useEffect } from "react";
import {
  Users,
  Settings,
  Search,
  RefreshCw,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import PayrollEmployeeModal from "./PayrollEmployeeModal";

// ─── Types ───────────────────────────────────────────────────

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

// ─── Currency Formatter ───────────────────────────────────────
function fmt(n: number | string | null | undefined): string {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return `NPR ${(isNaN(num) ? 0 : num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Props ───────────────────────────────────────────────────
interface PayrollDashboardProps {
  organizationId: string;
}

// ─── Main Component ──────────────────────────────────────────
export default function PayrollDashboard({ organizationId }: PayrollDashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"employees" | "setup" | "settings">("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // ── Fetch Employees ─────────────────────────────────────────
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/employees", { credentials: "include" });
      const data = await res.json();
      setEmployees(data.employees || data.data || []);
    } catch (e) {
      console.error("Failed to fetch employees:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [organizationId]);

  // ── Filtered Employees ──────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    const haystack = [emp.name, emp.position, emp.department?.name, emp.email]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  // Statistics
  const totalEmployees = employees.length;
  const employeesWithSalary = employees.filter((e) => (e.salary ?? 0) > 0).length;
  const missingSalaryCount = totalEmployees - employeesWithSalary;

  const tabs = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "setup", label: "Salary Setup", icon: TrendingUp },
    { id: "settings", label: "Configuration", icon: Settings },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Modern Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Payroll Management
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Nepal Payroll System · SSF + Income Tax Compliant
            </p>
          </div>
          <button
            onClick={fetchEmployees}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

          {/* ── Summary Cards (Employees overview) ── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Employees</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalEmployees}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Salary Ready</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{employeesWithSalary}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Missing Salary</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{missingSalaryCount}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        {activeTab === "employees" && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
            />
          </div>
        )}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "employees" && (
        <EmployeesTab
          employees={filteredEmployees}
          loading={loading}
          onViewEmployee={(emp) => {
            console.log('PayrollDashboard: open employee', emp?.id);
            setSelectedEmployee(emp);
            setShowEmployeeModal(true);
          }}
        />
      )}

      {activeTab === "setup" && (
        <SalarySetupTab
          organizationId={organizationId}
          searchQuery={searchQuery}
          onRefreshEmployees={fetchEmployees}
        />
      )}
      {activeTab === "settings" && <ConfigurationTab organizationId={organizationId} />}

      {/* Payroll Employee Modal */}
      <PayrollEmployeeModal
        employee={selectedEmployee}
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        organizationId={organizationId}
        onRefreshEmployees={fetchEmployees}
      />
    </div>
  );
}

// ─── Employees Tab (clean table) ─────────────────────────────

function EmployeesTab({
  employees,
  loading,
  onViewEmployee,
}: {
  employees: Employee[];
  loading: boolean;
  onViewEmployee: (emp: Employee) => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Users size={48} className="text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No employees found</h3>
        <p className="text-sm text-slate-500">Try adjusting your search or refresh the list.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Position</th>
              <th className="px-5 py-3">Salary (Monthly)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50 cursor-pointer"
                onClick={() => onViewEmployee(emp)}
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{emp.name}</div>
                  <div className="text-xs text-slate-500">{emp.email || ""}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{emp.department?.name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{emp.position || emp.role || "—"}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{emp.salary ? fmt(emp.salary) : "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      emp.employmentStatus === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {emp.employmentStatus || "Active"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewEmployee(emp);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Salary Setup Tab (unchanged, from original) ─────────────

function SalarySetupTab({
  organizationId,
  searchQuery,
  onRefreshEmployees,
}: {
  organizationId: string;
  searchQuery: string;
  onRefreshEmployees?: () => void;
}) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [form, setForm] = useState({
    basicSalary: "",
    hra: "",
    dearness: "",
    transport: "",
    medical: "",
    effectiveFromDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Local fetch for salary-setup employees (keeps tab independent)
    const fetchSetupEmployees = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/hr/employees", { credentials: "include" });
        const data = await res.json();
        setEmployees(data.employees || data.data || []);
      } catch (err) {
        console.error("Failed to fetch employees for Salary Setup:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetupEmployees();
  }, [organizationId]);

  const filteredEmployees = employees.filter((emp) => {
    const haystack = [emp.name, emp.position, emp.department?.name].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  const handleSave = async () => {
    if (!selectedEmployee || !form.basicSalary) {
      setMessage("❌ Please select an employee and enter basic salary.");
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

      const res = await fetch(`/api/payroll/salary-structure/${selectedEmployee.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          basicSalary: parseFloat(form.basicSalary),
          allowances,
          effectiveFromDate: form.effectiveFromDate,
          department: selectedEmployee.department?.name,
        }),
      });
      const data = await res.json();
      setMessage(data.success ? "✅ Salary structure saved!" : `❌ ${data.error}`);
      if (data.success) {
        // Refresh employee list so UI reflects updated salary
        try {
          onRefreshEmployees && onRefreshEmployees();
        } catch (err) {
          // ignore
        }
        // Optionally clear selection or keep it selected
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Employee List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <h3 className="font-bold text-slate-900">Employees</h3>
          <p className="text-xs text-slate-500">Select an employee to set salary structure</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No employees found.</div>
        ) : (
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full px-5 py-3 text-left transition-colors hover:bg-slate-50 ${
                  selectedEmployee?.id === emp.id ? "border-l-4 border-slate-900 bg-slate-50" : ""
                }`}
              >
                <div className="font-medium text-slate-900">{emp.name}</div>
                <div className="text-xs text-slate-500">
                  {emp.position} · {emp.department?.name || "No dept"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Salary Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          {selectedEmployee ? `Salary for ${selectedEmployee.name}` : "Salary Structure"}
        </h3>
        <p className="mb-5 text-xs text-slate-500">
          {selectedEmployee ? "Set the basic salary and allowances below." : "Select an employee first."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Basic Salary (NPR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={form.basicSalary}
              onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              disabled={!selectedEmployee}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            />
            <p className="mt-1 text-xs text-slate-400">SSF is calculated on basic salary (11% employee, 20% employer)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "hra", label: "HRA (House Rent)" },
              { key: "dearness", label: "Dearness Allowance" },
              { key: "transport", label: "Transport Allowance" },
              { key: "medical", label: "Medical Allowance" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  disabled={!selectedEmployee}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Effective From</label>
            <input
              type="date"
              value={form.effectiveFromDate}
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              disabled={!selectedEmployee}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            />
          </div>

          {/* Preview */}
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
                  <div className="space-y-1 text-slate-600">
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
                    <div className="text-xs text-slate-400">Tax calculated during payroll run</div>
                  </div>
                );
              })()}
            </div>
          )}

          {message && (
            <p className={`text-sm font-medium ${message.startsWith("✅") ? "text-emerald-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!selectedEmployee || saving}
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Salary Structure"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Configuration Tab (unchanged) ───────────────────────────

function ConfigurationTab({ organizationId }: { organizationId: string }) {
  const [config, setConfig] = useState({ ssfEmployeeRate: 11, ssfEmployerRate: 20, minimumWage: 13500 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/payroll/configuration?organizationId=${organizationId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConfig(d.data);
      });
  }, [organizationId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/configuration?organizationId=${organizationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setMsg(data.success ? "✅ Configuration saved!" : `❌ ${data.error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">SSF Configuration</h3>
        <p className="mb-5 text-xs text-slate-500">Social Security Fund rates (Nepal standard: 11% + 20%)</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Employee SSF Rate (%)</label>
            <input
              type="number"
              value={config.ssfEmployeeRate}
              onChange={(e) => setConfig({ ...config, ssfEmployeeRate: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Standard: 11%</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Employer SSF Rate (%)</label>
            <input
              type="number"
              value={config.ssfEmployerRate}
              onChange={(e) => setConfig({ ...config, ssfEmployerRate: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Standard: 20%</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Minimum Wage</h3>
        <p className="mb-4 text-xs text-slate-500">Nepal minimum wage (NPR). Used for validation.</p>
        <input
          type="number"
          value={config.minimumWage}
          onChange={(e) => setConfig({ ...config, minimumWage: parseFloat(e.target.value) })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>

      {msg && <p className={`text-sm font-medium ${msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"}`}>{msg}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <RefreshCw className="mb-3 h-8 w-8 animate-spin text-slate-400" />
      <p className="text-sm text-slate-500">Loading employees...</p>
    </div>
  );
}