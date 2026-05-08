// ============================================================
// FILE: src/lib/payroll/helpers.ts
// ============================================================
// Core salary calculation logic. Pure functions — no database calls.
// This is the "brain" of your payroll system.

import type {
  SalaryCalculationInput,
  SalaryCalculationResult,
  TaxSlabConfig,
  TaxSlabBreakdown,
} from "./types";

// ─── Currency Formatter ───────────────────────────────────────────
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return "NPR 0.00";
  return `NPR ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Monthly Tax Calculation (Nepal Slab-Based) ───────────────────
//
// How Nepal income tax works:
//   - Tax slabs are defined as ANNUAL income bands.
//   - We calculate monthly taxable income, annualize it, apply slabs, then divide by 12.
//   - SSF contributions reduce taxable income (they are pre-tax deductions).
//
// Nepal FY 2080/81 standard slabs (these are seeded in DB, configurable):
//   0 - 500,000     → 1%
//   500,001 - 700,000  → 10%
//   700,001 - 1,000,000 → 20%
//   1,000,001 - 2,000,000 → 30%
//   2,000,001+     → 36%

export function calculateTax(
  annualTaxableIncome: number,
  taxSlabs: TaxSlabConfig[]
): { totalTax: number; breakdown: TaxSlabBreakdown[] } {
  const breakdown: TaxSlabBreakdown[] = [];
  let totalTax = 0;
  let remaining = annualTaxableIncome;

  // Sort slabs by minIncome ascending
  const sorted = [...taxSlabs].sort((a, b) => a.minIncome - b.minIncome);

  for (const slab of sorted) {
    if (remaining <= 0) break;

    const slabMin = slab.minIncome;
    const slabMax = slab.maxIncome ?? Infinity;
    const slabWidth = slabMax - slabMin;

    // How much of the income falls in this slab
    const taxableInSlab = Math.min(remaining, slabWidth);
    if (taxableInSlab <= 0) {
      // This slab starts above the income — skip
      if (annualTaxableIncome <= slabMin) break;
      continue;
    }

    const taxForSlab = (taxableInSlab * slab.taxRate) / 100 - slab.reliefAmount;
    const actualTax = Math.max(0, taxForSlab); // tax can't be negative

    breakdown.push({
      slab: `${formatCurrency(slabMin)} - ${slab.maxIncome ? formatCurrency(slab.maxIncome) : "Above"}`,
      taxableAmount: taxableInSlab,
      rate: slab.taxRate,
      tax: actualTax,
    });

    totalTax += actualTax;
    remaining -= taxableInSlab;
  }

  return { totalTax: Math.max(0, totalTax), breakdown };
}

// ─── Main Salary Calculator ───────────────────────────────────────
export function calculateSalary(input: SalaryCalculationInput): SalaryCalculationResult {
  const {
    basicSalary,
    allowances,
    ssfEmployeeRate,
    ssfEmployerRate,
    taxSlabs,
    leaveDeductionDays = 0,
    workingDaysInMonth = 26, // Nepal standard working days
    manualDeductions = 0,
  } = input;

  // 1. Gross Salary = Basic + All Allowances
  const totalAllowances = Object.values(allowances).reduce((sum, v) => sum + (v || 0), 0);
  const grossSalary = basicSalary + totalAllowances;

  // 2. SSF (Social Security Fund)
  //    Employee pays 11% of basic salary (NOT gross — Nepal SSF is on basic)
  //    Employer pays 20% of basic salary
  const ssfEmployee = (basicSalary * ssfEmployeeRate) / 100;
  const ssfEmployer = (basicSalary * ssfEmployerRate) / 100;

  // 3. Leave Deduction (per-day-salary × absent days)
  //    Daily rate = Gross / working days in month
  const dailyRate = grossSalary / workingDaysInMonth;
  const leaveDeduction = dailyRate * leaveDeductionDays;

  // 4. Taxable Income = Gross - SSF Employee contribution
  //    (SSF is pre-tax deductible in Nepal)
  const monthlyTaxableIncome = grossSalary - ssfEmployee;

  // 5. Annual taxable income → apply slabs → monthly tax
  const annualTaxableIncome = monthlyTaxableIncome * 12;
  const { totalTax: annualTax, breakdown: taxBreakdown } = calculateTax(annualTaxableIncome, taxSlabs);
  const incomeTax = annualTax / 12;

  // 6. Total Deductions
  const totalDeductions = ssfEmployee + incomeTax + leaveDeduction + manualDeductions;

  // 7. Net Salary
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    allowances,
    grossSalary,
    ssfEmployee,
    ssfEmployer,
    taxableIncome: monthlyTaxableIncome,
    incomeTax,
    leaveDeduction,
    manualDeductions,
    totalDeductions,
    netSalary: Math.max(0, netSalary),
    taxBreakdown,
  };
}

// ─── Get Leave Days For Employee in a Payroll Month ──────────────
// Use this to count UNPAID leave days from your LeaveRequest table.
// Only count approved leaves for the specific month/year.
export function countUnpaidLeaveDays(
  leaveRequests: Array<{
    startDate: Date;
    endDate: Date;
    status: string;
    leaveType?: string;
  }>,
  month: number, // 1-12
  year: number
): number {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0); // last day of month

  let totalDays = 0;

  for (const leave of leaveRequests) {
    if (leave.status !== "APPROVED") continue;

    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);

    // Find overlap with this month
    const overlapStart = leaveStart < monthStart ? monthStart : leaveStart;
    const overlapEnd = leaveEnd > monthEnd ? monthEnd : leaveEnd;

    if (overlapStart <= overlapEnd) {
      const days =
        Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDays += days;
    }
  }

  return totalDays;
}

// ─── Nepal Default Tax Slabs (Fiscal Year 2080/81) ───────────────
// Seed these into your TaxSlab table. They're configurable in the DB.
export const NEPAL_DEFAULT_TAX_SLABS: Omit<
  TaxSlabConfig,
  "id" | "organizationId" | "effectiveFromDate"
>[] = [
  { minIncome: 0, maxIncome: 500000, taxRate: 1, reliefAmount: 0 },
  { minIncome: 500000, maxIncome: 700000, taxRate: 10, reliefAmount: 0 },
  { minIncome: 700000, maxIncome: 1000000, taxRate: 20, reliefAmount: 0 },
  { minIncome: 1000000, maxIncome: 2000000, taxRate: 30, reliefAmount: 0 },
  { minIncome: 2000000, maxIncome: null, taxRate: 36, reliefAmount: 0 },
];