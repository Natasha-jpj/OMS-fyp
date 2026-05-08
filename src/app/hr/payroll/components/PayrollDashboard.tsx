"use client";

// ============================================================
// FILE: src/components/payroll/PayrollDashboard.tsx
// ============================================================
//
// Full-featured Payroll Dashboard with:
//   - Overview tab: payroll run cards with process/finalize actions
//   - Records tab: detailed per-employee salary table for a run
//   - Setup tab: assign salary structures to employees
//   - Settings tab: configure SSF rates, tax slabs

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  Lock,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface PayrollRun {
  id: string;
  organizationId: string;
  month: number;
  year: number;
  status: "DRAFT" | "CALCULATED" | "FINALIZED" | "PAID" | "CANCELLED";
  locked: boolean;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalSSFEmployee: number;
  totalSSFEmployer: number;
  totalTax: number;
  notes?: string;
  processedAt?: string;
  finalizedAt?: string;
  finalizedBy?: string;
  createdAt: string;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  basicSalary: number;
  allowances: Record<string, number>;
  grossSalary: number;
  ssfEmployee: number;
  ssfEmployer: number;
  incomeTax: number;
  leaveDeduction: number;
  manualDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  notes?: string;
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
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "records" | "setup" | "settings">("overview");
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch Payroll Runs ──────────────────────────────────────
  const fetchPayrollRuns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payroll/runs?organizationId=${organizationId}`);
      const data = await res.json();
      setPayrollRuns(data.data || []);
    } catch (e) {
      console.error("Failed to fetch payroll runs:", e);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchPayrollRuns();
  }, [fetchPayrollRuns]);

  // ── Fetch Records for a Run ─────────────────────────────────
  const fetchRecords = async (runId: string) => {
    setRecordsLoading(true);
    try {
      const res = await fetch(
        `/api/payroll/runs/${runId}/records?organizationId=${organizationId}`
      );
      const data = await res.json();
      setRecords(data.data || []);
    } catch (e) {
      console.error("Failed to fetch records:", e);
    } finally {
      setRecordsLoading(false);
    }
  };

  // ── View Details (switch to records tab) ───────────────────
  const handleViewDetails = (run: PayrollRun) => {
    setSelectedRun(run);
    setActiveTab("records");
    fetchRecords(run.id);
  };

  // ── Process Payroll ─────────────────────────────────────────
  const handleProcess = async (runId: string) => {
    if (!confirm("Process payroll for all employees? This will calculate salaries.")) return;
    setProcessing(runId);
    try {
      const res = await fetch(`/api/payroll/runs/${runId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayrollRuns();
        alert(
          `✅ Payroll processed!\n${data.data.processed} employees calculated.\n${data.data.skipped > 0 ? `⚠️ ${data.data.skipped} skipped (no salary structure):\n${data.data.skippedEmployees?.join("\n")}` : ""}`
        );
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      alert("Failed to process payroll. Check console.");
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  // ── Finalize Payroll ────────────────────────────────────────
  const handleFinalize = async (runId: string) => {
    if (
      !confirm(
        "Finalize and LOCK this payroll run?\n\nThis action cannot be undone. All records will be marked as verified."
      )
    )
      return;

    try {
      const res = await fetch(`/api/payroll/runs/${runId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverNotes: "Approved by HR" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayrollRuns();
        alert("✅ Payroll finalized and locked!");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      alert("Failed to finalize payroll.");
      console.error(e);
    }
  };

  // ── Create New Payroll Run ──────────────────────────────────
  const handleCreateRun = async () => {
    const now = new Date();
    const month = parseInt(prompt("Enter month (1-12):", String(now.getMonth() + 1)) || "0");
    const year = parseInt(prompt("Enter year:", String(now.getFullYear())) || "0");

    if (!month || !year || month < 1 || month > 12) {
      alert("Invalid month or year.");
      return;
    }

    try {
      const res = await fetch("/api/payroll/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, month, year }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayrollRuns();
        alert("✅ New payroll run created!");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      alert("Failed to create payroll run.");
    }
  };

  // ── Summary Stats ───────────────────────────────────────────
  const totalGross = payrollRuns.reduce((s, r) => s + (Number(r.totalGrossSalary) || 0), 0);
  const totalNet = payrollRuns.reduce((s, r) => s + (Number(r.totalNetSalary) || 0), 0);
  const pendingRuns = payrollRuns.filter((r) => r.status === "DRAFT").length;
  const finalizedRuns = payrollRuns.filter((r) => r.status === "FINALIZED" || r.status === "PAID").length;

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "records", label: "Payroll Records", icon: Users },
    { id: "setup", label: "Salary Setup", icon: Settings },
    { id: "settings", label: "Configuration", icon: Settings },
  ] as const;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-blue-600" size={32} />
            Payroll Management
          </h1>
          <p className="text-gray-500 mt-1">Nepal Payroll System · SSF + Income Tax Compliant</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPayrollRuns}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handleCreateRun}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> New Payroll Run
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, color: "blue", label: "Total Gross", value: fmt(totalGross) },
          { icon: DollarSign, color: "green", label: "Total Net", value: fmt(totalNet) },
          { icon: CheckCircle, color: "indigo", label: "Finalized", value: String(finalizedRuns) },
          { icon: Clock, color: "orange", label: "Pending", value: String(pendingRuns) },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${color}-50`}>
                <Icon className={`text-${color}-600`} size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* ── Tab Content ── */}
      {loading ? (
        <LoadingState />
      ) : activeTab === "overview" ? (
        <OverviewTab
          payrollRuns={payrollRuns}
          processing={processing}
          onProcess={handleProcess}
          onFinalize={handleFinalize}
          onViewDetails={handleViewDetails}
          onCreate={handleCreateRun}
        />
      ) : activeTab === "records" ? (
        <RecordsTab
          payrollRuns={payrollRuns}
          selectedRun={selectedRun}
          records={records}
          recordsLoading={recordsLoading}
          onSelectRun={(run) => {
            setSelectedRun(run);
            fetchRecords(run.id);
          }}
        />
      ) : activeTab === "setup" ? (
        <SalarySetupTab organizationId={organizationId} searchQuery={searchQuery} />
      ) : (
        <ConfigurationTab organizationId={organizationId} />
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────

function OverviewTab({
  payrollRuns,
  processing,
  onProcess,
  onFinalize,
  onViewDetails,
  onCreate,
}: {
  payrollRuns: PayrollRun[];
  processing: string | null;
  onProcess: (id: string) => void;
  onFinalize: (id: string) => void;
  onViewDetails: (run: PayrollRun) => void;
  onCreate: () => void;
}) {
  if (payrollRuns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
        <AlertCircle className="mx-auto text-gray-300 mb-4" size={56} />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Payroll Runs</h3>
        <p className="text-gray-500 mb-6">Create your first payroll run to get started.</p>
        <button
          onClick={onCreate}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Create Payroll Run
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payrollRuns.map((run) => (
        <PayrollRunCard
          key={run.id}
          run={run}
          isProcessing={processing === run.id}
          onProcess={onProcess}
          onFinalize={onFinalize}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

// ─── Payroll Run Card ─────────────────────────────────────────

function PayrollRunCard({
  run,
  isProcessing,
  onProcess,
  onFinalize,
  onViewDetails,
}: {
  run: PayrollRun;
  isProcessing: boolean;
  onProcess: (id: string) => void;
  onFinalize: (id: string) => void;
  onViewDetails: (run: PayrollRun) => void;
}) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CALCULATED: "bg-purple-100 text-purple-800 border-purple-200",
    FINALIZED: "bg-blue-100 text-blue-800 border-blue-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  const monthName = new Date(0, run.month - 1).toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {monthName} {run.year}
          </h3>
          <div className="flex gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[run.status] || "bg-gray-100 text-gray-800"}`}
            >
              {run.status}
            </span>
            {run.locked && (
              <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                <Lock size={11} /> Locked
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Created {new Date(run.createdAt).toLocaleDateString()}</p>
          {run.processedAt && <p>Processed {new Date(run.processedAt).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 p-4 bg-gray-50 rounded-lg">
        {[
          { label: "Gross Salary", value: run.totalGrossSalary },
          { label: "SSF Employee", value: run.totalSSFEmployee },
          { label: "SSF Employer", value: run.totalSSFEmployer },
          { label: "Income Tax", value: run.totalTax },
          { label: "Net Salary", value: run.totalNetSalary, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`font-bold text-sm mt-1 ${highlight ? "text-green-600 text-base" : "text-gray-900"}`}>
              NPR {Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {run.status === "DRAFT" && (
          <button
            onClick={() => onProcess(run.id)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><RefreshCw size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><RefreshCw size={16} /> Process Payroll</>
            )}
          </button>
        )}
        {run.status === "CALCULATED" && (
          <>
            <button
              onClick={() => onViewDetails(run)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye size={16} /> Review
            </button>
            <button
              onClick={() => onFinalize(run.id)}
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Finalize & Lock
            </button>
          </>
        )}
        {(run.status === "FINALIZED" || run.status === "PAID") && (
          <button
            onClick={() => onViewDetails(run)}
            className="flex-1 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Eye size={16} /> View Payslips
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Records Tab ──────────────────────────────────────────────

function RecordsTab({
  payrollRuns,
  selectedRun,
  records,
  recordsLoading,
  onSelectRun,
}: {
  payrollRuns: PayrollRun[];
  selectedRun: PayrollRun | null;
  records: PayrollRecord[];
  recordsLoading: boolean;
  onSelectRun: (run: PayrollRun) => void;
}) {
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Run Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Payroll Run:</label>
        <div className="flex flex-wrap gap-2">
          {payrollRuns.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedRun?.id === run.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {new Date(0, run.month - 1).toLocaleDateString("en-US", { month: "short" })} {run.year}{" "}
              <span className="text-xs opacity-70">({run.status})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      {recordsLoading ? (
        <LoadingState />
      ) : !selectedRun ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          Select a payroll run above to view records
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No records found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Process the payroll run first to generate employee records.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {new Date(0, selectedRun.month - 1).toLocaleDateString("en-US", { month: "long" })}{" "}
              {selectedRun.year} — {records.length} Employees
            </h3>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              Click any row to expand
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Employee", "Department", "Gross", "SSF (EE)", "Tax", "Deductions", "Net Pay", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <React.Fragment key={rec.id}>
                    <tr
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                      onClick={() =>
                        setExpandedRecord(expandedRecord === rec.id ? null : rec.id)
                      }
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{rec.employeeName}</div>
                        <div className="text-xs text-gray-400">{rec.position}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{rec.department}</td>
                      <td className="py-3 px-4 font-medium">NPR {Number(rec.grossSalary).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-red-600">NPR {Number(rec.ssfEmployee).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-red-600">NPR {Number(rec.incomeTax).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-red-600">NPR {Number(rec.totalDeductions).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-bold text-green-700">
                        NPR {Number(rec.netSalary).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                    {expandedRecord === rec.id && (
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={8} className="px-6 py-4">
                          <EmployeeRecordDetail record={rec} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Employee Record Detail (Expandable) ──────────────────────

function EmployeeRecordDetail({ record }: { record: PayrollRecord }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div>
        <h4 className="text-xs font-bold text-blue-700 uppercase mb-3">Earnings</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Basic Salary</span>
            <span className="font-medium">NPR {Number(record.basicSalary).toLocaleString("en-IN")}</span>
          </div>
          {record.allowances && Object.entries(record.allowances).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-gray-600">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
              <span className="font-medium">NPR {Number(v).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Gross Salary</span>
            <span>NPR {Number(record.grossSalary).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-red-600 uppercase mb-3">Deductions</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">SSF (Employee 11%)</span>
            <span className="font-medium text-red-600">- NPR {Number(record.ssfEmployee).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Income Tax</span>
            <span className="font-medium text-red-600">- NPR {Number(record.incomeTax).toLocaleString("en-IN")}</span>
          </div>
          {Number(record.leaveDeduction) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Leave Deduction</span>
              <span className="font-medium text-red-600">- NPR {Number(record.leaveDeduction).toLocaleString("en-IN")}</span>
            </div>
          )}
          {Number(record.manualDeductions) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Other Deductions</span>
              <span className="font-medium text-red-600">- NPR {Number(record.manualDeductions).toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-bold text-red-600">
            <span>Total Deductions</span>
            <span>NPR {Number(record.totalDeductions).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-green-700 uppercase mb-3">Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between font-bold text-green-700 text-lg">
            <span>Net Pay</span>
            <span>NPR {Number(record.netSalary).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Employer SSF (20%)</span>
            <span>NPR {Number(record.ssfEmployer).toLocaleString("en-IN")}</span>
          </div>
          {record.notes && (
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded mt-2">
              ⚠️ {record.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Salary Setup Tab ─────────────────────────────────────────

function SalarySetupTab({ organizationId, searchQuery }: { organizationId: string; searchQuery: string }) {
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
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/hr/employees", {
          credentials: "include",
        });
        const data = await res.json();
        setEmployees(data.employees || data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [organizationId]);

  const filteredEmployees = employees.filter((emp) => {
    const haystack = [emp.name, emp.position, emp.department?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
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
    } catch (e) {
      setMessage("❌ Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Employee List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Employees</h3>
          <p className="text-xs text-gray-500 mt-1">Select an employee to set their salary structure</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No employees found.</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                  selectedEmployee?.id === emp.id ? "bg-blue-50 border-l-2 border-blue-600" : ""
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
                <div className="text-xs text-gray-500">
                  {emp.position} · {emp.department?.name || "No dept"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Salary Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">
          {selectedEmployee ? `Salary for ${selectedEmployee.name}` : "Salary Structure"}
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          {selectedEmployee
            ? "Set the basic salary and allowances below."
            : "Select an employee first."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Basic Salary (NPR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={form.basicSalary}
              onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              disabled={!selectedEmployee}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">SSF is calculated on basic salary (11% employee, 20% employer)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "hra", label: "HRA (House Rent)" },
              { key: "dearness", label: "Dearness Allowance" },
              { key: "transport", label: "Transport Allowance" },
              { key: "medical", label: "Medical Allowance" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  disabled={!selectedEmployee}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Effective From</label>
            <input
              type="date"
              value={form.effectiveFromDate}
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              disabled={!selectedEmployee}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* Preview */}
          {form.basicSalary && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Quick Preview</p>
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
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Gross Salary</span>
                      <span className="font-medium">NPR {gross.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Employee SSF (11%)</span>
                      <span>- NPR {ssfEE.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Employer SSF (20%)</span>
                      <span>NPR {ssfER.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Tax calculated during payroll run</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {message && (
            <p className={`text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!selectedEmployee || saving}
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? "Saving..." : "Save Salary Structure"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Configuration Tab ────────────────────────────────────────

function ConfigurationTab({ organizationId }: { organizationId: string }) {
  const [config, setConfig] = useState({ ssfEmployeeRate: 11, ssfEmployerRate: 20, minimumWage: 13500 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/payroll/configuration?organizationId=${organizationId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setConfig(d.data); });
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">SSF Configuration</h3>
        <p className="text-xs text-gray-500 mb-5">Social Security Fund rates (Nepal standard: 11% + 20%)</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "ssfEmployeeRate", label: "Employee SSF Rate (%)", hint: "Standard: 11%" },
            { key: "ssfEmployerRate", label: "Employer SSF Rate (%)", hint: "Standard: 20%" },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={config[key as keyof typeof config]}
                onChange={(e) => setConfig({ ...config, [key]: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Minimum Wage</h3>
        <p className="text-xs text-gray-500 mb-4">Nepal minimum wage (NPR). Used for validation.</p>
        <input
          type="number"
          value={config.minimumWage}
          onChange={(e) => setConfig({ ...config, minimumWage: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h4 className="font-bold text-amber-800 mb-2">⚡ Tax Slabs Setup</h4>
        <p className="text-sm text-amber-700 mb-3">
          To set up Nepal&apos;s tax slabs for the first time, call this API once:
        </p>
        <code className="block bg-amber-100 rounded p-3 text-xs text-amber-900 font-mono">
          POST /api/payroll/seed?organizationId={organizationId}
        </code>
        <p className="text-xs text-amber-600 mt-2">
          This seeds the standard Nepal FY 2080/81 tax slabs. You can edit them afterward via the tax-slabs API.
        </p>
      </div> */}

      {msg && <p className={`text-sm font-medium ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{msg}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="text-center py-16">
      <RefreshCw className="mx-auto text-blue-500 animate-spin mb-4" size={32} />
      <p className="text-gray-500">Loading payroll data...</p>
    </div>
  );
}