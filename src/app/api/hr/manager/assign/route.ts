import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
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

    const { managerId, departmentIds } = await req.json();
    if (!managerId || !Array.isArray(departmentIds)) {
      return NextResponse.json({ error: "Missing managerId or departmentIds" }, { status: 400 });
    }

    // Verify all departments belong to this HR
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } }
    });

    if (departments.some(dept => dept.hrId !== hrId)) {
      return NextResponse.json({ error: "Unauthorized: Some departments do not belong to your account" }, { status: 403 });
    }

    // Set managerId for each department AND update manager's departmentId to the first one
    await Promise.all(
      departmentIds.map((deptId: string, index: number) =>
        prisma.department.update({
          where: { id: deptId },
          data: { managerId }
        })
      )
    );

    // Also update the manager employee's departmentId to the first assigned department
    if (departmentIds.length > 0) {
      await prisma.employee.update({
        where: { id: managerId },
        data: { departmentId: departmentIds[0] }
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Manager assign error:", e);
    return NextResponse.json({ error: "Failed to assign manager" }, { status: 500 });
  }
}
