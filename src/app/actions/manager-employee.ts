"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function managerHireEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const position = formData.get("position") as string;
  const role = formData.get("role") as "INTERN" | "MANAGER"; // Manager can choose role
  let departmentId = formData.get("departmentId") as string;
  const managerId = formData.get("managerId") as string;

  // Handle case where departmentId is undefined, null, or the string "undefined"
  if (!departmentId || departmentId === "undefined" || departmentId === "null") {
    departmentId = null as any;
  }

  try {
    // 1. Verification: Ensure email is unique in the organization
    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) return { success: false, error: "Email already exists in the system." };

    // 2. Security: Hash the temporary security key
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Silo-Scoped Creation: Automatically link to the Manager's department (if manager has one assigned)
    await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position: position || "Workforce Member",
        role: role || "INTERN",
        departmentId: departmentId || null, // Optional - only if manager has a department
        managerId,    // Sets the reporting hierarchy
      }
    });

    revalidatePath("/manager/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Hiring Error:", error);
    return { success: false, error: "Operational Sync Error." };
  }
}