import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET: Fetch broadcasts for the current user role
export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get('role'); // 'EMPLOYEE', 'MANAGER', 'HR'
    if (!role) return NextResponse.json({ error: 'Role required' }, { status: 400 });

    let where = {};
    if (role === 'EMPLOYEE') {
      // Employees see all broadcasts
      where = { };
    } else if (role === 'MANAGER') {
      // Managers see only HR broadcasts
      where = { senderRole: 'HR' };
    } else if (role === 'HR') {
      // HR sees only their own broadcasts
      where = { senderRole: 'HR' };
    }

    const broadcasts = await prisma.broadcast.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ broadcasts });
  } catch (error: any) {
    console.error("Error fetching broadcasts:", error);
    return NextResponse.json({ error: "Failed to fetch broadcasts", broadcasts: [] }, { status: 500 });
  }
}

// POST: Create a new broadcast
export async function POST(req: NextRequest) {
  const { senderId, senderRole, message } = await req.json();
  if (!senderId || !senderRole || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // HR broadcasts are visible to all, manager broadcasts only to employees
  const visibility = senderRole === 'HR' ? 'ALL' : 'EMPLOYEE';
  const broadcast = await prisma.broadcast.create({
    data: {
      senderId,
      senderRole,
      message,
      visibility,
    },
  });
  return NextResponse.json({ broadcast });
}
