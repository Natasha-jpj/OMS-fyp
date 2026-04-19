import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update a task (status only)
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing task id" }, { status: 400 });
    if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });
    
    // Verify the task belongs to the authenticated employee
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task || task.employeeId !== userId) {
      return NextResponse.json({ error: "Unauthorized: Task not found or does not belong to you" }, { status: 403 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: { employee: { select: { id: true, name: true } } }
    });
    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Task Update Error:", error);
    return NextResponse.json({ error: "Failed to update task", details: String(error) }, { status: 500 });
  }
}

// GET: Fetch tasks for the authenticated employee only
export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { employeeId: userId },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Task Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync directives" }, { status: 500 });
  }
}