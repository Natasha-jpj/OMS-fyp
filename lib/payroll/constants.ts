/**
 * Payroll System - Constants & Enums
 */

// ─── PAYROLL CONFIGURATION CONSTANTS ────────────────────────────────────

export const DEFAULT_PAYROLL_CONFIG = {
  SSF_EMPLOYEE_RATE: 11,        // 11% of gross salary
  SSF_EMPLOYER_RATE: 20,        // 20% of gross salary
  MINIMUM_WAGE_NPR: 13500,      // Nepal minimum wage
  CURRENCY_CODE: "NPR",
  TAXATION_ENABLED: true,
  SSF_ENABLED: true,
};

// ─── TAX SLAB CONSTANTS ────────────────────────────────────────────────

export const NEPAL_TAX_SLABS_2024 = [
  { minIncome: 0, maxIncome: 300000, taxRate: 0, reliefAmount: 0 },
  { minIncome: 300001, maxIncome: 700000, taxRate: 1, reliefAmount: 0 },
  { minIncome: 700001, maxIncome: 2000000, taxRate: 10, reliefAmount: 0 },
  { minIncome: 2000001, maxIncome: Infinity, taxRate: 20, reliefAmount: 0 },
];

export const TAX_CALCULATION_MODE = {
  PROGRESSIVE: "PROGRESSIVE",   // Multiple slabs
  FLAT: "FLAT",                 // Single rate
  CUSTOM: "CUSTOM",             // Organization specific
} as const;

// ─── PAYROLL STATUS CONSTANTS ──────────────────────────────────────────

export const PAYROLL_RUN_STATUSES = {
  DRAFT: "DRAFT",               // Not yet processed
  FINALIZED: "FINALIZED",       // Processed and locked
  PAID: "PAID",                 // Payment made
  CANCELLED: "CANCELLED",       // Cancelled/reversed
} as const;

export const PAYROLL_RECORD_STATUSES = {
  PENDING: "PENDING",           // Waiting to be processed
  CALCULATED: "CALCULATED",     // Calculation completed
  VERIFIED: "VERIFIED",         // Verified by HR
  PAID: "PAID",                 // Payment processed
  ADJUSTED: "ADJUSTED",         // Adjustment applied
} as const;

// ─── LEAVE TYPE CONSTANTS ──────────────────────────────────────────────

export const LEAVE_TYPES = {
  CASUAL: "CASUAL",
  MEDICAL: "MEDICAL",
  UNPAID: "UNPAID",
  SPECIAL: "SPECIAL",
  BEREAVEMENT: "BEREAVEMENT",
  MATERNITY: "MATERNITY",
  PATERNITY: "PATERNITY",
} as const;

// ─── MANUAL DEDUCTION TYPES ────────────────────────────────────────────

export const MANUAL_DEDUCTION_TYPES = {
  LOAN: "LOAN",
  PENALTY: "PENALTY",
  ADJUSTMENT: "ADJUSTMENT",
  OTHER: "OTHER",
  HEALTH_INSURANCE: "HEALTH_INSURANCE",
  UNIFORM: "UNIFORM",
  SECURITY: "SECURITY",
} as const;

// ─── AUDIT ACTION CONSTANTS ────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  PROCESS: "PROCESS",
  FINALIZE: "FINALIZE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  CANCEL: "CANCEL",
  RECALCULATE: "RECALCULATE",
  EXPORT: "EXPORT",
} as const;

// ─── ENTITY TYPES FOR AUDIT ────────────────────────────────────────────

export const AUDIT_ENTITY_TYPES = {
  PAYROLL_RUN: "PAYROLL_RUN",
  PAYROLL_RECORD: "PAYROLL_RECORD",
  TAX_SLAB: "TAX_SLAB",
  SALARY_STRUCTURE: "SALARY_STRUCTURE",
  CONFIGURATION: "CONFIGURATION",
  LEAVE_DEDUCTION: "LEAVE_DEDUCTION",
  MANUAL_DEDUCTION: "MANUAL_DEDUCTION",
} as const;

// ─── VALIDATION CONSTRAINTS ────────────────────────────────────────────

export const VALIDATION_RULES = {
  SALARY_STRUCTURE: {
    MIN_BASIC_SALARY: 0,
    MAX_BASIC_SALARY: 10000000,
    MAX_ALLOWANCES: 100,
  },
  TAX_SLAB: {
    MIN_RATE: 0,
    MAX_RATE: 100,
    MIN_INCOME: 0,
    MAX_INCOME: 999999999,
  },
  PAYROLL_RUN: {
    MIN_MONTH: 1,
    MAX_MONTH: 12,
    MIN_YEAR: 2000,
    MAX_YEAR: 2100,
  },
  DEDUCTION: {
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 10000000,
  },
} as const;

// ─── CURRENCY FORMATTING ──────────────────────────────────────────────

export const CURRENCY_FORMAT = {
  NPR: {
    symbol: "₹",
    locale: "ne-NP",
    code: "NPR",
    decimalPlaces: 2,
  },
  USD: {
    symbol: "$",
    locale: "en-US",
    code: "USD",
    decimalPlaces: 2,
  },
} as const;

// ─── ERROR CODES ──────────────────────────────────────────────────────

