import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all projects in HR's departments
    const departments = await prisma.department.findMany({
      where: { hrId }
    });

    const projects = await prisma.project.findMany({
      where: {
        departmentId: {
          in: departments.map(d => d.id)
        }
      },
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Failed to fetch HR projects:", error.message);
    return NextResponse.json({ error: "Failed to fetch projects", projects: [] }, { status: 500 });
  }
}
