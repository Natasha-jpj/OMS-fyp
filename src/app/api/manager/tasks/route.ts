import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deptId = searchParams.get("deptId");
  if (!deptId) return NextResponse.json({ error: "Missing departmentId" }, { status: 400 });
  const tasks = await prisma.task.findMany({
    where: { departmentId: deptId },
    include: { employee: { select: { id: true, name: true, email: true, position: true } } }
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const { title, description, employeeId, departmentId, hrId } = await req.json();
  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      employeeId,
      departmentId,
      hrId,
      status: "TODO" // Default from schema
    }
  });
  return NextResponse.json(newTask);
}