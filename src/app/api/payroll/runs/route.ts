import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

/**
 * GET /api/payroll/runs - Fetch all payroll runs
 * POST /api/payroll/runs - Create new payroll run
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "Organization ID required" },
        { status: 400 }
      );
    }

    const where: any = { organizationId };
    if (status) where.status = status;

    let payrollRuns = await prisma.payrollRun.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    let total = await prisma.payrollRun.count({ where });

    // Auto-create a current-month draft run so the payroll screen is never empty.
    if (total === 0) {
      const now = new Date();
      const draftRun = await prisma.payrollRun.create({
        data: {
          organizationId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          notes: "Auto-created draft payroll run",
          status: "DRAFT",
          locked: false,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          totalSSFEmployee: 0,
          totalSSFEmployer: 0,
          totalTax: 0,
        },
      });

      payrollRuns = [draftRun];
      total = 1;
    }

    return NextResponse.json({
      success: true,
      data: payrollRuns,
      pagination: { total, limit, offset },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("GET /api/payroll/runs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payroll runs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year, notes, organizationId } = body;

    // Validation
    if (!month || !year || !organizationId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: month, year, organizationId" },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: "Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this month/year
    const existing = await prisma.payrollRun.findUnique({
      where: { organizationId_month_year: { organizationId, month, year } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Payroll already exists for this month/year" },
        { status: 409 }
      );
    }

    const payrollRun = await prisma.payrollRun.create({
      data: {
        organizationId,
        month,
        year,
        notes: notes || null,
        status: "DRAFT",
        locked: false,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalSSFEmployee: 0,
        totalSSFEmployer: 0,
        totalTax: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: payrollRun,
        message: "Payroll run created successfully",
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/payroll/runs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payroll run" },
      { status: 500 }
    );
  }
}
