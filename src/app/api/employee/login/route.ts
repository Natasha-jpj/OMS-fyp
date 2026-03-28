// app/api/employee/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ... existing imports

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: identifier },
          { id: identifier }
        ]
      },
      include: {
        // FIXED: Using 'manages' instead of 'managedDepartment' 
        // as per your current Prisma error output
        manages: true 
      }
    });

    if (!employee) return NextResponse.json({ error: "Identity not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return NextResponse.json({ error: "Invalid Security Key" }, { status: 401 });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

    const token = jwt.sign(
      { id: employee.id, role: employee.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        departmentId: employee.departmentId,
        // Match the field here too
        managedDepartment: employee.manages, 
        organization: "Pcity Tech"
      }
    });
  } catch (error: any) {
    console.error("AUTH_CRASH:", error.message);
    return NextResponse.json({ error: "Authentication Error" }, { status: 500 });
  }
}