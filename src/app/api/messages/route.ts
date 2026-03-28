import { pusherServer } from "../../../lib/pusher"; 

export async function POST(req: Request) {
  try {
    const { content, senderType, senderId, receiverId } = await req.json();

    const message = await prisma.message.create({
      data: {
        content,
        // Save using your existing logic for sender types
        hrSenderId: senderType === "HR" ? senderId : null,
        employeeSenderId: senderType !== "HR" ? senderId : null,
      },
      include: {
        hrSender: { select: { id: true, name: true } },
        employeeSender: { select: { id: true, name: true } },
      },
    });

    // CHANGE: Trigger the "global-office" channel instead of a department channel
    // This ensures every user currently online sees that a new message has arrived
    await pusherServer.trigger("global-office", "new-message", message);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}