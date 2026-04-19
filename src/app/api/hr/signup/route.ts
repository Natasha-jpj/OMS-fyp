import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password, phone, organization, organizationDomain } = body;

    // 1. Validation
    if (!name || !email || !password || !organization || !organizationDomain) {
      return NextResponse.json({ error: 'All corporate fields are required' }, { status: 400 });
    }

    // 2. Check Connection & Existing User
    // This is often where it crashes if DATABASE_URL is wrong
    const existing = await prisma.hR.findUnique({ 
      where: { email } 
    }).catch(err => {
      console.error("Prisma Connection Error:", err.message);
      throw new Error("Database connection failed");
    });

    if (existing) {
      return NextResponse.json({ error: 'HR account already established' }, { status: 400 });
    }

    // 3. Security (bcryptjs is more stable in Next.js than bcrypt)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create HR Root Account
    const hr = await prisma.hR.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        organization,
        organizationDomain,
      },
    });

    // 5. Generate JWT Token (same as login)
    const token = jwt.sign(
      { id: hr.id, role: 'ADMIN', organization: hr.organization },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // 6. Create response with token cookie
    const response = NextResponse.json({ 
      message: 'Organization established', 
      hr: { 
        id: hr.id, 
        name: hr.name, 
        email: hr.email, 
        organization: hr.organization 
      }
    }, { status: 201 });

    // 7. Set secure httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;

  } catch (err: unknown) {
    // THIS LOG WILL TELL US THE REAL REASON IN THE TERMINAL
    console.error("FULL SIGNUP CRASH LOG:", err); 
    
    return NextResponse.json({ 
      error: (err as Error).message || 'Internal server error',
      details: (err as { code?: string }) .code // Prisma error code if available
    }, { status: 500 });
  }
}