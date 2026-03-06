import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hrId = searchParams.get("hrId");

    if (!hrId) return NextResponse.json({ error: "HR ID is required" }, { status: 400 });

    const employees = await prisma.employee.findMany({
      where: { department: { hrId } },
      select: {
        id: true,
        name: true,
        email: true,
        department: { select: { name: true } },
        attendances: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    const rows = employees.flatMap((e) =>
      e.attendances.map((a) => ({
        employeeId: e.id,
        employeeName: e.name,
        email: e.email,
        department: e.department?.name,
        type: a.type,
        timestamp: a.timestamp,
        photo: a.photo,
      }))
    ).sort((a,b) => (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    return NextResponse.json({ records: rows }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
