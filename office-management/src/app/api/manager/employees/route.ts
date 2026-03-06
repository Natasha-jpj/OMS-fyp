import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");

    if (!deptId) {
      return NextResponse.json({ error: "Department ID required for silo sync" }, { status: 400 });
    }

    // Fetching only employees within this specific silo
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: deptId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to retrieve silo data" }, { status: 500 });
  }
}