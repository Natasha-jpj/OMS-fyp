import { NextResponse } from "next/server";
import prisma from "../../../../../prismaClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hrId = searchParams.get("hrId");
    if (!hrId) return NextResponse.json({ error: "hrId is required" }, { status: 400 });

    const holidays = await prisma.holiday.findMany({
      where: { hrId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ holidays }, { status: 200 });
  } catch (error) {
    console.error("Error fetching holidays", error);
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { hrId, date, title } = await req.json();
    if (!hrId || !date || !title) {
      return NextResponse.json({ error: "hrId, date, and title are required" }, { status: 400 });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const holiday = await prisma.holiday.upsert({
      where: { hrId_date: { hrId, date: parsedDate } },
      update: { title },
      create: { hrId, date: parsedDate, title },
    });

    return NextResponse.json({ message: "Holiday saved", holiday }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating holiday", error);
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
  }
}
