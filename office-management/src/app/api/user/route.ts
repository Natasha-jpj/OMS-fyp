import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";

export async function GET() {
  // Fetch all users from the new User table
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  return NextResponse.json({ users });
}
