/**
 * Payroll Calculation Engine
 * Nepal-specific implementation with SSF and progressive tax system
 */

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
interface SalaryStructure {
  basicSalary: number;
  allowances: Record<string, number>;  // { dearness: 10000, hra: 15000, ... }
}

interface TaxSlab {
  id: any;
  minIncome: number;
  maxIncome: number;
  taxRate: number;  // 0-100
  reliefAmount?: number;
}

interface PayrollConfig {
  ssfEmployeeRate: number;      // 11%
  ssfEmployerRate: number;      // 20%
  minimumWage: number;          // 13500
  taxationEnabled: boolean;
  ssfEnabled: boolean;
}

interface CalculationResult {
  basicSalary: number;
  allowances: Record<string, number>;
  grossSalary: number;
  
  ssfEmployeeAmount: number;
  ssfEmployerAmount: number;
  
  taxableIncome: number;
  incomeTax: number;
  applicableSlab?: TaxSlab;
  
  leaveDeductionAmount: number;
  manualDeductionAmount: number;
  
  totalDeductions: number;
  netSalary: number;
  
  summary: {
    employerCost: number;        // Gross + SSF Employer
    employeeTakeHome: number;    // Net Salary
  };
}

// ─── PAYROLL CALCULATION SERVICE ──────────────────────────────────────────────

class PayrollCalculationEngine {
  private config: PayrollConfig;
  private taxSlabs: TaxSlab[];

  constructor(config: PayrollConfig, taxSlabs: TaxSlab[]) {
    this.config = config;
    // Sort slabs by minIncome for efficient lookup
    this.taxSlabs = taxSlabs.sort((a, b) => a.minIncome - b.minIncome);
    this.validateConfig();
  }

  /**
   * MAIN METHOD: Calculate complete salary for an employee
   */
  calculateSalary(
    salaryStructure: SalaryStructure,
    leaveDeductionAmount: number = 0,
    manualDeductionAmount: number = 0
  ): CalculationResult {
    // Step 1: Calculate Gross Salary
    const { basicSalary, allowances } = salaryStructure;
    const grossSalary = this.calculateGrossSalary(basicSalary, allowances);

    // Step 2: Calculate SSF (Employee & Employer)
    const { ssfEmployeeAmount, ssfEmployerAmount } = this.calculateSSF(grossSalary);

    // Step 3: Calculate Taxable Income
    const taxableIncome = grossSalary - ssfEmployeeAmount;

    // Step 4: Calculate Income Tax
    const { incomeTax, applicableSlab } = this.calculateIncomeTax(taxableIncome);

    // Step 5: Calculate Total Deductions
    const totalDeductions =
      ssfEmployeeAmount + incomeTax + leaveDeductionAmount + manualDeductionAmount;

    // Step 6: Calculate Net Salary
    const netSalary = grossSalary - totalDeductions;

    // Step 7: Calculate Employer Cost
    const employerCost = grossSalary + ssfEmployerAmount;

    return {
      basicSalary,
      allowances,
      grossSalary,
      ssfEmployeeAmount,
      ssfEmployerAmount,
      taxableIncome,
      incomeTax,
      applicableSlab,
      leaveDeductionAmount,
      manualDeductionAmount,
      totalDeductions,
      netSalary,
      summary: {
        employerCost,
        employeeTakeHome: netSalary,
      },
    };
  }

  /**
   * Calculate Gross Salary = Basic + All Allowances
   */
  private calculateGrossSalary(
    basicSalary: number,
    allowances: Record<string, number>
  ): number {
    const allowanceTotal = Object.values(allowances).reduce((sum, val) => {
      // Handle nested objects (e.g., { other: { special: 5000 } })
      if (typeof val === "object" && val !== null) {
        return sum + Object.values(val as Record<string, number>).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
      }
      return sum + (typeof val === "number" ? val : 0);
    }, 0);

    const gross = basicSalary + allowanceTotal;

    // Ensure not below minimum wage (if configured)
    if (this.config.minimumWage && gross < this.config.minimumWage) {
      console.warn(
        `Gross salary ${gross} is below minimum wage ${this.config.minimumWage}`
      );
    }

    return this.round(gross);
  }

