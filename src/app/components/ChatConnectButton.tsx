"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface ChatConnectButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function ChatConnectButton({ onClick, isActive = false }: ChatConnectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        isActive
          ? "bg-black text-white"
          : "bg-slate-50 border border-slate-200 text-black hover:bg-slate-100"
      }`}
    >
      <MessageSquare size={16} />
      Connect
    </button>
  );
}
