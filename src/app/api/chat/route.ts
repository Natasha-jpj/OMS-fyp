import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
// import { pusherServer } from "../../../lib/pusher";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const user1 = searchParams.get("user1");
		const user2 = searchParams.get("user2");

		if (!user1 || !user2) {
			return NextResponse.json({ error: "user1 and user2 are required" }, { status: 400 });
		}

		// Universal 1:1 chat: fetch messages between any two users
		const messages = await prisma.message.findMany({
			where: {
				OR: [
					// user1 sent to user2
					{
						receiverId: user2,
						OR: [
							{ hrSenderId: user1 },
							{ employeeSenderId: user1 },
						],
					},
					// user2 sent to user1
					{
						receiverId: user1,
						OR: [
							{ hrSenderId: user2 },
							{ employeeSenderId: user2 },
						],
					},
				],
			},
			orderBy: { createdAt: "asc" },
			take: 100,
			include: {
				hrSender: { select: { id: true, name: true } },
				employeeSender: { select: { id: true, name: true } },
			},
		});

		// Map messages to a consistent format with senderId and receiverId
		const mapped = messages.map((msg) => {
			const senderId = msg.hrSenderId || msg.employeeSenderId;
			return {
				...msg,
				senderId,
				receiverId: msg.receiverId,
			};
		});

		return NextResponse.json({ messages: mapped }, { status: 200 });
	} catch (error) {
		console.error("Error fetching messages", error);
		return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { content, senderType, senderId, receiverId, sentAt } = await req.json();

		// Log for debugging
		console.log("POST /api/chat received:", { content, senderType, senderId, receiverId });

		if (!content || !content.trim()) {
			return NextResponse.json(
				{ error: "content is required and cannot be empty" },
				{ status: 400 }
			);
		}

		if (!senderId) {
			return NextResponse.json(
				{ error: "senderId is required" },
				{ status: 400 }
			);
		}

		if (!receiverId) {
			return NextResponse.json(
				{ error: "receiverId is required" },
				{ status: 400 }
			);
		}

		// Determine sender/receiver fields based on senderType
		const data: any = { 
			content: content.trim(),
			receiverId: receiverId,
		};
		
		if (senderType === "HR") {
			data.hrSenderId = senderId;
		} else if (senderType === "EMPLOYEE" || senderType === "Staff Member" || !senderType) {
			// Default to employee if type is not specified
			data.employeeSenderId = senderId;
		}

		// Save message asynchronously (don't wait, return fast)
		prisma.message.create({
			data,
		}).catch(err => console.error("Failed to persist message:", err));

		// Return success immediately (message already shown via Pusher optimistic update)
		return NextResponse.json({ 
			success: true,
			message: {
				content: content.trim(),
				senderId,
				receiverId,
				senderType
			}
		}, { status: 200 });
	} catch (error) {
		console.error("Error creating message", error);
		return NextResponse.json({ error: "Failed to send message", details: String(error) }, { status: 500 });
	}
}
