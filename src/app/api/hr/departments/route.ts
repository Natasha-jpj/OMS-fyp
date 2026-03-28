import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const departments = await prisma.department.findMany({
    include: {
      manager: { select: { name: true } },
      _count: { select: { employees: true } }
    }
  });
  
  const formatted = departments.map(d => ({
    id: d.id,
    name: d.name,
    head: d.manager?.name || "Unassigned",
    members: d._count.employees,
    efficiency: d.efficiency || 100
  }));

  return NextResponse.json({ departments: formatted });
}