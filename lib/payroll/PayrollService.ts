/**
 * Payroll Service - Business Logic Layer
 * Handles payroll run creation, processing, and management
 */

import { PayrollCalculationEngine, CalculationResult } from "./PayrollCalculationEngine";

interface PayrollProcessingOptions {
  month: number;
  year: number;
  excludeEmployeeIds?: string[];
  overrideLeaveBalance?: boolean;
}

interface ProcessingResult {
  processed: number;
  failed: number;
  errors: Array<{
    employeeId: string;
    employeeName?: string;
    error: string;
  }>;
  payrollRunId: string;
}

class PayrollService {
  private prisma: any; // Prisma client

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  /**
   * Create a new payroll run for a specific month
   */
  async createPayrollRun(month: number, year: number, notes?: string): Promise<any> {
    // Validate month/year
    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Must be between 1 and 12.");
    }
    if (year < 2000 || year > 2100) {
      throw new Error("Invalid year.");
    }

    // Check if payroll already exists for this month
    const existing = await this.prisma.payrollRun.findUnique({
      where: { month_year: { month, year } },
    });

    if (existing) {
      throw new Error(`Payroll already exists for ${month}/${year}`);
    }

    // Get total active employees
    const totalEmployees = await this.prisma.employee.count({
      where: { employmentStatus: "Active" },
    });

