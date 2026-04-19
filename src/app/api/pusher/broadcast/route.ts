import { NextResponse } from "next/server";
import { pusherServer } from "../../../../lib/pusher";

export async function POST(req: Request) {
  try {
    const { channel, event, data } = await req.json();

    if (!channel || !event || !data) {
      return NextResponse.json(
        { error: "channel, event, and data are required" },
        { status: 400 }
      );
    }

    // Broadcast to all users subscribed to this channel
    await pusherServer.trigger(channel, event, data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Pusher broadcast error:", error);
    return NextResponse.json({ error: "Broadcast failed" }, { status: 500 });
  }
}
