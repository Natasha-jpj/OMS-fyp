// ============================================================
// FILE: src/app/api/payroll/runs/[runId]/records/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { runId } = params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!runId) {
      return NextResponse.json(
        { success: false, error: "runId is required" },
        { status: 400 }
      );
    }

    const where: any = { payrollRunId: runId };
    if (organizationId) where.organizationId = organizationId;

    const records = await prisma.payrollRecord.findMany({
      where,
      orderBy: { employeeName: "asc" },
    });

    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
    });

    return NextResponse.json({
      success: true,
      data: records,
      run,
      count: records.length,
      timestamp: new Date(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}


// ============================================================
// FILE: src/app/api/payroll/seed/route.ts
// ============================================================
//
// POST /api/payroll/seed?organizationId=xxx
//
// Seeds Nepal's default tax slabs for an organization.
// Run this ONCE when setting up payroll for a new organization.
// After seeding, you can edit slabs via the tax-slabs API.

/*
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";
import { NEPAL_DEFAULT_TAX_SLABS } from "@/lib/payroll/helpers";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ success: false, error: "organizationId required" }, { status: 400 });
  }

  // Clear existing slabs for this org
  await prisma.taxSlab.deleteMany({ where: { organizationId } });

  // Seed Nepal default slabs
  const slabs = await Promise.all(
    NEPAL_DEFAULT_TAX_SLABS.map((slab) =>
      prisma.taxSlab.create({
        data: {
          organizationId,
          minIncome: slab.minIncome,
          maxIncome: slab.maxIncome,
          taxRate: slab.taxRate,
          reliefAmount: slab.reliefAmount,
          effectiveFromDate: new Date("2024-07-17"), // Start of FY 2080/81
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    message: `Seeded ${slabs.length} Nepal tax slabs`,
    data: slabs,
  });
}
*/