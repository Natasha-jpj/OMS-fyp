import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, departmentId, managerId } = await req.json();

    // 1. Check if email is already taken in the organization
    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Create the intern within the departmental silo
    const intern = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "INTERN", // Defaults to INTERN
        departmentId, // Locked to HOD's department
        managerId,    // Reporting line to the HOD
      }
    });

    return NextResponse.json(intern, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Hiring Process Failed" }, { status: 500 });
  }
}