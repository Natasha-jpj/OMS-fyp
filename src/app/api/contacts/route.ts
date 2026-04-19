import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../../prismaClient";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return all employees + HR for universal chat
    const [employees, hrs] = await Promise.all([
      prisma.employee.findMany({
        where: {
          id: { not: userId }, // Exclude current user
        },
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          role: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      }),
      // Fetch all HR users too
      prisma.hR.findMany({
        where: {
          id: { not: userId }, // Exclude current user if they're HR
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // Transform HR to match employee format
    const transformedHRs = hrs.map((hr: any) => ({
      ...hr,
      position: "HR Manager",
      role: "HR",
    }));

    // Combine all contacts
    const allContacts = [...employees, ...transformedHRs];

    return NextResponse.json({ contacts: allContacts });
  } catch (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
