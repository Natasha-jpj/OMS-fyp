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

    // Get all departments for this HR to filter employees
    const departments = await prisma.department.findMany({
      where: { hrId },
      select: { id: true }
    });

    const departmentIds = departments.map(d => d.id);

    // Fetch employees that belong to this HR:
    // 1. Employees in departments that belong to this HR
    // 2. Employees created by this HR (with hrId set)
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { departmentId: { in: departmentIds } },  // In HR's departments
          { hrId }  // Created by this HR
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        role: true,
        departmentId: true,
        phone: true,
        salary: true,
        contractType: true,
        contractEndDate: true,
        employmentStatus: true,
        contractUrl: true,
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Employees fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}