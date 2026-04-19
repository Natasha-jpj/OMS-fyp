"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createProject(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      console.error("No userId in cookies");
      return { success: false, error: "Unauthorized - no user session" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const departmentId = formData.get("departmentId") as string;

    console.log("Creating project with:", { name, description, status, departmentId, userId });

    if (!name || !description || !departmentId) {
      console.error("Missing required fields:", { name, description, departmentId });
      return { success: false, error: "Missing required fields: name, description, and department" };
    }

    // Verify manager has access to this department
    const manager = await prisma.employee.findUnique({
      where: { id: userId },
      include: { manages: true }
    });

    if (!manager) {
      console.error("Manager not found:", userId);
      return { success: false, error: "Manager profile not found" };
    }

    console.log("Manager manages departments:", manager.manages.map(d => d.id));

    const hasAccess = manager.manages.some(d => d.id === departmentId);
    if (!hasAccess) {
      console.error("No access to department:", { userId, departmentId, managedDepts: manager.manages.map(d => d.id) });
      return { success: false, error: "Not authorized for this department" };
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
    revalidatePath("/manager/dashboard");
    return { success: true, project };
  } catch (error: any) {
    console.error("Project creation error:", error.message, error.stack);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function getProjects() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return { success: false, projects: [], error: "Unauthorized" };
    }

    const manager = await prisma.employee.findUnique({
      where: { id: userId },
      include: { manages: true }
    });

    if (!manager || manager.manages.length === 0) {
      return { success: true, projects: [] };
    }

    const projects = await prisma.project.findMany({
      where: {
        departmentId: {
          in: manager.manages.map(d => d.id)
        }
      },
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, projects };
  } catch (error: any) {
    console.error("Failed to fetch projects:", error);
    return { success: false, projects: [], error: error.message };
  }
}