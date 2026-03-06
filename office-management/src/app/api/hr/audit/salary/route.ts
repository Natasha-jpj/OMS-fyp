import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../../../prismaClient";

// GET: Fetch salary audit logs (optionally filter by employeeId, changedById, date range)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');
  const changedById = searchParams.get('changedById');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const where: any = {};
  if (employeeId) where.employeeId = employeeId;
  if (changedById) where.changedById = changedById;
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = new Date(start);
    if (end) where.createdAt.lte = new Date(end);
  }

  const audits = await prisma.salaryAudit.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true, email: true } },
      changedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ audits });
}

// POST: Log a new salary change (called when HR changes salary)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { employeeId, oldSalary, newSalary, changedById, reason } = body;
  if (!employeeId || oldSalary == null || newSalary == null || !changedById) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const audit = await prisma.salaryAudit.create({
    data: { employeeId, oldSalary, newSalary, changedById, reason },
  });
  return NextResponse.json({ audit });
}
