// app/api/employee/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
        manages: true 
      }
    });

    if (!employee) return NextResponse.json({ error: "Identity not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return NextResponse.json({ error: "Invalid Security Key" }, { status: 401 });

    const response = NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        departmentId: employee.departmentId,
        organization: "Pcity Tech"
      }
    });

    // Simple: Just set user ID in cookie
    response.cookies.set("userId", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json({ error: "Authentication Error" }, { status: 500 });
  }
}
