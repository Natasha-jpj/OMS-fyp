import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../prismaClient";
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail } from '@/lib/mail';

// POST: Employee submits a leave request (reads userId from cookie)
export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, startDate, endDate, reason } = body;
    
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || '',
        employeeId: userId,
        status: 'PENDING',
      },
    });
    return NextResponse.json({ leave });
  } catch (err) {
    console.error('Error creating leave request:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Failed to create leave request', message: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

// GET: Fetch leave requests (employee gets own, manager gets department team)
export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'employee' or 'manager'

    if (type === 'manager') {
      // Manager: fetch leave requests for their department employees
      const manager = await prisma.employee.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!manager) {
        return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
      }

      const departments = await prisma.department.findMany({
        where: { managerId: userId },
        select: { id: true },
      });

      const departmentIds = departments.map(d => d.id);
      const employees = await prisma.employee.findMany({
        where: { departmentId: { in: departmentIds } },
        select: { id: true },
      });

      const employeeIds = employees.map(e => e.id);
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: { employeeId: { in: employeeIds } },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: { select: { id: true, name: true } },
            },
          },
        },
      });

      return NextResponse.json({ leaveRequests });
    } else {
      // Employee: fetch their own leave requests
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: { employeeId: userId },
      });
      return NextResponse.json({ leaveRequests });
    }
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch leave requests', message: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

// PATCH: Manager/HR approves/rejects a leave request
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leaveRequestId, status } = body;

    if (!leaveRequestId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { id: true, name: true } },
          },
        },
      }
    });

    // Send email notification to employee
    if (updated.employee?.email) {
      const departmentName = updated.employee.department?.name || "Unknown Department";
      const employeeName = updated.employee.name || "Employee";

      if (status === 'APPROVED') {
        await sendLeaveApprovalEmail(
          employeeName,
          updated.employee.email,
          departmentName,
          updated.title,
          updated.startDate.toISOString(),
          updated.endDate.toISOString()
        );
      } else if (status === 'REJECTED') {
        await sendLeaveRejectionEmail(
          employeeName,
          updated.employee.email,
          departmentName,
          updated.title,
          updated.startDate.toISOString(),
          updated.endDate.toISOString()
        );
      }
    }

    return NextResponse.json({ leaveRequest: updated });
  } catch (err) {
    console.error('Error updating leave request:', err);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
