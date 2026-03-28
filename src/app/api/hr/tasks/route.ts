import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hrId = searchParams.get("hrId");

  if (!hrId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { hrId },
    include: { 
      employee: { 
        select: { name: true, department: { select: { name: true } } } 
      } 
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(tasks);
}