import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import { pusherServer } from "../../../lib/pusher";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		// Universal chat: fetch messages between two users
		const user1 = searchParams.get("user1");
		const user2 = searchParams.get("user2");
		if (!user1 || !user2) {
			return NextResponse.json({ error: "user1 and user2 are required" }, { status: 400 });
		}
		const messages = await prisma.message.findMany({
			where: {
				   OR: [
					   // HR to Employee (both directions)
					   { hrSenderId: user1, employeeSenderId: user2 },
					   { hrSenderId: user2, employeeSenderId: user1 },
					   // Employee to Employee (both directions, no HR involved)
					   { employeeSenderId: user1, hrSenderId: null, },
					   { employeeSenderId: user2, hrSenderId: null, },
					   // HR to HR (both directions, no employee involved)
					   { hrSenderId: user1, employeeSenderId: null },
					   { hrSenderId: user2, employeeSenderId: null },
				   ],
			},
			orderBy: { createdAt: "asc" },
			take: 100,
			include: {
				hrSender: { select: { id: true, name: true } },
				employeeSender: { select: { id: true, name: true } },
			},
		});
		// Always return senderId and receiverId for frontend filtering
		const mapped = messages.map(msg => {
			let senderId = null;
			let receiverId = null;
			// HR to Employee
			if (msg.hrSenderId && msg.employeeSenderId) {
				senderId = msg.hrSenderId;
				receiverId = msg.employeeSenderId;
			}
			// Employee to HR
			else if (msg.employeeSenderId && msg.hrSenderId) {
				senderId = msg.employeeSenderId;
				receiverId = msg.hrSenderId;
			}
			// Employee to Employee
			else if (msg.employeeSenderId && !msg.hrSenderId) {
				senderId = msg.employeeSenderId;
				receiverId = null; // Not a 1:1 HR chat
			}
			// HR to HR
			else if (msg.hrSenderId && !msg.employeeSenderId) {
				senderId = msg.hrSenderId;
				receiverId = null; // Not a 1:1 employee chat
			}
			return {
				...msg,
				senderId,
				receiverId,
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
		const { content, senderType, senderId, receiverId } = await req.json();

		if (!content || !senderType || !senderId || !receiverId) {
			return NextResponse.json(
				{ error: "content, senderType, senderId, and receiverId are required" },
				{ status: 400 }
			);
		}

		// Determine sender/receiver fields
		let data: any = { content };
		if (senderType === "HR") {
			data.hrSenderId = senderId;
			// If receiver is HR or Employee, try both
			data.employeeSenderId = undefined;
		} else {
			data.employeeSenderId = senderId;
			data.hrSenderId = undefined;
		}

		// Save message
		const message = await prisma.message.create({
			data,
			include: {
				hrSender: { select: { id: true, name: true } },
				employeeSender: { select: { id: true, name: true } },
			},
		});

		// Trigger Pusher for real-time updates
		await pusherServer.trigger("global-office", "new-message", message);

		return NextResponse.json({ message }, { status: 201 });
	} catch (error) {
		console.error("Error creating message", error);
		return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
	}
}
