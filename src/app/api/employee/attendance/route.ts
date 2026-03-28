import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

// GET: Fetch all attendance records for an employee
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    if (!employeeId) return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });

    const records = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
