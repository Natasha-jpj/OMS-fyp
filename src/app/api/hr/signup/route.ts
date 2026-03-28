import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Signup Request:", body.email); // Debug Log

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

    console.log("HR Created Successfully:", hr.id);

    return NextResponse.json({ 
      message: 'Organization established', 
      hr: { 
        id: hr.id, 
        name: hr.name, 
        email: hr.email, 
        organization: hr.organization 
      } 
    }, { status: 201 });

  } catch (err: any) {
    // THIS LOG WILL TELL US THE REAL REASON IN THE TERMINAL
    console.error("FULL SIGNUP CRASH LOG:", err); 
    
    return NextResponse.json({ 
      error: err.message || 'Internal server error',
      details: err.code // Prisma error code if available
    }, { status: 500 });
  }
}