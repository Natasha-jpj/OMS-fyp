import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function POST(req: Request) {
  try {
    const { employeeId, timestamp, photo } = await req.json();

    if (!timestamp || !employeeId) {
      return NextResponse.json({ error: "employeeId and timestamp are required" }, { status: 400 });
    }

    // Ensure employee exists
    const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    // TODO: get employeeId from auth token; for now optional
    const record = await prisma.attendance.create({
      data: {
        employeeId,
        type: "CHECKIN",
        timestamp: new Date(timestamp),
        photo,
      },
    });

    return NextResponse.json({ message: "Check-in recorded", record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 });
  }
}
