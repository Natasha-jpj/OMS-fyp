import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { timestamp, photo } = await req.json();

    if (!timestamp) {
      return NextResponse.json({ error: "timestamp required" }, { status: 400 });
    }

    const emp = await prisma.employee.findUnique({ where: { id: userId } });
    if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const record = await prisma.attendance.create({
      data: {
        employeeId: userId,
        type: "CHECKOUT",
        timestamp: new Date(timestamp),
        photo: photo || null,
      },
    });

    return NextResponse.json({ message: "Checked out", record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Check-out failed" }, { status: 500 });
  }
}