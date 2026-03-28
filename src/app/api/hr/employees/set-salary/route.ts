import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { employeeId, salary } = body;
  if (!employeeId || salary == null || isNaN(Number(salary))) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: { salary: Number(salary) },
  });
  return NextResponse.json({ employee: updated });
}
