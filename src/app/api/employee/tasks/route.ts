import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update a task (status, dueDate, code, estimate)
export async function PATCH(req: Request) {
  try {
    const { id, status, dueDate, code, estimate } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing task id" }, { status: 400 });
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(code && { code }),
        ...(estimate && { estimate })
      }
    });
    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Task Update Error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// GET: Fetch tasks for an employee (by employeeId)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized Identity" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Task Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync directives" }, { status: 500 });
  }
}