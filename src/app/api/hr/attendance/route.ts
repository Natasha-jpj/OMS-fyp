import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "../../../../../prismaClient";

export async function GET(req: Request) {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode token to get hrId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

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
