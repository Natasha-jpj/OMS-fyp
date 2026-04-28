import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const employeeId = formData.get("employeeId") as string;

    if (!file || !employeeId) {
      return NextResponse.json(
        { error: "File and employeeId required" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const contractUrl = `data:application/pdf;base64,${base64}`;

    // Save to database using Prisma
    const document = await prisma.contractDocument.create({
      data: {
        employeeId,
        fileName: file.name,
        fileUrl: contractUrl,
        uploadedBy: employeeId,
      },
    });

    // Update employee with latest contract URL
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { contractUrl },
    });

    return NextResponse.json({
      message: "Contract uploaded successfully",
      contractUrl,
      document,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error uploading contract:", error);
    return NextResponse.json(
      { error: "Failed to upload contract" },
      { status: 500 }
    );
  }
}

