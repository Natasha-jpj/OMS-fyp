"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function hireEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const position = formData.get("position") as string;

  try {
    // 1. Check if email is already taken
    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) return { success: false, error: "Email already registered." };

    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the Employee record based on your schema
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position: position || "Workforce Member",
        role: "INTERN", // Default role from schema
      }
    });

    revalidatePath("/hr/dashboard");
    // Return the ID so you can copy-paste it into the "Add Dept" form
    return { success: true, employeeId: newEmployee.id };
  } catch (error) {
    return { success: false, error: "Failed to hire employee." };
  }
}