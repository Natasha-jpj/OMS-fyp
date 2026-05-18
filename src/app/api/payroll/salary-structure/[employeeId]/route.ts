import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

/**
 * GET /api/payroll/salary-structure/[employeeId] - Get employee salary structure
 * POST /api/payroll/salary-structure/[employeeId] - Create/update salary structure
 */

export async function GET(request: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const params = await context.params;
    const { employeeId } = params;

    if (!employeeId || !organizationId) {
      return NextResponse.json(
        { success: false, error: "Employee ID and Organization ID required" },
        { status: 400 }
      );
    }

    const salaryStructure = await prisma.salaryStructure.findFirst({
      where: {
        organizationId,
        employeeId,
        effectiveFromDate: { lte: new Date() },
        OR: [
          { effectiveToDate: null },
          { effectiveToDate: { gte: new Date() } },
        ],
      },
      orderBy: { effectiveFromDate: "desc" },
    });

    if (!salaryStructure) {
      return NextResponse.json(
        { success: false, error: "No active salary structure found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: salaryStructure,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("GET /api/payroll/salary-structure error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch salary structure" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { employeeId } = params;
    const body = await request.json();
    const { organizationId, basicSalary, allowances = {}, effectiveFromDate, department } = body;

    // Validation
    if (!employeeId || !organizationId || !basicSalary || !effectiveFromDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: employeeId, organizationId, basicSalary, effectiveFromDate",
        },
        { status: 400 }
      );
    }

    if (basicSalary <= 0) {
      return NextResponse.json(
        { success: false, error: "Basic salary must be greater than 0" },
        { status: 400 }
      );
    }

    // Deactivate previous salary structures
    await prisma.salaryStructure.updateMany({
      where: {
        organizationId,
        employeeId,
        effectiveToDate: null,
      },
      data: {
        effectiveToDate: new Date(),
      },
    });

    // Create new salary structure
    const salaryStructure = await prisma.salaryStructure.create({
      data: {
        organizationId,
        employeeId,
        basicSalary: basicSalary,
        allowances,
        effectiveFromDate: new Date(effectiveFromDate),
        department: department || null,
      },
    });

    // Keep employee record in sync: set employee.salary to latest basic salary
    try {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          salary: basicSalary,
        },
      });
      console.log(`✅ Updated employee ${employeeId} salary to ${basicSalary}`);
    } catch (err: any) {
      // Non-fatal: log and continue. Employee may not exist in current tenants during import.
      console.error(`❌ Failed to update employee ${employeeId} salary:`, err.message);
    }

    return NextResponse.json(
      {
        success: true,
        data: salaryStructure,
        message: "Salary structure created successfully",
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/payroll/salary-structure error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create salary structure" },
      { status: 500 }
    );
  }
}
