// ============================================================
// FILE: src/lib/payroll/types.ts
// ============================================================
// All TypeScript types used across the payroll system.
// Import these in your components and API routes.

export interface PayslipData {
  company: {
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
  };
  employee: {
    employeeId: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone?: string;
  };
  month: number;
  year: number;
  earnings: {
    basicSalary: number;
    allowances: Record<string, number>;
    grossSalary: number;
  };
  deductions: {
    ssfEmployee: number;
    incomeTax: number;
    leaveDeduction: number;
    manualDeduction: number;
    totalDeductions: number;
  };
  summary: {
    netSalary: number;
    employerSSF: number;
    totalCostToCompany: number;
  };
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
  };
  generatedAt: string;
}

export interface SalaryCalculationInput {
  basicSalary: number;
  allowances: Record<string, number>;
  ssfEmployeeRate: number; // e.g. 11 (percent)
  ssfEmployerRate: number; // e.g. 20 (percent)
  taxSlabs: TaxSlabConfig[];
  leaveDeductionDays?: number;
  workingDaysInMonth?: number;
  manualDeductions?: number;
}

export interface TaxSlabConfig {
  minIncome: number;
  maxIncome: number | null;
  taxRate: number; // percent
  reliefAmount: number;
}

export interface SalaryCalculationResult {
  basicSalary: number;
  allowances: Record<string, number>;
  grossSalary: number;
  ssfEmployee: number;
  ssfEmployer: number;
  taxableIncome: number;
  incomeTax: number;
  leaveDeduction: number;
  manualDeductions: number;
  totalDeductions: number;
  netSalary: number;
  taxBreakdown: TaxSlabBreakdown[];
}

export interface TaxSlabBreakdown {
  slab: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}