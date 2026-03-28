import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { title, description, employeeId, departmentId, dueDate, code, estimate } = await req.json();

    const task = await prisma.task.create({
      data: {
        title,
        description,
        employeeId,
        departmentId,
        status: "TODO",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        code,
        estimate
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Task Delegation Failed" }, { status: 500 });
  }
}
