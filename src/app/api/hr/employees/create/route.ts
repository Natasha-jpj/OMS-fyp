import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password, deptId, hrId } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newEmployee = await prisma.employee.create({
    data: {
      name,
      email,
      password: hashedPassword,
      departmentId: deptId,
      // Automatic hierarchy
      // role: "INTERN"
    }
  });

  return NextResponse.json(newEmployee);
}