import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    if (!employeeId) return NextResponse.json({ error: "employeeId is required" }, { status: 400 });

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { department: { select: { hrId: true } } },
    });

    if (!employee?.department?.hrId) {
      return NextResponse.json({ error: "Employee or HR not found" }, { status: 404 });
    }

    const holidays = await prisma.holiday.findMany({
      where: { hrId: employee.department.hrId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ holidays }, { status: 200 });
  } catch (error) {
    console.error("Error fetching holidays", error);
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
  }
}
