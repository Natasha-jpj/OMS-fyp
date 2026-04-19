import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    // Get userId from cookies - managers use userId cookie, not JWT token
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch manager's current employee record with fresh data
    const manager = await prisma.employee.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, position: true, departmentId: true, role: true }
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    return NextResponse.json({ manager });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
