// app/api/hr/departments/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, hrId, managerName, managerEmail, managerPassword } = await req.json();

    // 1. Conflict Check: Preventing 409 errors
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Faculty already exists" }, { status: 409 });
    }

    const hashedManagerPassword = await bcrypt.hash(managerPassword, 12);

    // 2. Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
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

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Sync Error" }, { status: 500 });
  }
}