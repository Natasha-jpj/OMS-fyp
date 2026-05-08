import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode token to get hrId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId, salary } = body;
    
    if (!employeeId || salary == null || isNaN(Number(salary))) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Verify employee belongs to this HR's departments
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee?.department || employee.department.hrId !== hrId) {
      return NextResponse.json({ error: "Unauthorized: Employee does not belong to your account" }, { status: 403 });
    }

    // Get previous salary change from payrollAuditLog (if any)
    const previousAudit = await prisma.payrollAuditLog.findFirst({
      where: { entityType: 'SalaryAudit', entityId: employeeId },
      orderBy: { createdAt: 'desc' },
    });

    // Resolve organizationId from HR profile
    const hr = await prisma.hR.findUnique({ where: { id: hrId } });
    const organizationId = hr?.organization || "";

    const prevChanges = previousAudit?.changes as any;
    const prevOldSalary = (prevChanges && (prevChanges.oldSalary ?? prevChanges.newSalary)) ?? 0;

    // Create a generic audit log entry instead of a dedicated SalaryAudit table
    const salaryAudit = await prisma.payrollAuditLog.create({
      data: {
        organizationId,
        entityType: 'SalaryAudit',
        entityId: employeeId,
        action: 'SALARY_CHANGE',
        changes: { oldSalary: prevOldSalary, newSalary: Number(salary) },
        createdBy: hrId,
      }
    });

    return NextResponse.json({ salaryAudit });
  } catch (error) {
    console.error("Set salary error:", error);
    return NextResponse.json({ error: "Failed to set salary" }, { status: 500 });
  }
}
