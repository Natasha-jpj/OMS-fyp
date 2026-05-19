import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

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
      address,
      emergencyContact,
      position,
      salary,
      joinDate,
      contractType,
      contractEndDate,
      employmentStatus,
    } = body;

    // Build update object dynamically
    const updateData: any = {};

    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (position !== undefined) updateData.position = position;
    if (salary !== undefined) updateData.salary = salary ? parseFloat(salary) : null;
    if (joinDate !== undefined) updateData.joinDate = joinDate ? new Date(joinDate) : null;
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
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: "Employee updated successfully",
      ...employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
