import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

/**
 * GET /api/payroll/tax-slabs - Fetch tax slabs
 * POST /api/payroll/tax-slabs - Create new tax slab
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "Organization ID required" },
        { status: 400 }
      );
    }

    const taxSlabs = await prisma.taxSlab.findMany({
      where: {
        organizationId,
        effectiveFromDate: { lte: new Date() },
        OR: [
          { effectiveToDate: null },
          { effectiveToDate: { gte: new Date() } },
        ],
      },
      orderBy: { minIncome: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: taxSlabs,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("GET /api/payroll/tax-slabs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tax slabs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, minIncome, maxIncome, taxRate, reliefAmount = 0, effectiveFromDate } =
      body;

    // Validation
    if (!organizationId || minIncome === undefined || maxIncome === undefined || taxRate === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: organizationId, minIncome, maxIncome, taxRate",
        },
        { status: 400 }
      );
    }

    if (minIncome >= maxIncome) {
      return NextResponse.json(
        { success: false, error: "Max income must be greater than min income" },
        { status: 400 }
      );
    }

    if (taxRate < 0 || taxRate > 100) {
      return NextResponse.json(
        { success: false, error: "Tax rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    const taxSlab = await prisma.taxSlab.create({
      data: {
        organizationId,
        minIncome: minIncome,
        maxIncome: maxIncome,
        taxRate,
        reliefAmount: reliefAmount || 0,
        effectiveFromDate: new Date(effectiveFromDate),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: taxSlab,
        message: "Tax slab created successfully",
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/payroll/tax-slabs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create tax slab" },
      { status: 500 }
    );
  }
}
