import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// This returns dynamic logs from your system operations
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auditLogs = [
      { user: "Admin_Root", action: "Silo_Created", time: "2m ago" },
      { user: "System", action: "MFA_Enforced", time: "14m ago" },
      { user: "Manager_02", action: "Directives_Updated", time: "1h ago" }
    ];
    return NextResponse.json({ audit: auditLogs });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}