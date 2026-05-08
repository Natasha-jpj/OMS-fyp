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

    // Use payrollAuditLog as a generic audit table to store salary changes
    const where: any = {
      entityType: 'SalaryAudit',
      ...(employeeId ? { entityId: employeeId } : {}),
      ...(changedById ? { createdBy: changedById } : {}),
    };

    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }

    const audits = await prisma.payrollAuditLog.findMany({
      where,
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

    // Resolve organizationId from HR profile if available
    const hr = await prisma.hR.findUnique({ where: { id: hrId } });
    const organizationId = hr?.organization || "";

    const audit = await prisma.payrollAuditLog.create({
      data: {
        organizationId,
        entityType: 'SalaryAudit',
        entityId: employeeId,
        action: 'SALARY_CHANGE',
        changes: { oldSalary, newSalary },
        reason: reason || null,
        createdBy: hrId,
      },
    });
    return NextResponse.json({ audit });
  } catch (error: any) {
    console.error("Error creating salary audit:", error);
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