export const ERROR_CODES = {
  // Validation Errors (400)
  INVALID_MONTH: "INVALID_MONTH",
  INVALID_YEAR: "INVALID_YEAR",
  INVALID_TAX_RATE: "INVALID_TAX_RATE",
  INVALID_SALARY: "INVALID_SALARY",
  DEDUCTION_EXCEEDS_GROSS: "DEDUCTION_EXCEEDS_GROSS",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  
  // Conflict Errors (409)
  PAYROLL_ALREADY_EXISTS: "PAYROLL_ALREADY_EXISTS",
  PAYROLL_LOCKED: "PAYROLL_LOCKED",
  PAYROLL_ALREADY_PAID: "PAYROLL_ALREADY_PAID",
  DUPLICATE_TAX_SLAB: "DUPLICATE_TAX_SLAB",
  DUPLICATE_SALARY_STRUCTURE: "DUPLICATE_SALARY_STRUCTURE",
  
  // Not Found Errors (404)
  PAYROLL_RUN_NOT_FOUND: "PAYROLL_RUN_NOT_FOUND",
  PAYROLL_RECORD_NOT_FOUND: "PAYROLL_RECORD_NOT_FOUND",
  EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND",
  TAX_SLAB_NOT_FOUND: "TAX_SLAB_NOT_FOUND",
  SALARY_STRUCTURE_NOT_FOUND: "SALARY_STRUCTURE_NOT_FOUND",
  
  // Business Logic Errors (422)
  NO_ACTIVE_SALARY_STRUCTURE: "NO_ACTIVE_SALARY_STRUCTURE",
  NO_TAX_SLABS_FOUND: "NO_TAX_SLABS_FOUND",
  PAYROLL_CONFIGURATION_MISSING: "PAYROLL_CONFIGURATION_MISSING",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
  
  // Authorization Errors (403)
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  
  // Server Errors (500)
  DATABASE_ERROR: "DATABASE_ERROR",
  CALCULATION_ERROR: "CALCULATION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// ─── ERROR MESSAGES ────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  INVALID_MONTH: "Month must be between 1 and 12",
  INVALID_YEAR: "Year must be between 2000 and 2100",
  INVALID_TAX_RATE: "Tax rate must be between 0 and 100",
  INVALID_SALARY: "Basic salary must be greater than 0",
  DEDUCTION_EXCEEDS_GROSS: "Total deductions cannot exceed gross salary",
  PAYROLL_ALREADY_EXISTS: "Payroll for this month/year already exists",
  PAYROLL_LOCKED: "Cannot modify a locked/finalized payroll",
  NO_ACTIVE_SALARY_STRUCTURE: "No active salary structure found for employee",
  NO_TAX_SLABS_FOUND: "No applicable tax slab found",
  EMPLOYEE_NOT_FOUND: "Employee not found",
  UNAUTHORIZED_ACCESS: "You do not have permission to access this resource",
} as const;

// ─── DATE & TIME CONSTANTS ────────────────────────────────────────────

export const MONTHS = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
} as const;

export const NEPALI_MONTHS = {
  1: "बैशाख",
  2: "जेठ",
  3: "असार",
  4: "साउन",
  5: "भदौ",
  6: "असोज",
  7: "कार्तिक",
  8: "मंसिर",
  9: "पुष",
  10: "माघ",
  11: "फाल्गुन",
  12: "चैत्र",
} as const;

// ─── DAYS IN MONTH ────────────────────────────────────────────────────

export const DAYS_IN_MONTH = {
  1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
} as const;

// ─── PROCESSING BATCH SIZE ────────────────────────────────────────────

export const BATCH_SIZE = {
  SMALL: 50,
  MEDIUM: 500,
  LARGE: 1000,
} as const;

// ─── EXPORT FORMATS ───────────────────────────────────────────────────

export const EXPORT_FORMATS = {
  CSV: "CSV",
  PDF: "PDF",
  EXCEL: "EXCEL",
  JSON: "JSON",
} as const;

// ─── ROLE BASED ACCESS ────────────────────────────────────────────────

export const PAYROLL_ROLES = {
  PAYROLL_ADMIN: "PAYROLL_ADMIN",
  HR_MANAGER: "HR_MANAGER",
  FINANCE: "FINANCE",
  EMPLOYEE: "EMPLOYEE",
  VIEWER: "VIEWER",
} as const;

// ─── PERMISSIONS ──────────────────────────────────────────────────────

export const PAYROLL_PERMISSIONS = {
  CREATE_PAYROLL: "payroll:create",
  EDIT_PAYROLL: "payroll:edit",
  DELETE_PAYROLL: "payroll:delete",
  FINALIZE_PAYROLL: "payroll:finalize",
  VIEW_PAYROLL: "payroll:view",
  EXPORT_PAYROLL: "payroll:export",
  MANAGE_TAX_SLABS: "payroll:manage_tax_slabs",
  MANAGE_CONFIGURATION: "payroll:manage_configuration",
  APPROVE_DEDUCTIONS: "payroll:approve_deductions",
  VIEW_AUDIT_LOGS: "payroll:view_audit_logs",
} as const;

// ─── CALCULATION PRECISION ────────────────────────────────────────────

export const CALCULATION_PRECISION = {
  DECIMAL_PLACES: 2,
  ROUNDING_MODE: "HALF_UP" as const,
} as const;

// ─── API CONSTANTS ────────────────────────────────────────────────────

export const API_CONSTANTS = {
  MAX_RECORDS_PER_PAGE: 100,
  DEFAULT_PAGE_SIZE: 20,
  REQUEST_TIMEOUT_MS: 30000,
  MAX_FILE_SIZE_MB: 10,
} as const;

// ─── CACHE DURATIONS (in seconds) ──────────────────────────────────────

export const CACHE_DURATION = {
  TAX_SLABS: 3600,           // 1 hour
  CONFIGURATION: 7200,       // 2 hours
  SALARY_STRUCTURE: 1800,    // 30 minutes
  EMPLOYEE_DATA: 900,        // 15 minutes
} as const;
