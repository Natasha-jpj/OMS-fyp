import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch only departments belonging to this HR
    const departments = await prisma.department.findMany({
      where: { hrId },
      include: {
        manager: { select: { name: true } },
        _count: { select: { employees: true } }
      }
    });
  
    const formatted = departments.map(d => ({
      id: d.id,
      name: d.name,
      head: d.manager?.name || "Unassigned",
      members: d._count.employees,
      efficiency: d.efficiency || 100
    }));

    return NextResponse.json({ departments: formatted });
  } catch (error) {
    console.error("Departments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}