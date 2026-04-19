import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    const { name, email, password, deptId, role } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify department belongs to this HR (if provided)
    if (deptId) {
      const department = await prisma.department.findUnique({
        where: { id: deptId }
      });

      if (!department || department.hrId !== hrId) {
        return NextResponse.json({ error: "Unauthorized: Department does not belong to your account" }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        departmentId: deptId || null,
        hrId,
        role: role || "EMPLOYEE",
      }
    });

    return NextResponse.json(newEmployee);
  } catch (error: any) {
    console.error("Employee create error details:", error?.message, error?.code, error);
    return NextResponse.json({ 
      error: "Failed to create employee",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}