import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function POST(req: Request) {
  try {
    const { employeeId, timestamp } = await req.json();

    if (!timestamp || !employeeId) {
      return NextResponse.json({ error: "employeeId and timestamp are required" }, { status: 400 });
    }

    const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const record = await prisma.attendance.create({
      data: {
        employeeId,
        type: "CHECKOUT",
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({ message: "Check-out recorded", record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record check-out" }, { status: 500 });
  }
}
