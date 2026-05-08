/**
 * Payroll System - Validation Functions
 */

import {
  ValidationError,
  PayrollConfig,
  SalaryStructure,
  CreatePayrollRunRequest,
  CreateTaxSlabRequest,
  UpdateSalaryStructureRequest,
  AddManualDeductionRequest,
} from "./types";

import {
  VALIDATION_RULES,
  DAYS_IN_MONTH,
  ERROR_CODES,
  ERROR_MESSAGES,
} from "./constants";

// ─── PAYROLL RUN VALIDATION ────────────────────────────────────────────

export function validatePayrollRunRequest(
  request: CreatePayrollRunRequest
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!request.month || request.month < 1 || request.month > 12) {
    errors.push({
      field: "month",
      message: ERROR_MESSAGES.INVALID_MONTH,
      value: request.month,
    });
  }

  if (!request.year || request.year < 2000 || request.year > 2100) {
    errors.push({
      field: "year",
      message: ERROR_MESSAGES.INVALID_YEAR,
      value: request.year,
    });
  }

  if (request.notes && request.notes.length > 1000) {
    errors.push({
      field: "notes",
      message: "Notes cannot exceed 1000 characters",
      value: request.notes.length,
    });
  }

  return errors;
}

// ─── SALARY STRUCTURE VALIDATION ───────────────────────────────────────

export function validateSalaryStructure(
  salary: SalaryStructure
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate basic salary
  if (!salary.basicSalary || salary.basicSalary <= 0) {
    errors.push({
      field: "basicSalary",
      message: ERROR_MESSAGES.INVALID_SALARY,
      value: salary.basicSalary,
    });
  }

  if (
    salary.basicSalary >
    VALIDATION_RULES.SALARY_STRUCTURE.MAX_BASIC_SALARY
  ) {
    errors.push({
      field: "basicSalary",
      message: `Basic salary cannot exceed ${VALIDATION_RULES.SALARY_STRUCTURE.MAX_BASIC_SALARY}`,
      value: salary.basicSalary,
    });
  }

  // Validate allowances
  if (salary.allowances && typeof salary.allowances !== "object") {
    errors.push({
      field: "allowances",
      message: "Allowances must be an object",
      value: salary.allowances,
    });
  }

  if (salary.allowances) {
    const allowanceKeys = Object.keys(salary.allowances);

    if (allowanceKeys.length > VALIDATION_RULES.SALARY_STRUCTURE.MAX_ALLOWANCES) {
      errors.push({
        field: "allowances",
        message: `Cannot have more than ${VALIDATION_RULES.SALARY_STRUCTURE.MAX_ALLOWANCES} allowance types`,
        value: allowanceKeys.length,
      });
    }

    // Validate each allowance amount
    for (const [key, value] of Object.entries(salary.allowances)) {
      if (typeof value !== "number" || value < 0) {
        errors.push({
          field: `allowances.${key}`,
          message: "Allowance amount must be a positive number",
          value,
        });
      }
    }
  }

  // Validate dates
  if (salary.effectiveFromDate && salary.effectiveToDate) {
    if (
      new Date(salary.effectiveFromDate) >
      new Date(salary.effectiveToDate)
    ) {
      errors.push({
        field: "effectiveToDate",
        message: "Effective to date must be after from date",
        value: salary.effectiveToDate,
      });
    }
  }

  return errors;
}

// ─── TAX SLAB VALIDATION ───────────────────────────────────────────────

export function validateTaxSlab(slab: CreateTaxSlabRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate income range
  if (slab.minIncome < VALIDATION_RULES.TAX_SLAB.MIN_INCOME) {
    errors.push({
      field: "minIncome",
      message: "Minimum income cannot be negative",
      value: slab.minIncome,
    });
  }

  if (slab.minIncome >= slab.maxIncome) {
    errors.push({
      field: "minIncome/maxIncome",
      message: "Maximum income must be greater than minimum income",
      value: { minIncome: slab.minIncome, maxIncome: slab.maxIncome },
    });
  }

  // Validate tax rate
  if (
    slab.taxRate < VALIDATION_RULES.TAX_SLAB.MIN_RATE ||
    slab.taxRate > VALIDATION_RULES.TAX_SLAB.MAX_RATE
  ) {
    errors.push({
      field: "taxRate",
      message: ERROR_MESSAGES.INVALID_TAX_RATE,
      value: slab.taxRate,
    });
  }

  // Validate relief amount
  if (slab.reliefAmount && slab.reliefAmount < 0) {
    errors.push({
      field: "reliefAmount",
      message: "Relief amount cannot be negative",
      value: slab.reliefAmount,
    });
  }

  // Validate dates
  if (slab.effectiveFromDate && slab.effectiveToDate) {
    const fromDate = new Date(slab.effectiveFromDate);
    const toDate = new Date(slab.effectiveToDate);

    if (fromDate > toDate) {
      errors.push({
        field: "effectiveToDate",
        message: "Effective to date must be after from date",
        value: slab.effectiveToDate,
      });
    }
  }

  return errors;
}

// ─── MANUAL DEDUCTION VALIDATION ───────────────────────────────────────

