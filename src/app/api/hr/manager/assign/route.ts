import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { managerId, departmentIds } = await req.json();
  if (!managerId || !Array.isArray(departmentIds)) {
    return NextResponse.json({ error: "Missing managerId or departmentIds" }, { status: 400 });
  }
  try {
    // Set managerId for each department
    await Promise.all(
      departmentIds.map((deptId: string) =>
        prisma.department.update({
          where: { id: deptId },
          data: { managerId }
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to assign manager" }, { status: 500 });
  }
}
