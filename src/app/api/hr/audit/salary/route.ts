import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// GET: Fetch salary audit logs (optionally filter by employeeId, changedById, date range)
export async function GET(req: NextRequest) {
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error("Error fetching salary audits:", error);
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

// POST: Log a new salary change (called when HR changes salary)
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId, oldSalary, newSalary, reason } = body;
    if (!employeeId || oldSalary == null || newSalary == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const audit = await prisma.salaryAudit.create({
      data: { employeeId, oldSalary, newSalary, changedById: hrId, reason },
    });
    return NextResponse.json({ audit });
  } catch (error: any) {
    console.error("Error creating salary audit:", error);
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
