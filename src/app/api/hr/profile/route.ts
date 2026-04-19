import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string; role?: string };
    const hrId = decoded?.id;

    if (!hrId || decoded?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the current HR user from database
    const hr = await prisma.hR.findUnique({
      where: { id: hrId },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        phone: true,
      },
    });

    if (!hr) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Return the current HR user data
    return NextResponse.json({ 
      user: hr
    }, { status: 200 });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
