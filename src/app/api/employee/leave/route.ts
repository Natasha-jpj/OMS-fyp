import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function POST(req: Request) {
  try {
    const { employeeId, title, reason, startDate, endDate } = await req.json();

    if (!employeeId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: "employeeId, title, startDate, and endDate are required" }, { status: 400 });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    if (parsedEnd < parsedStart) {
      return NextResponse.json({ error: "endDate cannot be before startDate" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: { select: { hrId: true } } },
    });

    if (!employee?.department?.hrId) {
      return NextResponse.json({ error: "Employee or HR not found" }, { status: 404 });
    }

    const request = await prisma.leaveRequest.create({
      data: {
        title,
        reason,
        startDate: parsedStart,
        endDate: parsedEnd,
        employeeId,
        hrId: employee.department.hrId,
      },
    });

    return NextResponse.json({ message: "Leave request submitted", request }, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request", error);
    return NextResponse.json({ error: "Failed to submit leave request" }, { status: 500 });
  }
}
