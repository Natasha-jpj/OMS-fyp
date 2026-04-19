import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");

    // Get manager ID from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If deptId is provided, fetch employees from that specific department
    if (deptId) {
      const employees = await prisma.employee.findMany({
        where: {
          departmentId: deptId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          role: true,
          managerId: true,
          createdAt: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({ employees });
    }

    // Fallback: Get all departments managed by this manager
    const managedDepts = await prisma.department.findMany({
      where: { managerId: userId },
      select: { id: true }
    });

    const deptIds = managedDepts.map(d => d.id);

    // Fetching only employees within manager's departments
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: { in: deptIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Manager employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

    