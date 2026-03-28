import { NextResponse } from 'next/server';

// Dummy handler for /api/manager/projects to prevent frontend fetch crash
export async function GET(req: Request) {
  // Return an empty array or mock data for now
  return NextResponse.json({ projects: [] });
}
