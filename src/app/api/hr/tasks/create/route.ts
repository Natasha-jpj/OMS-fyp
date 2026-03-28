import { NextResponse } from "next/server";
import prisma from "../../../../../../prismaClient";

const allowedStatuses = new Set(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

export async function POST(req: Request) {
  try {
    const { hrId, employeeId, title, description, status, dueDate } = await req.json();

    if (!hrId || !employeeId || !title) {
      return NextResponse.json(
        { error: "hrId, employeeId, and title are required" },
        { status: 400 }
      );
    }

    const hr = await prisma.hR.findUnique({ where: { id: hrId } });
    if (!hr) {
      return NextResponse.json({ error: "HR not found" }, { status: 404 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.department.hrId !== hrId) {
      return NextResponse.json({ error: "Employee does not belong to this HR" }, { status: 403 });
    }

    const normalizedStatus = allowedStatuses.has(status) ? status : "TODO";
    const lastInColumn = await prisma.task.findFirst({
      where: { employeeId, status: normalizedStatus as any },
      orderBy: { order: "desc" },
    });

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: normalizedStatus as any,
        order: (lastInColumn?.order || 0) + 1,
        dueDate: parsedDueDate,
        hrId,
        employeeId,
      },
      include: {
        employee: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ message: "Task created", task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
