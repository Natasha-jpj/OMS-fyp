import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendNewUserCredentials } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode token to get hrId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse form data (supports both JSON and multipart for file uploads)
    let name, email, password, position, role, departmentId, phone, joinDate, address, emergencyContact, contractType, contractFile;
    
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      ({ name, email, password, position, role, departmentId, phone, joinDate, address, emergencyContact, contractType } = body);
    } else {
      const formData = await req.formData();
      name = formData.get("name") as string;
      email = formData.get("email") as string;
      password = formData.get("password") as string;
      position = formData.get("position") as string;
      role = (formData.get("role") as string) || "EMPLOYEE";
      departmentId = formData.get("departmentId") as string;
      phone = formData.get("phone") as string;
      joinDate = formData.get("joinDate") as string;
      address = formData.get("address") as string;
      emergencyContact = formData.get("emergencyContact") as string;
      contractType = (formData.get("contractType") as string) || "Full-time";
      contractFile = formData.get("contract") as File | null;
    }
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields: name, email, password" }, { status: 400 });
    }

    // Verify department belongs to this HR (if provided)
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department || department.hrId !== hrId) {
        return NextResponse.json({ error: "Unauthorized: Department does not belong to your account" }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate contract end date based on contract type and join date
    let contractEndDate: Date | null = null;
    const joinDateObj = joinDate ? new Date(joinDate) : new Date();
    if (contractType === "Intern") {
      // 6 months for internship
      contractEndDate = new Date(joinDateObj.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    } else if (contractType === "Contract") {
      // 1 year for contract
      contractEndDate = new Date(joinDateObj.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else if (contractType === "Part-time") {
      // 1 year for part-time
      contractEndDate = new Date(joinDateObj.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    // Full-time stays null (permanent)

    // Handle contract file upload if provided
    let contractUrl: string | null = null;
    if (contractFile) {
      try {
        const bytes = await contractFile.arrayBuffer();
        // For now, store filename; in production use cloud storage (S3, etc)
        contractUrl = `/contracts/${Date.now()}-${contractFile.name}`;
        console.log(`Contract placeholder: ${contractUrl}`);
      } catch (e) {
        console.warn("Failed to process contract file:", e);
      }
    }

    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position: position || "Workforce Member",
        departmentId: departmentId || null,
        hrId,
        role: role || "EMPLOYEE",
        phone: phone || null,
        joinDate: joinDateObj,
        address: address || null,
        emergencyContact: emergencyContact || null,
        contractType: contractType || "Full-time",
        contractEndDate,
        contractUrl,
      }
    });
    // Send credentials email (best-effort). Use dynamic import to avoid ESM interop issues.
    let emailSent = false;
    try {
      const mailModule = await import("@/lib/mail");
      const fn = (mailModule as any).sendNewUserCredentials;
      if (typeof fn === "function") {
        await fn(newEmployee.name, newEmployee.email, newEmployee.email, password);
        emailSent = true;
      } else {
        console.warn("sendNewUserCredentials not available on mail module");
      }
    } catch (e) {
      console.warn("Failed to send credentials email:", (e as any)?.message || e);
    }
    // Attempt to create a default salary structure so new employees are payroll-ready.
    try {
      const hrRecord = await prisma.hR.findUnique({ where: { id: hrId } });
      const organizationId = hrRecord?.organization || hrId;
      const basicSalary = 13500; // Default minimum wage
      await prisma.salaryStructure.create({
        data: {
          organizationId,
          employeeId: newEmployee.id,
          basicSalary: basicSalary,
          allowances: {},
          effectiveFromDate: new Date(),
        },
      });
    } catch (e) {
      console.warn("Failed to auto-create salary structure:", e?.message || e);
    }

    // In development, include the plain password in the response to aid testing when email isn't configured.
    if (process.env.NODE_ENV !== "production" && !emailSent) {
      return NextResponse.json({ newEmployee, tempPassword: password });
    }

    return NextResponse.json(newEmployee);
  } catch (error: any) {
    console.error("Employee create error details:", error?.message, error?.code, error);
    return NextResponse.json({ 
      error: "Failed to create employee",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}