import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET: Fetch attendance records for the authenticated employee
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const records = await prisma.attendance.findMany({
      where: { employeeId: userId },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
