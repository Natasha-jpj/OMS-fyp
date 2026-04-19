import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

    // Get all messages for this HR's organization
    const messages = await prisma.message.findMany({
      where: {
        hrSenderId: hrId
      },
      include: {
        department: true,
        employeeSender: true,
        hrSender: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Failed to fetch HR messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages", messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const { content, departmentId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        hrSenderId: hrId,
        departmentId: departmentId || null
      },
      include: {
        hrSender: true,
        department: true
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
