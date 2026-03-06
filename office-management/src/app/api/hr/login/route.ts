import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Find the HR user (The Root Admin)
    const hr = await prisma.hR.findUnique({
      where: { email },
    });

    if (!hr) {
      return NextResponse.json({ error: 'Invalid corporate credentials' }, { status: 401 });
    }

    // 2. Verify Security Key (Bcrypt)
    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid corporate credentials' }, { status: 401 });
    }

    // 3. Generate Enterprise JWT
    // We include the organization context so the dashboard knows its scope
    const token = jwt.sign(
      { id: hr.id, role: 'ADMIN', organization: hr.organization },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // 4. Return Session Data
    const response = NextResponse.json({
      message: 'Login successful',
      hr: {
        id: hr.id,
        name: hr.name,
        email: hr.email,
        organization: hr.organization
      },
      token
    });

    // 5. Secure HttpOnly Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login Failure:", error);
    return NextResponse.json({ error: 'Internal system error' }, { status: 500 });
  }
}