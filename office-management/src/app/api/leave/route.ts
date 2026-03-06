import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../prismaClient";

// POST: Employee submits a leave request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, startDate, endDate, reason, employeeId } = body;
    if (!title || !startDate || !endDate || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const leave = await prisma.leaveRequest.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employeeId,
        status: 'PENDING',
      },
    });
    return NextResponse.json({ leave });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Error creating leave request:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Failed to create leave request', message: err.message, stack: err.stack }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create leave request', details: err }, { status: 500 });
  }
}

// GET: Manager views leave requests for their department
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');
    const employeeId = searchParams.get('employeeId');
    if (managerId) {
      // Manager: fetch leave requests for their department
      const departments = await prisma.department.findMany({
        where: { managerId },
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
        include: { employee: true },
      });
      return NextResponse.json({ leaveRequests });
    } else if (employeeId) {
      // Employee: fetch their own leave requests
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: { employeeId },
      });
      return NextResponse.json({ leaveRequests });
    } else {
      return NextResponse.json({ error: 'Missing managerId or employeeId' }, { status: 400 });
    }
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Error fetching leave requests:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch leave requests', message: err.message, stack: err.stack }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch leave requests', details: err }, { status: 500 });
  }
}

// PATCH: Manager approves/rejects a leave request
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { leaveRequestId, status } = body;
    if (!leaveRequestId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status },
    });
    return NextResponse.json({ leaveRequest: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update leave request', details: err }, { status: 500 });
  }
}
