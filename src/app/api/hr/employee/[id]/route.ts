import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Destructure fields HR can edit
    const {
      email,
      phone,
      position,
      salary,
      contractType,
      contractEndDate,
      employmentStatus,
    } = body;

    // Build update object dynamically
    const updateData: any = {};

    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (position !== undefined) updateData.position = position;
    if (salary !== undefined) updateData.salary = salary ? parseFloat(salary) : null;
    if (contractType !== undefined) updateData.contractType = contractType;
    if (contractEndDate !== undefined) updateData.contractEndDate = contractEndDate ? new Date(contractEndDate) : null;
    if (employmentStatus !== undefined) updateData.employmentStatus = employmentStatus;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
