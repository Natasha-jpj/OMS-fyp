import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

// GET: Manager fetches all attendance records for their department
export async function GET(req: Request) {
  try {
    // For demo, get departmentId from query (in real, from auth)
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");
    if (!deptId) return NextResponse.json({ error: "Missing departmentId" }, { status: 400 });

    // Get all employees in department, excluding manager(s)
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: deptId,
        NOT: { role: "MANAGER" }
      }
    });
    const employeeIds = employees.map(e => e.id);

    // Get all attendance records for these employees (not manager)
    const attendance = await prisma.attendance.findMany({
      where: { employeeId: { in: employeeIds } },
      orderBy: { timestamp: "desc" },
    });

    // Attach employee info to each record
    const records = attendance.map(record => {
      const emp = employees.find(e => e.id === record.employeeId);
      return {
        ...record,
        employee: {
          id: emp?.id,
          name: emp?.name,
          position: emp?.position,
          image: emp ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}` : null,
        },
      };
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
