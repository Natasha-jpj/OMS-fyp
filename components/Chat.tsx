"use client";

import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  senderType: "HR" | "EMPLOYEE";
  senderHr?: { id: string; name: string } | null;
  senderEmp?: { id: string; name: string } | null;
  receiverType: "EVERYONE" | "HR" | "EMPLOYEE";
  createdAt: string;
};

type ChatProps = {
  userId: string;
  userType: "HR" | "EMPLOYEE";
  userName: string;
  organizationId: string;
};

const ChatIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const EmojiIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

const AttachIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

const MinimizeIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export default function Chat({ userId, userType, userName, organizationId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [receiverType, setReceiverType] = useState<"EVERYONE" | "HR" | "EMPLOYEE">("EVERYONE");
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?organizationId=${organizationId}&userId=${userId}&userType=${userType}`);
      const data = await res.json();
      if (res.ok) {
        const newMessages = data.messages || [];
        setMessages(newMessages);
        
        // Show typing indicator if new messages arrived
        if (newMessages.length > lastMessageCountRef.current) {
          const latestMsg = newMessages[newMessages.length - 1];
          const isFromOther = userType === "HR" 
            ? latestMsg.senderType !== "HR" || latestMsg.senderHr?.id !== userId
            : latestMsg.senderType !== "EMPLOYEE" || latestMsg.senderEmp?.id !== userId;
          
          if (isFromOther && open) {
            // Play notification sound or show animation
          }
        }
        lastMessageCountRef.current = newMessages.length;
      }
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.trim(),
          senderType: userType,
          senderId: userId,
          receiverType: "EVERYONE",
          organizationId,
        }),
      });

      if (res.ok) {
        setInput("");
        setShowEmoji(false);
        await fetchMessages();
        setTimeout(scrollToBottom, 100);
        inputRef.current?.focus();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message", error);
      alert("Network error while sending message");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (open && !minimized && organizationId) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      fetchRecipients();

      // Poll for new messages every 2 seconds for more real-time feel
      pollRef.current = setInterval(() => {
        fetchMessages();
      }, 2000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [open, minimized, organizationId]);

  const fetchRecipients = async () => {
    try {
      if (userType === "HR") {
        const res = await fetch(`/api/hr/employees?hrId=${userId}`);
        const data = await res.json();
        if (res.ok) setRecipients(data.employees || []);
      } else {
        const empRes = await fetch(`/api/employee/holidays?employeeId=${userId}`);
        if (empRes.ok) {
          // Fetch HR list via department
          setRecipients([]);
        }
      }
    } catch (error) {
      console.error("Error fetching recipients", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const getSenderName = (msg: Message) => {
    if (msg.senderType === "HR") return msg.senderHr?.name || "HR";
    return msg.senderEmp?.name || "Employee";
  };

  const isMyMessage = (msg: Message) => {
    if (userType === "HR" && msg.senderType === "HR") return msg.senderHr?.id === userId;
    if (userType === "EMPLOYEE" && msg.senderType === "EMPLOYEE") return msg.senderEmp?.id === userId;
    return false;
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return msgDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 z-50 group"
      >
        <ChatIcon />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">3</span>
        </div>
      </button>
    );
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-white rounded-t-2xl shadow-2xl border border-slate-200 z-50">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FF6B35] to-[#FF5A1F] text-white rounded-t-2xl cursor-pointer hover:from-[#FF5A1F] hover:to-[#FF6B35] transition-all" onClick={() => setMinimized(false)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChatIcon />
            </div>
            <div>
              <div className="font-semibold text-sm">Team Chat</div>
              <div className="text-xs opacity-90">{messages.length} messages</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                setMinimized(false);
              }}
              className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
      {/* Header - Modern messenger style */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF5A1F] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-lg font-bold">👥</span>
          </div>
          <div>
            <div className="font-semibold text-base">Team Chat</div>
            <div className="text-xs opacity-90 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {receiverType === "EVERYONE" ? "Everyone" : selectedReceiverId ? "Direct message" : "Select recipient"} • Active now
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-9 h-9 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            title="More options"
          >
            <MoreIcon />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="w-9 h-9 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            title="Minimize"
          >
            <MinimizeIcon />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Messages - Instagram/Messenger style */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-b from-slate-50 to-white">
        {loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-[#FF6B35] rounded-full animate-spin mb-3"></div>
            <div className="text-slate-500 text-sm">Loading messages...</div>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4">
              <ChatIcon />
            </div>
            <div className="text-slate-700 font-semibold text-base mb-1">No messages yet</div>
            <div className="text-slate-500 text-sm">Start the conversation with your team!</div>
          </div>
        )}
        {groupedMessages.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-slate-200 rounded-full text-xs font-medium text-slate-600">
                {group.date === new Date().toLocaleDateString() ? "Today" : group.date}
              </div>
            </div>
            
            {/* Messages in group */}
            {group.messages.map((msg, idx) => {
              const isMine = isMyMessage(msg);
              const senderName = getSenderName(msg);
              const showAvatar = !isMine && (idx === group.messages.length - 1 || group.messages[idx + 1] && isMyMessage(group.messages[idx + 1]));
              
              return (
                <div key={msg.id} className={`flex gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"} group`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(senderName)} flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(senderName)}
                    </div>
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%]`}>
                    {!isMine && showAvatar && (
                      <div className="text-xs font-semibold text-slate-600 mb-1 px-2">{senderName}</div>
                    )}
                    <div className={`relative rounded-2xl px-4 py-2 ${
                      isMine 
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FF5A1F] text-white rounded-br-md" 
                        : "bg-slate-100 text-slate-900 rounded-bl-md"
                    } shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</div>
                      <div className={`text-[11px] mt-1 ${isMine ? "text-orange-100" : "text-slate-500"}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 mb-2 animate-fade-in">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <span className="text-xs">•••</span>
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Recipient selector */}
      {showRecipientModal && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl shadow-xl border-t border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Send message to:</h3>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              <button
                onClick={() => {
                  setReceiverType("EVERYONE");
                  setSelectedReceiverId(null);
                  setShowRecipientModal(false);
                  inputRef.current?.focus();
                }}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-orange-50 transition flex items-center gap-3 ${receiverType === "EVERYONE" ? "bg-orange-50" : ""}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF5A1F] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  👥
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Everyone</div>
                  <div className="text-xs text-slate-500">Broadcast to all</div>
                </div>
              </button>
              {recipients.map((recipient) => (
                <button
                  key={recipient.id}
                  onClick={() => {
                    setReceiverType("EMPLOYEE");
                    setSelectedReceiverId(recipient.id);
                    setShowRecipientModal(false);
                    inputRef.current?.focus();
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-orange-50 transition flex items-center gap-3 ${selectedReceiverId === recipient.id ? "bg-orange-50" : ""}`}
                >
                  <div className={`w-10 h-10 ${getAvatarColor(recipient.name)} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                    {getInitials(recipient.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{recipient.name}</div>
                    <div className="text-xs text-slate-500">{recipient.department?.name || "No dept"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area - Modern messenger style */}
      <div className="border-t border-slate-200 bg-white p-3">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          {/* Action buttons */}
          <div className="flex gap-1 pb-2">
            <button
              type="button"
              onClick={() => setShowRecipientModal(!showRecipientModal)}
              className="w-9 h-9 text-[#FF6B35] hover:bg-orange-50 rounded-full flex items-center justify-center transition"
              title="Select recipient"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            <button
              type="button"
              className="w-9 h-9 text-[#FF6B35] hover:bg-orange-50 rounded-full flex items-center justify-center transition"
              title="Attach file"
            >
              <AttachIcon />
            </button>
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="w-9 h-9 text-[#FF6B35] hover:bg-orange-50 rounded-full flex items-center justify-center transition"
              title="Add emoji"
            >
              <EmojiIcon />
            </button>
          </div>
          
          {/* Input field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Aa"
              className="w-full px-4 py-2.5 bg-slate-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-[15px] placeholder-slate-400"
            />
          </div>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              input.trim() && !sending
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF5A1F] text-white shadow-lg shadow-orange-500/50 hover:scale-110"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </form>
        
        {/* Quick emoji reactions */}
        {showEmoji && (
          <div className="mt-2 flex gap-2 flex-wrap animate-fade-in">
            {["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInput(input + emoji);
                  setShowEmoji(false);
                  inputRef.current?.focus();
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
