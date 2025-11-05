"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] // iOS cubic-bezier
      }}
      className={cn(
        "flex items-end gap-2 px-4 py-1.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "max-w-[75%] rounded-[20px] px-4 py-3 shadow-lg",
          isUser
            ? "bg-purple-600 text-white rounded-br-md"
            : "bg-gray-800 text-gray-100 rounded-bl-md"
        )}
      >
        <p className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </motion.div>
    </motion.div>
  );
}
