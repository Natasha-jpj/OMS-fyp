import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

/**
 * GET /api/payroll/configuration - Get payroll configuration
 * PUT /api/payroll/configuration - Update payroll configuration
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

    let config = await prisma.payrollConfiguration.findUnique({
      where: { organizationId },
    });

    // If configuration doesn't exist, create default one
    if (!config) {
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

    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("GET /api/payroll/configuration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const body = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "Organization ID required" },
        { status: 400 }
      );
    }

    const { ssfEmployeeRate, ssfEmployerRate, minimumWage, currency } = body;

    // Validation
    if (ssfEmployeeRate !== undefined && (ssfEmployeeRate < 0 || ssfEmployeeRate > 100)) {
      return NextResponse.json(
        { success: false, error: "SSF employee rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (ssfEmployerRate !== undefined && (ssfEmployerRate < 0 || ssfEmployerRate > 100)) {
      return NextResponse.json(
        { success: false, error: "SSF employer rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (minimumWage !== undefined && minimumWage <= 0) {
      return NextResponse.json(
        { success: false, error: "Minimum wage must be positive" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (ssfEmployeeRate !== undefined) updateData.ssfEmployeeRate = ssfEmployeeRate;
    if (ssfEmployerRate !== undefined) updateData.ssfEmployerRate = ssfEmployerRate;
    if (minimumWage !== undefined) updateData.minimumWage = minimumWage;
    if (currency !== undefined) updateData.currency = currency;
    updateData.updatedAt = new Date();

    const updatedConfig = await prisma.payrollConfiguration.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ssfEmployeeRate: ssfEmployeeRate || 11,
        ssfEmployerRate: ssfEmployerRate || 20,
        minimumWage: minimumWage || 13500,
        currency: currency || "NPR",
      },
      update: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedConfig,
        message: "Configuration updated successfully",
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/payroll/configuration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
