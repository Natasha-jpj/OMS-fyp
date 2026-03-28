"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const departmentId = formData.get("departmentId") as string;

  if (!departmentId) return { success: false, error: "Silo ID required." };

  try {
    await prisma.project.create({
      data: {
        name,
        description,
        status,
        departmentId,
      }
    });

    revalidatePath("/manager/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to establish project silo." };
  }
}