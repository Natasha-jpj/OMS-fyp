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

    const body = await req.json();
    const { name, email, password, deptId, role, salary } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify department belongs to this HR (if provided)
    if (deptId) {
      const department = await prisma.department.findUnique({
        where: { id: deptId }
      });

      if (!department || department.hrId !== hrId) {
        return NextResponse.json({ error: "Unauthorized: Department does not belong to your account" }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        departmentId: deptId || null,
        hrId,
        role: role || "EMPLOYEE",
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
      const basicSalary = Number(salary) || 13500;
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
      // Non-fatal: log and continue. Employee was created successfully.
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