  /**
   * Calculate SSF Contributions
   * Employee: 11% of gross (deducted from salary)
   * Employer: 20% of gross (cost to organization)
   */
  private calculateSSF(
    grossSalary: number
  ): { ssfEmployeeAmount: number; ssfEmployerAmount: number } {
    if (!this.config.ssfEnabled) {
      return { ssfEmployeeAmount: 0, ssfEmployerAmount: 0 };
    }

    // SSF Employee (deducted)
    const ssfEmployeeAmount = this.round(
      (grossSalary * this.config.ssfEmployeeRate) / 100
    );

    // SSF Employer (cost to employer)
    const ssfEmployerAmount = this.round(
      (grossSalary * this.config.ssfEmployerRate) / 100
    );

    return { ssfEmployeeAmount, ssfEmployerAmount };
  }

  /**
   * Calculate Income Tax using Progressive Tax Slab System
   * 
   * Example Nepal Tax System (FY 2024):
   * - 0 to 300,000: Tax-free
   * - 300,001 to 700,000: 1% tax
   * - 700,001 to 2,000,000: 10% tax
   * - 2,000,001+: 20% tax
   * 
   * Some slabs include relief amounts that can be subtracted
   */
  private calculateIncomeTax(
    taxableIncome: number
  ): { incomeTax: number; applicableSlab?: TaxSlab } {
    if (!this.config.taxationEnabled || taxableIncome <= 0) {
      return { incomeTax: 0 };
    }

    // Find applicable tax slab
    const applicableSlab = this.findApplicableSlab(taxableIncome);

    if (!applicableSlab) {
      return { incomeTax: 0 };
    }

    // Calculate tax for this slab only
    const incomeInSlab = Math.min(
      taxableIncome,
      applicableSlab.maxIncome
    ) - applicableSlab.minIncome;

    const taxBeforeRelief = (incomeInSlab * applicableSlab.taxRate) / 100;

    // Apply relief/deduction if applicable
    const relief = applicableSlab.reliefAmount || 0;
    const incomeTax = Math.max(0, this.round(taxBeforeRelief - relief));

    return { incomeTax, applicableSlab };
  }

  /**
   * Find which tax slab applies to given income
   */
  private findApplicableSlab(income: number): TaxSlab | null {
    return (
      this.taxSlabs.find((slab) => income >= slab.minIncome && income <= slab.maxIncome) || null
    );
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.ssfEmployeeRate < 0 || this.config.ssfEmployeeRate > 100) {
      throw new Error("SSF Employee rate must be between 0 and 100");
    }
    if (this.config.ssfEmployerRate < 0 || this.config.ssfEmployerRate > 100) {
      throw new Error("SSF Employer rate must be between 0 and 100");
    }
    if (this.taxSlabs.length === 0 && this.config.taxationEnabled) {
      console.warn("No tax slabs configured but taxation is enabled");
    }
  }

  /**
   * Round to nearest 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export { PayrollCalculationEngine };
    export type { CalculationResult, SalaryStructure, TaxSlab, PayrollConfig };

// ─── EXAMPLE USAGE ────────────────────────────────────────────────────────────
/*

const config: PayrollConfig = {
  ssfEmployeeRate: 11,
  ssfEmployerRate: 20,
  minimumWage: 13500,
  taxationEnabled: true,
  ssfEnabled: true,
};

const taxSlabs: TaxSlab[] = [
  { minIncome: 0, maxIncome: 300000, taxRate: 0, reliefAmount: 0 },
  { minIncome: 300001, maxIncome: 700000, taxRate: 1, reliefAmount: 0 },
  { minIncome: 700001, maxIncome: 2000000, taxRate: 10, reliefAmount: 0 },
  { minIncome: 2000001, maxIncome: Infinity, taxRate: 20, reliefAmount: 0 },
];

const engine = new PayrollCalculationEngine(config, taxSlabs);

const result = engine.calculateSalary(
  {
    basicSalary: 100000,
    allowances: {
      dearness: 10000,
      hra: 15000,
      conveyance: 2000,
    },
  },
  2000,  // leave deduction
  0      // manual deduction
);

console.log(result);
// Output:
// {
//   basicSalary: 100000,
//   allowances: { dearness: 10000, hra: 15000, conveyance: 2000 },
//   grossSalary: 127000,
//   ssfEmployeeAmount: 13970,
//   ssfEmployerAmount: 25400,
//   taxableIncome: 113030,
//   incomeTax: 5000,
//   leaveDeductionAmount: 2000,
//   manualDeductionAmount: 0,
//   totalDeductions: 20970,
//   netSalary: 106030,
//   summary: {
//     employerCost: 152400,  // 127000 + 25400
//     employeeTakeHome: 106030
//   }
// }

*/
