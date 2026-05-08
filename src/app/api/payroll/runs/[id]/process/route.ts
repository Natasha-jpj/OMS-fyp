// ============================================================
// FILE: src/app/api/payroll/runs/[runId]/process/route.ts
// ============================================================
//
// POST /api/payroll/runs/[runId]/process
//
// This is the most important route in your payroll system.
// It loops through ALL employees and calculates their salary for this payroll run.
//
// What it does step by step:
// 1. Load the PayrollRun (must be DRAFT status)
// 2. Load PayrollConfiguration (SSF rates, etc.)
// 3. Load active TaxSlabs from DB
// 4. Find all active employees in the organization
// 5. For each employee:
//    a. Find their SalaryStructure
//    b. Calculate leave deductions (unpaid leaves for this month)
//    c. Run the salary calculator
//    d. Save a PayrollRecord with the breakdown
// 6. Sum up totals and update the PayrollRun to CALCULATED status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";
import { calculateSalary, countUnpaidLeaveDays } from "@/lib/payroll/helpers";
import type { TaxSlabConfig } from "@/lib/payroll/types";

export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { runId } = params;
    const body = await request.json();
    const { organizationId } = body;

    if (!runId || !organizationId) {
      return NextResponse.json(
        { success: false, error: "runId and organizationId are required" },
        { status: 400 }
      );
    }

    // ── Step 1: Load Payroll Run ──────────────────────────────────
    const payrollRun = await prisma.payrollRun.findFirst({
      where: { id: runId, organizationId },
    });

    if (!payrollRun) {
      return NextResponse.json(
        { success: false, error: "Payroll run not found" },
        { status: 404 }
      );
    }

    if (payrollRun.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot process payroll in ${payrollRun.status} status. Only DRAFT runs can be processed.`,
        },
        { status: 400 }
      );
    }

    const { month, year } = payrollRun;

    // ── Step 2: Load Payroll Configuration ───────────────────────
    let config = await prisma.payrollConfiguration.findUnique({
      where: { organizationId },
    });

    if (!config) {
      // Auto-create default config if not set
      config = await prisma.payrollConfiguration.create({
        data: {
          organizationId,
          ssfEmployeeRate: 11,
          ssfEmployerRate: 20,
          minimumWage: 13500,
          currency: "NPR",
        },
      });
    }

    // ── Step 3: Load Active Tax Slabs ─────────────────────────────
    const taxSlabRecords = await prisma.taxSlab.findMany({
      where: {
        organizationId,
        effectiveFromDate: { lte: new Date() },
        OR: [{ effectiveToDate: null }, { effectiveToDate: { gte: new Date() } }],
      },
      orderBy: { minIncome: "asc" },
    });

    const taxSlabs: TaxSlabConfig[] = taxSlabRecords.map((s) => ({
      minIncome: parseFloat(s.minIncome.toString()),
      maxIncome: s.maxIncome ? parseFloat(s.maxIncome.toString()) : null,
      taxRate: s.taxRate,
      reliefAmount: parseFloat(s.reliefAmount.toString()),
    }));

    // If no tax slabs configured, warn but continue (tax = 0)
    if (taxSlabs.length === 0) {
      console.warn(`[Payroll] No tax slabs configured for org ${organizationId}. Tax will be 0.`);
    }

    // ── Step 4: Find All Employees in Organization ────────────────
    // We get employees linked to this org via their HR's organization
    const employees = await prisma.employee.findMany({
      where: {
        employmentStatus: "Active",
        hr: {
          organization: organizationId,
        },
      },
      include: {
        leaveRequests: {
          where: {
            status: "APPROVED",
          },
        },
      },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active employees found. Make sure employees are linked to this organization." },
        { status: 400 }
      );
    }

    // ── Step 5: Process Each Employee ────────────────────────────
    let totalGross = 0;
    let totalNet = 0;
    let totalSSFEmployee = 0;
    let totalSSFEmployer = 0;
    let totalTax = 0;
    let processed = 0;
    let skipped = 0;
    const skippedEmployees: string[] = [];

    // Delete existing records for this run (allow re-processing)
    await prisma.payrollRecord.deleteMany({
      where: { payrollRunId: runId },
    });

    for (const employee of employees) {
      // 5a. Find their salary structure
      const salaryStructure = await prisma.salaryStructure.findFirst({
        where: {
          organizationId,
          employeeId: employee.id,
          effectiveFromDate: { lte: new Date() },
          OR: [{ effectiveToDate: null }, { effectiveToDate: { gte: new Date() } }],
        },
        orderBy: { effectiveFromDate: "desc" },
      });

      if (!salaryStructure) {
        // Skip employees without a salary structure (log them)
        skipped++;
        skippedEmployees.push(`${employee.name} (no salary structure)`);
        continue;
      }

      const basicSalary = parseFloat(salaryStructure.basicSalary.toString());
      const allowances = (salaryStructure.allowances as Record<string, number>) || {};

      // 5b. Count unpaid leave days for this month
      const leaveDeductionDays = countUnpaidLeaveDays(
        employee.leaveRequests.map((lr) => ({
          startDate: lr.startDate,
          endDate: lr.endDate,
          status: lr.status,
        })),
        month,
        year
      );

      // 5c. Run salary calculation
      const result = calculateSalary({
        basicSalary,
        allowances,
        ssfEmployeeRate: config.ssfEmployeeRate,
        ssfEmployerRate: config.ssfEmployerRate,
        taxSlabs,
        leaveDeductionDays,
        workingDaysInMonth: 26,
        manualDeductions: 0, // Manual deductions can be added separately
      });

      // 5d. Get department name
      const department = salaryStructure.department || "Unknown";

      // 5e. Save PayrollRecord
      await prisma.payrollRecord.create({
        data: {
          organizationId,
          payrollRunId: runId,
          employeeId: employee.id,
          employeeName: employee.name,
          position: employee.position || "Employee",
          department,
          basicSalary: result.basicSalary,
          allowances: result.allowances,
          grossSalary: result.grossSalary,
          ssfEmployee: result.ssfEmployee,
          ssfEmployer: result.ssfEmployer,
          taxableIncome: result.taxableIncome,
          incomeTax: result.incomeTax,
          leaveDeduction: result.leaveDeduction,
          manualDeductions: result.manualDeductions,
          totalDeductions: result.totalDeductions,
          netSalary: result.netSalary,
          status: "CALCULATED",
          notes: leaveDeductionDays > 0
            ? `${leaveDeductionDays} day(s) leave deducted`
            : null,
        },
      });

      // Accumulate totals
      totalGross += result.grossSalary;
      totalNet += result.netSalary;
      totalSSFEmployee += result.ssfEmployee;
      totalSSFEmployer += result.ssfEmployer;
      totalTax += result.incomeTax;
      processed++;
    }

    // ── Step 6: Update Payroll Run Status ─────────────────────────
    const updatedRun = await prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: "CALCULATED",
        totalGrossSalary: totalGross,
        totalNetSalary: totalNet,
        totalSSFEmployee,
        totalSSFEmployer,
        totalTax,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRun,
        processed,
        skipped,
        skippedEmployees,
      },
      message: `Payroll processed: ${processed} employees calculated${skipped > 0 ? `, ${skipped} skipped (no salary structure)` : ""}.`,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("POST /api/payroll/runs/[runId]/process error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payroll" },
      { status: 500 }
    );
  }
}