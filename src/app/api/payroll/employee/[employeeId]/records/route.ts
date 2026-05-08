import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { employeeId } = params || {};

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId is required in the route" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { employeeId };
    if (organizationId) where.organizationId = organizationId;

    const records = await prisma.payrollRecord.findMany({
      where,
      include: { payrollRun: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.payrollRecord.count({ where });

    return NextResponse.json({
      success: true,
      data: records,
      pagination: { total, limit, offset },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("GET /api/payroll/employee/[employeeId]/records error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}
