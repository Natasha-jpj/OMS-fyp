import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all departments managed by this user
    const managedDepts = await prisma.department.findMany({
      where: { managerId: userId },
      select: { id: true }
    });

    const deptIds = managedDepts.map(d => d.id);
    
    // If manager has no departments, return empty array
    if (deptIds.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    // Get all employees in managed departments
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: { in: deptIds }
      },
      select: { id: true }
    });

    const employeeIds = employees.map(e => e.id);

    // Get tasks for these employees
    const tasks = await prisma.task.findMany({
      where: {
        employeeId: { in: employeeIds }
      },
      include: { employee: { select: { id: true, name: true, email: true, position: true } } },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Manager tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, employeeId, departmentId } = await req.json();
    
    // Verify manager is assigned to this department
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department || department.managerId !== userId) {
      return NextResponse.json({ error: "Unauthorized: You do not manage this department" }, { status: 403 });
    }

    // Verify employee is in this department  
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee || employee.departmentId !== departmentId) {
      return NextResponse.json({ error: "Invalid employee or department" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        employeeId,
        departmentId,
        status: "TODO"
      },
      include: { employee: { select: { id: true, name: true } } }
    });
    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error("Manager task creation error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH: Update task status (for Kanban drag and drop)
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Verify the task belongs to an employee in the manager's department
    const task = await prisma.task.findUnique({
      where: { id },
      include: { employee: { include: { department: true } } }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.employee?.department?.managerId !== userId) {
      return NextResponse.json({ error: "Unauthorized: Cannot update this task" }, { status: 403 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: { employee: { select: { id: true, name: true } } }
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Manager task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