    // Create payroll run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        month,
        year,
        notes,
        status: "DRAFT",
        totalEmployeesCount: totalEmployees,
        processedDate: new Date(),
      },
    });

    return payrollRun;
  }

  /**
   * Process all employees for a payroll run
   * Calculates salaries, SSF, tax, deductions
   */
  async processPayrollRun(
    payrollRunId: string,
    options: Partial<PayrollProcessingOptions>
  ): Promise<ProcessingResult> {
    // Fetch payroll run
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    });

    if (!payrollRun) {
      throw new Error("Payroll run not found");
    }

    if (payrollRun.locked) {
      throw new Error("Cannot process locked payroll");
    }

    // Fetch configuration
    const config = await this.prisma.payrollConfiguration.findFirst();
    if (!config) {
      throw new Error("Payroll configuration not found. Please configure payroll settings.");
    }

    // Fetch tax slabs
    const taxSlabs = await this.prisma.taxSlab.findMany({
      where: {
        effectiveFromDate: { lte: new Date() },
        OR: [{ effectiveToDate: null }, { effectiveToDate: { gte: new Date() } }],
      },
    });

    // Initialize calculation engine
    const engine = new PayrollCalculationEngine(
      {
        ssfEmployeeRate: config.ssfEmployeeRate,
        ssfEmployerRate: config.ssfEmployerRate,
        minimumWage: config.minimumWage,
        taxationEnabled: config.taxationEnabled,
        ssfEnabled: config.ssfEnabled,
      },
      taxSlabs
    );

    // Fetch active employees
    const employees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: "Active",
        NOT: { id: { in: options.excludeEmployeeIds || [] } },
      },
      include: {
        salaryStructures: {
          where: {
            status: "ACTIVE",
            effectiveFromDate: { lte: new Date() },
            OR: [{ effectiveToDate: null }, { effectiveToDate: { gte: new Date() } }],
          },
          take: 1,
        },
      },
    });

    const result: ProcessingResult = {
      processed: 0,
      failed: 0,
      errors: [],
      payrollRunId,
    };

    let totalGross = 0;
    let totalTax = 0;
    let totalSsfEmp = 0;
    let totalSsfEmpR = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    // Process each employee
    for (const employee of employees) {
      try {
        // Get current salary structure
        if (!employee.salaryStructures || employee.salaryStructures.length === 0) {
          throw new Error("No active salary structure found");
        }

        const salaryStructure = employee.salaryStructures[0];

        // Get leave deductions for this month
        const leaveDeductions = await this.calculateLeaveDeductions(
          employee.id,
          payrollRun.month,
          payrollRun.year,
          salaryStructure.basicSalary
        );

        // Get manual deductions
        const manualDeductions = await this.prisma.manualDeduction.aggregate({
          where: {
            employeeId: employee.id,
            status: "APPROVED",
            createdAt: {
              gte: new Date(payrollRun.year, payrollRun.month - 1, 1),
              lt: new Date(payrollRun.year, payrollRun.month, 1),
            },
          },
          _sum: { amount: true },
        });

        // Calculate salary
        const calculation = engine.calculateSalary(
          {
            basicSalary: salaryStructure.basicSalary,
            allowances: salaryStructure.allowances || {},
          },
          leaveDeductions,
          manualDeductions._sum.amount || 0
        );

        // Create payroll record
        const payrollRecord = await this.prisma.payrollRecord.create({
          data: {
            employeeId: employee.id,
            payrollRunId,
            basicSalary: calculation.basicSalary,
            allowances: calculation.allowances,
            grossSalary: calculation.grossSalary,
            ssfEmployeePercent: config.ssfEmployeeRate,
            ssfEmployeeAmount: calculation.ssfEmployeeAmount,
            ssfEmployerPercent: config.ssfEmployerRate,
            ssfEmployerAmount: calculation.ssfEmployerAmount,
            taxableIncome: calculation.taxableIncome,
            incomeTax: calculation.incomeTax,
            leaveDeductionAmount: leaveDeductions,
            manualDeductionAmount: manualDeductions._sum.amount || 0,
            totalDeductions: calculation.totalDeductions,
            netSalary: calculation.netSalary,
            status: "CALCULATED",
            calculatedAt: new Date(),
            taxSlabId: calculation.applicableSlab?.id,
          },
        });

        // Log in audit
        await this.prisma.payrollAuditLog.create({
          data: {
            payrollRecordId: payrollRecord.id,
            action: "CREATED",
            tableName: "payroll_records",
            recordId: payrollRecord.id,
            newValues: {
              status: "CALCULATED",
              grossSalary: calculation.grossSalary,
              netSalary: calculation.netSalary,
            },
            changedBy: "SYSTEM",
          },
        });

        // Accumulate totals
        totalGross += calculation.grossSalary;
        totalTax += calculation.incomeTax;
        totalSsfEmp += calculation.ssfEmployeeAmount;
        totalSsfEmpR += calculation.ssfEmployerAmount;
        totalDeductions += calculation.totalDeductions;
        totalNet += calculation.netSalary;

        result.processed++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          error: error.message,
        });
      }
    }

    // Update payroll run with totals
    const updatedRun = await this.prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        totalEmployeesProcessed: result.processed,
        totalGrossAmount: totalGross,
        totalIncomeTax: totalTax,
        totalSsfEmployee: totalSsfEmp,
        totalSsfEmployer: totalSsfEmpR,
        totalDeductions,
        totalNetAmount: totalNet,
        status: result.failed === 0 ? "FINALIZED" : "DRAFT",
      },
    });

    return result;
  }

  /**
   * Calculate leave deduction for a specific month
   */
  private async calculateLeaveDeductions(
    employeeId: string,
    month: number,
    year: number,
    basicSalary: number
  ): Promise<number> {
    // Get approved leave requests for this month
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: "APPROVED",
        startDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    // Calculate total leave days
    let totalLeaveDays = 0;
    for (const leave of leaves) {
      const daysDiff =
        (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
      totalLeaveDays += daysDiff;
    }

    // Calculate deduction (basic salary / 30 days per month)
    const ratePerDay = basicSalary / 30;
    const deductionAmount = totalLeaveDays * ratePerDay;

    return Math.round(deductionAmount * 100) / 100;
  }

  /**
   * Finalize payroll run (lock it from editing)
   */
  async finalizePayrollRun(payrollRunId: string, approverNotes?: string): Promise<any> {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    });

    if (!payrollRun) {
      throw new Error("Payroll run not found");
    }

    if (payrollRun.locked) {
      throw new Error("Payroll already finalized");
    }

    // Check if all records are calculated
    const pendingRecords = await this.prisma.payrollRecord.count({
      where: { payrollRunId, status: "PENDING" },
    });

    if (pendingRecords > 0) {
      throw new Error(`Cannot finalize. ${pendingRecords} records still pending.`);
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        locked: true,
        status: "FINALIZED",
        approvedDate: new Date(),
        notes: approverNotes,
      },
    });

    // Create audit log
    await this.prisma.payrollAuditLog.create({
      data: {
        payrollRunId,
        action: "LOCKED",
        tableName: "payroll_runs",
        recordId: payrollRunId,
        reason: approverNotes,
        changedBy: "SYSTEM",
      },
    });

    return updated;
  }

  /**
   * Recalculate a single payroll record
   */
  async recalculateRecord(payrollRecordId: string): Promise<any> {
    const record = await this.prisma.payrollRecord.findUnique({
      where: { id: payrollRecordId },
      include: {
        payrollRun: true,
        employee: {
          include: {
            salaryStructures: true,
          },
        },
        leaveDeductions: true,
        manualDeductions: true,
      },
    });

    if (!record) {
      throw new Error("Payroll record not found");
    }

    if (record.payrollRun.locked) {
      throw new Error("Cannot modify locked payroll");
    }

    // Recalculate using engine
    const config = await this.prisma.payrollConfiguration.findFirst();
    const taxSlabs = await this.prisma.taxSlab.findMany();

    const engine = new PayrollCalculationEngine(config, taxSlabs);

    const currentSalary = record.employee.salaryStructures[0];
    const totalManualDeductions = record.manualDeductions.reduce((sum, d) => sum + d.amount, 0);

    const calculation = engine.calculateSalary(
      {
        basicSalary: currentSalary.basicSalary,
        allowances: currentSalary.allowances || {},
      },
      record.leaveDeductionAmount,
      totalManualDeductions
    );

    // Update record
    const updated = await this.prisma.payrollRecord.update({
      where: { id: payrollRecordId },
      data: {
        grossSalary: calculation.grossSalary,
        ssfEmployeeAmount: calculation.ssfEmployeeAmount,
        ssfEmployerAmount: calculation.ssfEmployerAmount,
        taxableIncome: calculation.taxableIncome,
        incomeTax: calculation.incomeTax,
        totalDeductions: calculation.totalDeductions,
        netSalary: calculation.netSalary,
        status: "CALCULATED",
        calculatedAt: new Date(),
      },
    });

    return updated;
  }
}

export { PayrollService };    export type { ProcessingResult, PayrollProcessingOptions };

