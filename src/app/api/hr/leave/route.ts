import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

// GET: HR can view all leave requests with employee and department info
export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { status: { not: "REJECTED" } },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}
