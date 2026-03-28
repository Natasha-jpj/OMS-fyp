import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { employeeId, departmentId, role } = await req.json();
  if (!employeeId || !departmentId || !role) {
    return NextResponse.json({ error: "Missing employeeId, departmentId, or role" }, { status: 400 });
  }
  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { departmentId, role }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Shift employee error:", e);
    return NextResponse.json({ error: "Failed to shift employee", details: e?.message || e }, { status: 500 });
  }
}
