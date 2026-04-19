import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Get all employees
    const employees = await prisma.employee.findMany();

    // Get all attendance records
    const attendance = await prisma.attendance.findMany({
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
