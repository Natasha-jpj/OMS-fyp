"use server"

import { prisma } from "@/lib/prisma";
import { pusherServer } from "../../lib/pusher";
import { revalidatePath } from "next/cache";

/**
 * Handles private 1-on-1 transmissions and global broadcasts
 * Logic strictly follows the AuraFlow schema relations [cite: 21, 22, 23]
 */
export async function sendMessage(formData: FormData) {
  const content = formData.get("content") as string;
  const senderId = formData.get("senderId") as string;
  const receiverId = formData.get("receiverId") as string; // Required for private chat
  const role = formData.get("role") as string; // 'ADMIN', 'MANAGER', or 'INTERN'
  const deptId = formData.get("deptId") as string; // Optional: for silo-specific broadcasts 

  if (!content || !senderId) {
    return { success: false, error: "Missing transmission metadata." };
  }

  try {
    // 1. Persist the message to the database [cite: 21, 22, 23]
    const newMessage = await prisma.message.create({
      data: {
        content,
        hrSenderId: role === 'ADMIN' ? senderId : null,
        employeeSenderId: (role === 'INTERN' || role === 'MANAGER') ? senderId : null,
        departmentId: deptId || null, // null means organization-wide broadcast 
      },
      include: {
        hrSender: { select: { name: true } },
        employeeSender: { select: { name: true } }
      }
    });

    // 2. Determine the real-time channel 
    // If there's a receiverId, it's a private 1-on-1 transmission
    // Otherwise, it's a broadcast to a specific Silo or Global channel
    let channel = `user-${receiverId}`;
    let eventName = "new-message";

    if (!receiverId) {
      channel = deptId ? `silo-${deptId}` : "GLOBAL_BROADCAST";
      eventName = "new-broadcast";
    }

    // 3. Trigger Pusher for instant synchronization
    await pusherServer.trigger(channel, eventName, {
      id: newMessage.id,
      content: newMessage.content,
      senderName: role === 'ADMIN' ? newMessage.hrSender?.name : newMessage.employeeSender?.name,
      createdAt: newMessage.createdAt,
      departmentId: newMessage.departmentId
    });

    // 4. Update the UI cache
    revalidatePath("/hr/dashboard");
    revalidatePath("/manager/dashboard");
    revalidatePath("/employee/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Transmission Error:", error);
    return { success: false, error: "Failed to establish secure tunnel." };
  }
}

/**
 * Specifically for Root Admin global broadcasts
 * Simplifies the form data requirement for the Dashboard Hub
 */
export async function sendBroadcast(formData: FormData) {
  // Reuse the main logic but force it to broadcast mode
  formData.delete("receiverId"); 
  formData.append("role", "ADMIN");
  return await sendMessage(formData);
}