export function validateManualDeduction(
  deduction: AddManualDeductionRequest
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    deduction.amount <= VALIDATION_RULES.DEDUCTION.MIN_AMOUNT ||
    deduction.amount > VALIDATION_RULES.DEDUCTION.MAX_AMOUNT
  ) {
    errors.push({
      field: "amount",
      message: "Deduction amount must be positive",
      value: deduction.amount,
    });
  }

  if (!deduction.reason || deduction.reason.trim().length === 0) {
    errors.push({
      field: "reason",
      message: "Reason is required",
      value: deduction.reason,
    });
  }

  if (deduction.reason && deduction.reason.length > 500) {
    errors.push({
      field: "reason",
      message: "Reason cannot exceed 500 characters",
      value: deduction.reason.length,
    });
  }

  return errors;
}

// ─── SALARY STRUCTURE UPDATE VALIDATION ────────────────────────────────

export function validateUpdateSalaryStructure(
  update: UpdateSalaryStructureRequest
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!update.basicSalary || update.basicSalary <= 0) {
    errors.push({
      field: "basicSalary",
      message: ERROR_MESSAGES.INVALID_SALARY,
      value: update.basicSalary,
    });
  }

  if (update.allowances && typeof update.allowances !== "object") {
    errors.push({
      field: "allowances",
      message: "Allowances must be an object",
      value: update.allowances,
    });
  }

  if (update.effectiveFromDate) {
    try {
      new Date(update.effectiveFromDate);
    } catch (e) {
      errors.push({
        field: "effectiveFromDate",
        message: "Invalid date format",
        value: update.effectiveFromDate,
      });
    }
  }

  return errors;
}

// ─── CALCULATION VALIDATION ────────────────────────────────────────────

export function validateCalculationInputs(
  basicSalary: number,
  allowances: Record<string, number>,
  leaveDeduction: number,
  manualDeduction: number,
  config: PayrollConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate basic salary
  if (!basicSalary || basicSalary <= 0) {
    errors.push({
      field: "basicSalary",
      message: ERROR_MESSAGES.INVALID_SALARY,
      value: basicSalary,
    });
  }

  // Calculate gross
  let gross = basicSalary;
  if (allowances && typeof allowances === "object") {
    for (const [key, value] of Object.entries(allowances)) {
      if (typeof value !== "number" || value < 0) {
        errors.push({
          field: `allowances.${key}`,
          message: "Allowance must be a positive number",
          value,
        });
      }
      gross += value;
    }
  }

  // Validate deductions don't exceed gross
  const totalDeductions = leaveDeduction + manualDeduction;
  if (totalDeductions > gross) {
    errors.push({
      field: "deductions",
      message: ERROR_MESSAGES.DEDUCTION_EXCEEDS_GROSS,
      value: { gross, deductions: totalDeductions },
    });
  }

  // Validate against minimum wage
  if (basicSalary < config.minimumWage) {
    console.warn(
      `Basic salary ${basicSalary} is below minimum wage ${config.minimumWage}`
    );
  }

  return errors;
}

// ─── EMAIL VALIDATION ──────────────────────────────────────────────────

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ─── DATE VALIDATION ───────────────────────────────────────────────────

export function isValidDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch (e) {
    return false;
  }
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month as keyof typeof DAYS_IN_MONTH] || 31;
}

// ─── BATCH VALIDATION ──────────────────────────────────────────────────

export function validateBatchData(records: any[]): {
  valid: any[];
  invalid: Array<{ index: number; errors: ValidationError[] }>;
} {
  const valid: any[] = [];
  const invalid: Array<{ index: number; errors: ValidationError[] }> = [];

  records.forEach((record, index) => {
    const errors = validateSalaryStructure(record);
    if (errors.length === 0) {
      valid.push(record);
    } else {
      invalid.push({ index, errors });
    }
  });

  return { valid, invalid };
}

// ─── CONFIGURATION VALIDATION ──────────────────────────────────────────

export function validatePayrollConfig(config: PayrollConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    config.ssfEmployeeRate < 0 ||
    config.ssfEmployeeRate > 100
  ) {
    errors.push({
      field: "ssfEmployeeRate",
      message: "SSF employee rate must be between 0 and 100",
      value: config.ssfEmployeeRate,
    });
  }

  if (
    config.ssfEmployerRate < 0 ||
    config.ssfEmployerRate > 100
  ) {
    errors.push({
      field: "ssfEmployerRate",
      message: "SSF employer rate must be between 0 and 100",
      value: config.ssfEmployerRate,
    });
  }

  if (config.minimumWage <= 0) {
    errors.push({
      field: "minimumWage",
      message: "Minimum wage must be positive",
      value: config.minimumWage,
    });
  }

  return errors;
}

// ─── GENERAL VALIDATION RESPONSE ───────────────────────────────────────

export function createValidationError(
  code: string,
  message: string,
  errors?: ValidationError[]
) {
  return {
    success: false,
    error: code,
    message,
    details: errors,
    timestamp: new Date(),
  };
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors && errors.length > 0;
}

export function getFirstError(errors: ValidationError[]): ValidationError | null {
  return errors && errors.length > 0 ? errors[0] : null;
}
