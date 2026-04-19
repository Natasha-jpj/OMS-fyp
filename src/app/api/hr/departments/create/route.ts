// app/api/hr/departments/create/route.ts
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

    const { name, managerName, managerEmail, managerPassword } = await req.json();

    // 1. Conflict Check: Preventing 409 errors
    const existing = await prisma.department.findFirst({ 
      where: { name, hrId } 
    });
    if (existing) {
      return NextResponse.json({ error: "Faculty already exists" }, { status: 409 });
    }

    // 2. Atomic Transaction
    let result;
    
    if (managerName && managerEmail) {
      // Create with manager
      const hashedManagerPassword = await bcrypt.hash(managerPassword, 12);
      result = await prisma.$transaction(async (tx) => {
        // Create Manager (floating state)
        const manager = await tx.employee.create({
          data: {
            name: managerName,
            email: managerEmail,
            password: hashedManagerPassword,
            role: "MANAGER", 
          }
        });

        // Create Department and link the HOD
        const dept = await tx.department.create({
          data: {
            name,
            hrId,
            managerId: manager.id, 
          }
        });

        // Update manager to belong to the new department silo
        await tx.employee.update({
          where: { id: manager.id },
          data: { departmentId: dept.id }
        });

        return dept;
      });
    } else {
      // Create without manager
      result = await prisma.department.create({
        data: {
          name,
          hrId,
        }
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Sync Error" }, { status: 500 });
  }
}