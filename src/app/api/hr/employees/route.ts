import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      role: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
  return NextResponse.json({ employees });
}