// src/app/actions/department.ts
"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDepartment(formData: FormData) {
  const name = formData.get("name") as string;
  const managerId = formData.get("managerId") as string;
  const budget = formData.get("budget") as string;
  
  // Convert staff capacity to an Integer to match the Int? requirement in your schema
  const capacityInput = formData.get("capacity") as string;
  const capacity = parseInt(capacityInput) || 50;

  try {
    // 1. Validate HR Session: Fetch the Root Admin account
    const hr = await prisma.hR.findFirst(); 
    if (!hr) {
      return { success: false, error: "HR Account not found. Please register as Super Admin first." };
    }

    // 2. Execute Atomic Transaction: Create Dept and Upgrade Role
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Verify employee exists if a managerId was provided
      if (managerId) {
        const emp = await tx.employee.findUnique({ where: { id: managerId } });
        if (!emp) throw new Error("Employee ID not found.");
      }

      // B. Create the Department with the new AuraFlow fields
      const newDept = await tx.department.create({
        data: {
          name,
          budget,   
          capacity, 
          hrId: hr.id,
          // Only link manager if the ID is provided
          ...(managerId && { managerId })
        }
      });

      // C. AUTOMATIC ROLE UPGRADE: Override the @default(INTERN) status
      if (managerId) {
        await tx.employee.update({
          where: { id: managerId },
          data: { 
            role: "MANAGER", // Allows access to /manager/dashboard
            departmentId: newDept.id // Links them to the silo they manage
          }
        });
      }

      return newDept;
    });

    revalidatePath("/hr/dashboard");
    return { success: true };

  } catch (error: any) {
    console.error("Creation Error:", error);
    
    // Specific error handling for missing employees
    if (error.message === "Employee ID not found.") {
      return { success: false, error: "The provided Employee ID does not exist." };
    }

    return { success: false, error: "Database Sync Error. Check Neon Console columns." };
  }
}