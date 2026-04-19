import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, departmentId, role } = await req.json();

    if (!employeeId || !departmentId || !role) {
      return NextResponse.json({ error: "Missing required fields: employeeId, departmentId, role" }, { status: 400 });
    }

    // Verify employee belongs to this HR's departments
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee || !employee.department || employee.department.hrId !== hrId) {
      return NextResponse.json({ error: "Employee not found or unauthorized" }, { status: 403 });
    }

    // Verify destination department belongs to this HR
    const destDept = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!destDept || destDept.hrId !== hrId) {
      return NextResponse.json({ error: "Department not found or unauthorized" }, { status: 403 });
    }

    await prisma.employee.update({
      where: { id: employeeId },
      data: { departmentId, role }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Shift employee error:", e);
    return NextResponse.json({ error: "Failed to shift employee", details: e?.message || e }, { status: 500 });
  }
}
