import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

    // Get all departments managed by this HR
    const departments = await prisma.department.findMany({
      where: { hrId },
      select: { id: true }
    });

    const deptIds = departments.map(d => d.id);

    if (deptIds.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    // Get all employees in these departments
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: { in: deptIds }
      },
      select: { id: true }
    });

    const employeeIds = employees.map(e => e.id);

    // Get tasks for these employees
    const tasks = await prisma.task.findMany({
      where: {
        employeeId: { in: employeeIds }
      },
      include: {
        employee: { select: { id: true, name: true, email: true, position: true, department: true } },
        department: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("HR tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks", details: String(error) }, { status: 500 });
  }
}