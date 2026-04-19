import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail } from "@/lib/mail";

// GET: HR can view all leave requests across the organization
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all leave requests for this HR's departments
    const departments = await prisma.department.findMany({
      where: { hrId },
      select: { id: true }
    });

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employee: {
          departmentId: {
            in: departments.map(d => d.id)
          }
        }
      },
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
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: "Failed to fetch leave requests", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

// PATCH: HR approves/rejects a leave request
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leaveRequestId, status } = body;

    if (!leaveRequestId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status, hrId },
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
  } catch (error) {
    console.error("Error updating leave request", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: "Failed to update leave request", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
