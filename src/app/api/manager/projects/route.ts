import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get manager's departments
    const manager = await prisma.employee.findUnique({
      where: { id: userId },
      include: { manages: true }
    });

    if (!manager || manager.manages.length === 0) {
      return NextResponse.json({ projects: [] }, { status: 200 });
    }

    // Get all projects in managed departments
    const projects = await prisma.project.findMany({
      where: {
        departmentId: {
          in: manager.manages.map(d => d.id)
        }
      },
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch projects:", error.message);
    return NextResponse.json({ error: "Failed to fetch projects", projects: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      console.error("No userId in cookies");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, status, departmentId } = body;

    console.log("Creating project:", { name, description, status, departmentId, userId });

    if (!name || !description || !departmentId) {
      console.error("Missing fields:", { name, description, departmentId });
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, description, departmentId" },
        { status: 400 }
      );
    }

    // Verify manager has access to this department
    const manager = await prisma.employee.findUnique({
      where: { id: userId },
      include: { manages: true }
    });

    if (!manager) {
      console.error("Manager not found:", userId);
      return NextResponse.json(
        { success: false, error: "Manager profile not found" },
        { status: 404 }
      );
    }

    const hasAccess = manager.manages.some(d => d.id === departmentId);
    if (!hasAccess) {
      console.error("No access to department:", { userId, departmentId, manages: manager.manages.map(d => d.id) });
      return NextResponse.json(
        { success: false, error: "Not authorized to manage this department" },
        { status: 403 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "PLANNING",
        departmentId,
      },
      include: { department: true }
    });

    console.log("Project created successfully:", project.id);
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create project:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: `Failed to create project: ${error.message}` },
      { status: 500 }
    );
  }
}
